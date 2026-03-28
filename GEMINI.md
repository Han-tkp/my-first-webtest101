# GEMINI.md - Project Context & Instructions

This file provides foundational context and instructions for AI agents working on the **Yung101 (ยง101) / Yonchuw / VBDC 12.4** project.

## 📋 Project Overview

**Yung101** is a specialized equipment management system for Thai public health organizations (e.g., Vector Borne Disease Control centers). It manages the lifecycle of fogging machines and other field equipment, including registration, borrowing, multi-level approvals, and maintenance.

-   **Primary Language:** Thai (ภาษาไทย) for all user-facing content.
-   **Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS 4, Supabase (DB, Auth, Storage).
-   **Key Features:** Role-based dashboards, equipment borrowing workflow, repair management, dual-channel notifications (In-app + Email), and visual effects with Three.js/GSAP.

## 🏗️ Architecture & Core Systems

### 🔐 Authentication & Authorization
The system uses a hybrid approach with **Auth.js (NextAuth v4)** and **Supabase Auth**.
-   **Roles:** `admin`, `approver`, `technician`, `user`.
-   **Statuses:** `pending_approval`, `active`, `suspended`.
-   **Guards:**
    -   `middleware.ts`: Enforces role-based route protection at the edge.
    -   `src/lib/auth.ts`: Provides `requireRole`, `requirePageRole`, and `checkApiRole` for server-side protection.
-   **Registration:** New users are set to `pending_approval` by default and must be activated by an admin.

### 🗄️ Database & Supabase
-   **Client Management:** 
    -   `src/lib/supabase/client.ts`: Browser client.
    -   `src/lib/supabase/server.ts`: Server client (Admin/Service Role).
    -   `src/lib/supabase/auth-server.ts`: Auth.js integration client.
-   **Core Tables:** `profiles`, `equipment`, `borrows`, `repairs`, `notifications`.
-   **Migrations:** SQL files in `supabase/migrations/`. Always document schema changes in new migration files.

### 🔔 Notification System
-   **Channels:**
    -   **In-app:** Stored in the `notifications` table; managed via `src/lib/notification-center.ts`.
    -   **Email:** Sent via **Resend** (primary) or **Nodemailer/SMTP** (fallback).
-   **Templates:** React Email templates located in `src/emails/`.

### 🚀 Key Workflows
1.  **Borrowing:** Request (User) -> Approval (Approver) -> Delivery (Technician) -> Return (User/Technician) -> Post-return Inspection (Technician).
2.  **Repairs:** Request -> Approval -> Repair Process -> Completion.
3.  **User Management:** Register -> Pending State -> Admin Approval -> Active State.

## 🛠️ Development Guidelines

### Commands
-   `npm run dev`: Start development server (with Turbopack).
-   `npm run build`: Production build.
-   `npm run lint`: Run ESLint (Next.js core-web-vitals). **Run before every commit.**
-   `npm run start`: Serve production build.

### Coding Conventions
-   **Indentation:** 4 spaces.
-   **Strings:** Double quotes.
-   **Language:** Use Thai for UI strings and English for code (variables, functions, comments).
-   **Naming:** `PascalCase` for components, `camelCase` for utilities/helpers.
-   **Path Aliases:** Use `@/*` to reference the `src/` directory.
-   **Commits:** Follow Conventional Commits (e.g., `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `chore:`).

### 🎨 Styling
-   Uses **Tailwind CSS 4**.
-   Design aesthetic: **Glassmorphism** and a professional, official tone.
-   Font: **Noto Sans Thai** (defined in `src/app/layout.tsx`).

## 📁 Key File Map
-   `src/app/api/`: Backend logic and API endpoints.
-   `src/app/dashboard/`: Main application interface, role-dispatched.
-   `src/components/dashboard/`: Role-specific view components (`AdminView.tsx`, etc.).
-   `src/lib/`: Core business logic and service clients.
-   `src/types/`: Global TypeScript definitions.
-   `supabase/`: SQL migrations and seeding scripts.

## ⚠️ Important Notes
-   **Do not** commit secrets or `.env.local`. Use `.env.example` as a template.
-   Always verify Supabase configuration using `isSupabaseConfigured()` before performing DB operations.
-   Rate limiting is applied to sensitive actions like borrow requests (`src/lib/rate-limit.ts`).
