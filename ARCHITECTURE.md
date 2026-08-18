# Arquitectura del proyecto

Este proyecto sigue una arquitectura basada en capas con separación de responsabilidades.

## Capas

### entities/

Contiene reglas y modelos de negocio puros.

Ejemplos:

- Movie
- Category
- Person
- filtros de películas
- sorting de películas
- reglas de año
- identidad de una película

Reglas:

- No conoce rutas de la app.
- No conoce Strapi.
- No conoce React Query, cache, fetch ni UI.
- No conoce React ni Next.js.
- Puede exponer view models simples si pertenecen a la entidad.

---

### shared/

Componentes y utilidades genéricas reutilizables.

Ejemplos:

- iconos
- botones genéricos
- PosterGrid
- helpers de UI

Reglas:

- No conoce entidades.
- No conoce features.
- No conoce rutas.
- No contiene lógica de negocio.

---

### widgets/

Composiciones reutilizables de UI.

Se dividen conceptualmente en:

#### Widgets presentacionales

Ejemplos:

- widgets/movie-card

Reglas:

- Pueden depender de entities, shared y lib/routes.
- No deben depender de features.
- Pueden ser usados por features.

#### Widgets de composición

Ejemplos:

- widgets/Header
- widgets/composition/catalog-grid-with-ads

Reglas:

- Pueden combinar features.
- Solo deben ser consumidos por app/ o capas de composición superiores.
- No deben ser importados por features.

---

### features/

Contienen casos de uso concretos.

Ejemplos:

- catalog
- filters
- search
- player
- ads
- movie-detail
- actor-detail
- movies-page
- home

Reglas:

- Una feature no debe depender de app.
- Una feature no debe importar widgets de composición.
- La composición fuerte entre features debe hacerse mediante slots, props, páginas o widgets de composición.
- Cada feature contiene su UI, modelo, configuración y lógica específica.

---

### app/

Capa de rutas de Next.js.

Reglas:

- Las rutas deben ser delgadas.
- Deben componer features/services/widgets.
- No deben contener lógica de negocio.
- Pueden usar metadata, layouts, sitemap, robots y BFF.

---

### lib/api/repositories/

Capa de acceso a datos externos.

Responsabilidad:

- Hablar con Strapi.
- Normalizar respuestas.
- Paginación técnica.
- No conoce UI.

Reglas:

- No debe ser usada directamente por server components de página.
- Para server components, usar lib/queries/.
- Puede ser usada por route handlers/BFF.

---

### lib/queries/

Capa de consultas cacheadas para server components.

Responsabilidad:

- Envolver repositories con cache() de React.
- Ser el punto de entrada de datos para páginas server-side.

Reglas:

- Las páginas y servicios de feature deben preferir lib/queries.
- No debe contener lógica de Strapi.

---

### lib/api/strapi/

Adaptador específico de Strapi.

Responsabilidad:

- Schemas.
- Normalización.
- Parámetros de Strapi.
- Populate.
- Paginación de Strapi.

Reglas:

- No conoce features.
- No conoce UI.
- Solo adapta el CMS externo.

---

### lib/url/

Responsabilidad:

- Parseo y serialización canónica de query params.
- Conversión entre URL y dominio.

---

## Composición de ads

La feature ads es responsable de:

- reglas de colocación,
- banners,
- slots publicitarios.

No debe conocer catálogo.

La combinación de catálogo + ads se realiza en:

widgets/composition/catalog-grid-with-ads

---

## Scroll restore

El scroll restore está scopado por ruta.

- lib/scroll/defer.ts maneja señales por ruta.
- ScrollToTop solo delega si la ruta actual coincide con la señal pendiente.
- Catalog solo controla scroll cuando se regresa a /movies.

---

## Flujo recomendado

    app route
    -> feature service
    -> lib/queries
    -> lib/api/repositories
    -> lib/api/strapi
    -> fetchApi

Para catálogo en cliente:

    MovieGrid
    -> useInfiniteMovies
    -> fetchMoviesFromApi
    -> /api/movies
    -> fetchMoviesWithFilters
    -> Strapi
