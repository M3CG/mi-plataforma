# Arquitectura del proyecto

Este proyecto sigue una arquitectura basada en capas con separación estricta de responsabilidades.

El objetivo es que cada capa tenga una responsabilidad clara, testeable y estable en el tiempo.

---

## Principios generales

- Cada capa tiene una responsabilidad única.
- El dominio no conoce UI, URL, CMS, fetch, cache ni framework.
- La UI no habla directamente con Strapi.
- La composición fuerte entre features ocurre en `app/` o en `widgets/composition/`.
- Los contratos de datos se validan en la capa adecuada.
- Los query params, labels y estados de UI no pertenecen a las entidades.
- Las features no deben poseer infraestructura de acceso a datos si ya existe una capa canónica para eso.

---

## Capas

### entities/

Contiene reglas y modelos de negocio puros.

Ejemplos:

- `Movie`
- `Category`
- `Person`
- filtros de dominio
- valores válidos de sorting
- reglas de año
- identidad de una película
- deduplicación por identidad

Reglas:

- No conoce React.
- No conoce Next.js.
- No conoce rutas.
- No conoce query params de URL.
- No conoce Strapi.
- No conoce fetch, cache ni repositories.
- No conoce widgets, features, app ni shared.
- No conoce `lib/url`, `lib/api`, `lib/queries`, `lib/validation`, `lib/config`, `lib/scroll` ni `lib/utils`.
- No expone view models de presentación.
- No define labels de UI.
- No define opciones de dropdown, botones o textos visibles.

Responsabilidades correctas:

- Tipos de dominio.
- Reglas de negocio.
- Validaciones de dominio.
- Identidad de entidades.
- Valores canónicos de sorting.
- Reglas de rango de año.

---

### shared/

Componentes y utilidades genéricas reutilizables.

Ejemplos:

- iconos
- botones genéricos
- `PosterGrid`
- helpers de UI genéricos

Reglas:

- No conoce entidades.
- No conoce features.
- No conoce rutas.
- No conoce API.
- No conoce queries.
- No conoce validación de payloads.
- No contiene lógica de negocio.

---

### widgets/

Composiciones reutilizables de UI.

Se dividen en dos tipos conceptuales.

#### Widgets presentacionales

Ejemplo:

- `widgets/movie-card`

Reglas:

- Pueden depender de `entities`.
- Pueden depender de `shared`.
- Pueden depender de `lib/routes`.
- Pueden usar utilidades puras permitidas.
- No deben depender de features.
- No deben depender de app.
- No deben depender de API.
- No deben depender de queries.
- No deben depender de URL params.
- No deben depender de validación de payloads.

Ubicación correcta de view models de tarjeta:

- `widgets/movie-card/lib/createMovieCardViewModel.ts`

Motivo:

El `MovieCardViewModel` no pertenece a la entidad `Movie`, porque es una transformación específica para una tarjeta de UI.

---

#### Widgets de composición

Ejemplos:

- `widgets/Header`
- `widgets/composition/catalog-grid-with-ads`
- `widgets/composition/movie-player`

Reglas:

- Pueden combinar features.
- Solo deben ser consumidos por `app/` o capas superiores de composición.
- No deben ser importados por features.
- No deben hablar directamente con repositories.
- No deben hablar directamente con Strapi.
- No deben usar queries directamente si su responsabilidad es solo componer UI.

---

### features/

Contienen casos de uso concretos.

Ejemplos:

- `catalog`
- `filters`
- `search`
- `player`
- `ads`
- `movie-detail`
- `actor-detail`
- `movies-page`
- `home`
- `navigation`

Reglas:

- Una feature no debe depender de `app`.
- Una feature no debe importar widgets de composición.
- Una feature no debe hablar directamente con Strapi.
- Una feature no debe importar `lib/api/http`.
- Una feature no debe importar `lib/api/strapi`.
- Una feature no debe importar `lib/api/repositories` para flujos server-side.
- Para flujos server-side, debe usar `lib/queries`.
- Para flujos client-side, debe consumir el BFF mediante `fetch`, no Strapi directamente.
- La composición fuerte entre features debe hacerse mediante slots, props, páginas o widgets de composición.

