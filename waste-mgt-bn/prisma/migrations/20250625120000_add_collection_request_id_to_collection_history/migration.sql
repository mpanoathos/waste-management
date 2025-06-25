-- AlterTable
ALTER TABLE "CollectionHistory" ADD COLUMN "collectionRequestId" INTEGER;
ALTER TABLE "CollectionHistory" ADD CONSTRAINT "CollectionHistory_collectionRequestId_fkey" FOREIGN KEY ("collectionRequestId") REFERENCES "CollectionRequest"(id) ON DELETE SET NULL ON UPDATE CASCADE; 