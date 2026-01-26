-- FIX RLS POLICIES (OPEN READ ACCESS) - VERSION 2
-- แก้ไขปัญหา: ERROR 42710 policy already exists
-- คำสั่งนี้จะลบ Policy เก่าออกก่อนเสมอ แล้วค่อยสร้างใหม่

-- 1. ลบ Policy เก่า (เพิ่มบรรทัดลบให้ครบทุกชื่อที่เป็นไปได้)
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- 2. สร้าง Policy ใหม่: "Authenticated users can read all profiles"
CREATE POLICY "Authenticated users can read all profiles" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (true);

-- 3. Policy สำหรับ Update (แก้ตัวเองได้)
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

-- 4. Enable RLS (เผื่อไว้)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 5. Force refresh schema cache
NOTIFY pgrst, 'reload schema';
