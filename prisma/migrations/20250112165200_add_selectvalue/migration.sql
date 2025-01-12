/*
  Warnings:

  - Added the required column `dataFieldId` to the `SelectValue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DataField" ADD COLUMN     "selectValues" TEXT;

-- AlterTable
ALTER TABLE "SelectValue" ADD COLUMN     "dataFieldId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "SelectValue" ADD CONSTRAINT "SelectValue_dataFieldId_fkey" FOREIGN KEY ("dataFieldId") REFERENCES "DataField"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
