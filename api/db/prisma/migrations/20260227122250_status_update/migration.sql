-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PLACED', 'PENDING', 'COMPLETED', 'CANCELED');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'PLACED';
