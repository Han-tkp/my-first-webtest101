# 🔄 Yonchuw - ระบบจัดการเครื่องพ่นหมอกควัน

ระบบบริหารจัดการเครื่องพ่นหมอกควันแบบครบวงจร สำหรับการจอง ยืม-คืน และซ่อมบำรุงอุปกรณ์

## ✨ คุณสมบัติหลัก

- 🔐 **ระบบ Authentication** - ลงทะเบียน เข้าสู่ระบบ และจัดการบัญชีผู้ใช้
- 👥 **Role-based Access Control** - Admin, Approver, Technician, User
- 📦 **จัดการอุปกรณ์** - เพิ่ม แก้ไข ลบ และติดตามสถานะอุปกรณ์
- 📝 **ยืม-คืนอุปกรณ์** - ส่งคำขอยืม อนุมัติ และติดตามสถานะการยืม
- 🔧 **ซ่อมบำรุง** - แจ้งซ่อม อนุมัติงาน บันทึกค่าใช้จ่าย
- 📊 **รายงานและสถิติ** - Dashboard สรุปข้อมูลและรายงานต่างๆ
- 🔔 **Real-time Notifications** - แจ้งเตือนเมื่อมีการเปลี่ยนแปลง
- 📱 **Progressive Web App** - ใช้งานได้ทั้งบนเว็บและติดตั้งเป็นแอปพลิเคชัน
- 🎨 **Modern UI/UX** - ออกแบบด้วย Tailwind CSS + Framer Motion

## 🚀 เทคโนโลยีที่ใช้

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion, GSAP
- **3D Graphics**: Three.js, React Three Fiber
- **Charts**: Chart.js
- **Testing**: Jest, React Testing Library
- **Code Quality**: ESLint, Prettier

## 📋 ข้อกำหนดของระบบ

- Node.js 18.0 หรือสูงกว่า
- npm หรือ yarn
- Supabase account

## 🛠️ การติดตั้ง

### 1. Clone repository

```bash
git clone <repository-url>
cd my-first-webtest101
```

### 2. ติดตั้ง dependencies

```bash
npm install
# หรือ
yarn install
```

### 3. ตั้งค่า Environment Variables

คัดลอก `.env.example` เป็น `.env.local`:

```bash
cp .env.example .env.local
```

แก้ไขไฟล์ `.env.local` และใส่ค่าที่ถูกต้อง:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. ตั้งค่า Supabase Database

รัน migrations ใน Supabase:

```bash
cd supabase/migrations
# ทำตาม migrations ทีละไฟล์
```

### 5. รันโปรเจกต์

```bash
npm run dev
# หรือ
yarn dev
```

เปิดเบราว์เซอร์ที่ [http://localhost:3000](http://localhost:3000)

## 📁 โครงสร้างโปรเจกต์

```
my-first-webtest101/
├── public/                 # Static files
│   ├── icons/             # PWA icons
│   └── manifest.json      # PWA manifest
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── api/          # API routes
│   │   ├── dashboard/    # Dashboard pages
│   │   ├── login/        # Login page
│   │   └── register/     # Register page
│   ├── components/        # React components
│   │   ├── ui/           # UI components
│   │   ├── effects/      # Animation components
│   │   └── dashboard/    # Dashboard components
│   ├── lib/              # Libraries
│   │   └── supabase/     # Supabase clients
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Utility functions
│   ├── types/            # TypeScript types
│   ├── constants/        # Constants and configs
│   └── middleware.ts     # Next.js middleware
├── __tests__/            # Test files
├── supabase/             # Supabase migrations
└── docs/                 # Documentation
```

## 🧪 Testing

### รัน unit tests

```bash
npm test
# หรือ
yarn test
```

### รัน tests แบบ watch mode

```bash
npm run test:watch
# หรือ
yarn test:watch
```

### ตรวจสอบ code coverage

```bash
npm test -- --coverage
```

## 🎨 Code Quality

### Linting

```bash
npm run lint
# หรือ
yarn lint
```

### Format code

```bash
npm run format
# หรือ
yarn format
```

### Type checking

```bash
npm run type-check
# หรือ
yarn type-check
```

## 🔑 บทบาทผู้ใช้ (User Roles)

1. **Admin** - เข้าถึงได้ทุกฟีเจอร์
2. **Approver** - อนุมัติคำขอยืมและซ่อม ดูรายงาน
3. **Technician** - ตรวจสภาพอุปกรณ์ ดำเนินการซ่อม
4. **User** - ยืม-คืนอุปกรณ์ ดูประวัติของตัวเอง

## 🔄 ขั้นตอนการใช้งาน

1. **ลงทะเบียน** → รอการอนุมัติจาก Admin
2. **เข้าสู่ระบบ** → ใช้งานตามสิทธิ์ของบทบาท
3. **ส่งคำขอยืม** → เลือกอุปกรณ์และระบุวันที่
4. **รอการอนุมัติ** → Approver ตรวจสอบและอนุมัติ
5. **รับอุปกรณ์** → Technician ตรวจสภาพก่อนส่งมอบ
6. **คืนอุปกรณ์** → Technician ตรวจสภาพและบันทึก
7. **ซ่อมบำรุง** (ถ้าจำเป็น) → ส่งคำขอซ่อม → ดำเนินการซ่อม

## 📦 Build และ Deploy

### Build production

```bash
npm run build
# หรือ
yarn build
```

### รัน production server

```bash
npm start
# หรือ
yarn start
```

### Deploy to Vercel

ใช้ [Vercel Platform](https://vercel.com) สำหรับ deployment:

```bash
npm install -g vercel
vercel
```

## 🤝 Contributing

1. Fork repository
2. สร้าง feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. เปิด Pull Request

## 📄 License

This project is private and proprietary.

## 📞 ติดต่อ

**หน่วยควบคุมโรคติดต่อนำโดยแมลงที่ 12.4.4**  
11 ถนนระแงะมรรคา ตำบลบางนาค อำเภอเมืองนราธิวาส  
จังหวัดนราธิวาส 96000  
โทรศัพท์: 073-514-960

## 🙏 Credits

Developed with ❤️ for efficient equipment management.
