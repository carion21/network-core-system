/*
  Warnings:

  - You are about to drop the column `nodeParentId` on the `Node` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Individual" ADD COLUMN     "replacedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Node" DROP COLUMN "nodeParentId",
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "NodeConnection" (
    "id" SERIAL NOT NULL,
    "parentNodeId" INTEGER NOT NULL,
    "childNodeId" INTEGER NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NodeConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SelectValue" (
    "id" SERIAL NOT NULL,
    "value" VARCHAR(255) NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SelectValue_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "NodeConnection" ADD CONSTRAINT "NodeConnection_parentNodeId_fkey" FOREIGN KEY ("parentNodeId") REFERENCES "Node"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NodeConnection" ADD CONSTRAINT "NodeConnection_childNodeId_fkey" FOREIGN KEY ("childNodeId") REFERENCES "Node"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
