# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Yonchuw Equipment Management System** — a Thai-language web app for public health organizations to manage equipment borrowing, repairs, and approvals. Built with Next.js 15 App Router + Supabase + TypeScript + Tailwind CSS v4.

## Commands

```bash
npm run dev       # Dev server with Turbopack
npm run build     # Production build
npm run lint      # ESLint (next/core-web-vitals, flat config) — run before any PR
npm run start     # Serve production build locally
```

No test framework is configured. `npm run lint` is the minimum pre-PR check.

## Architecture

### Auth & Role System

Authentication is a hybrid of **Auth.js (NextAuth v4)** and **Supabase Auth**. Users have a `role` field in the `profiles` table:

- **Roles**: `admin`, `approver`, `technician`, `user`
- **Statuses**: `pending_approval`, `active`, `suspended`

Three auth guard functions in [src/lib/auth.ts](src/lib/auth.ts):
- `requireRole()` — for server components (redirects)
- `requirePageRole()` — for pages (checks role + status, redirects to `/pending` or `/suspended`)
- `checkApiRole()` — for API routes (returns error object, no redirect)

Middleware at [src/middleware.ts](src/middleware.ts) enforces per-route role and status access before pages load. It handles `/dashboard` paths (role-based guards) and `/login`, `/register` (redirects authenticated users away). Falls back gracefully when Supabase is not configured.

### Database (Supabase)

Core tables: `profiles`, `equipment`, `borrows`, `repairs`, `notifications`, `notification_dedupe_keys`, `notification_deliveries`

Key status enums:
- **Equipment**: `available`, `reserved`, `borrowed`, `under_maintenance`, `pending_repair_approval`
- **Borrows**: `pending_borrow_approval` → `borrow_approved` → `delivered` → `returned` / `returned_late`
- **Repairs**: `pending_repair_approval` → `repair_approved` → `completed` / `repair_rejected`

SQL migrations live in `supabase/`. Key files:
- `supabase/migration.sql` — main schema
- `supabase/seed-*.sql` — seed data
- `supabase/*.sql` — incremental migrations (e.g., `fix-auth-and-borrow-flows.sql`)

When adding schema changes, create a new migration file in `supabase/` and note it in the PR.

Supabase clients (all in `src/lib/supabase/`):
- `client.ts` — browser-side client
- `server.ts` — server-side client (admin)
- `auth-server.ts` — Auth.js integration
- `admin.ts` — admin operations
- `storage.ts` — R2 storage wrapper (`uploadImage()`, `deleteImage()`)
- `config.ts` — centralized env var getters with validation, `isSupabaseConfigured()`

### Dashboard Views (Role-Based Dispatch)

The main dashboard at [src/app/dashboard/page.tsx](src/app/dashboard/page.tsx) renders different components by role:
- `AdminView` / `ApproverView` / `TechnicianView` / `UserView` in [src/components/dashboard/](src/components/dashboard/)

Protected routes and their allowed roles:
| Route | Roles |
|---|---|
| `/dashboard/setup` | admin |
| `/dashboard/approvals`, `/dashboard/reports` | admin, approver |
| `/dashboard/technician` | admin, technician |
| `/dashboard/borrow`, `/dashboard/history` | admin, user |
| `/dashboard/notifications` | all |

### Notification System

Triple-channel notifications — all channels triggered for critical events:
1. **In-app** — stored in `notifications` table, deduped via `notification_dedupe_keys`. See [src/lib/notification-center.ts](src/lib/notification-center.ts).
2. **Email** — via **Resend** (primary). Templates in [src/emails/](src/emails/) use React Email (7 templates with Thai base layout). Delivery records logged to `notification_deliveries` with idempotency keys. See [src/lib/email.ts](src/lib/email.ts).
3. **LINE** — via LINE Messaging API. Requires `line_user_id` on profile. See [src/lib/line.ts](src/lib/line.ts). API routes: `/api/line/webhook`, `/link`, `/status`, `/unlink`.

