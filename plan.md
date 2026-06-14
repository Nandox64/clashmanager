# Plan del Proyecto — Clash Manager

## Estado actual del código (Audit: 12/06/2026)

**Todas las features documentadas en ANTIGRAVITY.md están implementadas.** El `plan.md` anterior estaba desactualizado y mostraba como "Pendiente" lo que ya existía en el código.

### Features implementadas ✅

| # | Feature | Archivos clave |
|---|---------|----------------|
| 1 | Caché cliente localStorage con TTL | `lib/clan-cache.ts`, `lib/store.ts`, `hooks/use-clan-data.ts` |
| 2 | LoadingProgress con fases | `components/dashboard/loading-progress.tsx`, store `progressPhase` |
| 3 | CR API en paralelo (4 calls) | `lib/cr-api.ts:getClanFull()` → `Promise.all()` |
| 4 | Cache API granular `?use_cache=1` | `app/api/firebase/load/route.ts` |
| 5 | Server pre-warm automático | `scripts/warmup.mjs`, `start.bat` |
| 6 | Polling con pausa `visibilitychange` | `hooks/use-clan-data.ts` |
| 7 | Rol cacheado inmediatamente | `onboarding-modal.tsx` → `setCachedRole()` on select |
| 8 | RoleGuard en pages | `components/auth/role-guard.tsx`, settings, recruitment |
| 9 | Regalos upload/delete | `api/resources/{upload,list,delete}/route.ts` |
| 10 | Login/Registro email+password | `app/login/page.tsx`, `AuthContext.signUpWithEmail` |
| 11 | Perfil (firstName, lastName, phone) | `app/profile/page.tsx` |
| 12 | Mazos de Guerra con preselección | `app/war-decks/war-decks-client.tsx` |
| 13 | Ruleta (3 components + 4 APIs) | `components/ruleta/*`, `api/ruleta/{config,spin,state,winners}` |
| 14 | AuthGuard → verify-email | `components/auth/auth-guard.tsx` |
| 15 | Verify Email page | `app/verify-email/page.tsx` |
| 16 | Sidebar CLASE⚔️PRO branding | `components/layout/sidebar.tsx` |
| 17 | Identification Banner | `components/onboarding/identification-banner.tsx` |

---

## Bug crítico resuelto: Service Worker servía caché viejo ✅

### Problema
El SW sigue serviendo contenido cacheado. Los cambios en código no aparecen.
**Tampoco se arregla con hard refresh (Ctrl+Shift+R)** porque hard refresh
no bypassa el Service Worker — solo bypasea HTTP cache.

### Causa raíz
`isStaticAsset()` en `sw.js` usa **cache-first** para `.js` y `.css`:
```js
function isStaticAsset(url) {
  return /\.(js|css|png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf|eot)$/.test(url.pathname);
}
```
Los archivos JS/CSS de Next.js en dev mode no tienen hash de contenido.
Una vez cacheados, el SW los sirve **para siempre** hasta bump de `SW_VERSION`.

### Síntomas
- Cambios en componentes no se reflejan al recargar
- Ni siquiera hard refresh los muestra
- Imágenes actualizadas muestran versión vieja
- En PWA instalada, persiste hasta reinstalar

### Fix aplicado
1. Assets con hash: se mantiene **cache-first** porque son inmutables.
2. JS/CSS en `localhost`/`127.0.0.1`: **network-only** para desarrollo.
3. Assets estáticos sin hash: **stale-while-revalidate** para no bloquear cambios nuevos.
4. `SW_VERSION` actualizado a 7 para forzar limpieza de caches anteriores.

---

## Sesión 1 (resuelto)
- **Causa raíz**: `use-clan-data.ts` refactor eliminó el `useEffect` que iniciaba `fetchData()`.
- **Fix**: se agregó `useEffect(() => { startPolling(); }, [])` dentro del hook `useClanData()`.
- **Service Worker**: cache name único por install, elimina caches viejos en activate.
- **UI**: fuente Cinzel Decorative, imágenes más grandes, CardTitle con font-display.
- **PWA**: service worker, Apple meta tags, icons 192/512/180, manifest.json
- **War Decks**: AI decks desde CR API + trophy path + evolution detection
- **Dashboard**: metric cards en pares, footer V1.0, clan name overflow fix

