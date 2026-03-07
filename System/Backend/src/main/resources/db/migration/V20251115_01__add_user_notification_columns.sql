ALTER TABLE users
    ADD COLUMN IF NOT EXISTS notify_booking_updates      boolean NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS notify_workshop_reminders   boolean NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS notify_approval_updates     boolean NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS notify_project_updates      boolean NOT NULL DEFAULT true;
