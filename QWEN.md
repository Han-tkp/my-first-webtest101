# Yung101 / Yonchuw - Project Context

## Project Overview

**Yung101** (package name: `yonchuw`) is a **Next.js 15 + TypeScript** web application for managing public health equipment operations, specifically fogging machines used in disease control. The system handles equipment borrowing, returns, approvals, and maintenance tracking for government health agencies.

### Core Features
- **Role-based access control**: Admin, Approver, Technician, and User roles with workflow-specific dashboard access
- **Equipment management**: Catalog tracking with status (available, reserved, borrowed, under_maintenance, pending_repair_approval)
- **Borrow/Return workflow**: Multi-step approval process with pre-delivery and post-return checklists
- **Repair management**: Damage reporting, repair approval, cost tracking, and maintenance history
- **In-app notifications**: Real-time notifications system with role-based targeting
- **Email notifications**: React Email templates for approval workflows

### Tech Stack
| Category | Technology |
|----------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5.7 |
| Styling | Tailwind CSS 4 |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth + NextAuth |
| UI Components | Custom components with Framer Motion, Lucide icons |
| 3D Graphics | Three.js + React Three Fiber + Drei |
| Charts | Chart.js + react-chartjs-2 |
| Email | React Email + Resend + Nodemailer |

## Project Structure

```
my-first-webtest101/
├── src/
│   ├── app/                    # Next.js App Router pages & API routes
│   │   ├── api/                # API endpoints (auth, borrows, equipment, repairs, notifications)
│   │   ├── dashboard/          # Protected dashboard views (approvals, borrow, history, reports, setup, technician)
│   │   ├── login/              # Authentication pages
│   │   ├── register/           # User registration
│   │   ├── pending/            # Pending approval state page
│   │   ├── suspended/          # Suspended account page
│   │   ├── layout.tsx          # Root layout with Thai font support
│   │   └── page.tsx            # Landing page
│   ├── components/
│   │   ├── dashboard/          # Dashboard-specific components
│   │   ├── effects/            # Visual effects and animations
│   │   ├── layout/             # Layout components (headers, navigation)
│   │   └── ui/                 # Reusable UI components (Button, GlassCard, BentoGrid)
│   ├── emails/                 # React Email templates
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Core utilities and business logic
│   │   ├── supabase/           # Supabase client configuration
│   │   ├── auth.ts             # Authentication helpers
│   │   ├── email.ts            # Email sending utilities
│   │   ├── equipment-catalog.ts
│   │   ├── equipment-inspection.ts
│   │   ├── notification-center.ts
│   │   ├── notifications.ts
│   │   └── rate-limit.ts
│   ├── types/                  # TypeScript type definitions
│   └── middleware.ts           # Route protection & role-based access control
├── supabase/
│   ├── migrations/             # Versioned database migrations
│   ├── *.sql                   # Migration and seed files
│   └── setup-storage.mjs       # Storage bucket configuration
├── public/                     # Static assets
└── output/                     # Build output directory
```

## Building and Running

### Prerequisites
- Node.js 18+ 
- Supabase project with database configured
- Environment variables in `.env.local`

### Environment Variables Required
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RESEND_API_KEY=your_resend_key  # For email notifications
```

### Development Commands
```bash
npm run dev      # Start dev server with Turbopack (http://localhost:3000)
npm run build    # Create production build
npm run start    # Run production server
npm run lint     # Run ESLint (next/core-web-vitals)
```

### Database Setup
1. Run migrations in Supabase SQL Editor:
   - `supabase/migration.sql` - Base schema (profiles, equipment, borrows, repairs, notifications)
   - `supabase/fix-auth-and-borrow-flows.sql` - Auth and borrow workflow fixes
   - `supabase/seed-*.sql` - Seed data for roles and equipment catalog

2. Configure storage buckets via `supabase/setup-storage.mjs`

## Development Conventions

### Code Style
- **TypeScript**: Strict mode disabled, 4-space indentation, double quotes
- **Imports**: Use `@/*` path alias for `src/` directory
- **Exports**: Named exports for utilities/components; default exports only for Next.js convention files (`page.tsx`, `layout.tsx`)

### Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `GlassCard.tsx`, `BentoGrid.tsx` |
| Helpers/Utils | camelCase | `notifications.ts`, `rate-limit.ts` |
| Route files | Next.js convention | `page.tsx`, `layout.tsx`, `route.ts` |

### File Organization
- Keep route-specific UI components near their page
- Place reusable components in `src/components/ui` or `src/components/layout`
- Business logic belongs in `src/lib/`

### Git & PR Guidelines
- **Commit messages**: Short imperative or Conventional Commits (`feat:`, `fix:`, `chore:`)
- **PR descriptions** should include:
  - Summary of changes
  - Affected routes/modules
  - Environment variable or migration changes
  - Screenshots for UI updates
  - Specific migration/seed file names if `supabase/` is modified

## Key Architecture Patterns

### Middleware & Route Guards
The `src/middleware.ts` implements:
- Cookie-based Supabase session management
- Profile-based role checking from database
- Route-level role guards (e.g., `/dashboard/approvals` requires admin or approver role)
- Status-based redirects (pending_approval → `/pending`, suspended → `/suspended`)

### Database Schema Highlights
- **profiles**: User accounts with role (`admin`, `approver`, `technician`, `user`) and status (`pending_approval`, `active`, `suspended`)
- **equipment**: Fogging machine catalog with status tracking
- **borrows**: Borrow requests with equipment_ids array, approval workflow, and checklists
- **repairs**: Maintenance records with cost tracking and approval states
- **notifications**: Role-targeted in-app notifications with metadata

### Authentication Flow
- Uses Supabase SSR client with cookie persistence
- Profile table managed at application level (not Supabase Auth hooks)
- Supports multiple auth providers: `credentials`, `google`, `legacy_supabase`

## Testing
No automated test framework is configured. Verification approach:
- Run `npm run lint` before committing
- Manual testing of affected pages and API flows
- Future tests should be placed as `*.test.ts` or `*.test.tsx` near the feature

## Special Directories

### `เอกสารประกอบหน่วยงาน/`
Thai language directory containing agency documentation and supporting materials.

### `.playwright-cli/`
Playwright test configuration (if end-to-end tests are added in the future).

### `src/emails/`
React Email templates for transactional emails (approval notifications, status updates).
