/*
  Warnings:

  - You are about to drop the column `farnerId` on the `Products` table. All the data in the column will be lost.
  - Added the required column `farmerId` to the `Products` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Products" DROP CONSTRAINT "Products_farnerId_fkey";

-- AlterTable
ALTER TABLE "Products" DROP COLUMN "farnerId",
ADD COLUMN     "category" TEXT,
ADD COLUMN     "farmLocation" TEXT,
ADD COLUMN     "farmerId" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "pinataImageUrl" TEXT[],
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "Products_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
