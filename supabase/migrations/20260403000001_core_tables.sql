-- ============================================================
-- Core tables for all missing features
-- ============================================================

-- profiles (Feature 15 - User Roles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role          text NOT NULL DEFAULT 'viewer' CHECK (role IN ('viewer','volunteer','coordinator','admin')),
  display_name  text,
  region        text,
  organization  text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- trigger: auto-create profile on sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email,'@',1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- missing_persons (Feature 2 & 6)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.missing_persons (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                text NOT NULL,
  age                 int,
  gender              text,
  last_known_location text,
  last_known_lat      float,
  last_known_lng      float,
  description         text,
  status              text NOT NULL DEFAULT 'missing' CHECK (status IN ('missing','safe','injured','evacuated','deceased')),
  contact             text,
  photo_url           text,
  notes               text,
  reported_by         uuid REFERENCES auth.users(id),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.missing_persons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mp_select" ON public.missing_persons FOR SELECT USING (true);
CREATE POLICY "mp_insert" ON public.missing_persons FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "mp_update" ON public.missing_persons FOR UPDATE USING (auth.role() = 'authenticated');

-- ============================================================
-- medical_resources (Feature 2)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.medical_resources (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  type          text NOT NULL DEFAULT 'hospital' CHECK (type IN ('hospital','clinic','pharmacy','field_hospital')),
  address       text,
  lat           float,
  lng           float,
  contact       text,
  status        text NOT NULL DEFAULT 'open' CHECK (status IN ('open','limited','closed')),
  beds_available int,
  specialties   text[],
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.medical_resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "medical_select" ON public.medical_resources FOR SELECT USING (true);
CREATE POLICY "medical_insert" ON public.medical_resources FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- community_channels (Feature 2)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.community_channels (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  type        text NOT NULL DEFAULT 'whatsapp' CHECK (type IN ('whatsapp','telegram','signal','radio')),
  description text,
  link        text,
  members     int DEFAULT 0,
  region      text,
  verified    boolean DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.community_channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "channels_select" ON public.community_channels FOR SELECT USING (true);
CREATE POLICY "channels_insert" ON public.community_channels FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- aid_inventory (Feature 2 & 12)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.aid_inventory (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name     text NOT NULL,
  category      text NOT NULL,
  quantity      int NOT NULL DEFAULT 0,
  unit          text DEFAULT 'units',
  location      text,
  lat           float,
  lng           float,
  donor_name    text,
  status        text NOT NULL DEFAULT 'available' CHECK (status IN ('available','reserved','matched','depleted')),
  expiry_date   date,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.aid_inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inventory_select" ON public.aid_inventory FOR SELECT USING (true);
CREATE POLICY "inventory_insert" ON public.aid_inventory FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "inventory_update" ON public.aid_inventory FOR UPDATE USING (auth.role() = 'authenticated');

-- ============================================================
-- damage_reports (Feature 2 & 5)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.damage_reports (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location              text NOT NULL,
  lat                   float,
  lng                   float,
  description           text,
  damage_level          text NOT NULL DEFAULT 'moderate' CHECK (damage_level IN ('minor','moderate','severe','destroyed')),
  building_type         text,
  photo_urls            text[],
  reconstruction_status text NOT NULL DEFAULT 'not_started' CHECK (reconstruction_status IN ('not_started','assessment','in_progress','completed')),
  progress_pct          int DEFAULT 0,
  reported_by           uuid REFERENCES auth.users(id),
  created_at            timestamptz NOT NULL DEFAULT now(),
  reported_at           timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.damage_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "damage_select" ON public.damage_reports FOR SELECT USING (true);
CREATE POLICY "damage_insert" ON public.damage_reports FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "damage_update" ON public.damage_reports FOR UPDATE USING (auth.role() = 'authenticated');

-- ============================================================
-- volunteers (Feature 2)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.volunteers (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  skills       text[],
  location     text,
  lat          float,
  lng          float,
  availability text NOT NULL DEFAULT 'available' CHECK (availability IN ('available','busy','unavailable')),
  contact      text,
  organization text,
  user_id      uuid REFERENCES auth.users(id),
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "volunteers_select" ON public.volunteers FOR SELECT USING (true);
CREATE POLICY "volunteers_insert" ON public.volunteers FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- marketplace (Feature 2)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.marketplace (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  description text,
  category    text NOT NULL DEFAULT 'goods',
  price       numeric DEFAULT 0,
  currency    text DEFAULT 'USD',
  is_free     boolean DEFAULT false,
  location    text,
  lat         float,
  lng         float,
  contact     text,
  status      text NOT NULL DEFAULT 'available' CHECK (status IN ('available','sold','reserved')),
  user_id     uuid REFERENCES auth.users(id),
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.marketplace ENABLE ROW LEVEL SECURITY;
CREATE POLICY "marketplace_select" ON public.marketplace FOR SELECT USING (true);
CREATE POLICY "marketplace_insert" ON public.marketplace FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- mesh_nodes (Feature 2)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.mesh_nodes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id       text UNIQUE NOT NULL,
  name          text,
  lat           float,
  lng           float,
  status        text NOT NULL DEFAULT 'online' CHECK (status IN ('online','offline','degraded')),
  signal_strength int,
  connected_peers int DEFAULT 0,
  last_seen     timestamptz DEFAULT now(),
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.mesh_nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mesh_select" ON public.mesh_nodes FOR SELECT USING (true);
CREATE POLICY "mesh_insert" ON public.mesh_nodes FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- escalation_events (Feature 11)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.escalation_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  description text,
  location    text,
  lat         float,
  lng         float,
  severity    text NOT NULL DEFAULT 'monitoring' CHECK (severity IN ('monitoring','elevated','high')),
  event_type  text NOT NULL DEFAULT 'conflict',
  source_url  text,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.escalation_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "escalation_select" ON public.escalation_events FOR SELECT USING (true);
CREATE POLICY "escalation_insert" ON public.escalation_events FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- aid_requests (Feature 12)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.aid_requests (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  description   text NOT NULL,
  category      text NOT NULL,
  quantity      int DEFAULT 1,
  location      text,
  lat           float,
  lng           float,
  priority      text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','critical')),
  status        text NOT NULL DEFAULT 'open' CHECK (status IN ('open','matched','in_transit','delivered')),
  contact       text,
  requested_by  uuid REFERENCES auth.users(id),
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.aid_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "aid_requests_select" ON public.aid_requests FOR SELECT USING (true);
CREATE POLICY "aid_requests_insert" ON public.aid_requests FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "aid_requests_update" ON public.aid_requests FOR UPDATE USING (auth.role() = 'authenticated');

-- ============================================================
-- aid_matches (Feature 12)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.aid_matches (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id   uuid REFERENCES public.aid_requests(id) ON DELETE CASCADE,
  inventory_id uuid REFERENCES public.aid_inventory(id) ON DELETE CASCADE,
  score        int NOT NULL DEFAULT 0,
  matched_by   uuid REFERENCES auth.users(id),
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.aid_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "aid_matches_select" ON public.aid_matches FOR SELECT USING (true);
CREATE POLICY "aid_matches_insert" ON public.aid_matches FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- broadcast_log (Feature 8)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.broadcast_log (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id        uuid REFERENCES auth.users(id),
  recipients_count int NOT NULL DEFAULT 0,
  message          text NOT NULL,
  channel          text NOT NULL CHECK (channel IN ('sms','whatsapp')),
  status           text NOT NULL DEFAULT 'sent' CHECK (status IN ('sent','failed','pending')),
  sent_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.broadcast_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "broadcast_select" ON public.broadcast_log FOR SELECT USING (auth.uid() = sender_id);
CREATE POLICY "broadcast_insert" ON public.broadcast_log FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- FTS on articles (Feature 14)
-- ============================================================
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS fts tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(title,'') || ' ' || coalesce(summary,''))
  ) STORED;

CREATE INDEX IF NOT EXISTS articles_fts_idx ON public.articles USING GIN(fts);