## Sesión 2 — Features completadas ✅
- Navegación reordenada (Logros debajo de Dashboard, Perfil antes de Ajustes)
- Página Perfil `/profile`: foto, dropdown vinculación, datos miembro, RBAC
- API `/api/profile`: GET/POST, Firestore, mock mode
- Hook useProfile con caché de sesión
- Control de permisos (RBAC): `lib/auth-utils.ts`
- Editor de Posición de Guerra y Escalado del Clan (settings)
- Store (Zustand) ampliado: `localWarTrophies`, `clanScaling`
- Sidebar con rol dinámico
- Service Worker cache bump v3

## Sesión 3 — Features completadas ✅
- Página Regalos `/gifts`: tabs móvil/PC/QR
- Onboarding Modal con caché de sesión
- Identification Banner en dashboard
- Cache de sesión (`profile-cache.ts`)

## Sesión 4 — Mejoras de rendimiento 🚀
- CR API en paralelo (4 calls simultáneas)
- Saves a Firestore en background (no bloquean respuesta)
- Cache siempre devuelto si existe (sin límite de 30min)
- FETCH_TIMEOUT 60s → 120s

## Sesión 5 — Correcciones de UX y roles 🛠️
- Perfil: miembro vinculado se muestra inmediatamente
- Rol cacheado en sessionStorage (`getCachedRole`/`setCachedRole`)
- Ajustes y Reclutar solo para leader/coleader

## Sesión 6 — Features completadas ✅
- Login/Registro email+password con verificación
- AuthGuard → redirección a `/verify-email`
- Verify Email page (reenviar, comprobar, links)
- Mazos de Guerra con preselección automática
- Ruleta SVG (3 components, 4 API routes, modo libre/evento)
- Sidebar CLASE⚔️PRO branding
- RoleGuard en settings y recruitment
- Regalos upload/delete con API
- LoadingProgress con fases
- Caché cliente localStorage con TTL
- Cache API granular `?use_cache=1`
- Server pre-warm automático
- Polling con pausa `visibilitychange`
- Rol cacheado inmediatamente al seleccionar miembro

## Sesión 7 — Seguridad, recursos y vinculaciones ✅
- Regalos: eliminado uso de QR por defecto; `/gifts` consume solo `uploaded.qr`.
- Regalos: eliminadas referencias a wallpapers CDN externos; móvil/PC usan recursos subidos localmente en `public/uploads/{mobile,pc}`.
- Upload de recursos: requiere auth, perfil vinculado a miembro del clan, tipo imagen permitido y tamaño máximo de 3MB.
- Delete de recursos: requiere auth y valida rol `leader` server-side antes de borrar archivos.
- UX: toasts para errores de carga, subida y borrado de recursos; toasts de éxito en upload/delete.
- Perfil: `POST /api/profile` evita `linkedMemberId` duplicado entre perfiles y devuelve `409` si el miembro ya está vinculado.
- Perfil: se persiste `memberLinks` al vincular para mantener trazabilidad miembro → Firebase UID.
- Nuevo endpoint `POST /api/profile/unlink`: solo líder, desvincula perfil y borra `memberLinks`.
- Settings: sección `Vinculaciones` visible para líder con listado de perfiles vinculados y acción de desvincular.
- Verificación: `pnpm --filter @clashmanager/web build` compila y genera rutas; queda aviso existente de ESLint por `eslint-config-next`.

## Sesión 8 — Mejoras visuales en Regalos y Ruleta ✅
- Gifts: descripción de `Recursos` reescrita para explicar biblioteca del clan, recursos ligeros y trazabilidad de aportes.
- Gifts: botones de pestañas simplificados a `Móvil`, `PC`, `Códigos` y `Ruleta`.
- Gifts: al seleccionar una pestaña se muestra título descriptivo en mayúsculas y texto de ayuda contextual.
- Gifts: etiqueta de autor actualizada a `Subido por:` en cada recurso.
- Gifts: fondos/recursos sin autor o con `Anónimo` se atribuyen visualmente al nombre real del líder cargado desde `members`.
- Gifts: títulos principales con fuente blanca, mayor peso visual y contorno oscuro.
- Gifts: descripción e instrucciones de cada sección ubicadas debajo del botón `Subir imagen`.
- Ruleta: en escritorio las instrucciones pasan al lado derecho de la ruleta; en móvil se mantienen apiladas.
- Ruleta: la UI del resultado/ganador se muestra debajo de las instrucciones, en la columna derecha junto a la ruleta.
- Ruleta: sonidos de victoria y derrota más característicos, disparados al mostrar el resultado final.

