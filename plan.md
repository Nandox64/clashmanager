# Plan del Proyecto — Clash Manager

## Sesión 1 (resuelto)
- **Causa raíz**: `use-clan-data.ts` refactor eliminó el `useEffect` que iniciaba `fetchData()`.
  El `startPolling()` solo lo llamaba `<DataProvider>` en `layout.tsx`.
- **Fix**: se agregó `useEffect(() => { startPolling(); }, [])` dentro del hook `useClanData()`.
- **Service Worker**: cache name único por install (`Date.now()`), elimina caches viejos en activate.
- **UI**: fuente Cinzel Decorative, imágenes más grandes (cofre1.png, duende.png),
  CardTitle con font-display.
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

## Sesión 6 — Pendientes y roadmap 🔧

| Prioridad | Descripción | Estado |
|-----------|-------------|--------|
| 🔴 Crítica | Caché cliente localStorage (P1) | Pendiente |
| 🔴 Crítica | Feedback de progreso de carga (P2) | Pendiente |
| 🟡 Alta | Cache API granular `use_cache=1` (P4) | Pendiente |
| 🟡 Alta | Server pre-warm (P5) | Implementado |
| 🟡 Alta | CR API + Firestore en paralelo (P3) | Parcial |
| 🟢 Media | RoleGuard en pages (P9) | Pendiente |
| 🟢 Media | Rol robusto (P7) | Parcial |
| 🟢 Media | Polling optimizado (P6) | Pendiente |
| 🔵 Baja | Assets regalos reales (P8) | Pendiente |
