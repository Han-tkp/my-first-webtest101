-- ============================================================
-- Yonchuw - Comprehensive Demo Workflow Seed
-- ครอบคลุมทุก Role และทุก CRUD operation
--
-- Run this after the latest schema in migration.sql
-- This script is idempotent — safe to re-run
--
-- IMPORTANT: profiles.id MUST match auth.users.id
-- This seed queries auth.users directly to guarantee linking.
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- 0a. Ensure notification tables exist (in case migration.sql
--     was only partially applied)
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role_audience TEXT CHECK (role_audience IN ('user', 'admin', 'technician', 'approver')),
    event_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    action_url TEXT,
    metadata JSONB,
    is_read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMPTZ,
    emailed_at TIMESTAMPTZ,
    email_status TEXT,
    dedupe_key TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notification_deliveries (
    id BIGSERIAL PRIMARY KEY,
    notification_id BIGINT REFERENCES public.notifications(id) ON DELETE CASCADE,
    dedupe_key TEXT NOT NULL,
    channel TEXT NOT NULL CHECK (channel IN ('in_app', 'email')),
    provider TEXT NOT NULL,
    recipient TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('queued', 'sent', 'skipped', 'failed')),
    provider_message_id TEXT,
    error_name TEXT,
    error_message TEXT,
    metadata JSONB,
    last_attempt_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (dedupe_key, channel)
);

-- ------------------------------------------------------------
-- 0b. Clean up previous demo data
-- ------------------------------------------------------------

-- Reset equipment that was used by demo data
WITH demo_equipment AS (
    SELECT DISTINCT unnest(equipment_ids) AS id
    FROM public.borrows
    WHERE purpose LIKE '[DEMO]%'
    UNION
    SELECT DISTINCT equipment_id AS id
    FROM public.repairs
    WHERE damage_description LIKE '[DEMO]%'
      AND equipment_id IS NOT NULL
)
UPDATE public.equipment
SET status = 'available'
WHERE id IN (SELECT id FROM demo_equipment);

DELETE FROM public.notification_deliveries
WHERE dedupe_key LIKE 'demo:%';

DELETE FROM public.notifications
WHERE dedupe_key LIKE 'demo:%';

DELETE FROM public.repairs
WHERE damage_description LIKE '[DEMO]%';

DELETE FROM public.borrows
WHERE purpose LIKE '[DEMO]%';

-- Remove dummy demo profiles (not linked to auth)
DELETE FROM public.profiles
WHERE email LIKE 'demo.%@example.com';

-- Also clean old seed data
WITH old_demo_eq AS (
    SELECT DISTINCT unnest(equipment_ids) AS id
    FROM public.borrows
    WHERE purpose LIKE '[DEMO-FLOW]%'
    UNION
    SELECT DISTINCT equipment_id AS id
    FROM public.repairs
    WHERE damage_description LIKE '[DEMO-FLOW]%'
      AND equipment_id IS NOT NULL
)
UPDATE public.equipment
SET status = 'available'
WHERE id IN (SELECT id FROM old_demo_eq);

DELETE FROM public.notification_deliveries WHERE dedupe_key LIKE 'demo-flow:%';
DELETE FROM public.notifications WHERE dedupe_key LIKE 'demo-flow:%';
DELETE FROM public.repairs WHERE damage_description LIKE '[DEMO-FLOW]%';
DELETE FROM public.borrows WHERE purpose LIKE '[DEMO-FLOW]%';
DELETE FROM public.profiles WHERE email LIKE 'workflow.%@example.com';

-- ------------------------------------------------------------
-- 1. Link auth.users → profiles (THE CRITICAL FIX)
--    profiles.id = auth.users.id is required for login to work
-- ------------------------------------------------------------

-- Admin
INSERT INTO public.profiles (id, email, full_name, agency, phone, address, role, status)
SELECT
    au.id,
    au.email,
    'ผู้ดูแลระบบ',
    'ศูนย์ควบคุมโรคติดต่อนำโดยแมลง',
    '0891234567',
    'อำเภอเมือง จังหวัดตรัง',
    'admin',
    'active'
FROM auth.users au
WHERE lower(au.email) IN ('admin@gmail.com', 'admin@test.com')
ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    status = 'active',
    full_name = COALESCE(NULLIF(public.profiles.full_name, ''), EXCLUDED.full_name),
    agency = COALESCE(public.profiles.agency, EXCLUDED.agency),
    phone = COALESCE(public.profiles.phone, EXCLUDED.phone);

-- Approver
INSERT INTO public.profiles (id, email, full_name, agency, phone, address, role, status)
SELECT
    au.id,
    au.email,
    'ผู้อนุมัติ',
    'กลุ่มงานควบคุมโรคติดต่อ',
    '0892345678',
    'อำเภอเมือง จังหวัดตรัง',
    'approver',
    'active'
FROM auth.users au
WHERE lower(au.email) IN ('approver@gmail.com', 'approver@test.com')
ON CONFLICT (id) DO UPDATE SET
    role = 'approver',
    status = 'active',
    full_name = COALESCE(NULLIF(public.profiles.full_name, ''), EXCLUDED.full_name),
    agency = COALESCE(public.profiles.agency, EXCLUDED.agency),
    phone = COALESCE(public.profiles.phone, EXCLUDED.phone);

-- Technician
INSERT INTO public.profiles (id, email, full_name, agency, phone, address, role, status)
SELECT
    au.id,
    au.email,
    'ช่างเทคนิค',
    'ฝ่ายบำรุงรักษาครุภัณฑ์',
    '0893456789',
    'อำเภอเมือง จังหวัดตรัง',
    'technician',
    'active'
