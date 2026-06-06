-- RLS Policies for Awahouse
-- Run these against your Supabase project once provisioned.

-- ============================================================
-- Table: users
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "users_admin_all" ON public.users
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- Table: verifications
-- ============================================================
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "verifications_select_own" ON public.verifications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "verifications_insert_own" ON public.verifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "verifications_update_own" ON public.verifications
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "verifications_admin_all" ON public.verifications
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- Table: properties
-- ============================================================
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Public can read available, non-deleted, verified properties
CREATE POLICY "properties_select_public" ON public.properties
  FOR SELECT USING (
    is_available = true AND is_deleted = false AND verification_badge != 'pending'
  );

-- Owner can read/update their own properties
CREATE POLICY "properties_select_own" ON public.properties
  FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "properties_insert_own" ON public.properties
  FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "properties_update_own" ON public.properties
  FOR UPDATE USING (auth.uid() = owner_id);

-- Admin can do everything
CREATE POLICY "properties_admin_all" ON public.properties
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- Table: property_images
-- ============================================================
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;

-- Public can read images of visible properties
CREATE POLICY "property_images_select_public" ON public.property_images
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_id AND p.is_available = true AND p.is_deleted = false)
  );

-- Owner can manage images
CREATE POLICY "property_images_owner" ON public.property_images
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_id AND p.owner_id = auth.uid())
  );

-- ============================================================
-- Table: saved_properties
-- ============================================================
ALTER TABLE public.saved_properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "saved_properties_select_own" ON public.saved_properties
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "saved_properties_insert_own" ON public.saved_properties
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "saved_properties_delete_own" ON public.saved_properties
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- Table: reviews
-- ============================================================
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Public can read published reviews
CREATE POLICY "reviews_select_public" ON public.reviews
  FOR SELECT USING (is_published = true);

-- Reviewer can manage their own reviews
CREATE POLICY "reviews_insert_own" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "reviews_update_own" ON public.reviews
  FOR UPDATE USING (auth.uid() = reviewer_id);

-- Admin can do everything
CREATE POLICY "reviews_admin_all" ON public.reviews
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );
