/*
  Warnings:

  - Added the required column `status` to the `Reference` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Reference" ADD COLUMN     "status" TEXT NOT NULL;
