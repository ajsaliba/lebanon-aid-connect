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
  { name: 'france24', url: 'https://www.france24.com/en/rss', sourceLabel: 'France 24' },
  { name: 'middleeasteye', url: 'https://www.middleeasteye.net/rss', sourceLabel: 'Middle East Eye' },
  { name: 'bbc', url: 'https://feeds.bbci.co.uk/news/world/rss.xml', sourceLabel: 'BBC World' },
  { name: 'reuters', url: 'https://www.reutersagency.com/feed/?taxonomy=best-sectors&post_type=best', sourceLabel: 'Reuters' },
  { name: 'google_crisis', url: 'https://news.google.com/rss/search?q=crisis+OR+war+OR+conflict+OR+humanitarian&hl=en&gl=US&ceid=US:en', sourceLabel: 'Google News' },
];

// Severity keywords
const HIGH_KEYWORDS = ['airstrike', 'bomb', 'bombing', 'killed', 'dead', 'death', 'massacre', 'attack', 'strike', 'explosion', 'casualties', 'shelling', 'missile', 'earthquake', 'tsunami', 'genocide', 'famine'];
const ELEVATED_KEYWORDS = ['ceasefire', 'tensions', 'escalation', 'warning', 'threat', 'sanctions', 'troops', 'military', 'evacuation', 'displacement', 'crisis', 'emergency', 'flood', 'hurricane', 'wildfire'];

// Category keywords
const CONFLICT_KEYWORDS = ['airstrike', 'bomb', 'attack', 'military', 'strike', 'combat', 'war', 'missile', 'shelling', 'offensive', 'troops', 'invasion', 'insurgent'];
const HUMANITARIAN_KEYWORDS = ['aid', 'humanitarian', 'refugee', 'displaced', 'unhcr', 'red cross', 'relief', 'unicef', 'food', 'shelter', 'evacuation', 'famine', 'drought'];
const POLITICAL_KEYWORDS = ['ceasefire', 'negotiation', 'un', 'summit', 'diplomatic', 'sanctions', 'resolution', 'government', 'election', 'parliament', 'treaty'];
const INFRASTRUCTURE_KEYWORDS = ['hospital', 'school', 'bridge', 'power', 'water', 'infrastructure', 'building', 'road', 'electricity', 'communication', 'dam'];

// Global city coordinates for geo-tagging
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  'beirut': { lat: 33.8938, lng: 35.5018 },
  'damascus': { lat: 33.5138, lng: 36.2765 },
  'gaza': { lat: 31.5017, lng: 34.4668 },
  'tel aviv': { lat: 32.0853, lng: 34.7818 },
  'jerusalem': { lat: 31.7683, lng: 35.2137 },
  'kyiv': { lat: 50.4501, lng: 30.5234 },
  'kharkiv': { lat: 49.9935, lng: 36.2304 },
  'moscow': { lat: 55.7558, lng: 37.6173 },
  'tehran': { lat: 35.6892, lng: 51.3890 },
  'kabul': { lat: 34.5553, lng: 69.2075 },
  'khartoum': { lat: 15.5007, lng: 32.5599 },
  'mogadishu': { lat: 2.0469, lng: 45.3182 },
  'baghdad': { lat: 33.3152, lng: 44.3661 },
  'sanaa': { lat: 15.3694, lng: 44.1910 },
  'tripoli': { lat: 32.9022, lng: 13.1800 },
  'cairo': { lat: 30.0444, lng: 31.2357 },
  'nairobi': { lat: -1.2921, lng: 36.8219 },
  'new york': { lat: 40.7128, lng: -74.0060 },
  'washington': { lat: 38.9072, lng: -77.0369 },
  'london': { lat: 51.5074, lng: -0.1278 },
  'paris': { lat: 48.8566, lng: 2.3522 },
  'beijing': { lat: 39.9042, lng: 116.4074 },
  'taipei': { lat: 25.0330, lng: 121.5654 },
  'myanmar': { lat: 19.7633, lng: 96.0785 },
  'ethiopia': { lat: 9.1450, lng: 40.4897 },
  'haiti': { lat: 18.9712, lng: -72.2852 },
  'istanbul': { lat: 41.0082, lng: 28.9784 },
  'riyadh': { lat: 24.7136, lng: 46.6753 },
  'islamabad': { lat: 33.6844, lng: 73.0479 },
  'new delhi': { lat: 28.6139, lng: 77.2090 },
  'manila': { lat: 14.5995, lng: 120.9842 },
  'dhaka': { lat: 23.8103, lng: 90.4125 },
  'ukraine': { lat: 48.3794, lng: 31.1656 },
  'sudan': { lat: 12.8628, lng: 30.2176 },
  'yemen': { lat: 15.5527, lng: 48.5164 },
  'syria': { lat: 34.8021, lng: 38.9968 },
  'iran': { lat: 32.4279, lng: 53.6880 },
  'israel': { lat: 31.0461, lng: 34.8516 },
  'lebanon': { lat: 33.8547, lng: 35.8623 },
  'palestine': { lat: 31.9522, lng: 35.2332 },
  'iraq': { lat: 33.2232, lng: 43.6793 },
  'libya': { lat: 26.3351, lng: 17.2283 },
  'somalia': { lat: 5.1521, lng: 46.1996 },
  'afghanistan': { lat: 33.9391, lng: 67.7100 },
  'congo': { lat: -4.0383, lng: 21.7587 },
  'niger': { lat: 17.6078, lng: 8.0817 },
  'mali': { lat: 17.5707, lng: -3.9962 },
  'burkina faso': { lat: 12.3714, lng: -1.5197 },
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

function stripHtml(html: string): string {
  return html
    .replace(/<article[^>]*>[\s\S]*?<\/article>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractItems(xml: string): Array<{ title: string; description: string; link: string; pubDate: string }> {
  const items: Array<{ title: string; description: string; link: string; pubDate: string }> = [];
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const getTag = (tag: string): string => {
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
    const timeout = setTimeout(() => controller.abort(), 8000);

    console.log(`Fetching ${feed.name}`);
    const response = await fetch(feed.url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
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
    console.log(`Feed ${feed.name}: ${rawItems.length} items`);

    // No regional filtering — include ALL items (global focus)
    return rawItems.map(raw => {
      const fullText = `${raw.title} ${raw.description}`;
      const coords = extractCoords(fullText);
      return {
        id: `${feed.name}-${btoa(encodeURIComponent(raw.title)).slice(0, 16)}`,
        title: raw.title,
        summary: raw.description.slice(0, 300),
        source: feed.sourceLabel,
        url: raw.link,
        publishedAt: raw.pubDate ? new Date(raw.pubDate).toISOString() : new Date().toISOString(),
        severity: classifySeverity(fullText),
        category: classifyCategory(fullText),
        ...coords,
      };
    });
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
    const results = await Promise.allSettled(RSS_FEEDS.map(fetchFeed));

    const allNews: NewsItem[] = [];
    for (const result of results) {
      if (result.status === 'fulfilled') {
        allNews.push(...result.value);
      }
    }

    // Deduplicate
    const seen = new Set<string>();
    const deduped = allNews.filter(item => {
      const key = item.title.toLowerCase().slice(0, 50);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    deduped.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    const final = deduped.slice(0, 80);

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
