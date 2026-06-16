-- RLS Policies for Awahouse
-- Run these against your Supabase project once provisioned.

-- ============================================================
-- Table: users
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_own" ON public.users;
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "users_update_own" ON public.users;
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "users_admin_all" ON public.users;
CREATE POLICY "users_admin_all" ON public.users
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND roles @> ARRAY['admin']::"UserRole"[])
  );

-- ============================================================
-- Table: verifications
-- ============================================================
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "verifications_select_own" ON public.verifications;
CREATE POLICY "verifications_select_own" ON public.verifications
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "verifications_insert_own" ON public.verifications;
CREATE POLICY "verifications_insert_own" ON public.verifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "verifications_update_own" ON public.verifications;
CREATE POLICY "verifications_update_own" ON public.verifications
  FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "verifications_admin_all" ON public.verifications;
CREATE POLICY "verifications_admin_all" ON public.verifications
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND roles @> ARRAY['admin']::"UserRole"[])
  );

-- ============================================================
-- Table: properties
-- ============================================================
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Public can read available, non-deleted, verified properties
DROP POLICY IF EXISTS "properties_select_public" ON public.properties;
CREATE POLICY "properties_select_public" ON public.properties
  FOR SELECT USING (
    is_available = true AND is_deleted = false AND verification_badge != 'pending'
  );

-- Owner can read/update their own properties
DROP POLICY IF EXISTS "properties_select_own" ON public.properties;
CREATE POLICY "properties_select_own" ON public.properties
  FOR SELECT USING (auth.uid() = owner_id);
DROP POLICY IF EXISTS "properties_insert_own" ON public.properties;
CREATE POLICY "properties_insert_own" ON public.properties
  FOR INSERT WITH CHECK (auth.uid() = owner_id);
DROP POLICY IF EXISTS "properties_update_own" ON public.properties;
CREATE POLICY "properties_update_own" ON public.properties
  FOR UPDATE USING (auth.uid() = owner_id);

-- Admin can do everything
DROP POLICY IF EXISTS "properties_admin_all" ON public.properties;
CREATE POLICY "properties_admin_all" ON public.properties
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND roles @> ARRAY['admin']::"UserRole"[])
  );

-- ============================================================
-- Table: property_images
-- ============================================================
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;

-- Public can read images of visible properties
DROP POLICY IF EXISTS "property_images_select_public" ON public.property_images;
CREATE POLICY "property_images_select_public" ON public.property_images
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_id AND p.is_available = true AND p.is_deleted = false)
  );

-- Owner can manage images
DROP POLICY IF EXISTS "property_images_owner" ON public.property_images;
CREATE POLICY "property_images_owner" ON public.property_images
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_id AND p.owner_id = auth.uid())
  );

-- ============================================================
-- Table: saved_properties
-- ============================================================
ALTER TABLE public.saved_properties ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "saved_properties_select_own" ON public.saved_properties;
CREATE POLICY "saved_properties_select_own" ON public.saved_properties
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "saved_properties_insert_own" ON public.saved_properties;
CREATE POLICY "saved_properties_insert_own" ON public.saved_properties
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "saved_properties_delete_own" ON public.saved_properties;
CREATE POLICY "saved_properties_delete_own" ON public.saved_properties
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- Table: reviews
-- ============================================================
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Public can read published reviews
DROP POLICY IF EXISTS "reviews_select_public" ON public.reviews;
CREATE POLICY "reviews_select_public" ON public.reviews
  FOR SELECT USING (is_published = true);

-- Reviewer can manage their own reviews
DROP POLICY IF EXISTS "reviews_insert_own" ON public.reviews;
CREATE POLICY "reviews_insert_own" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
DROP POLICY IF EXISTS "reviews_update_own" ON public.reviews;
CREATE POLICY "reviews_update_own" ON public.reviews
  FOR UPDATE USING (auth.uid() = reviewer_id);

-- Admin can do everything
DROP POLICY IF EXISTS "reviews_admin_all" ON public.reviews;
CREATE POLICY "reviews_admin_all" ON public.reviews
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND roles @> ARRAY['admin']::"UserRole"[])
  );

-- ============================================================
-- Table: escrow_transactions
-- ============================================================
ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;

-- Participant can read their own escrows
DROP POLICY IF EXISTS "escrow_select_participant" ON public.escrow_transactions;
CREATE POLICY "escrow_select_participant" ON public.escrow_transactions
  FOR SELECT USING (
    auth.uid() = tenant_id OR auth.uid() = landlord_id OR auth.uid() = agent_id
  );

-- Tenant can insert escrows
DROP POLICY IF EXISTS "escrow_insert_tenant" ON public.escrow_transactions;
CREATE POLICY "escrow_insert_tenant" ON public.escrow_transactions
  FOR INSERT WITH CHECK (auth.uid() = tenant_id);

-- Participant can update escrows
DROP POLICY IF EXISTS "escrow_update_participant" ON public.escrow_transactions;
CREATE POLICY "escrow_update_participant" ON public.escrow_transactions
  FOR UPDATE USING (
    auth.uid() = tenant_id OR auth.uid() = landlord_id OR auth.uid() = agent_id
  );

-- Admin can do everything
DROP POLICY IF EXISTS "escrow_admin_all" ON public.escrow_transactions;
CREATE POLICY "escrow_admin_all" ON public.escrow_transactions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND roles @> ARRAY['admin']::"UserRole"[])
  );

-- ============================================================
-- Table: transaction_logs
-- ============================================================
ALTER TABLE public.transaction_logs ENABLE ROW LEVEL SECURITY;

-- Participants can read logs for their escrows
DROP POLICY IF EXISTS "transaction_logs_select_participant" ON public.transaction_logs;
CREATE POLICY "transaction_logs_select_participant" ON public.transaction_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.escrow_transactions e
      WHERE e.id = escrow_id
        AND (e.tenant_id = auth.uid() OR e.landlord_id = auth.uid() OR e.agent_id = auth.uid())
    )
  );

-- Admin can do everything
DROP POLICY IF EXISTS "transaction_logs_admin_all" ON public.transaction_logs;
CREATE POLICY "transaction_logs_admin_all" ON public.transaction_logs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND roles @> ARRAY['admin']::"UserRole"[])
  );

-- ============================================================
-- Table: notifications
-- ============================================================
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- User can read/update their own notifications
DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- System can insert notifications
DROP POLICY IF EXISTS "notifications_insert_system" ON public.notifications;
CREATE POLICY "notifications_insert_system" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- Table: rent_instalments
-- ============================================================
ALTER TABLE public.rent_instalments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rent_instalments_select_own" ON public.rent_instalments;
CREATE POLICY "rent_instalments_select_own" ON public.rent_instalments
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "rent_instalments_update_own" ON public.rent_instalments;
CREATE POLICY "rent_instalments_update_own" ON public.rent_instalments
  FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "rent_instalments_admin_all" ON public.rent_instalments;
CREATE POLICY "rent_instalments_admin_all" ON public.rent_instalments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND roles @> ARRAY['admin']::"UserRole"[])
  );

-- ============================================================
-- Table: rent_score_events
-- ============================================================
ALTER TABLE public.rent_score_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rent_score_events_select_own" ON public.rent_score_events;
CREATE POLICY "rent_score_events_select_own" ON public.rent_score_events
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "rent_score_events_admin_all" ON public.rent_score_events;
CREATE POLICY "rent_score_events_admin_all" ON public.rent_score_events
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND roles @> ARRAY['admin']::"UserRole"[])
  );
