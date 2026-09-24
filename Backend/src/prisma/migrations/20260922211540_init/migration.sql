-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "origin" CHAR(3) NOT NULL,
    "destination" CHAR(3) NOT NULL,
    "cabinClass" TEXT NOT NULL,
    "duffelOfferId" TEXT NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'USD',
    "takeoffTime" TIMESTAMPTZ NOT NULL,
    "arrivalTime" TIMESTAMPTZ NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "passengers" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "age" INTEGER,
    "position" INTEGER NOT NULL,

    CONSTRAINT "passengers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bookings_email_idx" ON "bookings"("email");

-- CreateIndex
CREATE INDEX "passengers_bookingId_idx" ON "passengers"("bookingId");

-- AddForeignKey
ALTER TABLE "passengers" ADD CONSTRAINT "passengers_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