## Sesión 9 — Service Worker cache fix ✅
- SW_VERSION 7: fuerza eliminación de caches anteriores en `activate`.
- Assets inmutables con hash mantienen cache-first.
- JS/CSS sin hash en desarrollo usan network-only para que los cambios aparezcan al recargar.
- Assets estáticos sin hash usan stale-while-revalidate para actualizar cache en segundo plano.

## Sesión 10 — Fondos y Sidebar temáticos ✅
- Fondo principal cambiado a `bg_piso_verde.webp` (reemplaza `patron.png`).
- Secuencia repetitiva según orden del menú lateral: verde → azul → morado → verde → azul → morado...
  - Verde: `/dashboard`, `/gifts`, `/recruitment`
  - Azul: `/achievements`, `/members`, `/analytics`
  - Morado: `/war-decks`, `/profile`, `/settings`
- Nuevo `page-theme.ts` centraliza fondo, surface y border por ruta.
- `PageBackground` usa el tema activo.
- Sidebar (`premium-sidebar`) y barra móvil superior usan `surface` y `border` del tema con `backdrop-filter: blur(16px)`.
- Bottom tabs móvil usan el mismo surface/border/blur del tema activo.

### Sesión 10b — Componentes temáticos y utilidades CSS ✅
- `hooks/use-theme.ts` creado para acceder al tema actual desde cualquier componente.
- `Card` component ahora es `"use client"`, usa `useTheme()` con `theme.surface` + `theme.border` + `backdrop-filter`.
- Utilidades `bg-glass*` y `border-clash-border` en `globals.css` usan `var(--theme-surface, ...)` y `var(--theme-border, ...)`.
- Nav items (sidebar): base blanco, hover/active oro.
- Iconos inactivos: fondo `theme.border` + icono blanco; activos: fondo dorado + icono oro.

### Sesión 10c — Colores y textos ✅
- Color azul redefinido a `#003E77` (descartados `#1957A4` y `#115288`).
- `text-clash-muted` reasignado a `#c8d0d8` (gris claro).
- Nueva clase `text-clash-dimmed` para textos secundarios aún más tenues.

### Sesión 10d — Layout Analytics ✅
- Página `/analytics` reordenada: MetricCards → Matriz Rendimiento vs Actividad → Rendimiento Individual → grid `lg:grid-cols-2` con Top Donaciones + Comparativa de Jugadores.

### Sesión 10e — Divisores decorativos en Mazos de Guerra ✅
- Se agregaron imágenes divisor (`divisor5.png`, `divisor.png`, `divisor1.png`) dentro de cada card de `/war-decks` (entre descripción y botón).
- Tamaño reducido a `w-2/3` centrado con `mx-auto`.

### Sesión 10f — Logos, divisores en Gifts, instrucciones móvil ✅
- `logo_clase_pro.png`: aumentado a `w-28` en sidebar y `w-52` en login.
- `logoclashroyale.png`: aumentado a `180×135px` en AppShell visible en todas las páginas (desktop), eliminado duplicado de dashboard.
- `divisor2.png` agregado debajo del subtítulo en `/gifts` con `max-w-xs`.
- Instrucciones móvil unificadas: `"Formato vertical 9:16 · Máximo 3MB por imagen."`

### Sesión 10g — Botones al fondo en Mazos de Guerra ✅
- Cada card de `/war-decks` convertido a `flex flex-col`.
- Resultados (errores, mazos cargados) movidos ANTES del botón dentro de un contenedor `flex-1`.
- Botones con `mt-4` para que queden alineados en la parte inferior de las 3 cards.

