/*
  Warnings:

  - You are about to drop the column `address` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `cell` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `district` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `sector` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "address",
DROP COLUMN "cell",
DROP COLUMN "district",
DROP COLUMN "sector";

-- CreateTable
CREATE TABLE "Route" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "coordinates" JSONB NOT NULL,
    "companyId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
