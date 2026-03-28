-- ตั้งค่า role สำหรับบัญชีทดสอบ
-- รันหลังจากสร้าง users ใน Authentication Dashboard แล้ว

UPDATE public.profiles SET role = 'admin', status = 'active'      WHERE email = 'admin@gmail.com';
UPDATE public.profiles SET role = 'approver', status = 'active'   WHERE email = 'approver@gmail.com';
UPDATE public.profiles SET role = 'technician', status = 'active' WHERE email = 'tech@gmail.com';
UPDATE public.profiles SET role = 'user', status = 'active'       WHERE email = 'user@gmail.com';

SELECT email, full_name, role, status
FROM public.profiles
ORDER BY role, email;
