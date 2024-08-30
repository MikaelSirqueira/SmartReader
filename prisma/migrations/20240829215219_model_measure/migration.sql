-- CreateTable
CREATE TABLE "measures" (
    "measure_uuid" TEXT NOT NULL PRIMARY KEY,
    "measure_datetime" DATETIME NOT NULL,
    "measure_type" TEXT NOT NULL,
    "meter_reading" REAL NOT NULL,
    "image_url" TEXT NOT NULL,
    "customer_code" TEXT NOT NULL,
    "confirmed_value" INTEGER NOT NULL,
    "has_confirmed" BOOLEAN NOT NULL
);
