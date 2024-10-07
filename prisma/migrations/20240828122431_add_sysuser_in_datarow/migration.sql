-- AlterTable
ALTER TABLE "DataRow" ADD COLUMN     "sysUserId" INTEGER;

-- AddForeignKey
ALTER TABLE "DataRow" ADD CONSTRAINT "DataRow_sysUserId_fkey" FOREIGN KEY ("sysUserId") REFERENCES "SysUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
