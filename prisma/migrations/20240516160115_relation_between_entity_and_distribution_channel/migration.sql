/*
  Warnings:

  - Added the required column `entityId` to the `DistributionChannel` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DistributionChannel" ADD COLUMN     "entityId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "DistributionChannel" ADD CONSTRAINT "DistributionChannel_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Entity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