### Sesión 10h — lanza.png en Miembros en Riesgo ✅
- `lanza.png` agregado al card `Miembros en Riesgo` del dashboard.
- Posicionado `absolute bottom-2 right-2` con opacidad 30% y `pointer-events-none`, visible en ambos estados (con y sin miembros en riesgo).

- Build verificado: `pnpm --filter @clashmanager/web build` compila correctamente.

---

## Sesión 11 — Bugfixes, seguridad, branding y optimizaciones 🛡️

### Branding y UI ✅
- **Clash Manager → logo_cm.webp**: Todo texto "Clash Manager" en UI reemplazado por el logo `logo_cm.webp` (sidebar, login, mobile bar).
- **Metadata renombrada**: `layout.tsx`, `manifest.json`, `war-decks/page.tsx` ahora usan "CLASE⚔️PRO".
- **test-icon.png eliminado**: Icono no referenciado eliminado de `public/`.
- **Hamburger dorado**: Los botones toggle (abrir/cerrar menú) ahora usan `bg-metallic-gold` + `animate-metallic-shimmer` para coincidir con el diseño del logo.

### Seguridad: Auth en API routes ✅
- `POST /api/settings`: ahora requiere autenticación (Bearer token).
- `POST /api/recruits`: ahora requiere autenticación.
- `GET/POST /api/firebase/sync`: ahora requieren autenticación.
- Patrón `getUserUid` reutilizado (mismo que `profile/route.ts`) para todas las rutas.

### Bugfixes ✅
- **useClanData hook**: estado global mutable (`pollingStarted`, `fetching`, `lastFetchTime`) reemplazado por refs. `setInterval` ahora se limpia en `useEffect` cleanup. Se agregó `removeEventListener` para `visibilitychange`.
- **SW_VERSION sincronizado**: `pwa-register.tsx` actualizado de v6 a v7 para coincidir con `sw.js`.
- **`as any` cast eliminado**: `firebase/load/route.ts:84` reemplazado por type assertion segura `as { updatedAt?: number }`.
- **console.log eliminado**: `AuthContext.tsx` ya no expone estado interno en consola del navegador.
- **fetchCR timeout**: `cr-api.ts` ahora tiene AbortController con timeout de 30s.
- **RoleGuard**: ya no muestra spinner infinito para no-autorizados; ahora muestra mensaje "No tienes permisos".
- **selectedMember**: dead code eliminado del store (estado, setter e initial value).

### Code quality ✅
- **AI routes**: `trophy-path-deck/route.ts` y `load-war-decks/route.ts` ahora importan `getToken`, `encodeTag` y `BASE_URL` desde `cr-api.ts` en vez de redefinirlos.
- **`BASE_URL` y `encodeTag` exportados** desde `lib/cr-api.ts` para reutilización.

### Archivos modificados (14)
| Archivo | Cambio |
|---------|--------|
| `sidebar.tsx` | Reemplazo texto+icono por logo_cm.webp; hamburger shimmer |
| `login/page.tsx` | Reemplazo texto+icono por logo_cm.webp; unused import |
| `verify-email/page.tsx` | Texto "Clash Manager" → "CLASE⚔️PRO" |
| `layout.tsx` | Metadata title actualizado |
| `war-decks/page.tsx` | Metadata title actualizado |
| `manifest.json` | name/short_name actualizados |
| `premium.css` | (sin cambios, shimmer ya compatible) |
| `api/settings/route.ts` | Auth check en POST |
| `api/recruits/route.ts` | Auth check en POST |
| `api/firebase/sync/route.ts` | Auth check en GET+POST |
| `api/firebase/load/route.ts` | Fix `as any` cast |
| `lib/cr-api.ts` | Export BASE_URL, encodeTag; fetch timeout |
| `hooks/use-clan-data.ts` | Refs en vez de vars globales; cleanup interval |
| `components/pwa-register.tsx` | SW_VERSION 6→7 |
| `contexts/AuthContext.tsx` | Eliminados console.log |
| `components/auth/role-guard.tsx` | Denied message en vez de spinner |
| `lib/store.ts` | Eliminado selectedMember dead code |
| `api/ai/trophy-path-deck/route.ts` | Eliminadas funciones duplicadas |
| `api/ai/load-war-decks/route.ts` | Importa desde cr-api.ts |
| `public/test-icon.png` | Archivo eliminado |

