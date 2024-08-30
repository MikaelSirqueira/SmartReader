/*
  Warnings:

  - You are about to drop the column `confirmed_value` on the `measures` table. All the data in the column will be lost.
  - You are about to drop the column `meter_reading` on the `measures` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_measures" (
    "measure_uuid" TEXT NOT NULL PRIMARY KEY,
    "customer_code" TEXT NOT NULL,
    "measure_datetime" DATETIME NOT NULL,
    "measure_type" TEXT NOT NULL,
    "has_confirmed" BOOLEAN NOT NULL,
    "image_url" TEXT NOT NULL
);
INSERT INTO "new_measures" ("customer_code", "has_confirmed", "image_url", "measure_datetime", "measure_type", "measure_uuid") SELECT "customer_code", "has_confirmed", "image_url", "measure_datetime", "measure_type", "measure_uuid" FROM "measures";
DROP TABLE "measures";
ALTER TABLE "new_measures" RENAME TO "measures";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
