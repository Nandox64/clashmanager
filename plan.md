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

- Build verificado: `pnpm --filter @clashmanager/web build` compila correctamente.
