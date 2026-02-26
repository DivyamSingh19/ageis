/*
  Warnings:

  - You are about to drop the column `agentId` on the `Delivery` table. All the data in the column will be lost.
  - You are about to drop the `Admin` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DeliveryAgent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DeliveryAgentProfile` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DeliveryAgentProfile" DROP CONSTRAINT "DeliveryAgentProfile_agentId_fkey";

-- DropIndex
DROP INDEX "Delivery_agentId_key";

-- AlterTable
ALTER TABLE "Delivery" DROP COLUMN "agentId";

-- DropTable
DROP TABLE "Admin";

-- DropTable
DROP TABLE "DeliveryAgent";

-- DropTable
DROP TABLE "DeliveryAgentProfile";
