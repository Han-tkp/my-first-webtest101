-- 006_line_notify.sql

-- Add line_user_id to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS line_user_id TEXT UNIQUE;

-- Create table for LINE link tokens
CREATE TABLE IF NOT EXISTS public.line_link_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '10 minutes')
);

-- Enable RLS
ALTER TABLE public.line_link_tokens ENABLE CONTROL;
ALTER TABLE public.line_link_tokens ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for line_link_tokens
CREATE POLICY "Users can manage their own link tokens"
    ON public.line_link_tokens
    FOR ALL
    USING (auth.uid() = user_id);

-- Add index
CREATE INDEX IF NOT EXISTS idx_line_link_tokens_token ON public.line_link_tokens(token);
CREATE INDEX IF NOT EXISTS idx_line_link_tokens_user_id ON public.line_link_tokens(user_id);
