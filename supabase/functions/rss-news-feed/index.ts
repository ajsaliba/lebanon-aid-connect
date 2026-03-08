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
  { name: 'france24_me', url: 'https://www.france24.com/en/middle-east/rss', sourceLabel: 'France 24' },
  { name: 'middleeasteye', url: 'https://www.middleeasteye.net/rss', sourceLabel: 'Middle East Eye' },
  { name: 'bbc', url: 'https://feeds.bbci.co.uk/news/world/middle_east/rss.xml', sourceLabel: 'BBC' },
  { name: 'mtv', url: 'https://www.mtv.com.lb/RSS/AllNews', sourceLabel: 'MTV Lebanon' },
  { name: 'lbci', url: 'https://www.lbcgroup.tv/feed/rss/news/en', sourceLabel: 'LBCI' },
  { name: 'google_me_war', url: 'https://news.google.com/rss/search?q=middle+east+war+OR+airstrike+OR+conflict+OR+Iran+OR+Lebanon+OR+Gaza+OR+Syria+OR+Yemen+OR+Iraq&hl=en&gl=US&ceid=US:en', sourceLabel: 'Google News' },
];

// Middle East region keywords for filtering general feeds (Al Jazeera has global coverage)
const ME_KEYWORDS = [
  'lebanon', 'lebanese', 'beirut', 'hezbollah', 'sidon', 'tyre', 'baalbek', 'nabatieh', 'bekaa', 'dahiyeh',
  'israel', 'israeli', 'idf', 'tel aviv', 'jerusalem', 'netanyahu', 'gaza', 'palestine', 'palestinian', 'hamas', 'west bank',
  'iran', 'iranian', 'tehran', 'isfahan', 'irgc', 'khamenei',
  'syria', 'syrian', 'damascus', 'aleppo', 'assad',
  'yemen', 'yemeni', 'sanaa', 'houthi',
  'iraq', 'iraqi', 'baghdad', 'basra',
  'middle east', 'ceasefire', 'airstrike', 'missile',
];

// Severity keywords
const HIGH_KEYWORDS = ['airstrike', 'bomb', 'bombing', 'killed', 'dead', 'death', 'massacre', 'attack', 'strike', 'explosion', 'casualties', 'shelling', 'missile', 'genocide'];
const ELEVATED_KEYWORDS = ['ceasefire', 'tensions', 'escalation', 'warning', 'threat', 'sanctions', 'troops', 'military', 'evacuation', 'displacement', 'crisis', 'emergency'];

// Category keywords
const CONFLICT_KEYWORDS = ['airstrike', 'bomb', 'attack', 'military', 'strike', 'combat', 'war', 'missile', 'shelling', 'offensive', 'troops', 'invasion'];
const HUMANITARIAN_KEYWORDS = ['aid', 'humanitarian', 'refugee', 'displaced', 'unhcr', 'red cross', 'relief', 'unicef', 'food', 'shelter', 'evacuation', 'famine'];
const POLITICAL_KEYWORDS = ['ceasefire', 'negotiation', 'un', 'summit', 'diplomatic', 'sanctions', 'resolution', 'government', 'election', 'parliament', 'treaty'];
const INFRASTRUCTURE_KEYWORDS = ['hospital', 'school', 'bridge', 'power', 'water', 'infrastructure', 'building', 'road', 'electricity'];

