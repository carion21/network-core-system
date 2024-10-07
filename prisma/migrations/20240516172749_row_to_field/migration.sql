/*
  Warnings:

  - You are about to drop the `DataRow` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DataRowType` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `nodeId` to the `Individual` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "DataRow" DROP CONSTRAINT "DataRow_dataRowTypeId_fkey";

-- DropForeignKey
ALTER TABLE "DataRow" DROP CONSTRAINT "DataRow_individualId_fkey";

-- AlterTable
ALTER TABLE "Individual" ADD COLUMN     "nodeId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "DataRow";

-- DropTable
DROP TABLE "DataRowType";

-- CreateTable
CREATE TABLE "DataFieldType" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(255) NOT NULL,
    "label" VARCHAR(255) NOT NULL,
    "value" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DataFieldType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataField" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(255) NOT NULL,
    "label" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "optionnal" BOOLEAN NOT NULL DEFAULT false,
    "defaultValue" TEXT,
    "exampleValue" TEXT,
    "individualId" INTEGER NOT NULL,
    "dataRowTypeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DataField_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Individual" ADD CONSTRAINT "Individual_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "Node"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataField" ADD CONSTRAINT "DataField_individualId_fkey" FOREIGN KEY ("individualId") REFERENCES "Individual"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataField" ADD CONSTRAINT "DataField_dataRowTypeId_fkey" FOREIGN KEY ("dataRowTypeId") REFERENCES "DataFieldType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
