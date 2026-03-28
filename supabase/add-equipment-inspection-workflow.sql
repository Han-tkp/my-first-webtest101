ALTER TABLE public.borrows
    ADD COLUMN IF NOT EXISTS pre_delivery_checklist JSONB,
    ADD COLUMN IF NOT EXISTS pre_delivery_checked_at DATE,
    ADD COLUMN IF NOT EXISTS pre_delivery_checked_by TEXT,
    ADD COLUMN IF NOT EXISTS post_return_checklist JSONB,
    ADD COLUMN IF NOT EXISTS post_return_checked_at DATE,
    ADD COLUMN IF NOT EXISTS post_return_checked_by TEXT;

ALTER TABLE public.repairs
    ADD COLUMN IF NOT EXISTS repair_location TEXT,
    ADD COLUMN IF NOT EXISTS repair_items JSONB,
    ADD COLUMN IF NOT EXISTS repair_recommendation TEXT,
    ADD COLUMN IF NOT EXISTS repairer_name TEXT,
    ADD COLUMN IF NOT EXISTS receiver_name TEXT,
    ADD COLUMN IF NOT EXISTS repair_notes TEXT;
