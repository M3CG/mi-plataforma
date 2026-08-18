# Arquitectura del proyecto

Este proyecto sigue una arquitectura basada en capas con separación de responsabilidades.

## Capas

### `entities/`
Contiene reglas y modelos de negocio puros.

Ejemplos:
- `Movie`
- `Category`
- `Person`
- filtros de películas
- sorting de películas
- reglas de año
- identidad de una película

Reglas:
- No conoce rutas de la app.
- No conoce Strapi.
- No conoce React Query, cache, fetch ni UI.
- Puede exponer view models simples si pertenecen a la entidad.

---

### `features/`
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

Reglas:
- Una feature no debe depender directamente de otra feature.
- La composición entre features se hace mediante slots, props o páginas.
- Cada feature contiene su UI, modelo, configuración y lógica específica.

---

### `widgets/`
Composiciones reutilizables de más alto nivel.

Ejemplos:
- `Header`
- `AppMovieCard`

Reglas:
- Pueden combinar entidades y features.
- No deben contener reglas de negocio profundas.

---

### `shared/`
Componentes y utilidades genéricas reutilizables.

Ejemplos:
- iconos
- botones genéricos
- helpers de UI

Reglas:
- No conoce entidades.
- No conoce features.
- No contiene lógica de negocio.

---

### `app/`
Capa de rutas de Next.js.

Reglas:
- Las rutas deben ser delgadas.
- Deben componer features/services.
- No deben contener lógica de negocio.
- Pueden usar metadata, layouts, sitemap, robots y BFF.

---

### `lib/api/repositories/`
Capa de acceso a datos externos.

Responsabilidad:
- Hablar con Strapi.
- Normalizar respuestas.
- Paginación técnica.
- No conoce UI.

Reglas:
- No debe ser usada directamente por server components de página.
- Para server components, usar `lib/queries/`.
- Puede ser usada por route handlers/BFF.

---

### `lib/queries/`
Capa de consultas cacheadas para server components.

Responsabilidad:
- Envolver repositories con `cache()` de React.
- Ser el punto de entrada de datos para páginas server-side.

Reglas:
- Las páginas y servicios de feature deben preferir `lib/queries`.
- No debe contener lógica de Strapi.

---

### `lib/api/strapi/`
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

## Flujo recomendado

```txt
app route
  → feature service
    → lib/queries
      → lib/api/repositories
        → lib/api/strapi
          → fetchApi