Orchestrated by [src/lib/notifications.ts](src/lib/notifications.ts) — `deliverNotifications()` checks dedupe keys, filters recipients, then fans out to all three channels. 23 event types spanning user, borrow, and repair lifecycles.

### Equipment Workflows

**Borrow lifecycle** — API routes under [src/app/api/borrows/](src/app/api/borrows/):
- Create request → Approve/Reject → Deliver (technician) → Return → Inspect (post-return checklist)
- `pre_delivery_checklist` and `post_return_checklist` stored as JSONB in `borrows`

**Repair lifecycle** — API routes under [src/app/api/repairs/](src/app/api/repairs/):
- Create repair request → Approve/Reject → Complete
- Equipment status set to `pending_repair_approval` when repair requested, updated on completion

**Domain utilities:**
- [src/lib/equipment-catalog.ts](src/lib/equipment-catalog.ts) — `KNOWN_EQUIPMENT_TYPES[]`, `getEquipmentCategory()`, `getEquipmentImageUrl()`
- [src/lib/equipment-inspection.ts](src/lib/equipment-inspection.ts) — `inspectionItems[]`, `buildInspectionChecklist()` for post-return forms

### File Uploads

`POST /api/uploads` handles image uploads to R2 storage via `src/lib/supabase/storage.ts`. `DELETE /api/uploads` removes files. `next.config.mjs` allows remote images from `**.supabase.co`.

### Visual Effects

- **Three.js + React Three Fiber** — 3D scenes ([src/components/effects/Scene3D.tsx](src/components/effects/Scene3D.tsx))
- **Framer Motion** — animations and transitions
- **GSAP** — timeline-based animations

### Rate Limiting

Custom rate limiter in [src/lib/rate-limit.ts](src/lib/rate-limit.ts) — 10 requests per 5 minutes per user, 10-minute block on exceeded limit. Applied to both borrow and repair creation endpoints.

### Design System

**Tailwind CSS v4** — no `tailwind.config` file; theming via CSS custom properties in `src/app/globals.css`:
- Palette: `--color-primary` (navy #1f425b), `--color-secondary` (green #5f7358), `--color-warning` (gold #b08234), `--color-danger` (rust #ac584d), `--color-background` (beige #f2ede3)
- Glassmorphism: `.glass`, `.glass-card`, `.glass-button` classes using `backdrop-filter` with `--glass-blur: 14px`
- Layout: `.bento-grid` (4-col responsive grid)
- Font: **Noto Sans Thai** (weights 300–700) via Next.js Google Fonts

UI components in `src/components/ui/` — `Button` (4 variants: primary, secondary, glass, danger), `GlassCard`, `BentoGrid`, `DateRangeFilter`, `EquipmentImage`, `ImageUpload`, `ListToolbar`, `PaginationControls`.

## Coding Conventions

- **TypeScript strict mode** — includes `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`
- 4-space indentation, double quotes, semicolons required
- `@/*` path alias maps to `src/`
- Named exports for shared utilities; default exports for Next.js file conventions (`page.tsx`, `layout.tsx`, `route.ts`)
- Components: `PascalCase` — helpers/modules: `camelCase`
- All user-facing copy is in **Thai (ภาษาไทย)**
- ESLint flat config (`eslint.config.mjs`): `eqeqeq` (error, smart), `prefer-const` (error), `no-var` (error), `no-console` (warn, allow warn/error/info), trailing comma (always-multiline)
- Types are co-located with their modules (no central `types.ts` file)

## Required Environment Variables

Set in `.env.local`:

```env
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Email — Resend (primary)
RESEND_API_KEY=
EMAIL_FROM=

# LINE Messaging API (optional)
LINE_CHANNEL_ACCESS_TOKEN=
LINE_CHANNEL_SECRET=
```

## Commit Style

Follow existing imperative Conventional Commit style: `feat: add repair status filter`, `fix: handle missing Supabase session`. PRs touching `supabase/` must call out the specific migration file.
