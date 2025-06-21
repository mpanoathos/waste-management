-- AlterTable
ALTER TABLE "Bin" ADD COLUMN     "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "ChatMessage" ADD COLUMN     "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "CollectionRequest" ADD COLUMN     "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "priority" TEXT NOT NULL DEFAULT 'NORMAL',
ADD COLUMN     "reason" TEXT;

-- AlterTable
ALTER TABLE "ReportMessage" ADD COLUMN     "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "ReportThread" ADD COLUMN     "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "metadata" JSONB;
