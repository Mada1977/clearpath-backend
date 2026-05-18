-- CreateEnum
CREATE TYPE "Role" AS ENUM ('self', 'friend', 'professional');

-- CreateEnum
CREATE TYPE "Stage" AS ENUM ('curious', 'cutting', 'quitting', 'recovering', 'relapsed');

-- CreateEnum
CREATE TYPE "Addiction" AS ENUM ('smoking', 'alcohol', 'drugs', 'gambling');

-- CreateEnum
CREATE TYPE "LogType" AS ENUM ('used', 'resisted', 'craving_sos');

-- CreateEnum
CREATE TYPE "Trigger" AS ENUM ('stress', 'boredom', 'social', 'emotional', 'habit', 'celebration', 'physical', 'seeing_others', 'unknown');

-- CreateEnum
CREATE TYPE "Mood" AS ENUM ('rough', 'okay', 'good', 'great');

-- CreateEnum
CREATE TYPE "Outcome" AS ENUM ('resisted', 'gave_in');

-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('user', 'assistant');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" "Role" NOT NULL DEFAULT 'self',
    "addictions" "Addiction"[],
    "stage" "Stage" NOT NULL DEFAULT 'curious',
    "daily_goal" INTEGER NOT NULL DEFAULT 10,
    "is_premium" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT NOT NULL DEFAULT 'fr-FR',
    "reset_token" TEXT,
    "reset_expiry" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "LogType" NOT NULL,
    "addiction" "Addiction" NOT NULL,
    "trigger" "Trigger" NOT NULL DEFAULT 'unknown',
    "intensity" INTEGER,
    "mood" "Mood",
    "outcome" "Outcome",
    "notes" TEXT,
    "logged_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_messages" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "crisis_flagged" BOOLEAN NOT NULL DEFAULT false,
    "tokens_used" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "logs_user_id_idx" ON "logs"("user_id");

-- CreateIndex
CREATE INDEX "logs_user_id_logged_at_idx" ON "logs"("user_id", "logged_at");

-- CreateIndex
CREATE INDEX "ai_messages_user_id_idx" ON "ai_messages"("user_id");

-- CreateIndex
CREATE INDEX "ai_messages_user_id_created_at_idx" ON "ai_messages"("user_id", "created_at");

-- AddForeignKey
ALTER TABLE "logs" ADD CONSTRAINT "logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_messages" ADD CONSTRAINT "ai_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
