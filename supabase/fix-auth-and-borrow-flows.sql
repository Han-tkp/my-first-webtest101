-- Apply this to an existing database that already ran supabase/migration.sql

BEGIN;

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

DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
CREATE POLICY "profiles_select_all"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (
        auth.uid() = id
        OR public.current_user_role() IN ('admin', 'approver')
    );

DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
CREATE POLICY "profiles_update_admin"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (public.current_user_role() IN ('admin', 'approver'));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, agency, phone, address, role, status)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'agency', ''),
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        COALESCE(NEW.raw_user_meta_data->>'address', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
        COALESCE(NEW.raw_user_meta_data->>'status', 'pending_approval')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

CREATE OR REPLACE FUNCTION public.reserve_borrow_equipment()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.equipment
    SET status = 'reserved'
    WHERE id = ANY(NEW.equipment_ids);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS reserve_borrow_equipment ON public.borrows;
CREATE TRIGGER reserve_borrow_equipment
    AFTER INSERT ON public.borrows
    FOR EACH ROW EXECUTE FUNCTION public.reserve_borrow_equipment();

COMMIT;
