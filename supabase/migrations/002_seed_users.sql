-- Seed Test Users for Yonchuw
-- Run this in Supabase SQL Editor AFTER running 001_initial.sql
-- 
-- ⚠️ หมายเหตุ: Supabase ไม่อนุญาตให้ INSERT เข้า auth.users โดยตรง
-- ต้องใช้วิธีนี้แทน:
--
-- 1. ไปที่ Supabase Dashboard → Authentication → Users
-- 2. กด "Add user" → "Create new user"
-- 3. สร้าง users ตามข้อมูลด้านล่าง:
--
-- ========================================
-- TEST ACCOUNTS
-- ========================================
--
-- | Role       | Email               | Password     |
-- |------------|---------------------|--------------|
-- | Admin      | admin@gmail.com     | Admin123     |
-- | Approver   | approver@gmail.com  | Approver123  |
-- | Technician | tech@gmail.com      | Tech123      |
-- | User       | user@gmail.com      | User123      |
--
-- ========================================
-- หลังสร้าง users ในหน้า Authentication แล้ว
-- รัน SQL นี้เพื่อตั้งค่า roles:
-- ========================================

-- อัพเกรด Admin
UPDATE profiles SET role = 'admin', status = 'active' 
WHERE email = 'admin@gmail.com';

-- อัพเกรด Approver  
UPDATE profiles SET role = 'approver', status = 'active' 
WHERE email = 'approver@gmail.com';

-- อัพเกรด Technician
UPDATE profiles SET role = 'technician', status = 'active' 
WHERE email = 'tech@gmail.com';

-- อัพเกรด User (activate)
UPDATE profiles SET status = 'active' 
WHERE email = 'user@gmail.com';

-- ตรวจสอบผลลัพธ์
SELECT id, email, role, status, full_name FROM profiles;
