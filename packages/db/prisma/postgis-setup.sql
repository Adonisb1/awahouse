-- Run this against your Supabase PostgreSQL instance when provisioning the database.
-- This enables PostGIS for geo-search and creates the GiST index.

CREATE EXTENSION IF NOT EXISTS postgis;

-- GiST index on properties location for radius search
CREATE INDEX IF NOT EXISTS idx_properties_location
  ON public.properties
  USING GIST (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography)
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Full-text search index
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(address, '') || ' ' || coalesce(lga, ''))
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_properties_search
  ON public.properties
  USING GIN (search_vector);
