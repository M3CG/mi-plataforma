// scripts/sync-tmdb.js
// Ejecutar con: node -r dotenv/config scripts/sync-tmdb.js
// O: TMDB_API_KEY=... STRAPI_URL=... STRAPI_API_TOKEN=... node scripts/sync-tmdb.js

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

if (!TMDB_API_KEY || !STRAPI_API_TOKEN) {
  console.error(
    '❌ Faltan variables de entorno. Define TMDB_API_KEY y STRAPI_API_TOKEN.'
  );
  process.exit(1);
}

const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMG_BASE = 'https://image.tmdb.org/t/p/original';

const { slugify } = require('./lib/slug');

// Alias para no tocar todos los llamados existentes.
const createSlug = slugify;

async function strapiRequest(endpoint, method = 'GET', body = null) {
  try {
    const res = await fetch(`${STRAPI_URL}/api${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${STRAPI_API_TOKEN}`,
      },
      body: body ? JSON.stringify(body) : null,
    });
    return res.json();
  } catch (error) {
    console.error(`Error de red en Strapi (${endpoint}):`, error.message);
    return null;
  }
}

async function findOrCreate(collection, tmdbId, payload) {
  const existing = await strapiRequest(
    `/${collection}?filters[tmdb_id][$eq]=${tmdbId}`
  );
  if (existing?.data?.length > 0) {
    return existing.data[0].documentId;
  }
  const created = await strapiRequest(`/${collection}`, 'POST', {
    data: payload,
  });
  if (created?.data?.documentId) {
    return created.data.documentId;
  }
  console.error(`No se pudo crear en ${collection}:`, payload.name);
  return null;
}

async function syncMovies() {
  console.log('🚀 Iniciando sincronización de 100 películas desde TMDB...');

  for (let page = 1; page <= 5; page++) {
    console.log(`\n📄 Descargando página ${page} de películas populares...`);
    const popularRes = await fetch(
      `${TMDB_BASE}/movie/popular?api_key=${TMDB_API_KEY}&language=es-MX&page=${page}`
    );
    const popularData = await popularRes.json();

    for (const tmdbMovie of popularData.results) {
      console.log(`\nProcesando: ${tmdbMovie.title}...`);

      const existingMovie = await strapiRequest(
        `/movies?filters[tmdb_id][$eq]=${tmdbMovie.id}`
      );
      if (existingMovie?.data?.length > 0) {
        console.log(
          `⚠️  "${tmdbMovie.title}" ya existe en la base de datos. Saltando...`
        );
        continue;
      }

      const detailsRes = await fetch(
        `${TMDB_BASE}/movie/${tmdbMovie.id}?api_key=${TMDB_API_KEY}&language=es-MX&append_to_response=videos,credits`
      );
      const details = await detailsRes.json();

      const trailer = details.videos?.results.find(
        (v) =>
          v.type === 'Trailer' &&
          v.site === 'YouTube' &&
          v.iso_639_1 === 'es'
      );
      const trailerUrl = trailer
        ? `https://www.youtube.com/embed/${trailer.key}`
        : '';

      // ─── CORREGIDO: extraer país de producción ───
      const productionCountries = details.production_countries || [];
      const productionCountry =
        productionCountries.length > 0 ? productionCountries[0].name : '';

      const categoryIds = [];
      for (const genre of details.genres || []) {
        const catSlug = createSlug(genre.name);
        const catId = await findOrCreate('categories', genre.id, {
          name: genre.name,
          slug: catSlug,
          tmdb_id: genre.id,
        });
        if (catId) categoryIds.push(catId);
      }

      const actorIds = [];
      const topActors = (details.credits?.cast || []).slice(0, 5);
      for (const actor of topActors) {
        const actSlug = createSlug(actor.name);
        const actId = await findOrCreate('actors', actor.id, {
          name: actor.name,
          slug: actSlug,
          tmdb_id: actor.id,
          profile_image_url: actor.profile_path
            ? `${TMDB_IMG_BASE}${actor.profile_path}`
            : null,
        });
        if (actId) actorIds.push(actId);
      }

      const directorIds = [];
      const director = details.credits?.crew?.find((c) => c.job === 'Director');
      if (director) {
        const dirSlug = createSlug(director.name);
        const dirId = await findOrCreate('directors', director.id, {
          name: director.name,
          slug: dirSlug,
          tmdb_id: director.id,
          profile_image_url: director.profile_path
            ? `${TMDB_IMG_BASE}${director.profile_path}`
            : null,
        });
        if (dirId) directorIds.push(dirId);
      }

      const ageRating = details.adult ? 'R' : 'PG-13';

      const moviePayload = {
        title: tmdbMovie.title,
        slug: createSlug(tmdbMovie.title),
        synopsis: tmdbMovie.overview || 'Sin sinopsis disponible.',
        tmdb_id: tmdbMovie.id,
        imdb_id: details.imdb_id || null,
        country: productionCountry, // ← CORREGIDO
        year: tmdbMovie.release_date
          ? new Date(tmdbMovie.release_date).getFullYear()
          : 0,
        release_date: tmdbMovie.release_date || null,
        rating: tmdbMovie.vote_average || 0,
        runtime: details.runtime || 0,
        age_rating: ageRating,
        original_language: details.original_language || 'en',
        poster_url: tmdbMovie.poster_path
          ? `${TMDB_IMG_BASE}${tmdbMovie.poster_path}`
          : null,
        backdrop_url: tmdbMovie.backdrop_path
          ? `${TMDB_IMG_BASE}${tmdbMovie.backdrop_path}`
          : null,
        trailer_url: trailerUrl,
        is_featured: false,
        views: 0,
        categories: categoryIds,
        actors: actorIds,
        directors: directorIds,
      };

      const createdMovie = await strapiRequest('/movies', 'POST', {
        data: moviePayload,
      });
      if (createdMovie?.data?.documentId) {
        console.log(`✅ Película guardada: ${tmdbMovie.title}`);
      } else {
        console.log(`❌ Error al guardar: ${tmdbMovie.title}`);
      }
    }
  }

  console.log('\n🎉 ¡Sincronización completada con éxito!');
}

syncMovies().catch((error) => {
  console.error('💥 Error fatal en el script:', error);
});