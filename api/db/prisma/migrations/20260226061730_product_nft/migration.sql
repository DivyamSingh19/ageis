-- CreateTable
CREATE TABLE "ProductNFT" (
    "id" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductNFT_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductNFT_tokenId_key" ON "ProductNFT"("tokenId");

-- CreateIndex
CREATE INDEX "ProductNFT_id_idx" ON "ProductNFT"("id");

-- AddForeignKey
ALTER TABLE "ProductNFT" ADD CONSTRAINT "ProductNFT_id_fkey" FOREIGN KEY ("id") REFERENCES "Products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
