-- ============================================================
-- Yonchuw - Complete Database Setup
-- ระบบจอง ยืม-คืน และซ่อมบำรุง เครื่องพ่นหมอกควัน
--
-- วิธีใช้: คัดลอกทั้งหมดแล้วรันใน Supabase SQL Editor
-- ============================================================

-- ============================================================
-- 1. TABLES
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Profiles table managed by Auth.js / application-level auth
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    agency TEXT,
    phone TEXT,
    address TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'technician', 'approver')),
    status TEXT NOT NULL DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'active', 'suspended')),
    password_hash TEXT,
    auth_provider TEXT NOT NULL DEFAULT 'credentials' CHECK (auth_provider IN ('credentials', 'google', 'legacy_supabase')),
    google_id TEXT,
    email_verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Equipment table
CREATE TABLE IF NOT EXISTS public.equipment (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    serial TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'borrowed', 'under_maintenance', 'pending_repair_approval')),
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Borrows table
CREATE TABLE IF NOT EXISTS public.borrows (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_name TEXT,
    equipment_ids INT[],
    borrow_date DATE NOT NULL,
    due_date DATE NOT NULL,
    actual_return_date DATE,
    purpose TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending_borrow_approval',
    pre_delivery_checklist JSONB,
    pre_delivery_checked_at DATE,
    pre_delivery_checked_by TEXT,
    post_return_checklist JSONB,
    post_return_checked_at DATE,
    post_return_checked_by TEXT,
    late_return_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Repairs table
CREATE TABLE IF NOT EXISTS public.repairs (
    id SERIAL PRIMARY KEY,
    equipment_id INT REFERENCES public.equipment(id) ON DELETE SET NULL,
    equipment_name TEXT,
    damage_description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending_repair_approval' CHECK (status IN ('pending_repair_approval', 'repair_approved', 'completed', 'repair_rejected')),
    cost DECIMAL(10,2),
    repair_location TEXT,
    repair_items JSONB,
    repair_recommendation TEXT,
    repairer_name TEXT,
    receiver_name TEXT,
    repair_notes TEXT,
    repair_date DATE,
    request_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Notifications table
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

CREATE TABLE IF NOT EXISTS public.request_rate_limits (
    key TEXT PRIMARY KEY,
    action TEXT NOT NULL,
    scope TEXT NOT NULL,
    hits INT NOT NULL DEFAULT 0,
    window_started_at TIMESTAMPTZ NOT NULL,
    blocked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. ENABLE ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.borrows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT role
    FROM public.profiles
    WHERE id = auth.uid()
$$;

-- ============================================================
-- 3. RLS POLICIES - profiles
-- ============================================================

CREATE POLICY "profiles_select_all"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (
        auth.uid() = id
        OR public.current_user_role() IN ('admin', 'approver')
    );

CREATE POLICY "profiles_insert_own"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "profiles_update_admin"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (public.current_user_role() IN ('admin', 'approver'));

-- ============================================================
-- 4. RLS POLICIES - equipment
-- ============================================================

CREATE POLICY "equipment_select_all"
    ON public.equipment FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "equipment_insert_admin"
    ON public.equipment FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

CREATE POLICY "equipment_update_staff"
    ON public.equipment FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('admin', 'technician', 'approver')
        )
    );

CREATE POLICY "equipment_delete_admin"
    ON public.equipment FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- ============================================================
-- 5. RLS POLICIES - borrows
-- ============================================================

CREATE POLICY "borrows_select"
    ON public.borrows FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('admin', 'approver', 'technician')
        )
    );

CREATE POLICY "borrows_insert"
    ON public.borrows FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "borrows_update_staff"
    ON public.borrows FOR UPDATE
    TO authenticated
    USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('admin', 'approver', 'technician')
        )
    );

-- ============================================================
-- 6. RLS POLICIES - repairs
-- ============================================================

