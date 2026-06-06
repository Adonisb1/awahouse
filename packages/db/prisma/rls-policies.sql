-- RLS Policies for Awahouse
-- Run these against your Supabase project once provisioned.
-- These reference the Supabase `auth.uid()` function which is not available in local Postgres.

-- ============================================================
-- Table: users
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can read their own row
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Users can insert their own row (registration)
CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own row
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Admins can read all users
CREATE POLICY "users_admin_all" ON public.users
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- Table: verifications
-- ============================================================
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;

-- Users can read their own verifications
CREATE POLICY "verifications_select_own" ON public.verifications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own verifications
CREATE POLICY "verifications_insert_own" ON public.verifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own verifications
CREATE POLICY "verifications_update_own" ON public.verifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Admins can read and manage all verifications
CREATE POLICY "verifications_admin_all" ON public.verifications
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );
