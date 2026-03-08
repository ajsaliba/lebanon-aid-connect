
CREATE TABLE public.custom_feeds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  url text NOT NULL,
  source_label text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, url)
);

ALTER TABLE public.custom_feeds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own feeds" ON public.custom_feeds
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feeds" ON public.custom_feeds
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feeds" ON public.custom_feeds
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feeds" ON public.custom_feeds
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Service role can read all feeds" ON public.custom_feeds
  FOR SELECT USING (true);