---

## Sesión 12 — Fix recursos online, títulos unificados, scroll móvil 🎨

### Bugfix: Imágenes de recursos no visibles en producción ✅
- **Causa raíz**: `apps/web/public/uploads/` estaba en `.gitignore`, por lo que las imágenes pre-cargadas no se desplegaban en producción.
- **Fix**: Eliminada la entrada del `.gitignore` por completo. Ahora todos los archivos se trackean y despliegan normalmente.

### UI: divisor2.png ✅
- **Problema**: Separador decorativo muy abajo (`my-6`).
- **Fix**: Cambiado a `my-4` para reducir el espacio vertical.

### UI: Título "Recursos" ✅
- **Problema**: El CardTitle "Recursos" era más pequeño que otros títulos de página.
- **Fix**: Cambiado a `text-xl font-black` para igualar el tamaño de los demás títulos.

### UI: Sombra unificada en títulos ✅
- **Problema**: Solo la página Regalos tenía `text-shadow` con contorno negro. Los demás títulos no tenían sombra.
- **Fix**: 
  - Nueva utility CSS `text-title-shadow` en `globals.css` con opacidad reducida (`rgba(0,0,0,0.5)` con glow `rgba(0,0,0,0.35)`).
  - Aplicada a todos los h1 de página: Dashboard, Logros, Mazos de Guerra, Regalos, Miembros, Estadísticas, Reclutamiento, Perfil, Ajustes.
  - Eliminado el `titleOutline` inline de gifts (reemplazado por la utility).

### Bugfix: Salto scroll en móvil ✅
- **Problema**: `min-h-screen` (100vh) incluye la barra del navegador móvil, causando reflow al ocultarse.
- **Fix**: 
  - Nueva utility `min-h-dynamic` con `min-height: 100dvh` en `globals.css`.
  - `app-shell.tsx`: wrapper y `<main>` cambiados a `min-h-dynamic`.
  - `pb-20` → `pb-24` para mejor espacio sobre el BottomTabs.

### Archivos modificados (16)
| Archivo | Cambio |
|---------|--------|
| `.gitignore` | Ignora solo archivos nuevos, trackea pre-cargados |
| `globals.css` | Nuevas utilities `text-title-shadow` y `min-h-dynamic` |
| `app-shell.tsx` | `min-h-screen` → `min-h-dynamic`; `pb-20` → `pb-24` |
| `gifts/page.tsx` | Sombra via utility; divisor `my-6`→`my-4`; Recursos `text-xl`; eliminado titleOutline |
| `dashboard/dashboard-grid.tsx` | `text-title-shadow` agregado |
| `war-decks/war-decks-client.tsx` | `text-title-shadow` agregado; drop-shadow eliminado |
| `achievements/page.tsx` | `text-title-shadow` agregado |
| `members/page.tsx` | `text-title-shadow` agregado |
| `analytics/page.tsx` | `text-title-shadow` agregado |
| `recruitment/page.tsx` | `text-title-shadow` agregado |
| `profile/page.tsx` | `text-title-shadow` agregado |
| `settings/page.tsx` | `text-title-shadow` agregado |
| `public/uploads/mobile/*` | Archivos forzados a git |
| `public/uploads/pc/*` | Archivos forzados a git |
| `public/uploads/qr/*` | Archivos forzados a git |

---

## Sesión 13 — Optimización de rendimiento integral 🚀

### Problema
Las API routes de la app sufrían latencia extrema (10-20s) por cold starts + lecturas secuenciales + sync pesado en cada carga de página.

### Diagnóstico

| # | Endpoint | Latencia | Causa raíz |
|---|----------|----------|------------|
| 1 | `GET /api/firebase/load` | 5-15s | Llamado por TODAS las páginas. Sync completo: 4 CR API calls + 8 Firestore writes + 5 reads |
| 2 | `GET\|POST /api/firebase/sync` | 5-10s | Reads secuenciales + auth + 4 CR API calls |
| 3 | Settings page | 5-20s | 4 API calls separadas en carga (/load + /profile + /settings + linked-profiles) |
| 4 | `POST /api/ruleta/spin` | 3-18s | 2 reads secuenciales + cold start |
| 5 | Ruleta page | 3-15s | 3 API calls paralelas = 3 cold starts |

