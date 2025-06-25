-- DropForeignKey
ALTER TABLE "SensorLog" DROP CONSTRAINT "SensorLog_binId_fkey";

-- AddForeignKey
ALTER TABLE "SensorLog" ADD CONSTRAINT "SensorLog_binId_fkey" FOREIGN KEY ("binId") REFERENCES "Bin"("id") ON DELETE CASCADE ON UPDATE CASCADE;
