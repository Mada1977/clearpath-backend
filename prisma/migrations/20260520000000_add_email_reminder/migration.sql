-- Add email_reminder_enabled opt-in flag to users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_reminder_enabled" BOOLEAN NOT NULL DEFAULT false;
