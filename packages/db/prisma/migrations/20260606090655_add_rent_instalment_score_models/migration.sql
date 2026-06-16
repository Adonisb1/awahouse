-- CreateEnum
CREATE TYPE "RentInstalmentStatus" AS ENUM ('scheduled', 'paid', 'overdue', 'missed');

-- CreateEnum
CREATE TYPE "RentScoreEventType" AS ENUM ('on_time_payment', 'late_payment', 'missed_payment', 'escrow_completed', 'dispute_raised');

-- CreateTable
CREATE TABLE "rent_instalments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "escrow_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "instalment_number" INTEGER NOT NULL,
    "amount_kobo" BIGINT NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "paid_at" TIMESTAMP(3),
    "status" "RentInstalmentStatus" NOT NULL DEFAULT 'scheduled',
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "paystack_reference" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rent_instalments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rent_score_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "event_type" "RentScoreEventType" NOT NULL,
    "delta" INTEGER NOT NULL,
    "score_after" INTEGER NOT NULL,
    "escrow_id" UUID,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rent_score_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "rent_instalments_user_id_status_idx" ON "rent_instalments"("user_id", "status");

-- CreateIndex
CREATE INDEX "rent_instalments_due_date_idx" ON "rent_instalments"("due_date");

-- CreateIndex
CREATE UNIQUE INDEX "rent_instalments_escrow_id_instalment_number_key" ON "rent_instalments"("escrow_id", "instalment_number");

-- CreateIndex
CREATE INDEX "rent_score_events_user_id_idx" ON "rent_score_events"("user_id");

-- CreateIndex
CREATE INDEX "rent_score_events_user_id_created_at_idx" ON "rent_score_events"("user_id", "created_at");

-- AddForeignKey
ALTER TABLE "rent_instalments" ADD CONSTRAINT "rent_instalments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rent_instalments" ADD CONSTRAINT "rent_instalments_escrow_id_fkey" FOREIGN KEY ("escrow_id") REFERENCES "escrow_transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rent_score_events" ADD CONSTRAINT "rent_score_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rent_score_events" ADD CONSTRAINT "rent_score_events_escrow_id_fkey" FOREIGN KEY ("escrow_id") REFERENCES "escrow_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
