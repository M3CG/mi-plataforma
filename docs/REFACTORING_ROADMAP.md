# Roadmap de refactorización fina

Este documento define la siguiente etapa de mejora arquitectónica del proyecto.
El objetivo ya no es corregir violaciones graves, sino refinar la arquitectura para que sea más explícita, testeable y fácil de mantener.

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

## Decisiones arquitectónicas clave

### ❌ NO mover `formatRuntime` a `shared/utils/`

**Decisión:** `formatRuntime` se queda en `entities/movie/lib/format.ts`.

**Razón:** Aunque parece una utilidad de presentación, `formatRuntime` es **específico del dominio Movie**. No es una utilidad genérica como `slugify` o `logger`. Si mañana tenés `Series` con episodios de 45 minutos, ¿usarías el mismo formateador? Probablemente no (querrías "Temporada 1, Episodio 3" o "45min" sin horas).

**Implementación correcta:**
- `formatRuntime` vive en `entities/movie/lib/format.ts`
- Se exporta públicamente desde `entities/movie/index.ts`
- Los widgets lo consumen vía `import { formatRuntime } from '@/entities/movie'`

Esto mantiene la cohesión del dominio sin violar la arquitectura.

### ⏸️ Posponer contratos formales de búsqueda (Etapa 4)

**Decisión:** NO crear una capa de puertos/adaptadores para `MovieSearchRepository` ahora.

**Razón:** YAGNI (You Aren't Gonna Need It). Actualmente tenés **un solo proveedor de búsqueda** (Strapi). Crear contratos formales es over-engineering hasta que realmente necesites cambiar de proveedor.

**Cuándo reconsiderar:** Cuando necesites integrar Elasticsearch, Algolia, o cualquier otro motor de búsqueda además de Strapi.

---

## Etapa 1: APIs públicas de features ✅ COMPLETADA

### Objetivo
Evitar imports profundos entre features y widgets de composición.

### Acciones completadas
1. ✅ Exportar `SearchBar` desde `features/search/index.ts`
2. ✅ Exportar `WATCH_SECTION_ID` desde `features/movie-detail/index.ts`
3. ✅ Exportar `MovieGridSkeleton` desde `features/catalog/index.ts`
4. ✅ Exportar `FilterMenuSkeleton` desde `features/movies-page/index.ts`

### Beneficio
Cada feature pasa a tener una API pública explícita. Esto reduce acoplamiento y hace más fácil cambiar implementaciones internas sin romper consumidores.

---

## Etapa 2: Validar respuesta del BFF con schemas compartidos ✅ COMPLETADA

### Objetivo
Que el BFF garantice el contrato de respuesta.

### Acciones completadas
1. ✅ Importar `PaginatedMoviesSchema` en `app/api/movies/route.ts`
2. ✅ Validar el resultado antes de devolverlo
3. ✅ Devolver respuesta vacía con status 502 si la validación falla

### Beneficio
El contrato entre BFF y cliente de catálogo queda protegido en ambos lados.

---

## Etapa 3: Tests unitarios de lógica pura

### Objetivo
Proteger la lógica de negocio más valiosa.

### Candidatos prioritarios
- `entities/movie/lib/movieKey.ts` (identidad de películas)
- `entities/movie/lib/year.ts` (reglas de año)
- `lib/url/movieFilters.ts` (parseo de filtros)
- `features/filters/lib/parseFiltersForUI.ts` (estado de UI)
- `features/ads/lib/adPlacement.ts` (reglas de colocación)
- `features/player/lib/findNextAvailableSource.ts` (failover de servidores)

### Beneficio
Estas funciones son puras, críticas y fáciles de testear. Dan máxima cobertura con mínimo esfuerzo.

---

## Etapa 4: Optimización de performance con React Server Components

### Objetivo
Mejorar UX mediante streaming y partial prerendering.

### Acciones
1. Implementar React Server Components streaming en el home
2. Usar `React.Suspense` con boundaries más granulares
3. Implementar partial prerendering para páginas estáticas con datos dinámicos
4. Streamear el hero del home mientras carga el resto

### Beneficio
Mejora significativa de LCP (Largest Contentful Paint) y Time to Interactive.

---

## Etapa 5: Error boundaries por feature

### Objetivo
Aislar fallos para que no rompan toda la página.

### Acciones
1. Crear error boundaries específicos para:
   - `features/player` (si el video falla, no rompe el detalle)
   - `features/catalog` (si el grid falla, no rompe el home)
   - `features/search` (si la búsqueda falla, muestra estado vacío)
2. Implementar fallbacks elegantes por feature

### Beneficio
Resiliencia: un fallo en una feature no degrada toda la experiencia.

---

## Etapa 6: Métricas de performance (Web Vitals)

### Objetivo
Instrumentar Core Web Vitals para monitoreo continuo.

### Acciones
1. Integrar `web-vitals` package
2. Reportar LCP, FID, CLS, FCP, TTFB a servicio de analytics
3. Crear dashboard de performance
4. Alertas automáticas cuando métricas degraden

### Beneficio
Visibilidad objetiva de la calidad de experiencia del usuario.

---

## Etapa 7: Simplificar skeletons y loading states

### Objetivo
Que los skeletons se consuman desde APIs públicas.

### Acciones
1. Usar exports públicos de features (ya completado en Etapa 1)
2. Revisar duplicación de skeletons entre rutas
3. Evaluar skeleton compartido en `shared` si tiene sentido

### Beneficio
Consistencia visual y reducción de duplicación.

---

## Etapa 8: Endurecer reglas de imports entre features

### Objetivo
Evitar que una feature use internals de otra feature.

### Acciones
1. Definir qué features pueden ser públicas
2. Exportar solo lo necesario desde cada `index.ts`
3. Agregar regla ESLint para prohibir imports profundos de otras features
4. Excepciones explícitas solo para composición permitida

### Beneficio
Arquitectura más explícita y mantenible.

---

## Criterios de aceptación para futuras etapas

Toda refactorización debe cumplir:
- `npm run lint` pasa sin errores
- `npx tsc --noEmit` pasa sin errores
- No se introducen imports deprecados
- No se mueve lógica de negocio hacia UI
- No se mueve lógica de presentación hacia dominio
- No se introduce infraestructura dentro de features
- No se rompe la composición por slots
- Los cambios deben poder revisarse por capas

---

## Prioridad recomendada

Orden sugerido:
1. ✅ Etapa 1: APIs públicas de features (COMPLETADA)
2. ✅ Etapa 2: Validación de respuesta BFF (COMPLETADA)
3. **Etapa 3: Tests de lógica pura** (siguiente paso)
4. Etapa 4: Performance con RSC
5. Etapa 5: Error boundaries por feature
6. Etapa 6: Métricas de Web Vitals
7. Etapa 7: Simplificar skeletons
8. Etapa 8: Imports estrictos entre features
