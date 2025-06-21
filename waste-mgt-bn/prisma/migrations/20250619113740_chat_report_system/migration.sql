/*
  Warnings:

  - You are about to drop the `Report` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ThreadStatus" AS ENUM ('OPEN', 'CLOSED');

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_userId_fkey";

-- DropTable
DROP TABLE "Report";

-- DropEnum
DROP TYPE "ReportStatus";

-- CreateTable
CREATE TABLE "ReportThread" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "status" "ThreadStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportMessage" (
    "id" SERIAL NOT NULL,
    "threadId" INTEGER NOT NULL,
    "senderId" INTEGER NOT NULL,
    "senderRole" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportMessage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ReportThread" ADD CONSTRAINT "ReportThread_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportMessage" ADD CONSTRAINT "ReportMessage_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "ReportThread"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