### Cambios implementados

#### 1. Shared utility `getUserUid` ✅
- **Nuevo**: `src/lib/api-utils.ts` con función `getUserUid()` compartida
- Eliminadas 7 copias duplicadas del mismo código en rutas API
- Archivos actualizados: `config/route.ts`, `state/route.ts`, `spin/route.ts`, `sync/route.ts`, `profile/route.ts`, `settings/route.ts`, `recruits/route.ts`

#### 2. Endpoint combinado `/api/ruleta/init` ✅
- Un solo `GET /api/ruleta/init` devuelve `{ config, state, winners }` en 1 serverless call
- Reemplaza 3 llamadas separadas (config + state + winners)
- Resultado: 1 cold start en vez de 3

#### 3. Parallelizar reads en ruleta/spin ✅
- `getRuletaConfig` + `getRuletaSpin` ahora corren con `Promise.all`
- Reduce ~200-1000ms por spin request

#### 4. Endpoint ligero `/api/init` ✅
- Nueva ruta `GET /api/init` que solo lee de Firestore (5 lecturas paralelas)
- Sin CR API calls, sin escrituras
- Reemplaza a `/api/firebase/load` para carga de página normal

#### 5. Optimizado `use-clan-data.ts` ✅
- Usa `/api/init` en vez de `/api/firebase/load` para carga rápida
- Solo usa fuerza completa (`?force=1`) en sync manual
- Poll interval reducido de 60s → 120s

#### 6. Cleanup de código ✅
- Eliminado `getUserUid` duplicado en 7 archivos
- Eliminado import de `adminAuth` donde ya no se necesita

### Bugfix: Cold start en ruleta (1er intento falla) ✅
- **Síntoma**: La ruleta falla en el primer intento, funciona en el segundo, luego es inmediata.
- **Causa raíz**: `verifyIdToken()` bloquea el endpoint combinado `/api/ruleta/init` antes de empezar las lecturas Firestore. En cold start (función serverless fría), el timeout de 10s de Vercel Hobby se excede.
- **Fix 1**: Auth y Firestore reads ahora corren en paralelo (`uidPromise` + `getRuletaConfig`/`getRuletaWinners` en `Promise.all`). Si auth falla, config+winners se devuelven igual.
- **Fix 2**: Frontend ahora tiene timeout de 15s en `fetchState` con **retry automático** (1 reintento tras 2s si falla). Esto cubre el caso donde el cold start excede el timeout pero la función se calienta para el reintento.

### Archivos creados (3)
| Archivo | Descripción |
|---------|-------------|
| `lib/api-utils.ts` | Función `getUserUid()` compartida |
| `app/api/ruleta/init/route.ts` | Endpoint combinado ruleta |
| `app/api/init/route.ts` | Endpoint ligero de carga |

### Archivos modificados (9)
| Archivo | Cambio |
|---------|--------|
| `api/ruleta/config/route.ts` | Import `getUserUid` desde utils |
| `api/ruleta/state/route.ts` | Import `getUserUid` + `Promise.all` |
| `api/ruleta/spin/route.ts` | Import `getUserUid` + `Promise.all` |
| `api/firebase/sync/route.ts` | Import `getUserUid` desde utils |
| `api/profile/route.ts` | Import `getUserUid` desde utils |
| `api/settings/route.ts` | Import `getUserUid` desde utils |
| `api/recruits/route.ts` | Import `getUserUid` desde utils |
| `hooks/use-clan-data.ts` | Usa `/api/init` en vez de `/api/firebase/load`; poll 120s |
| `components/ruleta/ruleta-section.tsx` | 1 fetch a `/api/ruleta/init` en vez de 3; timeout 15s + retry |