FROM auth.users au
WHERE lower(au.email) IN ('tech@gmail.com', 'tech@test.com')
ON CONFLICT (id) DO UPDATE SET
    role = 'technician',
    status = 'active',
    full_name = COALESCE(NULLIF(public.profiles.full_name, ''), EXCLUDED.full_name),
    agency = COALESCE(public.profiles.agency, EXCLUDED.agency),
    phone = COALESCE(public.profiles.phone, EXCLUDED.phone);

-- User
INSERT INTO public.profiles (id, email, full_name, agency, phone, address, role, status)
SELECT
    au.id,
    au.email,
    'ผู้ใช้งานทั่วไป',
    'รพ.สต.บ้านนาโยง',
    '0894567890',
    'อำเภอนาโยง จังหวัดตรัง',
    'user',
    'active'
FROM auth.users au
WHERE lower(au.email) IN ('user@gmail.com', 'user@test.com')
ON CONFLICT (id) DO UPDATE SET
    role = 'user',
    status = 'active',
    full_name = COALESCE(NULLIF(public.profiles.full_name, ''), EXCLUDED.full_name),
    agency = COALESCE(public.profiles.agency, EXCLUDED.agency),
    phone = COALESCE(public.profiles.phone, EXCLUDED.phone);

-- ------------------------------------------------------------
-- 2. Dummy profiles (no auth.users — for admin/approver queue testing)
-- ------------------------------------------------------------

INSERT INTO public.profiles (id, email, full_name, agency, phone, address, role, status)
VALUES
    -- pending_approval: shows in approver's user approval queue
    (gen_random_uuid(), 'demo.pending1@example.com', 'สมชาย รออนุมัติ', 'รพ.สต.ห้วยยอด', '0811111111', 'อำเภอห้วยยอด', 'user', 'pending_approval'),
    (gen_random_uuid(), 'demo.pending2@example.com', 'สมหญิง รอตรวจสอบ', 'เทศบาลตำบลบ่อหิน', '0811111112', 'อำเภอสิเกา', 'user', 'pending_approval'),
    -- suspended: shows in admin's user management
    (gen_random_uuid(), 'demo.suspended1@example.com', 'วิชัย ถูกระงับ', 'สำนักงานสาธารณสุขจังหวัด', '0822222221', 'อำเภอเมือง', 'user', 'suspended'),
    -- active extra users: for borrow/repair variety
    (gen_random_uuid(), 'demo.fielduser1@example.com', 'ประสิทธิ์ ภาคสนาม', 'ศูนย์ควบคุมโรคภาคสนาม', '0833333331', 'อำเภอย่านตาขาว', 'user', 'active'),
    (gen_random_uuid(), 'demo.fielduser2@example.com', 'สุดา เจ้าหน้าที่สนาม', 'หน่วยควบคุมโรคเคลื่อนที่', '0833333332', 'อำเภอปะเหลียน', 'user', 'active'),
    (gen_random_uuid(), 'demo.fielduser3@example.com', 'ธนกร ผู้ปฏิบัติงาน', 'สำนักงานสาธารณสุขอำเภอ', '0833333333', 'อำเภอรัษฎา', 'user', 'active')
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------
-- 3. Seed comprehensive workflow data
-- ------------------------------------------------------------

DO $$
DECLARE
    -- Core login accounts (from auth.users)
    v_admin_id      UUID;
    v_approver_id   UUID;
    v_tech_id       UUID;
    v_user_id       UUID;
    -- Extra demo profiles
    v_field1_id     UUID;
    v_field2_id     UUID;
    v_field3_id     UUID;

    -- Equipment IDs (need at least 20)
    eq RECORD;
    eq_ids INT[];
    eq_count INT;

    -- Borrow IDs for notifications
    b_pending1_id   INT;
    b_pending2_id   INT;
    b_delivery1_id  INT;
    b_delivery2_id  INT;
    b_borrowed1_id  INT;
    b_borrowed2_id  INT;
    b_overdue_id    INT;
    b_returned1_id  INT;
    b_returned2_id  INT;
    b_late_id       INT;
    b_early_id      INT;
    b_damaged_id    INT;

    -- Repair IDs
    r_pending1_id   INT;
    r_pending2_id   INT;
    r_pending3_id   INT;
    r_approved1_id  INT;
    r_approved2_id  INT;
    r_rejected_id   INT;
    r_completed1_id INT;
    r_completed2_id INT;
