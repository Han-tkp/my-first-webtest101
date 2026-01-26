-- FIX MISSING PROFILES & ADD TRIGGER
-- แก้ปัญหา: User ที่สร้างจาก Supabase Dashboard ไม่มีข้อมูลในตาราง profiles
-- ทำให้ระบบมองว่าเป็น "User" ทั่วไปตลอดเวลา

-- 1. สร้าง Trigger เพื่อสร้าง profile อัตโนมัติเมื่อมี user ใหม่ (แม้จะสร้างผ่าน Dashboard)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'), -- รับ role จาก metadata ได้
    'active' -- ให้ active เลยถ้าสร้างผ่าน dashboard (ถือว่า admin สร้างเอง)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ลบ trigger เดิมถ้ามี
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- สร้าง trigger ใหม่
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. INSERT profiles ให้กับ users ที่ยังไม่มี (Fix Backlog)
INSERT INTO public.profiles (id, email, full_name, role, status)
SELECT 
  id, 
  email, 
  email as full_name, 
  'user' as role, 
  'active' as status
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- 3. อัพเดท Email ทดสอบให้เป็น Role ตามต้องการทันที
UPDATE profiles SET role = 'admin', status = 'active' WHERE email LIKE '%admin%';
UPDATE profiles SET role = 'approver', status = 'active' WHERE email LIKE '%approver%';
UPDATE profiles SET role = 'technician', status = 'active' WHERE email LIKE '%tech%';

-- ตรวจสอบผลลัพธ์
SELECT email, role, status FROM profiles;