### Resultados esperados
- **Carga de página**: ~500ms en vez de 5-15s (cache de Firestore, sin CR API)
- **Ruleta**: ~1-2s en vez de 3-15s (1 cold start vs 3). Con retry, incluso si el primer cold start falla, se recupera en 2s.
- **Spin**: ~200-500ms menos por request (reads paralelos)
- **Settings**: Menos latencia porque /load ahora es rápido
- **Polling**: 120s en vez de 60s = mitad de syncs automáticos

---

## Sesión 14 — Mejoras mobile, upload de perfil y UI 🚀

### Bugfix: Ruleta resultado rompe layout en mobile ✅
- **Problema**: El resultado del premio aparecía inline en la columna derecha, empujando contenido y desacomodando el BottomTabs.
- **Fix**: Convertido a **modal overlay fixed** con fondo semitransparente, botón de cerrar (X + "Cerrar"). No afecta scroll ni layout.

### Bugfix: Dashboard mensajes inline causan saltos ✅
- **Problema**: Los textos "Cacheado", "Actualizando..." y el banner de vinculación aparecían/desaparecían inline, moviendo el contenido.
- **Fix**: 
  - "Cacheado" y "Actualizando..." reemplazados por **toasts con sonner** (📦 cache toast, loading toast, success toast).
  - **IdentificationBanner** convertido de banner inline a **modal popup** centrado con opciones "Ir a Perfil" y "Ahora no".

### UI: Títulos separados de la barra superior ✅
- **Fix**: `pt-16` → `pt-20` (y `lg:pt-6` → `lg:pt-8`) en `app-shell.tsx` para dar más espacio entre la barra móvil y el contenido.

### UI: Sidebar sin scroll ✅
- **Problema**: El menú lateral mostraba scroll cuando los items no cabían verticalmente.
- **Fix**: 
  - Nav items distribuyen con `flex flex-col justify-evenly`.
  - Iconos reducidos (18→16px, wrappers 10→9).
  - Padding de items reducido (`0.5rem 0.75rem` → `0.4rem 0.6rem`).
  - Logos del header más compactos (`max-w[180px]` → `max-w[160px]`, `w-38` → `w-28`).

### Feature: Upload persistente de fotos de perfil ✅
- **Problema**: Las fotos de perfil se guardaban como data URL base64 en Firestore, sin persistencia real.
- **Fix**: 
  - Nueva API `POST /api/profile/upload` — sube archivo a `public/uploads/profile/`, devuelve URL.
  - Profile page ahora sube la imagen al servidor y guarda la ruta en Firestore.
  - Carpeta `public/uploads/profile/` creada.
  - Límite 1MB, solo imágenes (jpg, png, webp, gif).

### UI: Descripciones de upload consolidadas ✅
- **Problema**: Textos redundantes entre help del tab e instrucciones inferiores en Gifts.
- **Fix**: 
  - Eliminado bloque de instrucciones redundante en gifts.
  - Unificado tamaño máximo en help de cada tab (ej: "Vertical 9:16 · Máx 3MB por imagen.").
  - Descripción del CardHeader de Recursos simplificada.
  - Perfil ya mostraba "máx 1MB" correctamente.

### Archivos creados (2)
| Archivo | Descripción |
|---------|-------------|
| `app/api/profile/upload/route.ts` | API para subir imágenes de perfil |
| `public/uploads/profile/` | Carpeta para fotos de perfil |

### Archivos modificados (9)
| Archivo | Cambio |
|---------|--------|
| `components/ruleta/ruleta-section.tsx` | Resultado inline → modal overlay; import X |
| `app/dashboard/dashboard-grid.tsx` | Spans "Cacheado"/"Actualizando" → toasts sonner; import useRef |
| `components/onboarding/identification-banner.tsx` | Banner inline → modal popup |
| `components/layout/app-shell.tsx` | `pt-16` → `pt-20`, `lg:pt-6` → `lg:pt-8` |
| `components/layout/sidebar.tsx` | Nav `flex justify-evenly`; iconos/padding reducidos; logos compactos |
| `app/styles/premium.css` | Nav-item padding reducido |
| `app/profile/page.tsx` | Upload vía API en vez de data URL; import useAuth |
| `app/gifts/page.tsx` | Help tabs unificado con tamaño; textos redundantes eliminados |
| `plan.md` | Documentación de Sesión 14 |
