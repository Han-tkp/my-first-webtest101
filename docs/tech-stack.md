# เทคโนโลยีและเครื่องมือที่ใช้ในการพัฒนา

## 1. ภาพรวมสถาปัตยกรรมระบบ (System Architecture Overview)

ระบบยืม-คืนครุภัณฑ์ "Yonchuw" พัฒนาเป็น **Full-Stack Web Application** โดยใช้สถาปัตยกรรมแบบ Server-Side Rendering (SSR) ผสม Client-Side Rendering (CSR) ผ่าน Next.js App Router ทำงานร่วมกับ Supabase เป็น Backend-as-a-Service (BaaS) สำหรับฐานข้อมูล การยืนยันตัวตน และจัดเก็บไฟล์

---

## 2. เทคโนโลยีฝั่ง Frontend

| เทคโนโลยี | เวอร์ชัน | บทบาทในระบบ |
|---|---|---|
| **Next.js** | 15.3 | Web Framework หลัก — ใช้ App Router สำหรับ routing แบบ file-based, Server Components, API Routes และ Middleware สำหรับควบคุมสิทธิ์การเข้าถึง |
| **React** | 19.0 | UI Library — สร้าง Component-based UI พร้อมรองรับ Server Components และ Concurrent Features |
| **TypeScript** | 5.7 | ภาษาหลักในการพัฒนา — เพิ่ม Static Type Checking เปิดใช้ Strict Mode เต็มรูปแบบ |
| **Tailwind CSS** | 4.0 | Utility-first CSS Framework — จัดการ styling ผ่าน utility classes โดยกำหนด Design Tokens ผ่าน CSS Custom Properties |
| **Framer Motion** | 12.0 | Animation Library — ใช้สร้าง transition, page animation และ interactive motion |
| **Three.js** | 0.183 | 3D Graphics Library — แสดงผล 3D scene บนหน้าเว็บ |
| **React Three Fiber** | 9.0 | React renderer สำหรับ Three.js — ใช้เขียน 3D scene ในรูปแบบ React Component |
| **React Three Drei** | 10.0 | Helper library สำหรับ React Three Fiber — มี preset component สำเร็จรูป เช่น controls, lighting, effects |
| **GSAP** | 3.12 | Animation Engine — ใช้สร้าง timeline-based animation สำหรับ text effect และ parallax |
| **Chart.js** | 4.4 | Charting Library — สร้างกราฟและแผนภูมิสำหรับหน้ารายงาน (Reports) |
| **react-chartjs-2** | 5.2 | React wrapper สำหรับ Chart.js |
| **Lucide React** | 1.6 | Icon Library — ชุดไอคอน SVG สำหรับ UI |

---

## 3. เทคโนโลยีฝั่ง Backend

| เทคโนโลยี | เวอร์ชัน | บทบาทในระบบ |
|---|---|---|
| **Next.js API Routes** | 15.3 | จัดการ REST API endpoints ทั้งหมด (30+ routes) — ครอบคลุมระบบยืม-คืน, ซ่อม, อนุมัติ, แจ้งเตือน และจัดการผู้ใช้ |
| **Supabase** | 2.100 | Backend-as-a-Service — ให้บริการฐานข้อมูล PostgreSQL, Authentication, Row Level Security (RLS) และ Object Storage |
| **Supabase SSR** | 0.9 | ตัวช่วยจัดการ Supabase session บน Server-Side — รองรับ cookie-based auth สำหรับ Next.js |
| **NextAuth.js (Auth.js)** | 4.24 | Authentication Framework — ทำงานร่วมกับ Supabase Auth เป็นระบบ Hybrid Authentication รองรับ role-based access control (RBAC) 4 ระดับ |
| **bcryptjs** | 3.0 | Password Hashing — เข้ารหัสรหัสผ่านผู้ใช้ด้วยอัลกอริทึม bcrypt |

---

## 4. ระบบฐานข้อมูล (Database)

| เทคโนโลยี | รายละเอียด |
|---|---|
| **PostgreSQL** (ผ่าน Supabase) | ฐานข้อมูลเชิงสัมพันธ์หลัก — จัดเก็บข้อมูลผู้ใช้ (`profiles`), ครุภัณฑ์ (`equipment`), การยืม (`borrows`), การซ่อม (`repairs`), การแจ้งเตือน (`notifications`) พร้อมระบบ Row Level Security |
| **JSONB Columns** | ใช้เก็บข้อมูล checklist แบบยืดหยุ่น — `pre_delivery_checklist` และ `post_return_checklist` ใน borrows table |
| **Supabase Storage (R2)** | Object Storage — จัดเก็บรูปภาพครุภัณฑ์และไฟล์แนบ |

---

## 5. ระบบแจ้งเตือน (Notification System)

| เทคโนโลยี | เวอร์ชัน | บทบาทในระบบ |
|---|---|---|
| **Resend** | 6.9 | Email API Service (ช่องทางหลัก) — ส่งอีเมลแจ้งเตือนผ่าน API พร้อมระบบ idempotency key ป้องกันการส่งซ้ำ |
| **Nodemailer** | 8.0 | SMTP Email Library (ช่องทางสำรอง) — ส่งอีเมลผ่าน SMTP server |
| **React Email** | 5.2 | Email Template Engine — สร้าง template อีเมลด้วย React Component (7 templates) รองรับ cross-client rendering |
| **LINE Messaging API** | — | ช่องทางแจ้งเตือนที่ 3 — ส่งข้อความแจ้งเตือนผ่าน LINE Official Account |

