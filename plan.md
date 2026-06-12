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

## Bug crítico activo: Service Worker sirve caché viejo 🐛

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

### Fix propuesto (mañana)
1. Reemplazar cache-first por **stale-while-revalidate** para assets estáticos sin hash
2. Agregar detección de `localhost` → network-only para JS/CSS en dev mode
3. `hasHash()` → mantener cache-first (correcto, son inmutables)
4. Bump `SW_VERSION` a 7 tras el fix

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
