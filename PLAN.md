# ClashManager — Plan Maestro

> Aplicación de gestión inteligente para clanes de Clash Royale
> Estado: Implementación activa | Versión: 0.4 (MVP en desarrollo)

---

## Índice

1. [Visión General](#1-visión-general)
2. [Sistema de Roles](#2-sistema-de-roles)
3. [Dashboard Principal](#3-dashboard-principal)
4. [Sistema de Estadísticas](#4-sistema-de-estadísticas)
5. [Sistema de Gamificación](#5-sistema-de-gamificación)
6. [Automatización Inteligente](#6-automatización-inteligente)
7. [Sistema de Reclutamiento](#7-sistema-de-reclutamiento)
8. [Ideas Avanzadas](#8-ideas-avanzadas)
9. [UX / UI](#9-ux--ui)
10. [Arquitectura Técnica](#10-arquitectura-técnica)
11. [Roadmap](#11-roadmap)
12. [Extra — Ideas No Convencionales](#12-extra--ideas-que-un-líder-normal-no-pensaría)

---

## 1. VISIÓN GENERAL

**Nombre provisional:** ClashManager

**Objetivo principal:** Plataforma SaaS de gestión inteligente para clanes de Clash Royale que automatiza el análisis, la toma de decisiones y la motivación de jugadores.

**Usuarios objetivo:**
- Líderes / Colíderes (power users)
- Veteranos (moderación + datos limitados)
- Miembros (auto-servicio, estadísticas personales, gamificación)

**Propuesta de valor única:**
- Dashboard tipo "war room" con inteligencia de datos en tiempo real
- Automatización de grooming (detectar inactivos, sugerir ascensos/expulsiones)
- Gamificación que mantiene engagement sin intervención manual
- Identidad visual estilo eSport profesional

**Diferenciadores frente a trackers existentes:**
- No es solo tracker — es un sistema de gestión de roster con inteligencia
- Combina estadísticas + automatización + psicología de retención
- Diseñado específicamente para el flujo de trabajo de un líder de clan

---

## 2. SISTEMA DE ROLES

### Tabla de Permisos

| Rol | Acceso Dashboard | Gestionar Miembros | Expulsar | Ascender | Ver Stats Completas | Moderar Chat | Configurar Clan | Automatización | Ver Stats Personales |
|-----|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| **Líder** | Full | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (no eliminar clan) | Configurar todo | ✅ |
| **Colíder** | Full | ✅ | ✅ | ✅ (hasta colíder) | ✅ | ✅ | ✅ (no eliminar clan) | Activar/desactivar reglas | ✅ |
| **Veterano** | Limitado | ❌ | ❌ | ❌ | Ver | ✅ | ❌ | Solo ver reglas activas | ✅ |
| **Miembro** | Propio | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

### Permisos Granulares Adicionales

- `can_approve_recruits` — Veteranos pueden aceptar reclutas en período de prueba
- `can_manage_events` — Colíderes crean eventos semanales
- `can_view_analytics` — Control de profundidad de datos visibles
- `can_manage_medals` — Quién otorga medallas / recompensas

---

## 3. DASHBOARD PRINCIPAL

Diseño tipo "war room" con layout de cuadrícula asimétrica:

```
┌─────────────────┬──────────────────┬──────────────────┐
│   TOP COPA$     │   TOP DONADORES  │  INACTIVOS ⚠️    │
│ 1. PlayerA 7800 │ 1. PlayerX 850   │  PlayerM - 7d    │
│ 2. PlayerB 7600 │ 2. PlayerY 720   │  PlayerN - 5d    │
│ 3. PlayerC 7400 │ 3. PlayerZ 690   │  PlayerO - 3d    │
│ ...             │ ...              │  (ver todos →)   │
├─────────────────┴──────────────────┼──────────────────┤
│         RENDIMIENTO SEMANAL        │  GUERRA ACTIVA   │
│  ┌────────────────────────────┐    │  🏆 Medallas: 32 │
│  │   📈 Gráfico de copas      │    │  Batallas: 12/20 │
│  │   (7 días)                 │    │  Participación: │
│  └────────────────────────────┘    │  ██████░░ 60%   │
├────────────────────────────────────┴──────────────────┤
│         EVOLUCIÓN DEL CLAN                           │
│  ┌──────────────────────────────────────────────┐    │
│  │  📊 Línea de copas totales (30 días)         │    │
│  └──────────────────────────────────────────────┘    │
├────────────────────┬─────────────────────────────────┤
│  ALERTAS 🚨        │  MIEMBROS EN RIESGO            │
│  • PlayerK 3 días  │  • PlayerR - bajo donaciones   │
│  • PlayerL 2 días  │  • PlayerS - sin guerra 2 sem  │
│  • 5 sin donar hoy │  • PlayerT - copas estancadas  │
├────────────────────┴─────────────────────────────────┤
│  JUGADORES DESTACADOS ⭐                             │
│  PlayerA: +250 copas esta semana 🚀                  │
│  PlayerX: 500 donaciones esta semana 🏅              │
└──────────────────────────────────────────────────────┘
```

### Componentes Clave

- Tarjetas métricas con indicadores de cambio (↑↓)
- Sidebar colapsable con notificaciones en vivo
- Vista de calendario para eventos de guerra
- Mini feed de actividad reciente

---

## 4. SISTEMA DE ESTADÍSTICAS

### 4.1 Progreso de Copas
- Gráfico de líneas (30d, 7d, 90d) por jugador y agregado
- Heatmap de días de farming (qué días suben más)
- Proyección de tendencia (regresión lineal simple)

### 4.2 Donaciones
- Bar chart semanal por jugador
- Tabla de líderes con medallas por alcanzar metas
- Métricas: promedio diario, máximo histórico, racha actual

### 4.3 Actividad
- Timeline de última conexión con código de colores
  - <24h 🟢
  - <48h 🟡
  - <72h 🟠
  - >72h 🔴
- Score de actividad compuesto (copas + donaciones + guerra) normalizado 0-100

### 4.4 Guerra
- Participación histórica por jugador (%)
- Tarjetas recolectadas promedio
- Batallas ganadas/perdidas
- Ranking interno de guerra

### 4.5 Dashboard Analítico (Vista Avanzada)
- Gráfico radar comparativo entre jugadores
- Matriz 2x2 (Actividad vs Rendimiento) para identificar:
  - ★ **Estrellas** (alto rendimiento, alta actividad)
  - ⚠️ **Talento dormido** (alto rendimiento, baja actividad)
  - 💪 **Trabajadores** (bajo rendimiento, alta actividad)
  - ❌ **Lastre** (bajo rendimiento, baja actividad)
- Score de salud del clan (0-100) basado en todos los KPIs

---

## 5. SISTEMA DE GAMIFICACIÓN

### Medallas y Logros

| Medalla | Requisito | Efecto |
|---------|-----------|--------|
| 🥇 Leyenda de la Guerra | 10 guerras con 100% participación | Título especial |
| 🏅 Corazón del Clan | 30 días donando diario | +10 XP semanal |
| ⚡ Imparable | +500 copas en una semana | Badge en perfil |
| 🛡️ Guardián | Más donaciones del mes | Mención en MVP mensual |
| 🎯 Francotirador | MVP de guerra 3 veces seguidas | Rango automático a Veterano sugerido |
| 💎 Diamante en Bruto | Mejor ratio de mejora de copas/día | Tag "promesa" en roster |
| 🔥 En llamas | Racha de 7 días activo | Boost visual (emoji 🔥 en lista) |
| 🧠 Estratega | Predecir resultado correcto de guerra 5 veces | Rol honorífico |

### Sistema de XP y Niveles Internos
- Cada jugador tiene XP interno (no visible a ellos)
- Sube con: actividad diaria, donaciones, guerra, retos ganados
- Al alcanzar niveles, se desbloquean títulos visuales
- Nvl 1-10 → Recluta
- Nvl 11-25 → Guerrero
- Nvl 26-50 → Élite
- Nvl 51+ → Leyenda

### Eventos Semanales Automáticos
- **Lunes:** Reto "Donation King" (más donaciones del día)
- **Miércoles:** "War Ready" (tener todas las tarjetas de guerra listas)
- **Viernes:** "Push Friday" (más copas ganadas en 24h)
- **Domingo:** "MVP de la Semana" (anuncio automático con stats)

---

## 6. AUTOMATIZACIÓN INTELIGENTE

### Reglas Automatizadas Configurables

```
🔹 INACTIVIDAD
  SI (última conexión > N días) → Marcar como "En riesgo"
  SI (última conexión > M días) → Sugerir expulsión al líder
  Parámetros: N y M configurables (default: 5 y 10)

🔹 BAJO RENDIMIENTO
  SI (copas semanales < umbral) AND (guerra < umbral) → Alerta
  Si persiste 2 semanas → Sugerir degradación o expulsión

🔹 ASCENSOS AUTOMÁTICOS (sugerencia)
  SI (actividad > 90% por 14 días) AND (donaciones top 5) → Recomendar ascenso a Veterano
  SI (consistente por 30 días) AND (liderazgo en guerra) → Recomendar Colíder

🔹 ROSTER OPTIMIZATION
  Cada domingo: generar "Weekly Report" con:
  - Miembros que deberían ser expulsados
  - Miembros listos para ascender
  - Jugadores destacados
  - Salud general del clan
  - Predicción: "Si expulsas a X e invitas a Y, el clan subiría ~Z copas"
```

### Resúmenes Automáticos
- **Daily Digest** (7am): Jugadores que no han entrado en 24h, donaciones de ayer
- **Weekly Report** (domingo 8pm): Análisis completo con gráficas embebidas
- **War Recap** (post-guerra): MVP, estadísticas, comparativa con guerra anterior

---

## 7. SISTEMA DE RECLUTAMIENTO

### Pipeline de Reclutamiento

```
SOLICITUD → EVALUACIÓN → PRUEBA → DECISIÓN
```

### Evaluación Automática del Candidato
Score de recluta 0-100 basado en:
- Copas del jugador (40%)
- Nivel de rey/torre (15%)
- Cartas maxeadas / nivel (10%)
- Actividad en guerra estimada (15%)
- Historial de clanes (20%) — si cambia mucho, penaliza

### Filtros Inteligentes
"Buscar jugadores con >6000 copas, >50% win rate en guerra, que hayan estado en su clan actual >30 días"

### Período de Prueba Automático
- Al aceptar, se crea trial de 7 días con monitoreo
- Dashboard muestra: "Recluta X: Día 3/7 — Actividad 80% ✅ — Donaciones 200 ✅ — Guerra ✅"
- Al día 7: recomendación automática (aceptar/expulsar/extender prueba)

### Fuentes de Reclutamiento
- Integración con API de Clash Royale para buscar jugadores
- "Invitación inteligente": detectar jugadores sin clan con buen perfil

---

## 8. IDEAS AVANZADAS

### 8.1 IA para Análisis de Comportamiento
- **Predicción de abandono:** basado en patrones de actividad (baja gradual, donaciones que caen, guerras perdidas)
- Modelo simple con features: días desde última conexión, donaciones últimas 3 semanas, tendencia de copas
- Alerta: "PlayerX tiene un 75% de probabilidad de abandonar en 2 semanas"

### 8.2 Sugerencias Estratégicas
- "Esta semana 3 miembros no donaron nada. Sugerimos rotar el roster con estos candidatos..."
- "Tus miembros suben más copas los fines de semana. Programa la guerra para que termine el sábado."
- "El clan ha perdido 500 copas netas esta semana. Los jugadores con bajo rendimiento son: ..."

### 8.3 Sistema de Reputación
- Cada miembro tiene un Clan Score (visible solo a líderes)
- Basado en historial completo: antigüedad, consistencia, comportamiento, contribución
- Útil para decidir quién merece segunda oportunidad vs quién no

### 8.4 Notificaciones Inteligentes
- Push notifications: "🚨 PlayerK lleva 5 días inactivo"
- Discord / Telegram webhook integration para alertas del clan
- Resumen semanal enviado automáticamente

### 8.5 Modo "Clan vs Clan"
- Estadísticas comparativas: tu clan vs clanes rivales
- Benchmarks contra clanes del mismo rango

---

## 9. UX / UI

### Paleta de Colores

| Uso | Color |
|-----|-------|
| Fondo | `#0D1117` (oscuro profundo) |
| Superficies | `#161B22`, `#1C2333` |
| Bordes | `#30363D` |
| Primario | `#FF6B35` (naranja neón) — energía gaming |
| Secundario | `#00E5FF` (cian) — datos / tech |
| Acento | `#FFD700` (oro) — logros / destacado |
| Éxito | `#39FF14` (verde neón) |
| Error | `#FF1744` (rojo) |
| Texto primario | `#E6EDF3` |
| Texto secundario | `#8B949E` |

### Tipografía
- Headings: **Inter** o **Poppins** Bold
- Body: **Inter** Regular
- Números / stats: **JetBrains Mono** (estilo terminal / dashboard)

### Iconografía
- Lucide Icons (open source, consistente)
- Iconos personalizados para: copas, donaciones, guerra, activity streak
- SVG puro, sin icon fonts

### Pantallas Principales

| Pantalla | Descripción |
|----------|-------------|
| `/login` | Login con email / Discord / Google |
| `/dashboard` | War room principal |
| `/members` | Grid/tabla de miembros con filtros, ordenable por stats |
| `/member/:id` | Perfil individual: stats, gráficos, historial, logros |
| `/analytics` | Panel de analytics deep: heatmaps, tendencias, matriz 2x2 |
| `/wars` | Historial de guerras, stats por guerra |
| `/recruitment` | Pipeline de reclutamiento, candidatos, período de prueba |
| `/settings` | Configuración: roles, reglas automáticas, webhooks |
| `/events` | Calendario de eventos semanales, retos activos |
| `/achievements` | Tabla de logros, medallas, ranking interno |
| `/gamification` | Configuración del sistema de gamificación |

### Navegación
- Sidebar vertical expandible (collapsible a iconos)
- En mobile: bottom tab bar con 5 secciones principales
- Breadcrumbs contextuales
- Command palette (⌘K): buscar miembros, stats, ir a pantallas

### Mobile-First
- Dashboard adaptativo a 1 columna en mobile
- Tablas horizontales con scroll
- Pull-to-refresh para stats en tiempo real
- Gestos swipe en listas de miembros para acciones rápidas

### Animaciones
- Transiciones suaves entre páginas (framer-motion)
- Micro-animaciones en tarjetas al hover
- Contadores animados para stats numéricas
- Chart animations al cargar datos

---

## 10. ARQUITECTURA TÉCNICA

### Stack Recomendado

**Frontend:**
- Framework: Next.js 15 (App Router, RSC, Server Actions)
- Lenguaje: TypeScript (strict mode)
- UI: shadcn/ui + Tailwind CSS v4
- Charts: Recharts + Tremor (dashboard components)
- Animación: Framer Motion
- State: Zustand (global) + TanStack Query (server state)
- Formularios: React Hook Form + Zod
- PWA: next-pwa (offline parcial)
- Testing: Vitest + Playwright

**Backend (opciones):**
- Next.js API Routes / Server Actions (para MVP)
- O bien: Hono.js (liviano, rápido, TypeScript-first)

**Base de Datos:**
- ORM: Drizzle ORM
- Validation: Zod (compartido frontend/backend)
- BD Primaria: PostgreSQL (Neon / Supabase)
- Cache: Redis (Upstash)
- Vector DB (futuro): pgvector para embeddings de perfiles

**Autenticación:**
- Auth.js v5 (NextAuth.js)
- Providers: Discord, Google, Email magic link
- JWT + session cookies
- RBAC implementado con middleware + database

**Almacenamiento:**
- Avatares / assets: Cloudflare R2 / AWS S3
- Logs de actividad: ClickHouse (futuro)

**Sincronización con API de Clash Royale:**
- Cron cada 15-30 min → fetch a API oficial
- Worker separado (Cloudflare Workers / Vercel Edge)
- Cachear respuestas en Redis
- Procesamiento batch: stats cada 6h, datos críticos en tiempo real

**Escalabilidad:**
- Frontend: CDN + ISR + Edge Runtime
- Backend: Serverless functions + connection pooling
- DB: Read replicas + partitioning por clan
- Cache: Redis cluster
- Background jobs: BullMQ + Redis

### Estructura del Proyecto (Monorepo)

```
clashmanager/
├── apps/
│   ├── web/              # Next.js app
│   └── api/              # (si se separa)
├── packages/
│   ├── shared/           # Types, Zod schemas, constants
│   ├── ui/               # shadcn components personalizados
│   ├── db/               # Drizzle schema + migrations
│   ├── analytics/        # Lógica de estadísticas
│   └── api-client/       # Cliente para CR API
├── workers/
│   ├── sync-worker/      # Sincronización CR API
│   └── report-worker/    # Generación de reportes
├── tooling/
│   ├── eslint/           # Config ESLint
│   └── typescript/       # TS config base
└── docker-compose.yml    # Dev environment
```

---

## 11. ROADMAP

### Fase 1: MVP (Semanas 1-4)
**Objetivo:** Dashboard funcional + gestión básica

- [ ] Setup de monorepo + Next.js + Tailwind + shadcn/ui
- [ ] Sistema de autenticación (Discord / Google)
- [ ] Dashboard principal con:
  - Tarjetas de top copas, donadores, inactivos
  - Gráfico de evolución semanal
- [ ] CRUD de miembros (invitar, expulsar, roles manuales)
- [ ] Integración básica con API de Clash Royale (fetch manual)
- [ ] Sistema de roles y permisos (hardcodeado)
- [ ] Diseño responsive básico
- [ ] Dark mode default

### Fase 2: Beta (Semanas 5-8)
**Objetivo:** Automatización + gamificación básica

- [ ] Automatización de sugerencias (inactivos, ascensos, expulsiones)
- [ ] Sistema de gamificación (medallas, XP, logros)
- [ ] Perfil de jugador con stats individuales
- [ ] Página de reclutamiento con evaluación automática
- [ ] Período de prueba para nuevos miembros
- [ ] Weekly reports automáticos
- [ ] Alertas y notificaciones (in-app + Discord webhook)
- [ ] Caché con Redis para rendimiento

### Fase 3: Versión Avanzada (Semanas 9-14)
**Objetivo:** Analytics profundos + engagement

- [ ] Dashboard analítico avanzado (heatmaps, matriz 2x2)
- [ ] Sistema de eventos semanales automáticos
- [ ] War analytics detallado
- [ ] Sugerencias estratégicas básicas
- [ ] Sistema de reputación (Clan Score)
- [ ] Exportación de datos (CSV, PDF)
- [ ] Command palette (⌘K)
- [ ] PWA con soporte offline parcial
- [ ] Múltiples clanes (un usuario líder de varios clanes)

### Fase 4: Escalado (Semanas 15+)
**Objetivo:** IA, comunidad, ecosistema

- [ ] Predicción de abandono con ML simple
- [ ] Análisis de comportamiento / clustering de jugadores
- [ ] Ligas internas y torneos
- [ ] Sistema social: chat interno, foro, wall
- [ ] IA para recomendaciones de roster
- [ ] Benchmarks contra otros clanes
- [ ] API pública para desarrolladores third-party
- [ ] Multi-idioma (i18n)
- [ ] Panel de administración multi-clan

---

## 12. EXTRA — Ideas que un líder normal no pensaría

### 🔬 Análisis de Química del Clan
Detectar si ciertos jugadores rinden mejor juntos (correlación de actividad cuando ambos están activos). Identificar "clusters" de amistad — útil para saber a quién invitar para retener a un grupo.

### 📉 Índice de Fatiga
Si un jugador ha tenido actividad intensa >20 días seguidos, mostrar alerta de "riesgo de burnout". Sugerir al líder: "PlayerX ha donado 800+ por 3 semanas seguidas. Podría beneficiarse de un descanso."

### 🏴 Shadow Roster
Lista invisible de "ex-miembros valiosos" que se fueron en buenos términos. Con un clic, enviar invitación personalizada para volver. Incluye motivo de salida y últimas stats conocidas.

### 🧪 Modo Simulación
"¿Qué pasa si expulsas a PlayerX e invitas a PlayerY (candidato en pool)?"
Simulación basada en stats históricas: proyección de copas del clan, actividad estimada.

### 📊 NPS Interno (Net Promoter Score)
Encuesta mensual opcional: "¿Qué tan probable es que recomiendes este clan?"
Anónimo, correlacionar con actividad posterior. Detectar insatisfacción antes de que alguien se vaya.

### 🎯 Sistema de Metas por Objetivos (OKRs)
Líder define metas del clan: "Llegar a 60000 copas en 30 días". El sistema desglosa en metas individuales automáticamente. Tracking semanal de progreso.

### 🚨 Diario de Decisiones
Log automático de todas las decisiones de gestión (ascensos, expulsiones, advertencias). El líder puede ver: "Desde que expulsaste a PlayerX, el clan ha mejorado un 12% en donaciones". Data-driven leadership feedback.

### 🔄 Rotación Inteligente
Si hay lista de espera, sugerir automáticamente intercambios temporales: "PlayerY está bajo en actividad esta semana. Sugerimos darle su lugar a un recluta prometedor por 7 días." El jugador original mantiene su lugar en cola de reingreso.

### 📋 Informe de Identidad
Generación automática de "quién es quién" en el clan basado en datos: "Top 3 jugadores ofensivos", "Mejores donadores", "Muro de la guerra". Ideal para que nuevos miembros entiendan la cultura del clan.

### 🧩 Puzzle de Roster
Algoritmo que sugiere la composición ideal del clan según el momento de la temporada. Ej: "Para la última semana de temporada, necesitas tus 10 mejores pushers. Para guerra, tus 15 más consistentes."

---

> **Resumen ejecutivo:** ClashManager convierte la gestión de un clan de Clash Royale de una tarea manual y reactiva a un proceso automatizado, data-driven y proactivo. No es un tracker más — es un sistema de operaciones para tu clan, con capa de gamificación que mantiene a los jugadores engaged sin que el líder tenga que estar detrás de nadie.

---

## 13. ESTADO DE IMPLEMENTACIÓN

### Datos del Proyecto

| Dato | Valor |
|------|-------|
| Clan | CLASE⚔️PRO |
| Tag | `#GLQVYCUL` |
| Miembros | 45 |
| Copas | 117,266 |
| API de CR | Conectada vía proxy.royaleapi.dev |
| Firebase | Configurado (Auth + Firestore) |
| Último build | ✅ Exitoso |
| Tema UI | ✅ Paleta metálica (oro, plata, bronce) implementada |

### Stack Actual

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 15 + Tailwind v4 + shadcn/ui |
| Estado | Zustand + TanStack Query (hook) |
| Backend | Next.js API Routes (15 endpoints) |
| DB | Firestore (NoSQL) |
| Auth | Firebase Auth (Google, Email) |
| Charts | Recharts + CSS nativo |
| API externa | Clash Royale API oficial vía proxy |
| Monorepo | pnpm workspaces |

### Estructura del Proyecto

```
clashmanager/
├── apps/web/
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/cr/          # 6 endpoints (clan, members, warlog, currentwar, player, sync)
│   │   │   ├── api/firebase/     # 2 endpoints (clan, sync)
│   │   │   ├── dashboard/        # Dashboard con 9 widgets
│   │   │   ├── members/          # Lista con filtros
│   │   │   ├── analytics/        # Estadísticas + matriz 2x2
│   │   │   ├── achievements/     # Logros y medallas
│   │   │   ├── recruitment/      # Pipeline de reclutamiento
│   │   │   ├── settings/         # Configuración + automatización
│   │   │   └── login/            # Pantalla de login
│   │   ├── components/
│   │   │   ├── ui/               # Card, Badge, Avatar, Button, Input
│   │   │   ├── layout/           # Sidebar, BottomTabs, AppShell
│   │   │   ├── dashboard/        # 9 widgets del dashboard
│   │   │   └── shared/           # MetricCard
│   │   ├── lib/
│   │   │   ├── cr-api.ts         # Cliente CR API (proxy)
│   │   │   ├── cr-types.ts       # Tipos de respuesta oficial
│   │   │   ├── cr-transform.ts   # Transformadores CR → App
│   │   │   ├── firebase.ts       # Firebase Client SDK
│   │   │   ├── firebase-admin.ts # Firebase Admin SDK
│   │   │   ├── firestore-service.ts # CRUD Firestore
│   │   │   ├── mock-data.ts      # Datos mock (fallback)
│   │   │   ├── store.ts          # Zustand store
│   │   │   └── utils.ts          # Utilidades
│   │   ├── hooks/
│   │   │   └── use-clan-data.ts  # Hook de datos + sync
│   │   └── contexts/
│   │       └── AuthContext.tsx    # Contexto de autenticación
│   └── .env.local                # Credenciales (gitignored)
├── packages/shared/              # Tipos y constantes compartidas
├── pnpm-workspace.yaml
├── package.json
└── PLAN.md
```

### Flujo de Datos Actual

```
App carga (PC o celular)
  → /api/firebase/load
    → 1. Fetch CR API (proxy.royaleapi.dev)
    → 2. Guardar en Firestore (caché automática)
    → 3. Devolver { clan, members, localWarRank }
    ─────────────────────────────────────
    Si CR API falla → leer de Firestore (caché)
    Si ambos fallan → error → botón Reintentar
```

### Logros Técnicos

| Hito | Estado |
|------|--------|
| Monorepo pnpm + Next.js 15 | ✅ |
| Tailwind v4 + Tema oscuro gaming | ✅ |
| Layout responsive (sidebar + bottom tabs) | ✅ |
| Dashboard con 9 widgets | ✅ |
| Lista de miembros con filtros y búsqueda | ✅ |
| Página de analytics con matriz 2x2 | ✅ |
| Gamificación (medallas, XP, logros) | ✅ (UI completa, pero usa mock data — pendiente conectar Firestore) |
| Pipeline de reclutamiento | ✅ (UI completa, pero usa mock data — pendiente conectar Firestore) |
| Configuración y automatización | ✅ |
| Conexión a API oficial de CR vía proxy | ✅ |
| Transformación de datos CR → App | ✅ |
| Firebase Client SDK (auth) | ✅ |
| Firebase Admin SDK (server) | ✅ |
| Firestore (CRUD clan + miembros) | ✅ |
| Dashboard conectado a datos reales | ✅ |
| Login con Google (Firebase Auth) | ✅ |
| Cerrar sesión (sidebar) | ✅ |
| Sidebar con datos reales (clan, usuario) | ✅ |
| Auto-sync cada 30 min (hook + cron-job.org) | ✅ Implementado con fallback Firestore (ver /api/firebase/load) |
| GET /api/firebase/sync (para crons) | ✅ |
| Ranking local guerra de clanes (Colombia) | ✅ |
| Widget GuerraActiva con datos reales | ✅ |
| Puesto local en dashboard (#posición) | ✅ |
| Sin mock data inicial (loading hasta Firestore) | ✅ |
| Estado de carga en dashboard (spinner) | ✅ |
| GET /api/firebase/load (sync + read en 1) | ✅ |
| Resiliencia: CR API → Firestore como fallback | ✅ |
| Staleness check: Firestore < 15 min → cache | ✅ |
| Ranking guerra con limit=200 | ✅ |
| CR API river race opcionales (no bloquean sync) | ✅ |
| Seed fijo fuera del top 200 (547, 2620, -5 desde .env) | ✅ |
| Tendencia en widget guerra | ✅ |
| **Tema metálico (oro, plata, bronce) implementado** | ✅ |
| Activar Google Auth en Firebase Console y verificar login | ✅ |
| weeklyStats calculados (trophiesGained, activityDays, warParticipation) | ✅ |
| Limpieza automática de ex-miembros en Firestore | ✅ |
| Descripciones en cards UI | ✅ |
| Botón "Enviar mazo al juego" con deep link | ✅ |
| text-black en botones gold | ✅ |

## Pendiente / Próximos Pasos

### Últimos Avances (Sesión actual — Mazos de Guerra + Evoluciones)
- **Botón metálico con bisel** – ✅ Variante `metal` añadida en `components/ui/button.tsx`
- **Imágenes correctas para héroes y evoluciones** – ✅ Helper `isHeroOrEvo` en `getCardImageUrl`
- **Carga de mazos de guerra anteriores** – ✅ Fallback a `battlelog` implementado
- **Botón flotante redundante** – ✅ Eliminado
- **Panel lateral metálico** – ✅ Implementado con `MetalPanel`
- **Tipografía y tamaños elegantes** – ✅ Fuente `Inter` + `font-size: 18px`
- **Animación del panel** – ✅ Manteniendo animación existente
- **Export `getToken()`** – ✅ Fix build error preexistente (`check-token/route.ts`)
- **Deploy en Vercel** – ✅ `clashmanager.vercel.app` (dominio personalizado)
- **Alertas dinámicas** – ✅ Threshold basado en promedio del clan, lista en 3 columnas con avatares
- **Avatar size `xs`** – ✅ Añadido para listas compactas
- **Ranking guerra simplificado a seed fijo** – ✅ Cuando el clan está fuera del top 200, usa valores de `.env` (547, 2620, -5) en lugar de estimación inestable por score-gap. Persiste en Firestore como `localWarRank` / `localWarTrophies`.
- **Member status real** – ✅ Corregido: status se calcula desde `lastSeen` (inactive >10d, risk >5d, active) en lugar de hardcode `"active"`
- **adminDb guard en sync** – ✅ Evita crash cuando Firebase Admin no está inicializado
- **Division by zero en healthScore** – ✅ Fix cuando `memberList` está vacío
- **weeklyStats padding en getMembersFromFirestore** – ✅ Evita runtime error por datos cacheados sin `weeklyStats`
- **PWA icons** – ✅ Manifest apunta a `/logo_clase_pro.png` existente
- **Deck deep link** – ✅ Botón "Enviar mazo al juego" con `clashroyale://copyDeck` + clipboard fallback
- **text-black en gold buttons** – ✅ 11 botones `bg-metallic-gold` cambiados de `text-white` a `text-black`
- **Descripciones en cards** – ✅ ~22 cards con texto descriptivo bajo el título (dashboard, settings, analytics, achievements, recruitment)
- **trophiesGained real** – ✅ Calculado como `currentTrophies - previousTrophies` desde Firestore (delta entre syncs)
- **activityDays real** – ✅ Derivado de `lastSeen`: <2d→5, <5d→3, <10d→1, else→0
- **warParticipation real** – ✅ Extraído de `currentRiverRace.participants` (decksUsed/4 * 100%)
- **Limpieza automática de ex-miembros** – ✅ `saveMembers` elimina documentos de miembros que ya no están en la respuesta de la API

### War Decks — Carga de Mazos de Guerra
- **Endpoint corregido** – ✅ Cambiado de `/clans/{tag}/war` (no existe) a usar battlelog como única fuente
- **Tipos de batalla reales** – ✅ `riverRacePvP`, `riverRaceDuelColosseum`, `boatBattle` (en vez de `warDay`/`clanMateWarDay` obsoletos)
- **Estructura battlelog corregida** – ✅ `team[0].cards` en vez de `team[0].deck.cards`
- **Duelo coliseo** – ✅ Partir `team[0].cards` en chunks de 8 → 1 mazo por ronda
- **Validación 8 cartas** – ✅ Rechazar decks con length !== 8 (filtra ruido)
- **Cache** – ✅ `no-store` en dev para datos frescos
- **Card Mazos de Guerra** – ✅ Movido al primer lugar en el grid
- **Limpiar al cambiar miembro** – ✅ Al cambiar miembro se borran warDecks, trophyDeck, errores anteriores
- **CardData con iconUrl** – ✅ load-war-decks devuelve `{name, id, maxLevel, iconUrl}` por carta

### Evoluciones — Imagen + Detección
- **`deduplicateCards`** – ✅ Detecta evos por `c.maxLevel > BASE_API_MAX_LEVEL[rarity]` (antes usaba `id >= 28000000`, daba falsos positivos)
- **`getCardImageUrl`** – ✅ Eliminado `-ev` suffix (CDN de RoyaleAPI no tiene imágenes de evo)
- **`top-cards.tsx`** – ✅ Usa `card.iconUrl` de la API como primera opción, cae a CDN como fallback
- **`deck-card.tsx`** – ✅ Usa `iconUrl` de la API + detecta evo por `maxLevel` con badge EVO

### Git Workflow
- `main` → producción (Vercel auto-deploy)
- `dev/*` → desarrollo sin disparar deploy
- Merge a `main` solo cuando está listo para producción

### Dependencias y Lockfile
- **Causa raíz de fallo en deploy:** Cuando se añade un paquete con `pnpm add <pkg>`, pnpm modifica `package.json` y `pnpm-lock.yaml`. Si se commitea solo el `package.json` sin el lockfile, Vercel falla con `ERR_PNPM_OUTDATED_LOCKFILE` porque usa `frozen-lockfile` por defecto en CI.
- **Prevención:** Verificar siempre con `git status` que ambos archivos (`package.json` + `pnpm-lock.yaml`) están staged antes de commitear. Si el lockfile queda fuera, el deploy se rompe silenciosamente hasta que se pushea.
- **Recuperación:** `pnpm install --no-frozen-lockfile` regenera el lockfile local, luego commitearlo y pushearlo. Vercel detecta el nuevo commit y redeploya automáticamente.

### Tabla de Prioridades

| Prioridad | Tarea | Estado |
|-----------|-------|--------|
| 🔴 Alta | ~~Desplegar en Vercel~~ | ✅ `clashmanager.vercel.app` |
| 🔴 Alta | ~~Ranking guerra estable~~ | ✅ Seed fijo en `.env` (547, 2620, -5) |
| 🔴 Alta | ~~Member status desde lastSeen~~ | ✅ |
| 🔴 Alta | ~~weeklyStats no hardcodeados~~ | ✅ trophiesGained, activityDays, warParticipation calculados |
| 🔴 Alta | ~~Ex-miembros en analytics~~ | ✅ `saveMembers` limpia al sync |
| 🟡 Media | Conectar **achievements** a Firestore (usa `mockAchievements`) | ✅ Ya conectado vía load/sync routes |
| 🟡 Media | Conectar **recruitment** a Firestore (usa `mockRecruits`) | ✅ Ya conectado |
| 🟡 Media | PWA (service worker para instalar en celular) | ✅ Service worker + icons + Apple meta tags |
| 🟡 Media | Auto-deploy Vercel desde GitHub | ✅ Ya funciona |
| 🟡 Media | ~~Carga de mazos de guerra (battlelog)~~ | ✅ `rivRacePvP`, `rivRaceDuelColosseum`, `boatBattle` |
| 🟡 Media | ~~Detección de evoluciones~~ | ✅ Por `maxLevel > baseMaxLevel` + `iconUrl` API |
| 🟢 Baja | Command palette (⌘K) | ❌ Pendiente |
| 🟢 Baja | Testing (Vitest + Playwright) | ❌ Pendiente |
| 🟢 Baja | Webhook Discord para alertas automáticas | ❌ Pendiente |
| 🟢 Baja | Arreglar warning ESLint | ❌ Pendiente (eslint-config-next, externo) |

> **Nota:** members, analytics y settings **ya están conectados a Firestore** vía `useClanData()`.
