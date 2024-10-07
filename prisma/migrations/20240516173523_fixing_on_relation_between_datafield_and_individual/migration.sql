/*
  Warnings:

  - You are about to drop the column `dataRowTypeId` on the `DataField` table. All the data in the column will be lost.
  - You are about to drop the column `individualId` on the `DataField` table. All the data in the column will be lost.
  - Added the required column `dataFieldTypeId` to the `DataField` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nodeTypeId` to the `DataField` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "DataField" DROP CONSTRAINT "DataField_dataRowTypeId_fkey";

-- DropForeignKey
ALTER TABLE "DataField" DROP CONSTRAINT "DataField_individualId_fkey";

-- AlterTable
ALTER TABLE "DataField" DROP COLUMN "dataRowTypeId",
DROP COLUMN "individualId",
ADD COLUMN     "dataFieldTypeId" INTEGER NOT NULL,
ADD COLUMN     "nodeTypeId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "DataRow" (
    "id" SERIAL NOT NULL,
    "dataFieldId" INTEGER NOT NULL,
    "individualId" INTEGER NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DataRow_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DataField" ADD CONSTRAINT "DataField_nodeTypeId_fkey" FOREIGN KEY ("nodeTypeId") REFERENCES "NodeType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataField" ADD CONSTRAINT "DataField_dataFieldTypeId_fkey" FOREIGN KEY ("dataFieldTypeId") REFERENCES "DataFieldType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataRow" ADD CONSTRAINT "DataRow_dataFieldId_fkey" FOREIGN KEY ("dataFieldId") REFERENCES "DataField"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataRow" ADD CONSTRAINT "DataRow_individualId_fkey" FOREIGN KEY ("individualId") REFERENCES "Individual"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
