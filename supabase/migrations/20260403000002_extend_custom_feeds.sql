-- Extend custom_feeds with keyword/source filtering (Feature 9)
ALTER TABLE public.custom_feeds
  ADD COLUMN IF NOT EXISTS keywords  text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS sources   text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS min_severity text DEFAULT 'monitoring'
    CHECK (min_severity IN ('monitoring','elevated','high'));