CREATE POLICY "repairs_select"
    ON public.repairs FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('admin', 'approver', 'technician')
        )
    );

-- ============================================================
-- 6.1 RLS POLICIES - notifications
-- ============================================================

CREATE POLICY "notifications_select_own"
    ON public.notifications FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "notifications_update_own"
    ON public.notifications FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "repairs_insert"
    ON public.repairs FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('admin', 'approver', 'technician')
        )
    );

CREATE POLICY "repairs_update"
    ON public.repairs FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role IN ('admin', 'approver', 'technician')
        )
    );

-- ============================================================
-- 7. AUTO-UPDATE updated_at TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_equipment_updated_at
    BEFORE UPDATE ON public.equipment
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_borrows_updated_at
    BEFORE UPDATE ON public.borrows
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_repairs_updated_at
    BEFORE UPDATE ON public.repairs
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_notification_deliveries_updated_at
    BEFORE UPDATE ON public.notification_deliveries
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_request_rate_limits_updated_at
    BEFORE UPDATE ON public.request_rate_limits
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 8. PROFILE CREATION
-- ============================================================
-- Auth.js handles user registration in the application layer.
-- No auth.users trigger is created in this setup.

-- ============================================================
-- 9. PROTECT role/status FROM SELF-UPDATE
-- ============================================================

CREATE OR REPLACE FUNCTION public.protect_role_status()
RETURNS TRIGGER AS $$
DECLARE
    actor_role TEXT;
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN NEW;
    END IF;

    SELECT role INTO actor_role
    FROM public.profiles
    WHERE id = auth.uid();

    IF actor_role = 'admin' THEN
        RETURN NEW;
    END IF;

    IF OLD.role IS DISTINCT FROM NEW.role THEN
        RAISE EXCEPTION 'Only admins can change role';
    END IF;

    IF OLD.status IS DISTINCT FROM NEW.status THEN
        IF actor_role = 'approver' THEN
            IF OLD.id = auth.uid() THEN
                RAISE EXCEPTION 'Approvers cannot change their own status';
            END IF;

            IF OLD.email IS DISTINCT FROM NEW.email
                OR OLD.full_name IS DISTINCT FROM NEW.full_name
                OR OLD.agency IS DISTINCT FROM NEW.agency
                OR OLD.phone IS DISTINCT FROM NEW.phone
                OR OLD.address IS DISTINCT FROM NEW.address THEN
                RAISE EXCEPTION 'Approvers can only update status';
            END IF;

            RETURN NEW;
        END IF;

        RAISE EXCEPTION 'Only admins or approvers can change status';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER protect_profiles_role_status
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.protect_role_status();

-- ============================================================
-- 9.1 VALIDATE EQUIPMENT ON BORROW CREATION
-- ============================================================

CREATE OR REPLACE FUNCTION public.validate_borrow_equipment()
RETURNS TRIGGER AS $$
DECLARE
    equipment_count INT;
BEGIN
    IF NEW.equipment_ids IS NULL OR array_length(NEW.equipment_ids, 1) IS NULL THEN
        RAISE EXCEPTION 'Borrow request must include at least one equipment item';
    END IF;

    PERFORM 1
    FROM public.equipment
    WHERE id = ANY(NEW.equipment_ids)
    FOR UPDATE;

    SELECT COUNT(*)
    INTO equipment_count
    FROM public.equipment
    WHERE id = ANY(NEW.equipment_ids)
      AND status = 'available';

    IF equipment_count <> array_length(NEW.equipment_ids, 1) THEN
        RAISE EXCEPTION 'Some equipment is no longer available';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS validate_borrow_equipment ON public.borrows;

CREATE TRIGGER validate_borrow_equipment
    BEFORE INSERT ON public.borrows
    FOR EACH ROW EXECUTE FUNCTION public.validate_borrow_equipment();

