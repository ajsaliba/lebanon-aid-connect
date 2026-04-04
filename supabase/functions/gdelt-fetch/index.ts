import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GDELTArticleRaw {
  title?: string;
  url?: string;
  seendate?: string;
  socialimage?: string;
  domain?: string;
  language?: string;
  sourcecountry?: string;
}

interface GDELTResponse {
  articles?: GDELTArticleRaw[];
}

interface NormalisedArticle {
  title: string;
  url: string;
  source: string;
  seendate: string;
  socialimage: string | null;
  language: string;
  domain: string;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS });
  }

  try {
    const { query, timespan } = await req.json() as { query: string; timespan: string };

    if (!query || !timespan) {
      return new Response(
        JSON.stringify({ error: 'query and timespan are required' }),
        { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } },
      );
    }

    const encodedQuery = encodeURIComponent(query);
    const gdeltUrl =
      `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodedQuery}&mode=artlist&maxrecords=75&timespan=${timespan}&format=json`;

    const gdeltRes = await fetch(gdeltUrl, {
      headers: { 'User-Agent': 'CedarsAlert/1.0' },
    });

    if (!gdeltRes.ok) {
      throw new Error(`GDELT API returned ${gdeltRes.status}`);
    }

    const raw = await gdeltRes.json() as GDELTResponse;
    const articles = raw.articles ?? [];

    const normalised: NormalisedArticle[] = articles.map((a) => ({
      title: a.title ?? '(no title)',
      url: a.url ?? '',
      source: a.domain ?? a.sourcecountry ?? 'unknown',
      seendate: a.seendate ?? new Date().toISOString(),
      socialimage: a.socialimage ?? null,
      language: a.language ?? 'en',
      domain: a.domain ?? '',
    }));

    return new Response(JSON.stringify(normalised), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } },
    );
  }
});
