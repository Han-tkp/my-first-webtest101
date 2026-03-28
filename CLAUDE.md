# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Yonchuw Equipment Management System** — a Thai-language web app for public health organizations to manage equipment borrowing, repairs, and approvals. Built with Next.js 15 App Router + Supabase + TypeScript.

## Commands

```bash
npm run dev       # Dev server with Turbopack
npm run build     # Production build
npm run lint      # ESLint (next/core-web-vitals) — run before any PR
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

Middleware at [src/middleware.ts](src/middleware.ts) enforces per-route role and status access before pages load.

### Database (Supabase)

Core tables: `profiles`, `equipment`, `borrows`, `repairs`, `notifications`

Key status enums:
- **Equipment**: `available`, `reserved`, `borrowed`, `under_maintenance`, `pending_repair_approval`
- **Borrows**: `pending_borrow_approval` → `borrow_approved` → `delivered` → `returned` / `returned_late`
- **Repairs**: `pending_repair_approval` → `repair_approved` → `completed` / `repair_rejected`

SQL migrations live in `supabase/`. Key files:
- `supabase/migration.sql` — main schema
- `supabase/seed-*.sql` — seed data
- `supabase/*.sql` — incremental migrations (e.g., `fix-auth-and-borrow-flows.sql`)

When adding schema changes, create a new migration file in `supabase/` and note it in the PR.

Supabase clients:
- [src/lib/supabase/client.ts](src/lib/supabase/client.ts) — browser
- [src/lib/supabase/server.ts](src/lib/supabase/server.ts) — server (admin)
- [src/lib/supabase/auth-server.ts](src/lib/supabase/auth-server.ts) — Auth.js integration

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

Dual-channel notifications — both channels are triggered for critical events:
1. **In-app** — stored in `notifications` table, deduped via `notification_dedupe_keys`. See [src/lib/notification-center.ts](src/lib/notification-center.ts).
2. **Email** — via **Resend** (primary) with **Nodemailer/SMTP** fallback. Templates in [src/emails/](src/emails/) use React Email. See [src/lib/email.ts](src/lib/email.ts) and [src/lib/notifications.ts](src/lib/notifications.ts).

### Visual Effects

- **Three.js + React Three Fiber** — 3D scenes ([src/components/effects/Scene3D.tsx](src/components/effects/Scene3D.tsx))
- **Framer Motion** — animations and transitions
- **GSAP** — timeline-based animations

### Equipment Borrow Workflow

Full lifecycle managed through API routes under [src/app/api/borrows/](src/app/api/borrows/):
- Create request → Approve/Reject → Deliver (technician) → Return → Inspect (post-return checklist)
- `pre_delivery_checklist` and `post_return_checklist` stored as JSONB in `borrows`

### Rate Limiting

Custom rate limiter in [src/lib/rate-limit.ts](src/lib/rate-limit.ts) — 10 borrow requests per 5 minutes, 10-minute block on exceeded limit.

## Coding Conventions

- **TypeScript**, 4-space indentation, double quotes
- `@/*` path alias maps to `src/`
- Named exports for shared utilities; default exports for Next.js file conventions (`page.tsx`, `layout.tsx`, `route.ts`)
- Components: `PascalCase` — helpers/modules: `camelCase`
- All user-facing copy is in **Thai (ภาษาไทย)**

## Required Environment Variables

Copy `.env.example` to `.env.local` and configure:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=
RESEND_API_KEY=
```

## Commit Style

Follow existing imperative Conventional Commit style: `feat: add repair status filter`, `fix: handle missing Supabase session`. PRs touching `supabase/` must call out the specific migration file.
