-- DropForeignKey
ALTER TABLE "Alert" DROP CONSTRAINT "Alert_companyId_fkey";

-- AlterTable
ALTER TABLE "Alert" ALTER COLUMN "companyId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
