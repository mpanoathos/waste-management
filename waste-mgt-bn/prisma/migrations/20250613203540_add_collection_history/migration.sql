-- CreateTable
CREATE TABLE "CollectionHistory" (
    "id" SERIAL NOT NULL,
    "binId" INTEGER NOT NULL,
    "collectedById" INTEGER NOT NULL,
    "collectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "CollectionHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CollectionHistory" ADD CONSTRAINT "CollectionHistory_binId_fkey" FOREIGN KEY ("binId") REFERENCES "Bin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionHistory" ADD CONSTRAINT "CollectionHistory_collectedById_fkey" FOREIGN KEY ("collectedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
