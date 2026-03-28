# Yung101 | ยง101 - ระบบบริหารจัดการเครื่องพ่นหมอกควัน

**ระบบสนับสนุนการยืม-คืน อนุมัติ และซ่อมบำรุงเครื่องพ่นหมอกควันสำหรับงานสาธารณสุขภาครัฐ**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwind-css)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?logo=supabase)](https://supabase.com)

---

## 📋 ภาพรวม

Yung101 เป็นระบบบริหารจัดการอุปกรณ์ภาคสนาม (เครื่องพ่นหมอกควัน) ที่ออกแบบ khususสำหรับหน่วยงานสาธารณสุขและองค์กรปกครองส่วนท้องถิ่น รองรับขั้นตอนการลงทะเบียน ตรวจสอบสิทธิ์ อนุมัติคำขอ และติดตามสภาพอุปกรณ์ ด้วยภาษาภาพที่อ่านง่าย สุภาพ และพร้อมใช้งานในบริบทหน่วยงานราชการ

### ✨ ฟีเจอร์หลัก

- **🔐 ระบบยืนยันตัวตนแบบ Role-Based** - แบ่งบทบาท ผู้ใช้งาน, ผู้อนุมัติ, ช่างเทคนิค, และผู้ดูแลระบบ
- **📝 การยืม-คืนอุปกรณ์** - ส่งคำขอยืม ติดตามสถานะ และบันทึกการคืน
- **✅ ระบบอนุมัติหลายระดับ** - แยกขั้นตอนการอนุมัติตามบทบาท
- **🔧 การจัดการซ่อมบำรุง** - แจ้งซ่อม อนุมัติซ่อม และบันทึกค่าใช้จ่าย
- **📊 Dashboard และรายงาน** - สรุปข้อมูลการใช้งานและสถานะอุปกรณ์
- **🔔 การแจ้งเตือน** - ทั้งในแอปและผ่านอีเมล
- **📱 Responsive Design** - ใช้งานได้ทั้ง desktop และ mobile

---

## 🚀 การติดตั้งและเริ่มต้นใช้งาน

### ความต้องการของระบบ

- Node.js 18+ 
- npm หรือ pnpm
- Supabase account (สำหรับ database และ auth)
- Resend account (สำหรับส่งอีเมล - ไม่บังคับ)

### 1. Clone Repository

```bash
git clone https://github.com/your-org/yung101.git
cd yung101
```

### 2. ติดตั้ง Dependencies

```bash
npm install
```

### 3. ตั้งค่า Environment Variables

คัดลอกไฟล์ `.env.example` เป็น `.env.local`:

```bash
cp .env.example .env.local
```

แก้ไขค่าใน `.env.local`:

```env
# Supabase (จำเป็น)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Site URL (ไม่บังคับ)
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Email (ไม่บังคับ - สำหรับระบบแจ้งเตือน)
RESEND_API_KEY=re_your-api-key
EMAIL_FROM=noreply@your-domain.com
```

### 4. ตั้งค่า Database

เข้าไปที่ [Supabase Dashboard](https://app.supabase.com) และรัน SQL migrations:

1. เปิด SQL Editor ใน Supabase
2. รันไฟล์ `supabase/migration.sql` เพื่อสร้างตารางทั้งหมด
3. รันไฟล์ seed data (ถ้าต้องการ):
   - `supabase/seed-roles.sql` - ข้อมูลบทบาท
   - `supabase/seed-equipment-catalog.sql` - ข้อมูลอุปกรณ์เริ่มต้น

หรือใช้ command:

```bash
# ผ่าน Supabase CLI (ถ้ามี)
supabase db reset
```

### 5. รัน Development Server

```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000) ในเบราว์เซอร์

---

## 📦 คำสั่งที่ใช้

| คำสั่ง | คำอธิบาย |
|--------|----------|
| `npm run dev` | รัน development server พร้อม Turbopack |
| `npm run build` | สร้าง production build |
| `npm run start` | รัน production server |
| `npm run lint` | รัน ESLint เพื่อตรวจสอบ code quality |

---

## 🏗️ โครงสร้างโปรเจกต์

```
yung101/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API Routes
│   │   ├── dashboard/          # หน้า Dashboard (protected)
│   │   ├── login/              # หน้าล็อกอิน
│   │   ├── register/           # หน้าลงทะเบียน
│   │   ├── layout.tsx          # Root Layout
│   │   └── page.tsx            # Landing Page
│   ├── components/
│   │   ├── dashboard/          # Components สำหรับ Dashboard
│   │   ├── effects/            # Visual Effects
│   │   ├── layout/             # Layout Components
│   │   └── ui/                 # Reusable UI Components
│   ├── emails/                 # React Email Templates
│   ├── hooks/                  # Custom React Hooks
│   ├── lib/                    # Utilities & Business Logic
│   │   ├── supabase/           # Supabase Clients
│   │   ├── auth.ts             # Authentication Helpers
│   │   ├── notifications.ts    # Notification System
│   │   └── email.ts            # Email Service
│   ├── types/                  # TypeScript Types
│   └── middleware.ts           # Route Protection
├── supabase/
│   ├── migrations/             # Database Migrations
│   └── *.sql                   # Seed Scripts
├── public/                     # Static Assets
└── .env.example               # Environment Template
```

---

## 🗄️ Database Schema

### ตารางหลัก

| ตาราง | คำอธิบาย |
|-------|----------|
| `profiles` | ข้อมูลผู้ใช้งาน (role, status, agency) |
| `equipment` | รายการอุปกรณ์ (สถานะ: available, borrowed, under_maintenance) |
| `borrows` | คำขอยืม-คืนอุปกรณ์ |
| `repairs` | คำขอซ่อมบำรุง |
| `notifications` | การแจ้งเตือนในแอป |

### บทบาทผู้ใช้งาน (Roles)

- **`admin`** - ผู้ดูแลระบบ เข้าถึงทุกฟีเจอร์
- **`approver`** - ผู้อนุมัติคำขอยืมและซ่อม
- **`technician`** - ช่างเทคนิค บันทึกการซ่อมและตรวจสอบอุปกรณ์
- **`user`** - ผู้ใช้งานทั่วไป ส่งคำขอยืมอุปกรณ์

### สถานะบัญชี (Status)

- **`pending_approval`** - รอการอนุมัติจากผู้ดูแล
- **`active`** - ใช้งานได้ปกติ
- **`suspended`** - ถูกระงับการใช้งาน

---

## 🎨 การออกแบบ UI

ระบบใช้ **Tailwind CSS 4** กับ custom design system ที่มี:

- **Color Palette**: โทนสีเอิร์ธที่ดูเป็นทางการ เหมาะกับงานราชการ
- **Glassmorphism**: เอฟเฟกต์กระจกใสสำหรับ cards และ panels
- **Thai Font**: ใช้ฟอนต์ Noto Sans Thai เพื่อการอ่านที่ง่าย
- **Responsive**: รองรับทุกขนาดหน้าจอ

---

## 🔒 Security

- **Supabase Auth** - จัดการ authentication และ session
- **Role-Based Access Control** - จำกัดการเข้าถึงตามบทบาท
- **Rate Limiting** - ป้องกันการโจมตีแบบ brute force
- **Input Validation** - ตรวจสอบข้อมูลก่อนบันทึก
- **Environment Secrets** - ไม่ commit credentials

---

## 🧪 Testing

ปัจจุบันยังไม่มี automated test ที่ตั้งค่าไว้ แนะนำให้:

1. รัน `npm run lint` ก่อน commit ทุกครั้ง
2. ทดสอบ manual ผ่าน browser
3. ตรวจสอบ API endpoints ด้วย tools เช่น Postman

---

## 🤝 การมีส่วนร่วม

### Commit Message Convention

ใช้ Conventional Commits:

- `feat:` - ฟีเจอร์ใหม่
- `fix:` - แก้ไขบั๊ก
- `docs:` - เอกสาร
- `style:` - จัดรูปแบบ code
- `refactor:` - ปรับปรุงโครงสร้าง code
- `chore:` - งานทั่วไป

### การส่ง Pull Request

1. Fork และสร้าง branch ใหม่ (`feat/your-feature`)
2. Commit ตาม convention
3. รัน lint และทดสอบ
4. ส่ง PR พร้อมคำอธิบาย

---

## 📄 License

[ระบุ License ของคุณที่นี่]

---

## 📞 ติดต่อ

- **ผู้พัฒนา**: [ชื่อของคุณ]
- **Email**: [อีเมลติดต่อ]
- **หน่วยงาน**: [ชื่อหน่วยงาน]

---

## 🙏 ขอบคุณ

- [Next.js](https://nextjs.org)
- [Supabase](https://supabase.com)
- [Tailwind CSS](https://tailwindcss.com)
- [React Email](https://react.email)
- [Framer Motion](https://www.framer.com/motion)
