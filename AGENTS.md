# Repository Guidelines

## Project Structure & Module Organization
This repository is a Next.js 15 + TypeScript app. Main code lives under `src/`.

- `src/app/`: App Router pages, layouts, and API routes such as `src/app/api/borrows/*`.
- `src/components/`: shared UI, dashboard views, and visual effects.
- `src/lib/`: auth, email, notifications, and Supabase client/server helpers.
- `src/emails/`: React Email templates.
- `supabase/`: SQL migrations, seed scripts, and storage setup utilities.

Keep route-specific UI close to its page and place reusable pieces in `src/components` or `src/lib`.

## Build, Test, and Development Commands
- `npm run dev`: starts the local Next.js dev server with Turbopack.
- `npm run build`: creates the production build.
- `npm run start`: serves the production build locally.
- `npm run lint`: runs the repo’s ESLint config (`next/core-web-vitals`).

There is no dedicated automated test script in `package.json` yet, so `npm run lint` is the minimum required check before opening a PR.

## Coding Style & Naming Conventions
Use TypeScript with 4-space indentation and double quotes, matching the existing codebase. Prefer named exports for shared utilities and components unless a Next.js file convention requires a default export (`page.tsx`, `layout.tsx`).

- Components: PascalCase, for example `GlassCard.tsx`
- Helpers and modules: camelCase or descriptive lowercase, for example `notifications.ts`
- Route files: Next.js conventions such as `page.tsx`, `layout.tsx`, and `route.ts`

Use the `@/*` path alias for imports from `src`.

## Testing Guidelines
No project test framework is configured today. When adding tests, place them near the feature as `*.test.ts` or `*.test.tsx` and keep them focused on app logic or API behavior. For now, verify changes with `npm run lint` and a manual pass through affected pages and API flows.

## Commit & Pull Request Guidelines
Recent history includes short imperative messages and occasional Conventional Commit prefixes, for example `feat: implement role-based dashboard...`. Follow that direction consistently: `feat: add repair status filter`, `fix: handle missing Supabase session`.

PRs should include a brief summary, affected routes or modules, required env or migration changes, and screenshots for UI updates. If a change touches `supabase/`, call out the exact migration or seed file in the PR description.

## Security & Configuration Tips
Keep secrets in `.env.local` and never commit credentials. Supabase URL/key changes should be documented in the PR, and schema changes should ship as versioned SQL files under `supabase/migrations/`.
