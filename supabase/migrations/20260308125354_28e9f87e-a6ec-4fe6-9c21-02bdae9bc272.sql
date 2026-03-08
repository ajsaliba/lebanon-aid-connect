
CREATE TABLE public.articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id text NOT NULL,
  content_hash text NOT NULL,
  title text NOT NULL,
  summary text,
  source text NOT NULL,
  url text,
  published_at timestamptz NOT NULL DEFAULT now(),
  severity text NOT NULL DEFAULT 'monitoring',
  category text NOT NULL DEFAULT 'political',
  lat double precision,
  lng double precision,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(content_hash)
);

CREATE INDEX idx_articles_published_at ON public.articles(published_at DESC);
CREATE INDEX idx_articles_content_hash ON public.articles(content_hash);
CREATE INDEX idx_articles_category ON public.articles(category);

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read articles"
  ON public.articles FOR SELECT
  USING (true);

CREATE POLICY "Service role can insert articles"
  ON public.articles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can delete articles"
  ON public.articles FOR DELETE
  USING (true);
