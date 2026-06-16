-- DropForeignKey
ALTER TABLE "escrow_transactions" DROP CONSTRAINT "escrow_transactions_agent_id_fkey";

-- DropForeignKey
ALTER TABLE "escrow_transactions" DROP CONSTRAINT "escrow_transactions_landlord_id_fkey";

-- DropForeignKey
ALTER TABLE "escrow_transactions" DROP CONSTRAINT "escrow_transactions_property_id_fkey";

-- DropForeignKey
ALTER TABLE "escrow_transactions" DROP CONSTRAINT "escrow_transactions_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "landlord_profiles" DROP CONSTRAINT "landlord_profiles_user_id_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_user_id_fkey";

-- DropForeignKey
ALTER TABLE "properties" DROP CONSTRAINT "properties_owner_id_fkey";

-- DropForeignKey
ALTER TABLE "property_images" DROP CONSTRAINT "property_images_property_id_fkey";

-- DropForeignKey
ALTER TABLE "rent_instalments" DROP CONSTRAINT "rent_instalments_escrow_id_fkey";

-- DropForeignKey
ALTER TABLE "rent_instalments" DROP CONSTRAINT "rent_instalments_user_id_fkey";

-- DropForeignKey
ALTER TABLE "rent_score_events" DROP CONSTRAINT "rent_score_events_escrow_id_fkey";

-- DropForeignKey
ALTER TABLE "rent_score_events" DROP CONSTRAINT "rent_score_events_user_id_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_escrow_id_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_property_id_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_reviewee_id_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_reviewer_id_fkey";

-- DropForeignKey
ALTER TABLE "saved_properties" DROP CONSTRAINT "saved_properties_property_id_fkey";

-- DropForeignKey
ALTER TABLE "saved_properties" DROP CONSTRAINT "saved_properties_user_id_fkey";

-- DropForeignKey
ALTER TABLE "transaction_logs" DROP CONSTRAINT "transaction_logs_actor_id_fkey";

-- DropForeignKey
ALTER TABLE "transaction_logs" DROP CONSTRAINT "transaction_logs_escrow_id_fkey";

-- DropForeignKey
ALTER TABLE "verifications" DROP CONSTRAINT "verifications_user_id_fkey";

-- DropIndex
DROP INDEX "properties_is_available_is_deleted_idx";

-- CreateIndex
CREATE INDEX "escrow_transactions_agent_id_idx" ON "escrow_transactions"("agent_id");

-- CreateIndex
CREATE INDEX "escrow_transactions_is_deleted_idx" ON "escrow_transactions"("is_deleted");

-- CreateIndex
CREATE INDEX "escrow_transactions_created_at_idx" ON "escrow_transactions"("created_at");

-- CreateIndex
CREATE INDEX "properties_owner_id_idx" ON "properties"("owner_id");

-- CreateIndex
CREATE INDEX "properties_price_kobo_idx" ON "properties"("price_kobo");

-- CreateIndex
CREATE INDEX "properties_created_at_idx" ON "properties"("created_at");

-- CreateIndex
CREATE INDEX "properties_is_available_is_deleted_verification_badge_idx" ON "properties"("is_available", "is_deleted", "verification_badge");

-- CreateIndex
CREATE INDEX "reviews_reviewer_id_idx" ON "reviews"("reviewer_id");

-- CreateIndex
CREATE INDEX "reviews_created_at_idx" ON "reviews"("created_at");

-- CreateIndex
CREATE INDEX "verifications_status_idx" ON "verifications"("status");