Responsabilidades correctas:

- UI de la feature.
- hooks de la feature.
- servicios de página.
- casos de uso de aplicación.
- configuración específica de la feature.
- estado de UI específico de la feature.
- labels y opciones de UI.

---

### app/

Capa de rutas de Next.js.

Reglas:

- Las rutas deben ser delgadas.
- Deben componer features, services y widgets.
- No deben contener lógica de negocio.
- Las páginas no deben importar repositories.
- Las páginas no deben importar `lib/api/http`.
- Las páginas no deben importar `lib/api/strapi`.
- Las páginas deben preferir feature services y `lib/queries`.
- Los route handlers/BFF sí pueden usar repositories.
- Pueden usar metadata, layouts, sitemap, robots y BFF.

---

### lib/url/

Capa canónica de URL y query params.

Responsabilidad:

- Parseo y serialización de query params.
- Conversión entre URL y dominio.
- Definir los nombres canónicos de query params.

Archivos canónicos:

- `lib/url/movieFilterParams.ts`
- `lib/url/movieFilters.ts`

Reglas:

- No contiene estado de UI.
- No contiene lógica de React.
- No contiene labels.
- No conoce features.
- No conoce widgets.
- No conoce API.
- No conoce Strapi.
- Puede conocer entidades porque convierte URL a dominio.

Ubicación correcta de params:

- `MOVIE_FILTER_PARAM_KEYS` vive en `lib/url/movieFilterParams.ts`.
- `MOVIE_PAGINATION_PARAM_KEYS` vive en `lib/url/movieFilterParams.ts`.

Ubicación correcta de parsing/serialización:

- `parseMovieFiltersFromSearchParams`
- `parseMovieFiltersFromRecord`
- `serializeMovieFiltersToSearchParams`

---

### features/filters/

Feature responsable de la UI de filtros.

Responsabilidades correctas:

- labels de sorting
- labels de rating
- estado de UI de filtros
- parseo de filtros para la UI
- interacciones de dropdowns
- filtros activos

Ubicación correcta:

- `features/filters/config/sortOptions.ts`
- `features/filters/config/options.ts`
- `features/filters/lib/parseFiltersForUI.ts`

Motivo:

Los labels como `Recientes`, `Antiguas`, `Mejor Puntuadas` pertenecen a la UI, no al dominio.

---

### lib/api/repositories/

Capa de acceso a datos externos.

Responsabilidad:

- Hablar con Strapi.
- Normalizar respuestas.
- Manejar paginación técnica.
- Exponer datos listos para queries o BFF.

Reglas:

- No conoce UI.
- No conoce features.
- No conoce widgets.
- No conoce app.
- No debe ser usada directamente por server components de página.
- Puede ser usada por route handlers/BFF.
- Para server components, usar `lib/queries`.

Archivos canónicos:

- `movies.ts`
- `categories.ts`
- `actors.ts`
- `countries.ts`
- `movieSearch.ts`

---

### lib/queries/

Capa de consultas cacheadas para server components.

Responsabilidad:

- Envolver repositories con `cache()` de React.
- Ser el punto de entrada de datos para páginas server-side.

Reglas:

- Las páginas y servicios de feature deben preferir `lib/queries`.
- No debe contener lógica de Strapi.
- No debe contener lógica de UI.
- No debe importar features.
- No debe importar widgets.
- No debe importar `lib/api/http`.
- No debe importar `lib/api/strapi`.

Archivos canónicos:

- `movies.ts`
- `categories.ts`
- `actors.ts`
- `countries.ts`
- `search.ts`

---

### lib/api/strapi/

Adaptador específico de Strapi.

Responsabilidad:

- Schemas de Strapi.
- Normalización de respuestas de Strapi.
- Parámetros de Strapi.
- Populate.
- Paginación de Strapi.

