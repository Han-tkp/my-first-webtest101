BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.profiles
    ALTER COLUMN id SET DEFAULT gen_random_uuid();

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE table_schema = 'public'
          AND table_name = 'profiles'
          AND constraint_name = 'profiles_id_fkey'
    ) THEN
        ALTER TABLE public.profiles DROP CONSTRAINT profiles_id_fkey;
    END IF;
END $$;

ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS password_hash TEXT,
    ADD COLUMN IF NOT EXISTS auth_provider TEXT NOT NULL DEFAULT 'credentials',
    ADD COLUMN IF NOT EXISTS google_id TEXT,
    ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'profiles_auth_provider_check'
    ) THEN
        ALTER TABLE public.profiles
            ADD CONSTRAINT profiles_auth_provider_check
            CHECK (auth_provider IN ('credentials', 'google', 'legacy_supabase'));
    END IF;
END $$;

UPDATE public.profiles
SET auth_provider = COALESCE(NULLIF(auth_provider, ''), 'credentials')
WHERE auth_provider IS NULL OR auth_provider = '';

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email_unique ON public.profiles (lower(email));
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_google_id_unique ON public.profiles(google_id) WHERE google_id IS NOT NULL;

COMMIT;
