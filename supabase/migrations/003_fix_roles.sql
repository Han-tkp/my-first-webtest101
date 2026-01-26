-- FIX ROLES SCRIPT
-- วิธีใช้:
-- 1. ดู Email ที่คุณใช้สมัครในหน้า /dashboard/debug
-- 2. รันคำสั่ง UPDATE ด้านล่างให้ตรงกับ Email ของคุณ

-- ถ้าคุณใช้ admin@gmail.com
UPDATE profiles 
SET role = 'admin', status = 'active' 
WHERE email = 'admin@gmail.com';

-- ถ้าคุณใช้ approver@gmail.com
UPDATE profiles 
SET role = 'approver', status = 'active' 
WHERE email = 'approver@gmail.com';

-- ถ้าคุณใช้ tech@gmail.com
UPDATE profiles 
SET role = 'technician', status = 'active' 
WHERE email = 'tech@gmail.com';

-- ถ้าคุณใช้ user@gmail.com
UPDATE profiles 
SET role = 'user', status = 'active' 
WHERE email = 'user@gmail.com';

-- ตรวจสอบผลลัพธ์
SELECT email, role, status FROM profiles;