Reglas:

- No conoce features.
- No conoce UI.
- No conoce widgets.
- No conoce app.
- Solo adapta el CMS externo.

---

### lib/validation/

Capa de validación de payloads de API/BFF.

Responsabilidad:

- Definir schemas Zod para respuestas normalizadas del BFF.
- Validar contratos de entrada/salida del cliente de catálogo.

Archivo canónico:

- `moviePayloadSchemas.ts`

Reglas:

- No conoce features.
- No conoce widgets.
- No conoce UI.
- No conoce entidades si el schema es autosuficiente.
- No conoce Strapi.

---

## Ubicaciones canónicas actuales

| Concepto | Ubicación correcta |
|---|---|
| Modelo `Movie` | `entities/movie/types/movie.ts` |
| Modelo `Category` | `entities/category/types.ts` |
| Modelo `Person`, `Actor`, `Director` | `entities/person/types.ts` |
| Identidad de película | `entities/movie/lib/movieKey.ts` |
| Reglas de año | `entities/movie/lib/year.ts` |
| Valores de sorting | `entities/movie/config/sort.ts` |
| Query params de filtros | `lib/url/movieFilterParams.ts` |
| Parsing/serialización de filtros | `lib/url/movieFilters.ts` |
| Estado de filtros para UI | `features/filters/lib/parseFiltersForUI.ts` |
| Opciones de sorting con labels | `features/filters/config/sortOptions.ts` |
| MovieCardViewModel | `widgets/movie-card/lib/createMovieCardViewModel.ts` |
| Repositorio de búsqueda | `lib/api/repositories/movieSearch.ts` |
| Queries de búsqueda | `lib/queries/search.ts` |
| Schemas de payload del catálogo | `lib/validation/moviePayloadSchemas.ts` |

---

## Flujo recomendado para páginas server-side

Para páginas server-side:

`app route`
→ `feature service`
→ `lib/queries`
→ `lib/api/repositories`
→ `lib/api/strapi`
→ `fetchApi`

Ejemplo:

`app/movies/page.tsx`
→ `getMoviesPageData`
→ `getMoviesWithFilters`
→ `fetchMoviesWithFilters`
→ Strapi

---

## Flujo recomendado para catálogo en cliente

Para catálogo en cliente:

`MovieGrid`
→ `useInfiniteMovies`
→ `fetchMoviesFromApi`
→ `/api/movies`
→ `fetchMoviesWithFilters`
→ Strapi

El cliente nunca habla directamente con Strapi.

---

## Flujo recomendado para búsqueda server-side

`app/search/page.tsx`
→ `getSearchPageData`
→ `searchMovies`
→ `lib/queries/search`
→ `lib/api/repositories/movieSearch`
→ Strapi

La feature `search` orquesta el caso de uso, pero no posee infraestructura directa de Strapi.

---

## Composición de ads

La feature `ads` es responsable de:

- reglas de colocación,
- banners,
- slots publicitarios.

No debe conocer catálogo.

La combinación de catálogo + ads se realiza en:

`widgets/composition/catalog-grid-with-ads`

---

## Scroll restore

El scroll restore está scopado por ruta.

- `lib/scroll/defer.ts` maneja señales por ruta.
- `ScrollToTop` solo delega si la ruta actual coincide con la señal pendiente.
- Catalog solo controla scroll cuando se regresa a `/movies`.

---

## Cambios prohibidos

No se debe:

- crear view models de UI dentro de `entities/`
- definir labels de UI dentro de `entities/`
- definir query params dentro de `entities/`
- crear una capa `types/` deprecada
- crear repositorios dentro de features
- importar Strapi desde features
- importar repositories desde features para flujos server-side
- importar repositories desde páginas
- poner estado de UI en `lib/url`
- duplicar schemas Zod de payload dentro de features si ya existe `lib/validation`

---

## Siguiente etapa

La siguiente etapa está documentada en:

`docs/REFACTORING_ROADMAP.md`
