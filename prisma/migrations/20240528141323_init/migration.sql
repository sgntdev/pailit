-- CreateTable
CREATE TABLE "AssetSelling" (
    "id" SERIAL NOT NULL,
    "debitorId" INTEGER NOT NULL,
    "sellingPrice" TEXT NOT NULL,

    CONSTRAINT "AssetSelling_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AssetSelling" ADD CONSTRAINT "AssetSelling_debitorId_fkey" FOREIGN KEY ("debitorId") REFERENCES "Debitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
