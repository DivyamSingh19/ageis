/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `Products` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Products" ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "Products_id_key" ON "Products"("id");
