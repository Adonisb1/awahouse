-- AlterTable
ALTER TABLE "escrow_transactions" ADD COLUMN     "payout_reference" TEXT,
ADD COLUMN     "payout_transfer_code" TEXT;
