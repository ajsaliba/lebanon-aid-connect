
-- SOS distress signals table
CREATE TABLE public.sos_signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  accuracy DOUBLE PRECISION,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  people_count INTEGER NOT NULL DEFAULT 1,
  needs TEXT[] DEFAULT '{}',
  contact_phone TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.sos_signals ENABLE ROW LEVEL SECURITY;

-- Anyone can see active SOS signals (responders need visibility)
CREATE POLICY "Anyone can view active SOS signals" ON public.sos_signals
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create SOS signals" ON public.sos_signals
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own SOS signals" ON public.sos_signals
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own SOS signals" ON public.sos_signals
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Safety check-ins table  
CREATE TABLE public.safety_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  status TEXT NOT NULL DEFAULT 'safe',
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.safety_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view safety checkins" ON public.safety_checkins
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create checkins" ON public.safety_checkins
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Add heading_count to shelters for "I'm heading here" tracking
ALTER TABLE public.shelters ADD COLUMN IF NOT EXISTS heading_count INTEGER NOT NULL DEFAULT 0;

-- Add urgency fields to housing
ALTER TABLE public.housing_listings ADD COLUMN IF NOT EXISTS is_free BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.housing_listings ADD COLUMN IF NOT EXISTS urgency TEXT NOT NULL DEFAULT 'normal';

-- Enable realtime for SOS signals so responders see them instantly
ALTER PUBLICATION supabase_realtime ADD TABLE public.sos_signals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.safety_checkins;
ALTER PUBLICATION supabase_realtime ADD TABLE public.shelters;
