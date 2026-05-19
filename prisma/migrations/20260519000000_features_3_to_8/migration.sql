-- Features 3–8: new columns on users, addiction_trackers, supporter_links

-- ── Feature 5: push notifications ───────────────────────────
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "expo_push_token" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_active_at"  TIMESTAMP(3);

-- ── Feature 8: premium / paywall ────────────────────────────
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "premium_plan"       TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "premium_expires_at" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "trial_started_at"   TIMESTAMP(3);

-- ── Feature 3: multi-addiction trackers ─────────────────────
CREATE TABLE IF NOT EXISTS "addiction_trackers" (
    "id"         TEXT NOT NULL,
    "user_id"    TEXT NOT NULL,
    "category"   "Addiction" NOT NULL,
    "name"       TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "is_active"  BOOLEAN NOT NULL DEFAULT true,
    "is_paused"  BOOLEAN NOT NULL DEFAULT false,
    "paused_at"  TIMESTAMP(3),
    "notes"      TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "addiction_trackers_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "addiction_trackers_user_id_idx" ON "addiction_trackers"("user_id");

ALTER TABLE "addiction_trackers"
    DROP CONSTRAINT IF EXISTS "addiction_trackers_user_id_fkey",
    ADD CONSTRAINT "addiction_trackers_user_id_fkey"
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ── Feature 6: supporter links ───────────────────────────────
DO $$ BEGIN
    CREATE TYPE "SupporterStatus" AS ENUM ('pending', 'active', 'revoked');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "supporter_links" (
    "id"              TEXT NOT NULL,
    "user_id"         TEXT NOT NULL,
    "supporter_email" TEXT NOT NULL,
    "invite_code"     TEXT NOT NULL,
    "status"          "SupporterStatus" NOT NULL DEFAULT 'pending',
    "share_streak"    BOOLEAN NOT NULL DEFAULT true,
    "share_mood"      BOOLEAN NOT NULL DEFAULT false,
    "created_at"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supporter_links_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "supporter_links_invite_code_key" ON "supporter_links"("invite_code");
CREATE INDEX IF NOT EXISTS "supporter_links_user_id_idx" ON "supporter_links"("user_id");

ALTER TABLE "supporter_links"
    DROP CONSTRAINT IF EXISTS "supporter_links_user_id_fkey",
    ADD CONSTRAINT "supporter_links_user_id_fkey"
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
