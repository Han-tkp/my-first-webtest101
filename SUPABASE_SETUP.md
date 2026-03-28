# 🚀 วิธีตั้งค่า Supabase Service Role Key

## ขั้นตอนการหา Service Role Key

1. **เข้าสู่ Supabase Dashboard**
   - ไปที่: https://app.supabase.com
   - ล็อกอินด้วยบัญชีของคุณ

2. **เลือกโปรเจกต์**
   - คลิกที่โปรเจกต์ `wikdgycjaofuapeooufu`

3. **ไปที่ Settings**
   - คลิกที่รูปเฟือง ⚙️ ด้านซ้ายล่าง
   - เลือก **API**

4. **คัดลอก Service Role Key**
   - คุณจะเห็น 2 keys:
     - `anon public` (ใช้สำหรับ client-side) ← อันนี้คุณมีแล้ว
     - `service_role` (ใช้สำหรับ server-side) ← **ต้องใช้อันนี้!**
   - คลิก **Copy** ตรง `service_role key`

5. **ใส่ใน .env.local**
   ```env
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (key ยาวๆ)
   ```

## ⚠️ คำเตือนสำคัญ

- **ห้าม** commit `.env.local` เด็ดขาด!
- **ห้าม** ใช้ Service Role Key ใน client-side code
- Service Role Key มีสิทธิ์ **เต็ม** (ข้าม RLS) ใช้เฉพาะใน server-side เท่านั้น

## ทดสอบการตั้งค่า

หลังจากใส่ key แล้ว รันคำสั่ง:

```bash
npm run dev
```

แล้วเปิด http://localhost:3000

หากระบบทำงานได้โดยไม่มี error แสดงว่าตั้งค่าถูกต้อง!
