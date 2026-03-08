-- Shelters table (user-submitted)
CREATE TABLE public.shelters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  capacity INTEGER NOT NULL,
  current_occupancy INTEGER NOT NULL DEFAULT 0,
  address TEXT NOT NULL,
  contact TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'full', 'closed')),
  amenities TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.shelters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view shelters" ON public.shelters FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert shelters" ON public.shelters FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own shelters" ON public.shelters FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own shelters" ON public.shelters FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Housing listings table (user-submitted)
CREATE TABLE public.housing_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  price INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  bedrooms INTEGER NOT NULL,
  address TEXT NOT NULL,
  contact TEXT NOT NULL,
  available BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.housing_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view housing" ON public.housing_listings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert housing" ON public.housing_listings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own housing" ON public.housing_listings FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own housing" ON public.housing_listings FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Donation links table (user-submitted: WhatsApp, GoFundMe, PayPal, etc.)
CREATE TABLE public.donation_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  platform TEXT NOT NULL CHECK (platform IN ('whatsapp', 'gofundme', 'paypal', 'other')),
  link TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('medical', 'food', 'shelter', 'general')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.donation_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view donation links" ON public.donation_links FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert donation links" ON public.donation_links FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own donation links" ON public.donation_links FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own donation links" ON public.donation_links FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_shelters_updated_at BEFORE UPDATE ON public.shelters FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_housing_updated_at BEFORE UPDATE ON public.housing_listings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();