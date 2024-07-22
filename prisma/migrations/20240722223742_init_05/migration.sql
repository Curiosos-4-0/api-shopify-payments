/*
  Warnings:

  - Made the column `status` on table `Purshase` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Purshase" ALTER COLUMN "status" SET NOT NULL;

-- AlterTable
ALTER TABLE "Reference" ALTER COLUMN "status" SET DEFAULT 'CREATED';
