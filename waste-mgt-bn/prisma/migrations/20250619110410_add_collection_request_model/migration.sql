/*
  Warnings:

  - You are about to drop the column `type` on the `Bin` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'COMPLETED', 'REJECTED');

-- AlterTable
ALTER TABLE "Bin" DROP COLUMN "type";

-- CreateTable
CREATE TABLE "CollectionRequest" (
    "id" SERIAL NOT NULL,
    "binId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CollectionRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CollectionRequest" ADD CONSTRAINT "CollectionRequest_binId_fkey" FOREIGN KEY ("binId") REFERENCES "Bin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionRequest" ADD CONSTRAINT "CollectionRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
