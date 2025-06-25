-- DropForeignKey
ALTER TABLE "Bin" DROP CONSTRAINT "Bin_userId_fkey";

-- DropForeignKey
ALTER TABLE "ChatMessage" DROP CONSTRAINT "ChatMessage_userId_fkey";

-- DropForeignKey
ALTER TABLE "CollectionHistory" DROP CONSTRAINT "CollectionHistory_binId_fkey";

-- DropForeignKey
ALTER TABLE "CollectionHistory" DROP CONSTRAINT "CollectionHistory_collectedById_fkey";

-- DropForeignKey
ALTER TABLE "CollectionRequest" DROP CONSTRAINT "CollectionRequest_binId_fkey";

-- DropForeignKey
ALTER TABLE "CollectionRequest" DROP CONSTRAINT "CollectionRequest_userId_fkey";

-- DropForeignKey
ALTER TABLE "ReportThread" DROP CONSTRAINT "ReportThread_userId_fkey";

-- DropForeignKey
ALTER TABLE "Route" DROP CONSTRAINT "Route_companyId_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_userId_fkey";

-- AddForeignKey
ALTER TABLE "Bin" ADD CONSTRAINT "Bin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionHistory" ADD CONSTRAINT "CollectionHistory_binId_fkey" FOREIGN KEY ("binId") REFERENCES "Bin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionHistory" ADD CONSTRAINT "CollectionHistory_collectedById_fkey" FOREIGN KEY ("collectedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionRequest" ADD CONSTRAINT "CollectionRequest_binId_fkey" FOREIGN KEY ("binId") REFERENCES "Bin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionRequest" ADD CONSTRAINT "CollectionRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportThread" ADD CONSTRAINT "ReportThread_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
