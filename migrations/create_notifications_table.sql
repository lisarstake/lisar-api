-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'general',
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Create index on is_read for filtering unread notifications
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- Create composite index for common query pattern (user_id + is_read)
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();

-- Disable Row Level Security (RLS) for now to allow background jobs to insert
-- TODO: Enable RLS in production with proper service role configuration
-- ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Add comments for documentation
COMMENT ON TABLE public.notifications IS 'Stores user notifications including reward notifications from background jobs';
COMMENT ON COLUMN public.notifications.user_id IS 'Reference to the user who receives this notification';
COMMENT ON COLUMN public.notifications.title IS 'Short title of the notification';
COMMENT ON COLUMN public.notifications.message IS 'Full notification message';
COMMENT ON COLUMN public.notifications.type IS 'Type of notification (reward, system, alert, etc.)';
COMMENT ON COLUMN public.notifications.is_read IS 'Whether the user has read this notification';
COMMENT ON COLUMN public.notifications.read_at IS 'Timestamp when notification was marked as read';
COMMENT ON COLUMN public.notifications.metadata IS 'Additional data in JSON format (e.g., reward amount, period, etc.)';
