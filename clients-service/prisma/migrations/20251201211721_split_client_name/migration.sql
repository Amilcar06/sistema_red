/*
  Warnings:

  - Added the required column `paterno` to the `clientes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "clientes" ADD COLUMN     "materno" TEXT,
ADD COLUMN     "paterno" TEXT NOT NULL;