// Middle East city coordinates for geo-tagging
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  // Lebanon
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
  'bekaa': { lat: 33.8463, lng: 35.9020 },
  // Israel/Palestine
  'tel aviv': { lat: 32.0853, lng: 34.7818 },
  'jerusalem': { lat: 31.7683, lng: 35.2137 },
  'gaza': { lat: 31.5017, lng: 34.4668 },
  'haifa': { lat: 32.7940, lng: 34.9896 },
  'west bank': { lat: 31.9522, lng: 35.2332 },
  'rafah': { lat: 31.2969, lng: 34.2455 },
  'khan younis': { lat: 31.3462, lng: 34.3065 },
  'nablus': { lat: 32.2211, lng: 35.2544 },
  // Syria
  'damascus': { lat: 33.5138, lng: 36.2765 },
  'aleppo': { lat: 36.2021, lng: 37.1343 },
  'homs': { lat: 34.7324, lng: 36.7137 },
  'idlib': { lat: 35.9306, lng: 36.6339 },
  'deir ez-zor': { lat: 35.3359, lng: 40.1408 },
  // Iran
  'tehran': { lat: 35.6892, lng: 51.3890 },
  'isfahan': { lat: 32.6546, lng: 51.6680 },
  'tabriz': { lat: 38.0800, lng: 46.2919 },
  'shiraz': { lat: 29.5918, lng: 52.5837 },
  'mashhad': { lat: 36.2605, lng: 59.6168 },
  'najafabad': { lat: 32.6342, lng: 51.3668 },
  'bandar abbas': { lat: 27.1865, lng: 56.2808 },
  // Yemen
  'sanaa': { lat: 15.3694, lng: 44.1910 },
  'aden': { lat: 12.7855, lng: 45.0187 },
  'hodeidah': { lat: 14.7980, lng: 42.9511 },
  'marib': { lat: 15.4543, lng: 45.3220 },
  // Iraq
  'baghdad': { lat: 33.3152, lng: 44.3661 },
  'basra': { lat: 30.5085, lng: 47.7804 },
  'mosul': { lat: 36.3566, lng: 43.1593 },
  'erbil': { lat: 36.1912, lng: 44.0119 },
  'kirkuk': { lat: 35.4681, lng: 44.3922 },
  // Country-level fallback
  'lebanon': { lat: 33.8547, lng: 35.8623 },
  'israel': { lat: 31.0461, lng: 34.8516 },
  'palestine': { lat: 31.9522, lng: 35.2332 },
  'iran': { lat: 32.4279, lng: 53.6880 },
  'syria': { lat: 34.8021, lng: 38.9968 },
  'yemen': { lat: 15.5527, lng: 48.5164 },
  'iraq': { lat: 33.2232, lng: 43.6793 },
};

function classifySeverity(text: string): 'high' | 'elevated' | 'monitoring' {
  const lower = text.toLowerCase();
  if (HIGH_KEYWORDS.some(k => lower.includes(k))) return 'high';
  if (ELEVATED_KEYWORDS.some(k => lower.includes(k))) return 'elevated';
  return 'monitoring';
}

function classifyCategory(text: string): 'conflict' | 'humanitarian' | 'political' | 'infrastructure' {
  const lower = text.toLowerCase();
  // Check more specific categories first before falling back to conflict
  const infraScore = INFRASTRUCTURE_KEYWORDS.filter(k => lower.includes(k)).length;
  const humanScore = HUMANITARIAN_KEYWORDS.filter(k => lower.includes(k)).length;
  const politicalScore = POLITICAL_KEYWORDS.filter(k => lower.includes(k)).length;
  const conflictScore = CONFLICT_KEYWORDS.filter(k => lower.includes(k)).length;

  // Use scoring: if a more specific category matches well, prefer it
  if (infraScore >= 2 || (infraScore >= 1 && conflictScore === 0)) return 'infrastructure';
  if (humanScore >= 2 || (humanScore >= 1 && conflictScore === 0)) return 'humanitarian';
  if (politicalScore >= 2 || (politicalScore >= 1 && conflictScore === 0)) return 'political';
  if (conflictScore >= 1) return 'conflict';
  if (politicalScore >= 1) return 'political';
  if (humanScore >= 1) return 'humanitarian';
  if (infraScore >= 1) return 'infrastructure';
  return 'political';
}

function extractCoords(text: string): { lat?: number; lng?: number } {
  const lower = text.toLowerCase();
  for (const [city, coords] of Object.entries(CITY_COORDS)) {
    if (lower.includes(city)) return coords;
  }
  return {};
}

function isMiddleEast(text: string): boolean {
  const lower = text.toLowerCase();
  return ME_KEYWORDS.some(k => lower.includes(k));
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
    if (title) items.push({ title, description, link, pubDate });
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

    const items: NewsItem[] = [];
    for (const raw of rawItems) {
      const fullText = `${raw.title} ${raw.description}`;
      // ME-focused feeds include all; general feeds (aljazeera) filter for ME relevance
      const meFocused = ['france24_me', 'middleeasteye', 'bbc', 'google_me_war'].includes(feed.name);
      if (!meFocused && !isMiddleEast(fullText)) continue;

      const coords = extractCoords(fullText);
      items.push({
        id: `${feed.name}-${btoa(encodeURIComponent(raw.title)).slice(0, 16)}`,
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
    console.log(`Feed ${feed.name}: returning ${items.length} ME items`);
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
    const results = await Promise.allSettled(RSS_FEEDS.map(fetchFeed));
    const allNews: NewsItem[] = [];
    for (const result of results) {
      if (result.status === 'fulfilled') allNews.push(...result.value);
    }
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