DROP TRIGGER IF EXISTS reserve_borrow_equipment ON public.borrows;
DROP FUNCTION IF EXISTS public.reserve_borrow_equipment();

CREATE OR REPLACE FUNCTION public.approve_borrow_request(target_borrow_id INT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    target_equipment_ids INT[];
    expected_count INT;
    updated_count INT;
    current_status TEXT;
BEGIN
    SELECT equipment_ids, status
    INTO target_equipment_ids, current_status
    FROM public.borrows
    WHERE id = target_borrow_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Borrow request not found';
    END IF;

    IF current_status <> 'pending_borrow_approval' THEN
        RAISE EXCEPTION 'Borrow request is not awaiting approval';
    END IF;

    expected_count := COALESCE(array_length(target_equipment_ids, 1), 0);

    IF expected_count = 0 THEN
        RAISE EXCEPTION 'Borrow request has no equipment items';
    END IF;

    UPDATE public.equipment
    SET status = 'reserved'
    WHERE id = ANY(target_equipment_ids)
      AND status = 'available';

    GET DIAGNOSTICS updated_count = ROW_COUNT;

    IF updated_count <> expected_count THEN
        RAISE EXCEPTION 'Some equipment is no longer available';
    END IF;

    UPDATE public.borrows
    SET status = 'pending_delivery'
    WHERE id = target_borrow_id;
END;
$$;

-- ============================================================
-- 10. INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email_unique ON public.profiles (lower(email));
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_google_id_unique ON public.profiles(google_id) WHERE google_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_equipment_status ON public.equipment(status);
CREATE INDEX IF NOT EXISTS idx_equipment_type ON public.equipment(type);
CREATE UNIQUE INDEX IF NOT EXISTS idx_equipment_serial_unique ON public.equipment(serial);
CREATE INDEX IF NOT EXISTS idx_borrows_user_id ON public.borrows(user_id);
CREATE INDEX IF NOT EXISTS idx_borrows_status ON public.borrows(status);
CREATE INDEX IF NOT EXISTS idx_repairs_status ON public.repairs(status);
CREATE INDEX IF NOT EXISTS idx_repairs_equipment_id ON public.repairs(equipment_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created_at ON public.notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notification_deliveries_notification_id ON public.notification_deliveries(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_deliveries_status ON public.notification_deliveries(channel, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_request_rate_limits_action ON public.request_rate_limits(action, updated_at DESC);

-- ============================================================
-- 11. SAMPLE EQUIPMENT DATA
-- ============================================================

INSERT INTO public.equipment (name, type, serial, status, image_url)
SELECT *
FROM (
    VALUES
        ('เครื่องพ่นสารเคมีชนิดอัดลมด้วยมือ ยี่ห้อ HUDSON X-PERT SPRAYER', 'HUDSON X-PERT SPRAYER', '0334 0418 0044', 'available', NULL),
        ('เครื่องพ่นสารเคมีชนิดอัดลมด้วยมือ ยี่ห้อ HUDSON X-PERT SPRAYER', 'HUDSON X-PERT SPRAYER', '0334 0418 0045', 'available', NULL),
        ('เครื่องพ่นสารเคมีชนิดอัดลมด้วยมือ ยี่ห้อ HUDSON X-PERT SPRAYER', 'HUDSON X-PERT SPRAYER', '0334 0418 0046', 'available', NULL),
        ('เครื่องพ่นสารเคมีชนิดอัดลมด้วยมือ ยี่ห้อ HUDSON X-PERT SPRAYER', 'HUDSON X-PERT SPRAYER', '0334 0418 0047', 'available', NULL),
        ('เครื่องพ่นสารเคมีชนิดอัดลมด้วยมือ ยี่ห้อ HUDSON X-PERT SPRAYER', 'HUDSON X-PERT SPRAYER', '0334 0418 0048', 'available', NULL),
        ('เครื่องพ่นสารเคมีชนิดอัดลมด้วยมือ ยี่ห้อ HUDSON X-PERT SPRAYER', 'HUDSON X-PERT SPRAYER', '0334 0418 0049', 'available', NULL),
        ('เครื่องพ่นสารเคมีชนิดอัดลมด้วยมือ ยี่ห้อ HUDSON X-PERT SPRAYER', 'HUDSON X-PERT SPRAYER', '0334 0418 0050', 'available', NULL),
        ('เครื่องพ่นสารเคมีชนิดอัดลมด้วยมือ ยี่ห้อ HUDSON X-PERT SPRAYER', 'HUDSON X-PERT SPRAYER', '0334 0418 0051', 'available', NULL),
        ('เครื่องพ่นสารเคมีชนิดอัดลมด้วยมือ ยี่ห้อ HUDSON X-PERT SPRAYER', 'HUDSON X-PERT SPRAYER', '0334 0418 0052', 'available', NULL),
        ('เครื่องพ่นสารเคมีชนิดอัดลมด้วยมือ ยี่ห้อ HUDSON X-PERT SPRAYER', 'HUDSON X-PERT SPRAYER', '0334 0418 0053', 'available', NULL),
        ('เครื่องพ่นสารเคมีชนิดอัดลมด้วยมือ ยี่ห้อ HUDSON X-PERT SPRAYER', 'HUDSON X-PERT SPRAYER', '0334 0418 0061', 'available', NULL),
        ('เครื่องพ่นสารเคมีชนิดอัดลมด้วยมือ ยี่ห้อ HUDSON X-PERT SPRAYER', 'HUDSON X-PERT SPRAYER', '0334 0418 0062', 'available', NULL),
        ('เครื่องพ่นสารเคมีชนิดอัดลมด้วยมือ ยี่ห้อ HUDSON X-PERT SPRAYER', 'HUDSON X-PERT SPRAYER', '0334 0418 0063', 'available', NULL),
        ('เครื่องพ่นสารเคมีชนิดอัดลมด้วยมือ ยี่ห้อ HUDSON X-PERT SPRAYER', 'HUDSON X-PERT SPRAYER', '0334 0418 0087', 'available', NULL),
        ('เครื่องพ่นสารเคมีชนิดอัดลมด้วยมือ ยี่ห้อ HUDSON X-PERT SPRAYER', 'HUDSON X-PERT SPRAYER', '0334 0418 0088', 'available', NULL),
        ('เครื่องพ่นสารเคมีชนิดอัดลมด้วยมือ ยี่ห้อ HUDSON X-PERT SPRAYER', 'HUDSON X-PERT SPRAYER', '0334 0418 0089', 'available', NULL),
        ('เครื่องพ่นสารเคมีชนิดอัดลมด้วยมือ ยี่ห้อ HUDSON X-PERT SPRAYER', 'HUDSON X-PERT SPRAYER', '0334 0418 0090', 'available', NULL),
        ('เครื่องพ่นสารเคมีชนิดอัดลมด้วยมือ ยี่ห้อ HUDSON X-PERT SPRAYER', 'HUDSON X-PERT SPRAYER', '0334 0418 0091', 'available', NULL),
        ('เครื่องพ่นสารเคมีชนิดอัดลมด้วยมือ ยี่ห้อ HUDSON X-PERT SPRAYER', 'HUDSON X-PERT SPRAYER', '0334 0418 0092', 'available', NULL),
        ('เครื่องพ่นสารเคมีชนิดอัดลมด้วยมือ ยี่ห้อ HUDSON X-PERT SPRAYER', 'HUDSON X-PERT SPRAYER', '0334 0418 0093', 'available', NULL),
        ('เครื่องพ่นสารเคมีชนิดอัดลมด้วยมือ ยี่ห้อ HUDSON X-PERT SPRAYER', 'HUDSON X-PERT SPRAYER', '0334 0461 01160 0106', 'available', NULL),
        ('เครื่องพ่นสารเคมีชนิดอัดลมด้วยมือ ยี่ห้อ HUDSON X-PERT SPRAYER', 'HUDSON X-PERT SPRAYER', '0334 0461 01160 0107', 'available', NULL),
        ('เครื่องพ่นสารเคมีชนิดอัดลมด้วยมือ ยี่ห้อ HUDSON X-PERT SPRAYER', 'HUDSON X-PERT SPRAYER', '0334 0461 01160 0108', 'available', NULL),
        ('เครื่องพ่นเคมีชนิดอัดลม IK VECTOR CONTROL SUPER', 'IK VECTOR CONTROL SUPER', 'สคร.0334 0429 0863 0124', 'available', NULL),
        ('เครื่องพ่นเคมีชนิดอัดลม IK VECTOR CONTROL SUPER', 'IK VECTOR CONTROL SUPER', 'สคร.0334 0429 0863 0125', 'available', NULL),
        ('เครื่องพ่นเคมีชนิดอัดลม IK VECTOR CONTROL SUPER', 'IK VECTOR CONTROL SUPER', 'สคร.0334 0429 0863 0126', 'available', NULL),
        ('เครื่องพ่นเคมีชนิดอัดลม IK VECTOR CONTROL SUPER', 'IK VECTOR CONTROL SUPER', 'สคร.0334 0429 0863 0127', 'available', NULL),
        ('เครื่องพ่นเคมีชนิดอัดลม IK VECTOR CONTROL SUPER', 'IK VECTOR CONTROL SUPER', 'สคร.0334 0429 0465 0140', 'available', NULL),
        ('เครื่องพ่นเคมีชนิดอัดลม IK VECTOR CONTROL SUPER', 'IK VECTOR CONTROL SUPER', 'สคร.0334 0429 0465 0141', 'available', NULL),
        ('เครื่องพ่นเคมีชนิดอัดลม IK VECTOR CONTROL SUPER', 'IK VECTOR CONTROL SUPER', 'สคร.0334 0429 0465 0142', 'available', NULL),
        ('เครื่องพ่นเคมีชนิดอัดลม IK VECTOR CONTROL SUPER', 'IK VECTOR CONTROL SUPER', 'สคร.0334 0429 0465 0143', 'available', NULL),
        ('เครื่องพ่นเคมีชนิดอัดลม IK VECTOR CONTROL SUPER', 'IK VECTOR CONTROL SUPER', 'สคร.0334 0429 0465 0144', 'available', NULL),
        ('เครื่องพ่นชนิดอัดลม ยี่ห้อ Micron รุ่น CS-10', 'Micron CS-10', '51 6640 007 00005 (67)', 'available', NULL),
        ('เครื่องพ่นหมอกควัน ยี่ห้อ SWING FOG SN 11 P เลขเครื่อง 8551', 'SWING FOG SN 11 P', '0332 048 0001 / 8551', 'available', NULL),
        ('เครื่องพ่นหมอกควัน ยี่ห้อ SWING FOG SN 50 เลขเครื่อง 8666', 'SWING FOG SN 50', '0332 048 0001 / 8666', 'available', NULL),
        ('เครื่องพ่นฝอยละเอียด ไอจีบ้า พอร์ที 123 ยูแอลวี เลขเครื่อง NR070542604', 'IGEBA Port 123 ULV', '0332 012.4 0010 / NR070542604', 'available', NULL),
        ('เครื่องพ่นฝอยละเอียด ไอจีบ้า พอร์ที 123 ยูแอลวี เลขเครื่อง NR070545004', 'IGEBA Port 123 ULV', '0332 012.4 0011 / NR070545004', 'available', NULL),
        ('เครื่องพ่นหมอกควัน SWING FOG SN50', 'SWING FOG SN 50', '0332 012.4 0012', 'available', NULL),
        ('เครื่องพ่นฝอยละอองแบบติดรถยนต์ ULV ยี่ห้อ อีเก้า 1800 E', 'ULV 1800 E', '0332 00418 00049', 'available', NULL),
        ('เครื่องพ่นละอองฝอย ยี่ห้อ twister xl by Dynafog เลขเครื่อง TL 060545', 'Twister XL by Dynafog', '0332 0418 0098 / TL 060545', 'available', NULL),
        ('เครื่องพ่นละอองฝอยยี่ห้อ Swingtec Serial No.154710', 'Swingtec', 'สคร.0332 0418 0105 / 154710', 'available', NULL),
        ('เครื่องพ่นละอองฝอยยี่ห้อ Swingtec Serial No.154714', 'Swingtec', 'สคร.0332 0418 0104 / 154714', 'available', NULL),
        ('เครื่องพ่นเคมีชนิดฝอยละออง (ULV) สะพายหลังยี่ห้อ FONTAN รุ่น PORTASTARs', 'FONTAN PORTASTARs', 'สคร.0332 0418 0121', 'available', NULL),
        ('เครื่องพ่นเคมีชนิดฝอยละออง (ULV) สะพายหลังยี่ห้อ FONTAN รุ่น PORTASTARs', 'FONTAN PORTASTARs', 'สคร.0332 0418 0122', 'available', NULL),
        ('เครื่องพ่นเคมีชนิดฝอยละออง (ULV) สะพายหลังยี่ห้อ FONTAN รุ่น PORTASTARs', 'FONTAN PORTASTARs', 'สคร.0332 0418 0126', 'available', NULL),
        ('เครื่องพ่นเคมีชนิดฝอยละออง (ULV) สะพายหลังยี่ห้อ FONTAN รุ่น PORTASTARs', 'FONTAN PORTASTARs', 'สคร.0332 0418 0127', 'available', NULL),
        ('เครื่องพ่นเคมีชนิดฝอยละออง (ULV) ยี่ห้อ Misuko รุ่น 3WF-3A', 'Misuko 3WF-3A', '0334 0461 1260', 'available', NULL),
        ('เครื่องพ่นเคมี ULV สะพายหลังยี่ห้อ Swingtac Serial No 164841', 'Swingtac ULV', '0332 0461 11600124 / 164841', 'available', NULL)
) AS seed(name, type, serial, status, image_url)
WHERE NOT EXISTS (
    SELECT 1
    FROM public.equipment existing
    WHERE existing.serial = seed.serial
);

-- ============================================================
-- DONE! ขั้นตอนถัดไป:
-- ============================================================
--
-- ขั้นตอนที่ 1: (เสร็จแล้ว) รัน SQL นี้ใน SQL Editor
--
-- ขั้นตอนที่ 2: ไป Authentication > Users > Add user > Create new user
--   สร้างบัญชีทดสอบ 4 บัญชีนี้:
--
--   | Role       | Email               | Password     |
--   |------------|---------------------|--------------|
--   | Admin      | admin@test.com      | Admin1234    |
--   | Approver   | approver@test.com   | Approver1234 |
--   | Technician | tech@test.com       | Tech1234     |
--   | User       | user@test.com       | User1234     |
--
--   (เลือก "Auto Confirm User" ด้วย)
--
-- ขั้นตอนที่ 3: กลับมา SQL Editor รันคำสั่งนี้เพื่อตั้ง roles:
--
--   UPDATE public.profiles SET role = 'admin'      WHERE email = 'admin@test.com';
--   UPDATE public.profiles SET role = 'approver'   WHERE email = 'approver@test.com';
--   UPDATE public.profiles SET role = 'technician' WHERE email = 'tech@test.com';
--   UPDATE public.profiles SET role = 'user'       WHERE email = 'user@test.com';
--
-- ขั้นตอนที่ 4: ไป Storage > New bucket > ชื่อ "equipment-images" > เปิด Public
--
-- ============================================================