ระบบแจ้งเตือนทำงานแบบ 3 ช่องทางพร้อมกัน (In-app, Email, LINE) พร้อมระบบ deduplication ป้องกันการแจ้งเตือนซ้ำ

---

## 6. เครื่องมือพัฒนาและ Build Tools

| เทคโนโลยี | เวอร์ชัน | บทบาท |
|---|---|---|
| **Node.js** | 22.x | JavaScript Runtime |
| **Turbopack** | (built-in Next.js 15) | Development Bundler — ใช้แทน Webpack ในโหมด dev เพื่อ Hot Module Replacement (HMR) ที่เร็วขึ้น |
| **PostCSS** | 8.x | CSS Processing Pipeline — ใช้ร่วมกับ Tailwind CSS v4 |
| **ESLint** | 9.x | Static Code Analysis — ตรวจสอบคุณภาพโค้ดด้วย flat config, ใช้ rule set ของ `next/core-web-vitals` |
| **Git** | — | Version Control System |

---

## 7. ภาษาและ Type System

| รายการ | รายละเอียด |
|---|---|
| **ภาษาหลัก** | TypeScript (Strict Mode) |
| **Target** | ES2017 |
| **การตั้งค่าเข้มงวด** | `strict: true`, `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch` |
| **Module System** | ESNext Modules (bundler resolution) |
| **ภาษา UI** | ภาษาไทย (ข้อความที่แสดงผลทั้งหมดเป็นภาษาไทย) |
| **ฟอนต์** | Noto Sans Thai (Google Fonts) น้ำหนัก 300–700 |

---

## 8. Design System และ UI Architecture

| องค์ประกอบ | รายละเอียด |
|---|---|
| **Styling Approach** | Utility-first (Tailwind CSS v4) + CSS Custom Properties สำหรับ Design Tokens |
| **Visual Theme** | โทนสีอบอุ่น — Navy Blue (#1f425b), Muted Green (#5f7358), Gold (#b08234), Beige Background (#f2ede3) |
| **UI Pattern** | Glassmorphism — ใช้ `backdrop-filter: blur()` สร้างเอฟเฟกต์กระจกฝ้า |
| **Layout System** | Bento Grid — responsive 4 คอลัมน์ (tablet: 2, mobile: 1) |
| **Component Library** | Custom components — Button (4 variants), GlassCard, BentoGrid, DateRangeFilter, ImageUpload, PaginationControls |
| **Animation** | Framer Motion (transitions), GSAP (timeline), Three.js (3D scenes) |

---

## 9. สถาปัตยกรรมการยืนยันตัวตนและการกำหนดสิทธิ์ (Authentication & Authorization)

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  NextAuth.js │────▶│ Supabase Auth │────▶│ profiles table  │
│  (Session)   │     │  (Provider)   │     │ (role + status) │
└─────────────┘     └──────────────┘     └─────────────────┘
                                                   │
                         ┌─────────────────────────┤
                         ▼                         ▼
                  ┌─────────────┐          ┌──────────────┐
                  │  Middleware  │          │  API Guards  │
                  │ (route-level)│          │ (per-route)  │
                  └─────────────┘          └──────────────┘
```

| ระดับสิทธิ์ (Role) | สิทธิ์การใช้งาน |
|---|---|
| `admin` | จัดการระบบทั้งหมด, อนุมัติผู้ใช้, ตั้งค่าระบบ |
| `approver` | อนุมัติ/ปฏิเสธคำขอยืมและซ่อม, ดูรายงาน |
| `technician` | จัดการการส่งมอบ, ดำเนินการซ่อม |
| `user` | ยืม-คืนครุภัณฑ์, ดูประวัติ |

สถานะผู้ใช้: `pending_approval` → `active` → `suspended`

---

## 10. สรุปแผนภาพ Technology Stack

```
┌──────────────────────────────────────────────────────┐
│                    Client (Browser)                    │
│  React 19 · Tailwind CSS 4 · Framer Motion · Three.js │
│  Chart.js · Lucide Icons · Noto Sans Thai              │
├──────────────────────────────────────────────────────┤
│                 Next.js 15 (App Router)                │
│  Server Components · API Routes · Middleware (RBAC)    │
│  Turbopack (dev) · TypeScript 5.7 (Strict)             │
├──────────────────────────────────────────────────────┤
│            Authentication (Hybrid)                     │
│  NextAuth.js 4.24  ◄──►  Supabase Auth                │
├──────────────────────────────────────────────────────┤
│              Supabase (BaaS)                           │
│  PostgreSQL · Row Level Security · Object Storage (R2) │
├──────────────────────────────────────────────────────┤
│           External Services                            │
│  Resend (Email) · LINE Messaging API · SMTP (Backup)   │
└──────────────────────────────────────────────────────┘
```
