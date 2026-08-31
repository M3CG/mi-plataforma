# CineStream — Frontend

Plataforma de streaming de películas con **Next.js 16 (App Router)**,
**React 19**, **TypeScript estricto** y **Tailwind CSS 4**.
CMS: **Strapi 5** (carpeta `backend/`), datos enriquecidos desde **TMDB**.

## Arquitectura

Capas con responsabilidades estrictas (ver `ARCHITECTURE.md`):

```
entities/   → dominio puro (Movie, Category, Person, reglas)
shared/     → UI genérica sin negocio
widgets/    → composiciones reutilizables de UI
features/   → casos de uso (catalog, search, player, filters...)
lib/        → infraestructura (api, queries, url, validation)
app/        → rutas delgadas + BFF (/api/*)
```

El cliente **nunca** habla con Strapi directamente: todo pasa por el BFF.

## Scripts

```bash
npm run dev     # desarrollo
npm run build   # build de producción
npm run check   # eslint + tsc --noEmit
npm test        # vitest (lógica pura)
```

## Variables de entorno

Ver `.env.example`. Las herramientas de administración (`/admin/import`)
solo existen en desarrollo local (`NODE_ENV=development`).

## Roadmap

Las decisiones de refactorización fina viven en `docs/REFACTORING_ROADMAP.md`.
