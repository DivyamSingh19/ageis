/*
  Warnings:

  - You are about to drop the column `address_line_1` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `address_line_2` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the column `address_line_3` on the `UserProfile` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[orderId]` on the table `Delivery` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[agentId]` on the table `Delivery` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[agentId]` on the table `DeliveryAgentProfile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `agentId` to the `Delivery` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderId` to the `Delivery` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `DeliveryAgent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `DeliveryAgent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `agentId` to the `DeliveryAgentProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneNumber` to the `DeliveryAgentProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `DeliveryAgentProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `addressLine01` to the `UserProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `addressLine02` to the `UserProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneNumber` to the `UserProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `postalCode` to the `UserProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Delivery" ADD COLUMN     "agentId" TEXT NOT NULL,
ADD COLUMN     "orderId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "DeliveryAgent" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "DeliveryAgentProfile" ADD COLUMN     "agentId" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "orderCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "phoneNumber" TEXT NOT NULL,
ADD COLUMN     "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "UserProfile" DROP COLUMN "address_line_1",
DROP COLUMN "address_line_2",
DROP COLUMN "address_line_3",
ADD COLUMN     "addressLine01" TEXT NOT NULL,
ADD COLUMN     "addressLine02" TEXT NOT NULL,
ADD COLUMN     "phoneNumber" TEXT NOT NULL,
ADD COLUMN     "postalCode" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Delivery_orderId_key" ON "Delivery"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Delivery_agentId_key" ON "Delivery"("agentId");

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryAgentProfile_agentId_key" ON "DeliveryAgentProfile"("agentId");

-- AddForeignKey
ALTER TABLE "DeliveryAgentProfile" ADD CONSTRAINT "DeliveryAgentProfile_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "DeliveryAgent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
