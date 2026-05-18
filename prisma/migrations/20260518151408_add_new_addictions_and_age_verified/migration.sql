-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Addiction" ADD VALUE 'pornography';
ALTER TYPE "Addiction" ADD VALUE 'gaming';
ALTER TYPE "Addiction" ADD VALUE 'social_media';
ALTER TYPE "Addiction" ADD VALUE 'shopping';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "age_verified" BOOLEAN NOT NULL DEFAULT false;
