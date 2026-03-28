BEGIN;

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

ALTER TABLE public.notification_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_rate_limits ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS set_notification_deliveries_updated_at ON public.notification_deliveries;
CREATE TRIGGER set_notification_deliveries_updated_at
    BEFORE UPDATE ON public.notification_deliveries
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_request_rate_limits_updated_at ON public.request_rate_limits;
CREATE TRIGGER set_request_rate_limits_updated_at
    BEFORE UPDATE ON public.request_rate_limits
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_notifications_user_created_at
    ON public.notifications(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_unread
    ON public.notifications(user_id, is_read);

CREATE INDEX IF NOT EXISTS idx_notification_deliveries_notification_id
    ON public.notification_deliveries(notification_id);

CREATE INDEX IF NOT EXISTS idx_notification_deliveries_status
    ON public.notification_deliveries(channel, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_request_rate_limits_action
    ON public.request_rate_limits(action, updated_at DESC);

COMMIT;
