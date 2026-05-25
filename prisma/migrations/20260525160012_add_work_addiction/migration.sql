-- AlterEnum
ALTER TYPE "Addiction" ADD VALUE 'work';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Trigger" ADD VALUE 'overworking';
ALTER TYPE "Trigger" ADD VALUE 'fear_of_failure';
ALTER TYPE "Trigger" ADD VALUE 'need_for_control';
ALTER TYPE "Trigger" ADD VALUE 'perfectionism';

-- AlterTable
ALTER TABLE "addiction_trackers" ALTER COLUMN "updated_at" DROP DEFAULT;
