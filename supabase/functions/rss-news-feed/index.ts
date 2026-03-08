const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface FeedSource {
  name: string;
  url: string;
  sourceLabel: string;
}

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: string;
  severity: 'high' | 'elevated' | 'monitoring';
  category: 'conflict' | 'humanitarian' | 'political' | 'infrastructure';
  lat?: number;
  lng?: number;
}

const RSS_FEEDS: FeedSource[] = [
  { name: 'aljazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml', sourceLabel: 'Al Jazeera' },
  { name: 'alarabiya', url: 'https://english.alarabiya.net/tools/rss', sourceLabel: 'Al Arabiya' },
  { name: 'france24', url: 'https://www.france24.com/en/middle-east/rss', sourceLabel: 'France 24' },
  { name: 'middleeasteye', url: 'https://www.middleeasteye.net/rss', sourceLabel: 'Middle East Eye' },
  { name: 'lbci', url: 'https://www.lbcgroup.tv/rss/feed/en', sourceLabel: 'LBCI' },
];

// Lebanon/Middle East keywords for filtering
const REGION_KEYWORDS = [
  'lebanon', 'lebanese', 'beirut', 'hezbollah', 'sidon', 'tyre', 'tripoli', 'baalbek',
  'nabatieh', 'bekaa', 'mount lebanon', 'south lebanon', 'dahiyeh',
  'middle east', 'syria', 'israel', 'gaza', 'palestine', 'iran',
  'ceasefire', 'airstrike', 'refugee', 'displaced', 'humanitarian',
];

// Keywords for severity classification
const HIGH_KEYWORDS = ['airstrike', 'bomb', 'bombing', 'killed', 'dead', 'death', 'massacre', 'attack', 'strike', 'explosion', 'casualties', 'shelling', 'missile'];
const ELEVATED_KEYWORDS = ['ceasefire', 'tensions', 'escalation', 'warning', 'threat', 'sanctions', 'troops', 'military', 'evacuation', 'displacement'];

// Keywords for category classification
const CONFLICT_KEYWORDS = ['airstrike', 'bomb', 'attack', 'military', 'strike', 'combat', 'war', 'missile', 'shelling', 'offensive', 'troops'];
const HUMANITARIAN_KEYWORDS = ['aid', 'humanitarian', 'refugee', 'displaced', 'unhcr', 'red cross', 'relief', 'unicef', 'food', 'shelter', 'evacuation'];
const POLITICAL_KEYWORDS = ['ceasefire', 'negotiation', 'un', 'summit', 'diplomatic', 'sanctions', 'resolution', 'government', 'election', 'parliament'];
const INFRASTRUCTURE_KEYWORDS = ['hospital', 'school', 'bridge', 'power', 'water', 'infrastructure', 'building', 'road', 'electricity', 'communication'];

// Known city coordinates for geo-tagging
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  'beirut': { lat: 33.8938, lng: 35.5018 },
  'tripoli': { lat: 34.4333, lng: 35.8333 },
  'sidon': { lat: 33.5594, lng: 35.3717 },
  'tyre': { lat: 33.2721, lng: 35.2033 },
  'baalbek': { lat: 34.0047, lng: 36.2110 },
  'nabatieh': { lat: 33.3633, lng: 35.4717 },
  'dahiyeh': { lat: 33.8547, lng: 35.4900 },
  'jounieh': { lat: 33.9806, lng: 35.6178 },
  'byblos': { lat: 34.1236, lng: 35.6511 },
  'zahle': { lat: 33.8463, lng: 35.9020 },
  'damascus': { lat: 33.5138, lng: 36.2765 },
  'gaza': { lat: 31.5017, lng: 34.4668 },
  'tel aviv': { lat: 32.0853, lng: 34.7818 },
};

function classifySeverity(text: string): 'high' | 'elevated' | 'monitoring' {
  const lower = text.toLowerCase();
  if (HIGH_KEYWORDS.some(k => lower.includes(k))) return 'high';
  if (ELEVATED_KEYWORDS.some(k => lower.includes(k))) return 'elevated';
  return 'monitoring';
}

