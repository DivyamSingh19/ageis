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
CREATE UNIQUE INDEX "keys_public_key_key" ON "keys"("public_key");

-- CreateIndex
CREATE UNIQUE INDEX "keys_user_id_key" ON "keys"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "farmer_keys_public_key_key" ON "farmer_keys"("public_key");

-- CreateIndex
CREATE UNIQUE INDEX "farmer_keys_farmer_id_key" ON "farmer_keys"("farmer_id");

-- AddForeignKey
ALTER TABLE "keys" ADD CONSTRAINT "keys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farmer_keys" ADD CONSTRAINT "farmer_keys_farmer_id_fkey" FOREIGN KEY ("farmer_id") REFERENCES "Farmer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
