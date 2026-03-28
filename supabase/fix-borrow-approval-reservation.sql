BEGIN;

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

COMMIT;
