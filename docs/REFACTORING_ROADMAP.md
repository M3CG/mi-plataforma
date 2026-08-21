# Roadmap de refactorización fina

Este documento define la siguiente etapa de mejora arquitectónica del proyecto.

El objetivo ya no es corregir violaciones graves, sino refinando la arquitectura para que sea más explícita, testeable y fácil de mantener.

---

## Estado actual

Ya se corrigieron las violaciones críticas de separación de responsabilidades:

- El `MovieCardViewModel` salió de `entities/`.
- Los query params salieron de `entities/`.
- Las opciones de sorting con labels salieron de `entities/`.
- Se eliminó la capa deprecada `types/`.
- Search ya no tiene un repository propio dentro de la feature.
- El estado de UI de filtros salió de `lib/url`.
- El catálogo ya no duplica schemas Zod dentro de la feature.
- Se agregaron reglas ESLint para evitar regresiones.

---

## Etapa 1: mover utilidades puras de presentación a shared

### Objetivo

Que los widgets presentacionales dependan de `shared` en lugar de utilidades de `lib/utils`.

### Acciones

1. Crear `shared/utils/format.ts`.
2. Mover `formatRuntime` desde `lib/utils/format.ts`.
3. Actualizar imports en:
   - `widgets/movie-card/lib/createMovieCardViewModel.ts`
   - `features/movie-detail/lib/createMovieDetailViewModel.ts`
4. Si `lib/utils/format.ts` queda vacío, eliminarlo.
5. Opcionalmente, endurecer ESLint para que `widgets/movie-card` no importe `lib/utils/format`.

### Beneficio

`shared` se convierte en la capa correcta para utilidades genéricas de UI, y los widgets presentacionales quedan más alineados con la arquitectura declarada.

---

## Etapa 2: exponer APIs públicas de features

### Objetivo

Evitar imports profundos entre features y widgets de composición.

### Problemas actuales

Ejemplos de imports profundos que conviene limpiar:

- `widgets/Header/Header.tsx` importa `@/features/search/ui/SearchBar`.
- `widgets/composition/movie-player/MoviePlayerSection.tsx` importa `@/features/movie-detail/config/movieDetail`.
- `app/movies/loading.tsx` importa `@/features/catalog/ui/MovieGridSkeleton`.
- `app/search/loading.tsx` importa `@/features/catalog/ui/MovieGridSkeleton`.
- `app/movies/page.tsx` importa `@/features/movies-page/ui/FilterMenuSkeleton`.

### Acciones

1. Exportar `SearchBar` desde `features/search/index.ts`.
2. Usar `WATCH_SECTION_ID` desde `features/movie-detail/index.ts`.
3. Usar `MovieGridSkeleton` desde `features/catalog/index.ts`.
4. Usar `FilterMenuSkeleton` desde `features/movies-page/index.ts`.
5. Luego, agregar reglas ESLint para prohibir imports profundos de features fuera de la propia feature.

### Beneficio

Cada feature pasa a tener una API pública explícita. Esto reduce acoplamiento y hace más fácil cambiar implementaciones internas sin romper consumidores.

---

## Etapa 3: validar respuesta del BFF con schemas compartidos

### Objetivo

Que el BFF no solo reciba filtros, sino que también garantice el contrato de respuesta.

### Acciones

1. Importar `PaginatedMoviesSchema` en `app/api/movies/route.ts`.
2. Validar el resultado de `fetchMoviesWithFilters` antes de devolverlo con `NextResponse.json`.
3. Si la validación falla, loguear y devolver una respuesta vacía con status 500 o 502 según criterio.
4. Mantener el schema en `lib/validation/moviePayloadSchemas.ts`.

### Beneficio

El contrato entre BFF y cliente de catálogo queda protegido en ambos lados.

---

## Etapa 4: contratos de búsqueda más explícitos

### Objetivo

Definir mejor el contrato de búsqueda sin romper la arquitectura actual.

### Acciones

1. Evaluar una capa de contratos/puertos para búsqueda.
2. Definir la interfaz `MovieSearchRepository` en una capa neutral.
3. Hacer que `lib/api/repositories/movieSearch.ts` implemente ese contrato.
4. Mantener `lib/queries/search.ts` como punto de entrada cacheado.

### Beneficio

La arquitectura queda más preparada para cambiar de proveedor de búsqueda sin tocar features.

---

## Etapa 5: tests unitarios de lógica pura

### Objetivo

Proteger la lógica de negocio más valiosa.

### Candidatos prioritarios

- `entities/movie/lib/movieKey.ts`
- `entities/movie/lib/year.ts`
- `lib/url/movieFilters.ts`
- `features/filters/lib/parseFiltersForUI.ts`
- `features/search/domain/normalize.ts`
- `features/search/domain/scoring.ts`
- `features/search/domain/mergeSearchResults.ts`
- `features/ads/lib/adPlacement.ts`
- `features/player/lib/findNextAvailableSource.ts`

### Beneficio

Estas funciones son puras, críticas y fáciles de testear. Dan máxima cobertura con mínimo esfuerzo.

---

## Etapa 6: simplificar skeletons y loading states

### Objetivo

Que los skeletons se consuman desde APIs públicas y no desde rutas internas.

### Acciones

1. Usar exports públicos de features.
2. Revisar duplicación de skeletons entre `app/movies/loading.tsx` y `app/search/loading.tsx`.
3. Evaluar un skeleton compartido en `shared` o en una feature si tiene sentido.

---

## Etapa 7: endurecer reglas de imports entre features

### Objetivo

Evitar que una feature use internals de otra feature.

### Acciones

1. Definir qué features pueden ser públicas.
2. Exportar solo lo necesario desde cada `index.ts`.
3. Agregar regla ESLint para prohibir imports profundos de otras features.
4. Excepciones explícitas solo para composición permitida.

---

## Criterios de aceptación para futuras etapas

Toda refactorización debe cumplir:

- `npm run lint` pasa sin errores.
- `npx tsc --noEmit` pasa sin errores.
- No se introducen imports deprecados.
- No se mueve lógica de negocio hacia UI.
- No se mueve lógica de presentación hacia dominio.
- No se introduce infraestructura dentro de features.
- No se rompe la composición por slots.
- Los cambios deben poder revisarse por capas.

---

## Prioridad recomendada

Orden sugerido:

1. Etapa 1: utilidades de shared.
2. Etapa 2: APIs públicas de features.
3. Etapa 5: tests de lógica pura.
4. Etapa 3: validación de respuesta BFF.
5. Etapa 4: contratos de búsqueda.
6. Etapa 6: skeletons.
7. Etapa 7: imports estrictos entre features.