function classifyCategory(text: string): 'conflict' | 'humanitarian' | 'political' | 'infrastructure' {
  const lower = text.toLowerCase();
  if (CONFLICT_KEYWORDS.some(k => lower.includes(k))) return 'conflict';
  if (HUMANITARIAN_KEYWORDS.some(k => lower.includes(k))) return 'humanitarian';
  if (POLITICAL_KEYWORDS.some(k => lower.includes(k))) return 'political';
  if (INFRASTRUCTURE_KEYWORDS.some(k => lower.includes(k))) return 'infrastructure';
  return 'political';
}

function extractCoords(text: string): { lat?: number; lng?: number } {
  const lower = text.toLowerCase();
  for (const [city, coords] of Object.entries(CITY_COORDS)) {
    if (lower.includes(city)) return coords;
  }
  return {};
}

function isRelevant(text: string): boolean {
  const lower = text.toLowerCase();
  return REGION_KEYWORDS.some(k => lower.includes(k));
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&nbsp;/g, ' ').trim();
}

function extractItems(xml: string): Array<{ title: string; description: string; link: string; pubDate: string }> {
  const items: Array<{ title: string; description: string; link: string; pubDate: string }> = [];

  // Match <item> blocks
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];

    const getTag = (tag: string): string => {
      // Handle CDATA
      const cdataRegex = new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${tag}>`, 'i');
      const cdataMatch = block.match(cdataRegex);
      if (cdataMatch) return cdataMatch[1].trim();

      const simpleRegex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
      const simpleMatch = block.match(simpleRegex);
      return simpleMatch ? simpleMatch[1].trim() : '';
    };

    const title = stripHtml(getTag('title'));
    const description = stripHtml(getTag('description'));
    const link = getTag('link');
    const pubDate = getTag('pubDate');

    if (title) {
      items.push({ title, description, link, pubDate });
    }
  }

  return items;
}

async function fetchFeed(feed: FeedSource): Promise<NewsItem[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(feed.url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CrisisTracker/1.0)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
    });
    clearTimeout(timeout);

    if (!response.ok) {
      console.warn(`Feed ${feed.name} returned ${response.status}`);
      return [];
    }

    const xml = await response.text();
    const rawItems = extractItems(xml);

    const items: NewsItem[] = [];
    for (const raw of rawItems) {
      const fullText = `${raw.title} ${raw.description}`;

      // Only include relevant items (or all items from Middle East-focused feeds)
      if (!isRelevant(fullText) && !['france24', 'middleeasteye'].includes(feed.name)) {
        continue;
      }

      const coords = extractCoords(fullText);

      items.push({
        id: `${feed.name}-${btoa(raw.title).slice(0, 12)}`,
        title: raw.title,
        summary: raw.description.slice(0, 300),
        source: feed.sourceLabel,
        url: raw.link,
        publishedAt: raw.pubDate ? new Date(raw.pubDate).toISOString() : new Date().toISOString(),
        severity: classifySeverity(fullText),
        category: classifyCategory(fullText),
        ...coords,
      });
    }

    return items;
  } catch (err) {
    console.warn(`Failed to fetch ${feed.name}:`, err);
    return [];
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Fetch all feeds in parallel
    const results = await Promise.allSettled(RSS_FEEDS.map(fetchFeed));

    const allNews: NewsItem[] = [];
    for (const result of results) {
      if (result.status === 'fulfilled') {
        allNews.push(...result.value);
      }
    }

    // Deduplicate by similar titles
    const seen = new Set<string>();
    const deduped = allNews.filter(item => {
      const key = item.title.toLowerCase().slice(0, 50);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Sort by date (newest first)
    deduped.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    // Limit to 50 items
    const final = deduped.slice(0, 50);

    return new Response(JSON.stringify({
      news: final,
      fetchedAt: new Date().toISOString(),
      sourcesQueried: RSS_FEEDS.length,
      totalItems: final.length,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('RSS feed error:', err);
    return new Response(JSON.stringify({ error: 'Failed to fetch news feeds', news: [] }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
