/*
  Warnings:

  - Added the required column `confirmed_value` to the `measures` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_measures" (
    "measure_uuid" TEXT NOT NULL PRIMARY KEY,
    "customer_code" TEXT NOT NULL,
    "measure_datetime" DATETIME NOT NULL,
    "measure_type" TEXT NOT NULL,
    "confirmed_value" INTEGER NOT NULL,
    "has_confirmed" BOOLEAN NOT NULL,
    "image_url" TEXT NOT NULL
);
INSERT INTO "new_measures" ("customer_code", "has_confirmed", "image_url", "measure_datetime", "measure_type", "measure_uuid") SELECT "customer_code", "has_confirmed", "image_url", "measure_datetime", "measure_type", "measure_uuid" FROM "measures";
DROP TABLE "measures";
ALTER TABLE "new_measures" RENAME TO "measures";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