BEGIN
    -- --------------------------------------------------------
    -- Resolve profile IDs
    -- --------------------------------------------------------
    SELECT id INTO v_admin_id FROM public.profiles
    WHERE lower(email) IN ('admin@gmail.com', 'admin@test.com') AND status = 'active'
    ORDER BY created_at LIMIT 1;

    SELECT id INTO v_approver_id FROM public.profiles
    WHERE lower(email) IN ('approver@gmail.com', 'approver@test.com') AND status = 'active'
    ORDER BY created_at LIMIT 1;

    SELECT id INTO v_tech_id FROM public.profiles
    WHERE lower(email) IN ('tech@gmail.com', 'tech@test.com') AND status = 'active'
    ORDER BY created_at LIMIT 1;

    SELECT id INTO v_user_id FROM public.profiles
    WHERE lower(email) IN ('user@gmail.com', 'user@test.com') AND status = 'active'
    ORDER BY created_at LIMIT 1;

    SELECT id INTO v_field1_id FROM public.profiles WHERE email = 'demo.fielduser1@example.com';
    SELECT id INTO v_field2_id FROM public.profiles WHERE email = 'demo.fielduser2@example.com';
    SELECT id INTO v_field3_id FROM public.profiles WHERE email = 'demo.fielduser3@example.com';

    IF v_admin_id IS NULL THEN RAISE EXCEPTION 'admin profile not found — check that admin@gmail.com exists in auth.users'; END IF;
    IF v_approver_id IS NULL THEN RAISE EXCEPTION 'approver profile not found — check that approver@gmail.com exists in auth.users'; END IF;
    IF v_tech_id IS NULL THEN RAISE EXCEPTION 'technician profile not found — check that tech@gmail.com exists in auth.users'; END IF;
    IF v_user_id IS NULL THEN RAISE EXCEPTION 'user profile not found — check that user@gmail.com exists in auth.users'; END IF;

    -- --------------------------------------------------------
    -- Gather available equipment (need at least 20)
    -- --------------------------------------------------------
    SELECT array_agg(id ORDER BY id)
    INTO eq_ids
    FROM (
        SELECT id FROM public.equipment
        WHERE status = 'available'
        ORDER BY id
        LIMIT 22
    ) sub;

    eq_count := COALESCE(array_length(eq_ids, 1), 0);
    IF eq_count < 20 THEN
        RAISE EXCEPTION 'Need at least 20 available equipment rows. Found: %', eq_count;
    END IF;

    -- ========================================================
    -- BORROWS — every status, multiple users
    -- ========================================================

    -- ---- pending_borrow_approval (2 items) ----

    -- User's own pending request
    INSERT INTO public.borrows (
        user_id, user_name, equipment_ids, borrow_date, due_date,
        purpose, contact_name, contact_phone, notes, status,
        created_at, updated_at
    ) VALUES (
        v_user_id, 'ผู้ใช้งานทั่วไป', ARRAY[eq_ids[1], eq_ids[2]],
        CURRENT_DATE + 2, CURRENT_DATE + 9,
        '[DEMO] คำขอยืมอุปกรณ์เพื่อฉีดพ่นหมู่บ้านนาโยง',
        'ผู้ใช้งานทั่วไป', '0894567890',
        'ต้องการใช้เครื่องพ่น 2 เครื่องสำหรับพื้นที่ตำบลนาโยง',
        'pending_borrow_approval',
        now() - interval '3 hours', now() - interval '3 hours'
    ) RETURNING id INTO b_pending1_id;

    -- Field user's pending request
    INSERT INTO public.borrows (
        user_id, user_name, equipment_ids, borrow_date, due_date,
        purpose, contact_name, contact_phone, notes, status,
        created_at, updated_at
    ) VALUES (
        v_field1_id, 'ประสิทธิ์ ภาคสนาม', ARRAY[eq_ids[3]],
        CURRENT_DATE + 1, CURRENT_DATE + 5,
        '[DEMO] ขอยืมเครื่องพ่นสำหรับปฏิบัติงานพื้นที่ย่านตาขาว',
        'ประสิทธิ์ ภาคสนาม', '0833333331',
        'ใช้ฉีดพ่นในเขตตำบลทุ่งกระบือ หมู่ 3-5',
        'pending_borrow_approval',
        now() - interval '1 hour', now() - interval '1 hour'
    ) RETURNING id INTO b_pending2_id;

    -- ---- pending_delivery (2 items) ----

    -- User's approved request waiting for technician delivery
    INSERT INTO public.borrows (
        user_id, user_name, equipment_ids, borrow_date, due_date,
        purpose, contact_name, contact_phone, notes, status,
        created_at, updated_at
    ) VALUES (
        v_user_id, 'ผู้ใช้งานทั่วไป', ARRAY[eq_ids[4], eq_ids[5]],
        CURRENT_DATE, CURRENT_DATE + 7,
        '[DEMO] คำขอยืมอนุมัติแล้ว รอส่งมอบ (เครื่องพ่น 2 เครื่อง)',
        'ผู้ใช้งานทั่วไป', '0894567890',
        'อนุมัติโดยผู้อนุมัติ รอช่างเตรียมอุปกรณ์',
        'pending_delivery',
        now() - interval '1 day', now() - interval '12 hours'
    ) RETURNING id INTO b_delivery1_id;

    -- Field user's approved request
    INSERT INTO public.borrows (
        user_id, user_name, equipment_ids, borrow_date, due_date,
        purpose, contact_name, contact_phone, notes, status,
        created_at, updated_at
    ) VALUES (
        v_field2_id, 'สุดา เจ้าหน้าที่สนาม', ARRAY[eq_ids[6]],
        CURRENT_DATE, CURRENT_DATE + 3,
        '[DEMO] คำขอยืมเร่งด่วน อนุมัติแล้ว รอส่งมอบ',
        'สุดา เจ้าหน้าที่สนาม', '0833333332',
        'ต้องใช้ด่วนสำหรับพื้นที่ระบาดตำบลปะเหลียน',
        'pending_delivery',
        now() - interval '18 hours', now() - interval '10 hours'
    ) RETURNING id INTO b_delivery2_id;

    -- ---- borrowed (2 active + 1 overdue) ----

    -- User's active borrow (on time)
    INSERT INTO public.borrows (
        user_id, user_name, equipment_ids, borrow_date, due_date,
        purpose, contact_name, contact_phone, notes, status,
        pre_delivery_checklist, pre_delivery_checked_at, pre_delivery_checked_by,
        created_at, updated_at
    ) VALUES (
        v_user_id, 'ผู้ใช้งานทั่วไป', ARRAY[eq_ids[7], eq_ids[8]],
        CURRENT_DATE - 2, CURRENT_DATE + 5,
        '[DEMO] กำลังยืมใช้งานอยู่ ฉีดพ่นตำบลนาโยง',
        'ผู้ใช้งานทั่วไป', '0894567890',
        'ส่งมอบแล้ว กำลังปฏิบัติงานภาคสนาม',
        'borrowed',
        jsonb_build_object('engine', 'passed', 'tank', 'passed', 'spray', 'passed', 'hose', 'passed'),
        CURRENT_DATE - 2, 'ช่างเทคนิค',
        now() - interval '3 days', now() - interval '2 days'
    ) RETURNING id INTO b_borrowed1_id;

    -- Field user's active borrow
    INSERT INTO public.borrows (
        user_id, user_name, equipment_ids, borrow_date, due_date,
        purpose, contact_name, contact_phone, notes, status,
        pre_delivery_checklist, pre_delivery_checked_at, pre_delivery_checked_by,
        created_at, updated_at
    ) VALUES (
        v_field3_id, 'ธนกร ผู้ปฏิบัติงาน', ARRAY[eq_ids[9]],
        CURRENT_DATE - 1, CURRENT_DATE + 6,
        '[DEMO] กำลังใช้งาน ฉีดพ่นพื้นที่ตำบลรัษฎา',
        'ธนกร ผู้ปฏิบัติงาน', '0833333333',
        'ส่งมอบอุปกรณ์ตรวจสอบปกติ',
        'borrowed',
        jsonb_build_object('engine', 'passed', 'tank', 'passed', 'spray', 'passed'),
        CURRENT_DATE - 1, 'ช่างเทคนิค',
        now() - interval '2 days', now() - interval '1 day'
    ) RETURNING id INTO b_borrowed2_id;

    -- OVERDUE borrow
    INSERT INTO public.borrows (
        user_id, user_name, equipment_ids, borrow_date, due_date,
        purpose, contact_name, contact_phone, notes, status,
        pre_delivery_checklist, pre_delivery_checked_at, pre_delivery_checked_by,
        created_at, updated_at
    ) VALUES (
        v_field1_id, 'ประสิทธิ์ ภาคสนาม', ARRAY[eq_ids[10]],
        CURRENT_DATE - 10, CURRENT_DATE - 3,
        '[DEMO] เลยกำหนดคืน 3 วัน — ภารกิจยืดเยื้อ',
        'ประสิทธิ์ ภาคสนาม', '0833333331',
        'พื้นที่ระบาดขยายวง ต้องใช้อุปกรณ์ต่อ',
        'borrowed',
        jsonb_build_object('engine', 'passed', 'tank', 'passed', 'spray', 'passed'),
        CURRENT_DATE - 10, 'ช่างเทคนิค',
        now() - interval '12 days', now() - interval '10 days'
    ) RETURNING id INTO b_overdue_id;

    -- ---- returned (normal, on time) ----
    INSERT INTO public.borrows (
        user_id, user_name, equipment_ids, borrow_date, due_date, actual_return_date,
        purpose, contact_name, contact_phone, notes, status,
        pre_delivery_checklist, pre_delivery_checked_at, pre_delivery_checked_by,
        post_return_checklist, post_return_checked_at, post_return_checked_by,
        created_at, updated_at
    ) VALUES (
        v_user_id, 'ผู้ใช้งานทั่วไป', ARRAY[eq_ids[11]],
        CURRENT_DATE - 14, CURRENT_DATE - 7, CURRENT_DATE - 7,
        '[DEMO] ประวัติ: คืนปกติตรงกำหนด',
        'ผู้ใช้งานทั่วไป', '0894567890',
        'คืนอุปกรณ์ครบ สภาพดี',
        'returned',
        jsonb_build_object('engine', 'passed', 'tank', 'passed', 'spray', 'passed'),
        CURRENT_DATE - 14, 'ช่างเทคนิค',
        jsonb_build_object('condition', 'normal', 'note', 'อุปกรณ์สภาพดี'),
        CURRENT_DATE - 7, 'ช่างเทคนิค',
        now() - interval '14 days', now() - interval '7 days'
    ) RETURNING id INTO b_returned1_id;

    -- Another returned (by field user)
    INSERT INTO public.borrows (
        user_id, user_name, equipment_ids, borrow_date, due_date, actual_return_date,
        purpose, contact_name, contact_phone, notes, status,
        pre_delivery_checklist, pre_delivery_checked_at, pre_delivery_checked_by,
        post_return_checklist, post_return_checked_at, post_return_checked_by,
        created_at, updated_at
    ) VALUES (
        v_field2_id, 'สุดา เจ้าหน้าที่สนาม', ARRAY[eq_ids[12]],
        CURRENT_DATE - 20, CURRENT_DATE - 14, CURRENT_DATE - 14,
        '[DEMO] ประวัติ: คืนปกติ ภารกิจปะเหลียน',
        'สุดา เจ้าหน้าที่สนาม', '0833333332',
        'เสร็จภารกิจฉีดพ่นตามแผน',
        'returned',
        jsonb_build_object('engine', 'passed', 'tank', 'passed'),
        CURRENT_DATE - 20, 'ช่างเทคนิค',
        jsonb_build_object('condition', 'normal'),
        CURRENT_DATE - 14, 'ช่างเทคนิค',
        now() - interval '20 days', now() - interval '14 days'
    ) RETURNING id INTO b_returned2_id;

    -- ---- returned_late ----
    INSERT INTO public.borrows (
        user_id, user_name, equipment_ids, borrow_date, due_date, actual_return_date,
        purpose, contact_name, contact_phone, notes, status,
        pre_delivery_checklist, pre_delivery_checked_at, pre_delivery_checked_by,
        post_return_checklist, post_return_checked_at, post_return_checked_by,
        late_return_reason,
        created_at, updated_at
    ) VALUES (
        v_user_id, 'ผู้ใช้งานทั่วไป', ARRAY[eq_ids[13]],
        CURRENT_DATE - 18, CURRENT_DATE - 12, CURRENT_DATE - 9,
        '[DEMO] ประวัติ: คืนล่าช้า 3 วัน',
        'ผู้ใช้งานทั่วไป', '0894567890',
        'คืนหลังกำหนดเนื่องจากฝนตกหนัก',
        'returned_late',
        jsonb_build_object('engine', 'passed', 'tank', 'passed', 'spray', 'passed'),
        CURRENT_DATE - 18, 'ช่างเทคนิค',
        jsonb_build_object('condition', 'normal'),
        CURRENT_DATE - 9, 'ช่างเทคนิค',
        'ฝนตกหนักติดต่อกัน 3 วัน ไม่สามารถเดินทางนำอุปกรณ์มาคืนได้',
        now() - interval '18 days', now() - interval '9 days'
    ) RETURNING id INTO b_late_id;

    -- ---- returned_early ----
    INSERT INTO public.borrows (
        user_id, user_name, equipment_ids, borrow_date, due_date, actual_return_date,
        purpose, contact_name, contact_phone, notes, status,
        pre_delivery_checklist, pre_delivery_checked_at, pre_delivery_checked_by,
        post_return_checklist, post_return_checked_at, post_return_checked_by,
        created_at, updated_at
    ) VALUES (
        v_field3_id, 'ธนกร ผู้ปฏิบัติงาน', ARRAY[eq_ids[14]],
        CURRENT_DATE - 25, CURRENT_DATE - 18, CURRENT_DATE - 21,
        '[DEMO] ประวัติ: คืนก่อนกำหนด 3 วัน',
        'ธนกร ผู้ปฏิบัติงาน', '0833333333',
        'เสร็จภารกิจเร็วกว่าแผน',
        'returned_early',
        jsonb_build_object('engine', 'passed', 'tank', 'passed'),
        CURRENT_DATE - 25, 'ช่างเทคนิค',
        jsonb_build_object('condition', 'normal', 'note', 'อุปกรณ์ปกติ'),
        CURRENT_DATE - 21, 'ช่างเทคนิค',
        now() - interval '25 days', now() - interval '21 days'
    ) RETURNING id INTO b_early_id;

    -- ---- returned_damaged ----
    INSERT INTO public.borrows (
        user_id, user_name, equipment_ids, borrow_date, due_date, actual_return_date,
        purpose, contact_name, contact_phone, notes, status,
        pre_delivery_checklist, pre_delivery_checked_at, pre_delivery_checked_by,
        post_return_checklist, post_return_checked_at, post_return_checked_by,
        created_at, updated_at
    ) VALUES (
        v_field1_id, 'ประสิทธิ์ ภาคสนาม', ARRAY[eq_ids[15]],
        CURRENT_DATE - 12, CURRENT_DATE - 5, CURRENT_DATE - 4,
        '[DEMO] ประวัติ: คืนพร้อมแจ้งอุปกรณ์ชำรุด',
        'ประสิทธิ์ ภาคสนาม', '0833333331',
        'หัวฉีดแตกระหว่างใช้งาน',
        'returned_damaged',
        jsonb_build_object('engine', 'passed', 'tank', 'passed', 'spray', 'passed'),
        CURRENT_DATE - 12, 'ช่างเทคนิค',
        jsonb_build_object('condition', 'damaged', 'note', 'หัวฉีดแตก สายส่งน้ำยารั่ว'),
        CURRENT_DATE - 4, 'ช่างเทคนิค',
        now() - interval '12 days', now() - interval '4 days'
    ) RETURNING id INTO b_damaged_id;

    -- ========================================================
    -- REPAIRS — every status
    -- ========================================================

    -- ---- pending_repair_approval (3 items — from damaged return + manual reports) ----

    -- Repair from damaged return
    INSERT INTO public.repairs (
        equipment_id, equipment_name, damage_description, status,
        request_date, repair_notes, created_at, updated_at
    )
    SELECT eq_ids[15], e.name,
        '[DEMO] หัวฉีดแตก สายส่งน้ำยารั่ว — จากการคืนอุปกรณ์ชำรุด',
        'pending_repair_approval', CURRENT_DATE - 4,
        'ตรวจพบหลังรับคืนจากผู้ใช้ ประสิทธิ์ ภาคสนาม',
        now() - interval '4 days', now() - interval '4 days'
    FROM public.equipment e WHERE e.id = eq_ids[15]
    RETURNING id INTO r_pending1_id;

    -- Manual repair report by technician
    INSERT INTO public.repairs (
        equipment_id, equipment_name, damage_description, status,
        request_date, repair_notes, created_at, updated_at
    )
    SELECT eq_ids[16], e.name,
        '[DEMO] มอเตอร์เสียงดังผิดปกติ — แจ้งโดยช่างเทคนิค',
        'pending_repair_approval', CURRENT_DATE - 2,
        'ตรวจพบระหว่างเตรียมอุปกรณ์ก่อนส่งมอบ',
        now() - interval '2 days', now() - interval '2 days'
    FROM public.equipment e WHERE e.id = eq_ids[16]
    RETURNING id INTO r_pending2_id;

    -- Another pending repair
    INSERT INTO public.repairs (
        equipment_id, equipment_name, damage_description, status,
        request_date, repair_notes, created_at, updated_at
    )
    SELECT eq_ids[17], e.name,
        '[DEMO] ถังน้ำยารั่วซึม — แจ้งจากการตรวจสอบประจำเดือน',
        'pending_repair_approval', CURRENT_DATE - 1,
        'พบรอยแตกที่ก้นถัง ขณะทำความสะอาดประจำเดือน',
        now() - interval '1 day', now() - interval '1 day'
    FROM public.equipment e WHERE e.id = eq_ids[17]
    RETURNING id INTO r_pending3_id;

    -- ---- repair_approved (2 items — in technician's repair queue) ----

    INSERT INTO public.repairs (
        equipment_id, equipment_name, damage_description, status,
        request_date, repair_notes, created_at, updated_at
    )
    SELECT eq_ids[18], e.name,
        '[DEMO] ชุดสายพานหลวม — อนุมัติซ่อมแล้ว รอช่างดำเนินการ',
        'repair_approved', CURRENT_DATE - 6,
        'อนุมัติโดยผู้อนุมัติ ให้เปลี่ยนสายพานชุดใหม่',
        now() - interval '6 days', now() - interval '3 days'
    FROM public.equipment e WHERE e.id = eq_ids[18]
    RETURNING id INTO r_approved1_id;

    INSERT INTO public.repairs (
        equipment_id, equipment_name, damage_description, status,
        request_date, repair_notes, created_at, updated_at
    )
    SELECT eq_ids[19], e.name,
        '[DEMO] วาล์วควบคุมแรงดันชำรุด — อนุมัติซ่อม',
        'repair_approved', CURRENT_DATE - 4,
        'ต้องส่งซ่อมภายนอก ร้านช่างประจำ',
        now() - interval '4 days', now() - interval '2 days'
    FROM public.equipment e WHERE e.id = eq_ids[19]
    RETURNING id INTO r_approved2_id;

    -- ---- repair_rejected (1 item) ----

    INSERT INTO public.repairs (
        equipment_id, equipment_name, damage_description, status,
        request_date, repair_notes, created_at, updated_at
    )
    SELECT eq_ids[20], e.name,
        '[DEMO] รอยขีดข่วนเล็กน้อย — ปฏิเสธการซ่อม (ไม่กระทบการใช้งาน)',
        'repair_rejected', CURRENT_DATE - 8,
        'ปฏิเสธ: รอยขีดข่วนเล็กน้อยที่ผิวนอก ไม่ส่งผลต่อการทำงาน',
        now() - interval '8 days', now() - interval '7 days'
    FROM public.equipment e WHERE e.id = eq_ids[20]
    RETURNING id INTO r_rejected_id;

    -- ---- completed (2 items) ----

    INSERT INTO public.repairs (
        equipment_id, equipment_name, damage_description, status,
        request_date, repair_date, cost, repair_location,
        repair_notes, repairer_name, receiver_name,
        created_at, updated_at
    )
    SELECT eq_ids[21], e.name,
        '[DEMO] เปลี่ยนหัวฉีดและล้างระบบส่งน้ำยา — ซ่อมเสร็จแล้ว',
        'completed', CURRENT_DATE - 20, CURRENT_DATE - 15,
        3200.00, 'ศูนย์ซ่อมครุภัณฑ์เขต',
        'เปลี่ยนหัวฉีดรุ่นใหม่ ล้างท่อน้ำยา ทดสอบแรงดันผ่าน',
        'ช่างเทคนิค', 'หัวหน้าคลังครุภัณฑ์',
        now() - interval '20 days', now() - interval '15 days'
    FROM public.equipment e WHERE e.id = eq_ids[21]
    RETURNING id INTO r_completed1_id;

    INSERT INTO public.repairs (
        equipment_id, equipment_name, damage_description, status,
        request_date, repair_date, cost, repair_location,
        repair_notes, repairer_name, receiver_name,
        created_at, updated_at
    )
    SELECT eq_ids[22], e.name,
        '[DEMO] ซ่อมมอเตอร์ เปลี่ยนแบตเตอรี่ — ซ่อมเสร็จ',
        'completed', CURRENT_DATE - 30, CURRENT_DATE - 25,
        5500.00, 'ร้านช่างอำเภอเมือง',
        'เปลี่ยนขดลวดมอเตอร์ เปลี่ยนแบตเตอรี่ลิเธียม ทดสอบพ่น 30 นาทีผ่าน',
        'ร้านช่างอำเภอเมือง', 'ช่างเทคนิค',
        now() - interval '30 days', now() - interval '25 days'
    FROM public.equipment e WHERE e.id = eq_ids[22]
    RETURNING id INTO r_completed2_id;

    -- ========================================================
    -- Update equipment statuses to match workflow state
    -- ========================================================

    UPDATE public.equipment
    SET status = CASE id
        -- pending_borrow_approval: equipment stays available (not reserved until approved)
        -- eq_ids[1], [2], [3] stay 'available'

        -- pending_delivery: equipment is reserved
        WHEN eq_ids[4] THEN 'reserved'
        WHEN eq_ids[5] THEN 'reserved'
        WHEN eq_ids[6] THEN 'reserved'

        -- borrowed: equipment is borrowed
        WHEN eq_ids[7] THEN 'borrowed'
        WHEN eq_ids[8] THEN 'borrowed'
        WHEN eq_ids[9] THEN 'borrowed'
        WHEN eq_ids[10] THEN 'borrowed'  -- overdue but still borrowed

        -- returned: equipment back to available
        -- eq_ids[11]-[14] stay 'available'

        -- returned_damaged → pending_repair_approval
        WHEN eq_ids[15] THEN 'pending_repair_approval'

        -- pending_repair_approval
        WHEN eq_ids[16] THEN 'pending_repair_approval'
        WHEN eq_ids[17] THEN 'pending_repair_approval'

        -- repair_approved → under_maintenance
        WHEN eq_ids[18] THEN 'under_maintenance'
        WHEN eq_ids[19] THEN 'under_maintenance'

        -- repair_rejected → available
        WHEN eq_ids[20] THEN 'available'

        -- completed → available
        -- eq_ids[21], [22] stay 'available'

        ELSE 'available'
    END
    WHERE id = ANY(eq_ids);

    -- ========================================================
    -- NOTIFICATIONS — comprehensive for all roles
    -- ========================================================

    INSERT INTO public.notifications (
        user_id, role_audience, event_type, entity_type, entity_id,
        title, body, action_url, metadata, dedupe_key, created_at
    ) VALUES
    -- ---- User notifications ----
    (
        v_user_id, 'user', 'borrow.pending_approval', 'borrow', b_pending1_id::TEXT,
        'คำขอยืมของคุณกำลังรออนุมัติ',
        'คำขอยืมเครื่องพ่น 2 เครื่องอยู่ระหว่างรอผู้อนุมัติตรวจสอบ',
        '/dashboard', jsonb_build_object('seed', true),
        'demo:user:borrow-pending1', now() - interval '3 hours'
    ),
    (
        v_user_id, 'user', 'borrow.approved', 'borrow', b_delivery1_id::TEXT,
        'คำขอยืมได้รับอนุมัติแล้ว',
        'คำขอยืมเครื่องพ่นผ่านการอนุมัติ รอช่างเทคนิคส่งมอบอุปกรณ์',
        '/dashboard', jsonb_build_object('seed', true),
        'demo:user:borrow-approved1', now() - interval '12 hours'
    ),
    (
        v_user_id, 'user', 'borrow.delivered', 'borrow', b_borrowed1_id::TEXT,
        'อุปกรณ์ถูกส่งมอบแล้ว',
        'ช่างเทคนิคส่งมอบเครื่องพ่น 2 เครื่องเรียบร้อย กรุณาตรวจสอบสภาพ',
        '/dashboard', jsonb_build_object('seed', true),
        'demo:user:borrow-delivered1', now() - interval '2 days'
    ),
    (
        v_user_id, 'user', 'borrow.returned', 'borrow', b_returned1_id::TEXT,
        'บันทึกการคืนอุปกรณ์เรียบร้อย',
        'ระบบบันทึกการคืนอุปกรณ์แล้ว สถานะ: คืนปกติ',
        '/dashboard/history', jsonb_build_object('seed', true),
        'demo:user:borrow-returned1', now() - interval '7 days'
    ),
    (
        v_user_id, 'user', 'borrow.returned_late', 'borrow', b_late_id::TEXT,
        'บันทึกการคืนล่าช้าเรียบร้อย',
        'ระบบบันทึกการคืนอุปกรณ์ล่าช้า 3 วัน เหตุผล: ฝนตกหนัก',
        '/dashboard/history', jsonb_build_object('seed', true),
        'demo:user:borrow-returned-late', now() - interval '9 days'
    ),

    -- ---- Approver notifications ----
    (
        v_approver_id, 'approver', 'user.pending_approval', 'profile',
        (SELECT id::TEXT FROM public.profiles WHERE email = 'demo.pending1@example.com'),
        'มีผู้ใช้ใหม่รออนุมัติ: สมชาย รออนุมัติ',
        'รพ.สต.ห้วยยอด สมัครเข้าใช้ระบบ รอการตรวจสอบ',
        '/dashboard/approvals', jsonb_build_object('seed', true),
        'demo:approver:user-pending1', now() - interval '4 hours'
    ),
    (
        v_approver_id, 'approver', 'user.pending_approval', 'profile',
        (SELECT id::TEXT FROM public.profiles WHERE email = 'demo.pending2@example.com'),
        'มีผู้ใช้ใหม่รออนุมัติ: สมหญิง รอตรวจสอบ',
        'เทศบาลตำบลบ่อหิน สมัครเข้าใช้ระบบ รอการตรวจสอบ',
        '/dashboard/approvals', jsonb_build_object('seed', true),
        'demo:approver:user-pending2', now() - interval '3 hours'
    ),
    (
        v_approver_id, 'approver', 'borrow.pending_borrow_approval', 'borrow', b_pending1_id::TEXT,
        'มีคำขอยืมรออนุมัติ',
        'ผู้ใช้งานทั่วไป ขอยืมเครื่องพ่น 2 เครื่อง สำหรับพื้นที่นาโยง',
        '/dashboard/approvals', jsonb_build_object('seed', true),
        'demo:approver:borrow-pending1', now() - interval '3 hours'
    ),
    (
        v_approver_id, 'approver', 'borrow.pending_borrow_approval', 'borrow', b_pending2_id::TEXT,
        'มีคำขอยืมรออนุมัติ',
        'ประสิทธิ์ ภาคสนาม ขอยืมเครื่องพ่นสำหรับพื้นที่ย่านตาขาว',
        '/dashboard/approvals', jsonb_build_object('seed', true),
        'demo:approver:borrow-pending2', now() - interval '1 hour'
    ),
    (
        v_approver_id, 'approver', 'repair.pending_repair_approval', 'repair', r_pending1_id::TEXT,
        'มีงานซ่อมรออนุมัติ: หัวฉีดแตก',
        'อุปกรณ์ชำรุดจากการคืน รอพิจารณาอนุมัติซ่อม',
        '/dashboard/approvals', jsonb_build_object('seed', true),
        'demo:approver:repair-pending1', now() - interval '4 days'
    ),
    (
        v_approver_id, 'approver', 'repair.pending_repair_approval', 'repair', r_pending2_id::TEXT,
        'มีงานซ่อมรออนุมัติ: มอเตอร์เสียงดัง',
        'ช่างเทคนิคแจ้งซ่อม มอเตอร์เสียงดังผิดปกติ',
        '/dashboard/approvals', jsonb_build_object('seed', true),
        'demo:approver:repair-pending2', now() - interval '2 days'
    ),
    (
        v_approver_id, 'approver', 'repair.pending_repair_approval', 'repair', r_pending3_id::TEXT,
        'มีงานซ่อมรออนุมัติ: ถังน้ำยารั่ว',
        'พบรอยแตกจากการตรวจสอบประจำเดือน',
        '/dashboard/approvals', jsonb_build_object('seed', true),
        'demo:approver:repair-pending3', now() - interval '1 day'
    ),

    -- ---- Technician notifications ----
    (
        v_tech_id, 'technician', 'borrow.pending_delivery', 'borrow', b_delivery1_id::TEXT,
        'มีรายการรอส่งมอบ',
        'ผู้ใช้งานทั่วไป — เครื่องพ่น 2 เครื่อง อนุมัติแล้ว พร้อมส่งมอบ',
        '/dashboard/technician', jsonb_build_object('seed', true),
        'demo:tech:delivery1', now() - interval '12 hours'
    ),
    (
        v_tech_id, 'technician', 'borrow.pending_delivery', 'borrow', b_delivery2_id::TEXT,
        'มีรายการรอส่งมอบ (เร่งด่วน)',
        'สุดา เจ้าหน้าที่สนาม — เครื่องพ่น 1 เครื่อง พื้นที่ระบาดปะเหลียน',
        '/dashboard/technician', jsonb_build_object('seed', true),
        'demo:tech:delivery2', now() - interval '10 hours'
    ),
    (
        v_tech_id, 'technician', 'borrow.overdue', 'borrow', b_overdue_id::TEXT,
        'มีรายการเลยกำหนดคืน',
        'ประสิทธิ์ ภาคสนาม เลยกำหนดคืน 3 วัน กรุณาติดตาม',
        '/dashboard/technician', jsonb_build_object('seed', true),
        'demo:tech:overdue', now() - interval '3 days'
    ),
    (
        v_tech_id, 'technician', 'repair.repair_approved', 'repair', r_approved1_id::TEXT,
        'มีงานซ่อมใหม่ในคิว: ชุดสายพาน',
        'อนุมัติซ่อมแล้ว กรุณาดำเนินการเปลี่ยนสายพาน',
        '/dashboard/technician', jsonb_build_object('seed', true),
        'demo:tech:repair-approved1', now() - interval '3 days'
    ),
    (
        v_tech_id, 'technician', 'repair.repair_approved', 'repair', r_approved2_id::TEXT,
        'มีงานซ่อมใหม่ในคิว: วาล์วแรงดัน',
        'อนุมัติซ่อมแล้ว ต้องส่งซ่อมภายนอก',
        '/dashboard/technician', jsonb_build_object('seed', true),
        'demo:tech:repair-approved2', now() - interval '2 days'
    ),

    -- ---- Admin notifications ----
    (
        v_admin_id, 'admin', 'system.overview', 'dashboard', 'admin',
        'ข้อมูลทดสอบ workflow พร้อมแล้ว',
        'ระบบถูกเติมข้อมูลตัวอย่างครบทุก role เพื่อตรวจสอบการทำงาน',
        '/dashboard', jsonb_build_object('seed', true),
        'demo:admin:overview', now() - interval '10 minutes'
    ),
    (
        v_admin_id, 'admin', 'user.suspended', 'profile',
        (SELECT id::TEXT FROM public.profiles WHERE email = 'demo.suspended1@example.com'),
        'บัญชีผู้ใช้ถูกระงับ',
        'วิชัย ถูกระงับ — สำนักงานสาธารณสุขจังหวัด',
        '/dashboard', jsonb_build_object('seed', true),
        'demo:admin:user-suspended', now() - interval '2 days'
    ),
    (
        v_admin_id, 'admin', 'equipment.low_availability', 'equipment', 'summary',
        'อุปกรณ์พร้อมใช้งานลดลง',
        'มีอุปกรณ์ที่ถูกยืม/จอง/อยู่ระหว่างซ่อม หลายรายการ',
        '/dashboard', jsonb_build_object('seed', true),
        'demo:admin:equipment-alert', now() - interval '1 hour'
    );

    -- ========================================================
    -- Notification deliveries (in_app + email logs)
    -- ========================================================

    -- In-app deliveries
    INSERT INTO public.notification_deliveries (
        notification_id, dedupe_key, channel, provider, recipient,
        status, metadata, last_attempt_at, created_at, updated_at
    )
    SELECT
        n.id, n.dedupe_key, 'in_app', 'database', p.email,
        'sent', jsonb_build_object('seed', true),
        n.created_at, n.created_at, n.created_at
    FROM public.notifications n
    JOIN public.profiles p ON p.id = n.user_id
    WHERE n.dedupe_key LIKE 'demo:%'
    ON CONFLICT (dedupe_key, channel) DO UPDATE SET
        status = EXCLUDED.status,
        recipient = EXCLUDED.recipient,
        updated_at = now();

    -- Email delivery logs
    INSERT INTO public.notification_deliveries (
        notification_id, dedupe_key, channel, provider, recipient,
        status, metadata, last_attempt_at, created_at, updated_at
    )
    SELECT
        n.id, n.dedupe_key, 'email', 'demo-seed', p.email,
        'sent', jsonb_build_object('seed', true, 'note', 'seeded log'),
        n.created_at, n.created_at, n.created_at
    FROM public.notifications n
    JOIN public.profiles p ON p.id = n.user_id
    WHERE n.dedupe_key LIKE 'demo:%'
    ON CONFLICT (dedupe_key, channel) DO UPDATE SET
        status = EXCLUDED.status,
        recipient = EXCLUDED.recipient,
        updated_at = now();

END $$;

COMMIT;

-- ============================================================
-- Done! Login accounts:
--   admin@gmail.com / approver@gmail.com / tech@gmail.com / user@gmail.com
--
-- What you should see per role:
--
-- ADMIN:
--   - Equipment: available, reserved, borrowed, under_maintenance, pending_repair_approval
--   - Users: active accounts + 2 pending_approval + 1 suspended
--   - Notifications: overview, suspended user, equipment alert
--
-- APPROVER:
--   - Pending user approvals: 2
--   - Pending borrows: 2
--   - Pending repairs: 3
--   - Reports: borrow + repair history with data
--
-- TECHNICIAN:
--   - Pending delivery: 2 items
--   - Active returns: 3 borrowed (1 overdue)
--   - Active repairs: 2 approved
--   - Notifications: delivery, overdue, repair queue
--
-- USER:
--   - Active: 1 pending_approval, 1 pending_delivery, 2 borrowed
--   - History: returned, returned_late, returned_early, returned_damaged
--   - Notifications: approval, delivery, return updates
-- ============================================================
