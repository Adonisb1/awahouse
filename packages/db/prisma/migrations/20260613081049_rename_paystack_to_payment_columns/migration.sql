/*
  Warnings:

  - You are about to drop the column `paystack_access_code` on the `escrow_transactions` table. All the data in the column will be lost.
  - You are about to drop the column `paystack_reference` on the `escrow_transactions` table. All the data in the column will be lost.
  - You are about to drop the column `paystack_reference` on the `rent_instalments` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('monnify', 'paystack');

-- DropIndex
DROP INDEX "escrow_transactions_paystack_reference_idx";

-- AlterTable
ALTER TABLE "escrow_transactions" DROP COLUMN "paystack_access_code",
DROP COLUMN "paystack_reference",
ADD COLUMN     "payment_access_code" TEXT,
ADD COLUMN     "payment_provider" "PaymentProvider" NOT NULL DEFAULT 'monnify',
ADD COLUMN     "payment_reference" TEXT;

-- AlterTable
ALTER TABLE "rent_instalments" DROP COLUMN "paystack_reference",
ADD COLUMN     "payment_reference" TEXT;

-- CreateIndex
CREATE INDEX "escrow_transactions_payment_reference_idx" ON "escrow_transactions"("payment_reference");
