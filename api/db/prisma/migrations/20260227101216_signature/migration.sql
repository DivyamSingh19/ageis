-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('Initialized', 'Intransit', 'OutForDelivery', 'Delivered');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "onboardingComplete" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Farmer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "onboardingComplete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Farmer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bio" TEXT,
    "addressLine01" TEXT NOT NULL,
    "addressLine02" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FarmerProfile" (
    "id" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "bio" TEXT,
    "location" TEXT NOT NULL,
    "trustScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FarmerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "productionDate" TIMESTAMP(3) NOT NULL,
    "pinataImageUrl" TEXT[],
    "category" TEXT,
    "farmLocation" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "farmerId" TEXT NOT NULL,

    CONSTRAINT "Products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductNFT" (
    "id" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "signature" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductNFT_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderNFC" (
    "id" TEXT NOT NULL,
    "nfcId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderNFC_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderNFT" (
    "id" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderNFT_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Delivery" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "status" "DeliveryStatus" NOT NULL DEFAULT 'Initialized',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Delivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "keys" (
    "key_id" TEXT NOT NULL,
    "public_key" TEXT NOT NULL,
    "encrypted_private_key" TEXT NOT NULL,
    "meta" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "keys_pkey" PRIMARY KEY ("key_id")
);

-- CreateTable
CREATE TABLE "farmer_keys" (
    "key_id" TEXT NOT NULL,
    "public_key" TEXT NOT NULL,
    "encrypted_private_key" TEXT NOT NULL,
    "meta" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "farmer_id" TEXT NOT NULL,

    CONSTRAINT "farmer_keys_pkey" PRIMARY KEY ("key_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Farmer_email_key" ON "Farmer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FarmerProfile_farmerId_key" ON "FarmerProfile"("farmerId");

-- CreateIndex
CREATE UNIQUE INDEX "Products_id_key" ON "Products"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ProductNFT_tokenId_key" ON "ProductNFT"("tokenId");

-- CreateIndex
CREATE INDEX "ProductNFT_id_idx" ON "ProductNFT"("id");

-- CreateIndex
CREATE UNIQUE INDEX "OrderNFC_nfcId_key" ON "OrderNFC"("nfcId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderNFT_tokenId_key" ON "OrderNFT"("tokenId");

-- CreateIndex
CREATE INDEX "OrderNFT_id_idx" ON "OrderNFT"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Delivery_orderId_key" ON "Delivery"("orderId");

-- CreateIndex
CREATE INDEX "Delivery_id_idx" ON "Delivery"("id");

-- CreateIndex
CREATE UNIQUE INDEX "keys_public_key_key" ON "keys"("public_key");

-- CreateIndex
CREATE UNIQUE INDEX "keys_user_id_key" ON "keys"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "farmer_keys_public_key_key" ON "farmer_keys"("public_key");

-- CreateIndex
CREATE UNIQUE INDEX "farmer_keys_farmer_id_key" ON "farmer_keys"("farmer_id");

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmerProfile" ADD CONSTRAINT "FarmerProfile_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "Products_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductNFT" ADD CONSTRAINT "ProductNFT_id_fkey" FOREIGN KEY ("id") REFERENCES "Products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderNFC" ADD CONSTRAINT "OrderNFC_id_fkey" FOREIGN KEY ("id") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderNFT" ADD CONSTRAINT "OrderNFT_id_fkey" FOREIGN KEY ("id") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "keys" ADD CONSTRAINT "keys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farmer_keys" ADD CONSTRAINT "farmer_keys_farmer_id_fkey" FOREIGN KEY ("farmer_id") REFERENCES "Farmer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
