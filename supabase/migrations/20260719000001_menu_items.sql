CREATE TABLE "MenuItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "price" INTEGER,
    "image" TEXT,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "CafeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "MenuItem_CafeId_idx" ON "MenuItem"("CafeId");

ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_CafeId_fkey"
  FOREIGN KEY ("CafeId") REFERENCES "Cafe"("id") ON DELETE CASCADE ON UPDATE CASCADE;