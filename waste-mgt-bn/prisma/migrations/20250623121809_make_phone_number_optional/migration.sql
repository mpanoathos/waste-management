/*
  Warnings:

  - You are about to drop the column `providerReference` on the `payments` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "payments_providerReference_key";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "address" TEXT;

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "providerReference",
ADD COLUMN     "phoneNumber" TEXT;
