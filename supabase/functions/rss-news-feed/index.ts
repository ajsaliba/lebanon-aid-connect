import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface FeedSource {
  name: string;
  url: string;
  sourceLabel: string;
  category?: string; // optional hint for feed type
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

// ── Core News Feeds (Middle East war 2026 focused) ──
const CORE_FEEDS: FeedSource[] = [
  { name: 'aljazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml', sourceLabel: 'Al Jazeera' },
  { name: 'france24_me', url: 'https://www.france24.com/en/middle-east/rss', sourceLabel: 'France 24' },
  { name: 'middleeasteye', url: 'https://www.middleeasteye.net/rss', sourceLabel: 'Middle East Eye' },
  { name: 'bbc', url: 'https://feeds.bbci.co.uk/news/world/middle_east/rss.xml', sourceLabel: 'BBC' },
  { name: 'mtv', url: 'https://www.mtv.com.lb/RSS/AllNews', sourceLabel: 'MTV Lebanon' },
  { name: 'lbci', url: 'https://www.lbcgroup.tv/feed/rss/news/en', sourceLabel: 'LBCI' },
  { name: 'naharnet', url: 'http://www.naharnet.com/stories/en/rss.xml', sourceLabel: 'Naharnet' },
  { name: 'dailystar', url: 'https://www.dailystar.com.lb/RSS.aspx', sourceLabel: 'Daily Star' },
  { name: 'alarabiya', url: 'https://english.alarabiya.net/tools/rss', sourceLabel: 'Al Arabiya' },
  { name: 'arabnews', url: 'https://www.arabnews.com/rss.xml', sourceLabel: 'Arab News' },
];

// ── Wire Services ──
const WIRE_FEEDS: FeedSource[] = [
  { name: 'reuters_me', url: 'https://news.google.com/rss/search?q=Reuters+middle+east+war+2026+OR+Lebanon+OR+Gaza+OR+Iran+airstrike&hl=en&gl=US&ceid=US:en', sourceLabel: 'Reuters' },
  { name: 'ap_me', url: 'https://news.google.com/rss/search?q=AP+News+middle+east+war+2026+OR+Lebanon+ceasefire+OR+Gaza+offensive&hl=en&gl=US&ceid=US:en', sourceLabel: 'AP News' },
  { name: 'afp_me', url: 'https://news.google.com/rss/search?q=AFP+middle+east+war+2026+OR+Lebanon+OR+Gaza+OR+Iran&hl=en&gl=US&ceid=US:en', sourceLabel: 'AFP' },
];

// ── Think Tanks (Middle East conflict analysis) ──
const THINK_TANK_FEEDS: FeedSource[] = [
  { name: 'brookings_me', url: 'https://www.brookings.edu/topic/middle-east-north-africa/feed/', sourceLabel: 'Brookings' },
  { name: 'carnegie_me', url: 'https://carnegieendowment.org/publications/rss?lang=en&topic=5', sourceLabel: 'Carnegie' },
  { name: 'crisisgroup', url: 'https://www.crisisgroup.org/middle-east-north-africa/feed', sourceLabel: 'Crisis Group' },
];

// ── Podcasts (conflict-analysis) ──
const PODCAST_FEEDS: FeedSource[] = [
  { name: 'podcast_war_on_rocks', url: 'https://warontherocks.com/feed/podcast/', sourceLabel: '🎙 War on the Rocks', category: 'podcast' },
];

// ── Government & Official Sources ──
const GOVERNMENT_FEEDS: FeedSource[] = [
  { name: 'un_news_me', url: 'https://news.un.org/feed/subscribe/en/news/region/middle-east/feed/rss.xml', sourceLabel: 'UN News' },
  { name: 'gov_press', url: 'https://news.google.com/rss/search?q=site:gov.lb+OR+site:un.org+OR+site:state.gov+Lebanon+war+2026+OR+Gaza+ceasefire+2026&hl=en&gl=US&ceid=US:en', sourceLabel: 'Gov Press' },
];

// ── YouTube Channels ──
const YOUTUBE_FEEDS: FeedSource[] = [
  { name: 'yt_aljazeeraeng', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCNye-wNBqNL5ZzHSJj3l8Bg', sourceLabel: '▶ Al Jazeera YT' },
  { name: 'yt_bbc_news', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC16niRr50-MSBwiO3YDb3RA', sourceLabel: '▶ BBC News YT' },
];

// ── Reddit Subreddits ──
const REDDIT_FEEDS: FeedSource[] = [
  { name: 'reddit_lebanon', url: 'https://www.reddit.com/r/lebanon/top/.rss?t=day', sourceLabel: 'r/lebanon' },
  { name: 'reddit_worldnews', url: 'https://www.reddit.com/r/worldnews/search/.rss?q=lebanon+OR+gaza+OR+hezbollah+OR+iran+war+2026&sort=new&restrict_sr=on&t=day', sourceLabel: 'r/worldnews' },
  { name: 'reddit_me', url: 'https://www.reddit.com/r/MiddleEastNews/top/.rss?t=day', sourceLabel: 'r/MiddleEastNews' },
];

// ── Google News aggregation (2026 war focused) ──
const GOOGLE_FEEDS: FeedSource[] = [
  { name: 'google_me_war', url: 'https://news.google.com/rss/search?q=middle+east+war+2026+airstrike+OR+conflict+OR+ceasefire&hl=en&gl=US&ceid=US:en', sourceLabel: 'Google News' },
  { name: 'google_lebanon', url: 'https://news.google.com/rss/search?q=Lebanon+war+2026+OR+Beirut+airstrike+OR+Hezbollah+ceasefire&hl=en&gl=US&ceid=US:en', sourceLabel: 'Google News' },
  { name: 'google_gaza', url: 'https://news.google.com/rss/search?q=Gaza+war+2026+OR+Hamas+OR+Palestine+ceasefire+OR+Israel+offensive&hl=en&gl=US&ceid=US:en', sourceLabel: 'Google News' },
  { name: 'google_iran', url: 'https://news.google.com/rss/search?q=Iran+war+2026+OR+Iran+military+strikes+OR+IRGC+attack&hl=en&gl=US&ceid=US:en', sourceLabel: 'Google News' },
  { name: 'google_syria_yemen', url: 'https://news.google.com/rss/search?q=Syria+war+2026+OR+Yemen+Houthi+attack+2026+OR+Iraq+militia&hl=en&gl=US&ceid=US:en', sourceLabel: 'Google News' },
];

// ── Arabic News (2026 war focused) ──
const ARABIC_FEEDS: FeedSource[] = [
  { name: 'google_ar_lebanon', url: 'https://news.google.com/rss/search?q=لبنان+حرب+2026+OR+غارة+OR+حزب+الله&hl=ar&gl=LB&ceid=LB:ar', sourceLabel: 'أخبار عربية' },
  { name: 'google_ar_gaza', url: 'https://news.google.com/rss/search?q=غزة+حرب+2026+OR+فلسطين+OR+حماس&hl=ar&gl=SA&ceid=SA:ar', sourceLabel: 'أخبار عربية' },
];

// All built-in feeds combined
const RSS_FEEDS: FeedSource[] = [
  ...CORE_FEEDS,
  ...WIRE_FEEDS,
  ...THINK_TANK_FEEDS,
  ...PODCAST_FEEDS,
  ...GOVERNMENT_FEEDS,
  ...YOUTUBE_FEEDS,
  ...REDDIT_FEEDS,
  ...GOOGLE_FEEDS,
  ...ARABIC_FEEDS,
];

// ME-focused feed names (skip ME keyword filter)
const ME_FOCUSED_FEEDS = new Set([
  'france24_me', 'middleeasteye', 'bbc', 'mtv', 'lbci', 'naharnet', 'dailystar', 'alarabiya', 'arabnews',
  'google_me_war', 'google_lebanon', 'google_gaza', 'google_iran', 'google_syria_yemen',
  'un_news_me', 'gov_press', 'afp_me',
  'reddit_lebanon', 'reddit_worldnews', 'reddit_me',
  'brookings_me', 'carnegie_me', 'chatham_me', 'crisisgroup',
  'google_ar_lebanon', 'google_ar_gaza', 'google_ar_me',
  'yt_aljazeeraeng', 'yt_bbc_news', 'yt_france24', 'yt_wion',
  'podcast_bbc_newshour', 'podcast_war_on_rocks',
]);

const ME_KEYWORDS = [
  'lebanon', 'lebanese', 'beirut', 'hezbollah', 'sidon', 'tyre', 'baalbek', 'nabatieh', 'bekaa', 'dahiyeh',
  'israel', 'israeli', 'idf', 'tel aviv', 'jerusalem', 'netanyahu', 'gaza', 'palestine', 'palestinian', 'hamas', 'west bank',
  'iran', 'iranian', 'tehran', 'isfahan', 'irgc', 'khamenei',
  'syria', 'syrian', 'damascus', 'aleppo', 'assad',
  'yemen', 'yemeni', 'sanaa', 'houthi',
  'iraq', 'iraqi', 'baghdad', 'basra',
  'middle east', 'ceasefire', 'airstrike', 'missile',
  'لبنان', 'غزة', 'فلسطين', 'إيران', 'سوريا', 'اليمن', 'حزب الله', 'حماس',
];

const HIGH_KEYWORDS = ['airstrike', 'bomb', 'bombing', 'killed', 'dead', 'death', 'massacre', 'attack', 'strike', 'explosion', 'casualties', 'shelling', 'missile', 'genocide'];
const ELEVATED_KEYWORDS = ['ceasefire', 'tensions', 'escalation', 'warning', 'threat', 'sanctions', 'troops', 'military', 'evacuation', 'displacement', 'crisis', 'emergency'];
const CONFLICT_KEYWORDS = ['airstrike', 'bomb', 'attack', 'military', 'strike', 'combat', 'war', 'missile', 'shelling', 'offensive', 'troops', 'invasion'];
const HUMANITARIAN_KEYWORDS = ['aid', 'humanitarian', 'refugee', 'displaced', 'unhcr', 'red cross', 'relief', 'unicef', 'food', 'shelter', 'evacuation', 'famine'];
const POLITICAL_KEYWORDS = ['ceasefire', 'negotiation', 'un', 'summit', 'diplomatic', 'sanctions', 'resolution', 'government', 'election', 'parliament', 'treaty'];
const INFRASTRUCTURE_KEYWORDS = ['hospital', 'school', 'bridge', 'power', 'water', 'infrastructure', 'building', 'road', 'electricity'];

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  'beirut': { lat: 33.8938, lng: 35.5018 }, 'tripoli': { lat: 34.4333, lng: 35.8333 },
  'sidon': { lat: 33.5594, lng: 35.3717 }, 'tyre': { lat: 33.2721, lng: 35.2033 },
  'baalbek': { lat: 34.0047, lng: 36.2110 }, 'nabatieh': { lat: 33.3633, lng: 35.4717 },
  'dahiyeh': { lat: 33.8547, lng: 35.4900 }, 'jounieh': { lat: 33.9806, lng: 35.6178 },
  'byblos': { lat: 34.1236, lng: 35.6511 }, 'zahle': { lat: 33.8463, lng: 35.9020 },
  'bekaa': { lat: 33.8463, lng: 35.9020 },
  'tel aviv': { lat: 32.0853, lng: 34.7818 }, 'jerusalem': { lat: 31.7683, lng: 35.2137 },
  'gaza': { lat: 31.5017, lng: 34.4668 }, 'haifa': { lat: 32.7940, lng: 34.9896 },
  'west bank': { lat: 31.9522, lng: 35.2332 }, 'rafah': { lat: 31.2969, lng: 34.2455 },
  'khan younis': { lat: 31.3462, lng: 34.3065 }, 'nablus': { lat: 32.2211, lng: 35.2544 },
  'damascus': { lat: 33.5138, lng: 36.2765 }, 'aleppo': { lat: 36.2021, lng: 37.1343 },
  'homs': { lat: 34.7324, lng: 36.7137 }, 'idlib': { lat: 35.9306, lng: 36.6339 },
  'deir ez-zor': { lat: 35.3359, lng: 40.1408 },
  'tehran': { lat: 35.6892, lng: 51.3890 }, 'isfahan': { lat: 32.6546, lng: 51.6680 },
  'tabriz': { lat: 38.0800, lng: 46.2919 }, 'shiraz': { lat: 29.5918, lng: 52.5837 },
  'mashhad': { lat: 36.2605, lng: 59.6168 }, 'najafabad': { lat: 32.6342, lng: 51.3668 },
  'bandar abbas': { lat: 27.1865, lng: 56.2808 },
  'sanaa': { lat: 15.3694, lng: 44.1910 }, 'aden': { lat: 12.7855, lng: 45.0187 },
  'hodeidah': { lat: 14.7980, lng: 42.9511 }, 'marib': { lat: 15.4543, lng: 45.3220 },
  'baghdad': { lat: 33.3152, lng: 44.3661 }, 'basra': { lat: 30.5085, lng: 47.7804 },
  'mosul': { lat: 36.3566, lng: 43.1593 }, 'erbil': { lat: 36.1912, lng: 44.0119 },
  'kirkuk': { lat: 35.4681, lng: 44.3922 },
  'lebanon': { lat: 33.8547, lng: 35.8623 }, 'israel': { lat: 31.0461, lng: 34.8516 },
  'palestine': { lat: 31.9522, lng: 35.2332 }, 'iran': { lat: 32.4279, lng: 53.6880 },
  'syria': { lat: 34.8021, lng: 38.9968 }, 'yemen': { lat: 15.5527, lng: 48.5164 },
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
  const infraScore = INFRASTRUCTURE_KEYWORDS.filter(k => lower.includes(k)).length;
  const humanScore = HUMANITARIAN_KEYWORDS.filter(k => lower.includes(k)).length;
  const politicalScore = POLITICAL_KEYWORDS.filter(k => lower.includes(k)).length;
  const conflictScore = CONFLICT_KEYWORDS.filter(k => lower.includes(k)).length;
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
  // Support both <item> (RSS) and <entry> (Atom/YouTube)
  const itemRegex = /<(?:item|entry)[^>]*>([\s\S]*?)<\/(?:item|entry)>/gi;
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
    // Atom uses <link href="..."/> instead of <link>...</link>
    const getLink = (): string => {
      const link = getTag('link');
      if (link) return link;
      const hrefMatch = block.match(/<link[^>]*href=["']([^"']+)["'][^>]*\/?>/i);
      return hrefMatch ? hrefMatch[1] : '';
    };
    const title = stripHtml(getTag('title'));
    const description = stripHtml(getTag('description') || getTag('summary') || getTag('media:description') || getTag('content'));
    const link = getLink();
    const pubDate = getTag('pubDate') || getTag('published') || getTag('updated');
    if (title) items.push({ title, description, link, pubDate });
  }
  return items;
}

// Simple content hash for dedup (normalized title)
async function contentHash(title: string, summary: string): Promise<string> {
  const normalized = `${title.toLowerCase().replace(/[^a-z0-9]/g, '')}${summary.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 100)}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
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
        'Accept': 'application/rss+xml, application/xml, application/atom+xml, text/xml, */*',
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
      const meFocused = ME_FOCUSED_FEEDS.has(feed.name) || feed.name.startsWith('custom_');
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

// In-memory cache (60s TTL)
let cachedResponse: { data: string; timestamp: number } | null = null;
const CACHE_TTL = 60_000;

// Rate limiting (per IP, 30 req/min)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 30;
const RATE_WINDOW = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  entry.count++;
  return entry.count <= RATE_LIMIT;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limiting
  const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!checkRateLimit(clientIP)) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded', news: [] }), {
      status: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '60' },
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const url = new URL(req.url);
  const mode = url.searchParams.get('mode');
  const retentionDays = parseInt(url.searchParams.get('retention') || '0');
  const userId = url.searchParams.get('user_id');

  // Retention cleanup
  if (retentionDays > 0) {
    const cutoff = new Date(Date.now() - retentionDays * 86400000).toISOString();
    await supabase.from('articles').delete().lt('published_at', cutoff);
    console.log(`Cleaned articles older than ${retentionDays} days`);
  }

  // History mode: return stored articles from DB
  if (mode === 'history') {
    const category = url.searchParams.get('category');
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '500'), 1000);

    let query = supabase
      .from('articles')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(limit);

    if (category) query = query.eq('category', category);
    if (from) query = query.gte('published_at', from);
    if (to) query = query.lte('published_at', to);

    const { data, error } = await query;
    if (error) {
      console.error('DB query error:', error);
      return new Response(JSON.stringify({ error: 'Failed to query articles', news: [] }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const news: NewsItem[] = (data || []).map(row => ({
      id: row.external_id,
      title: row.title,
      summary: row.summary || '',
      source: row.source,
      url: row.url || '',
      publishedAt: row.published_at,
      severity: row.severity as NewsItem['severity'],
      category: row.category as NewsItem['category'],
      lat: row.lat ?? undefined,
      lng: row.lng ?? undefined,
    }));

    return new Response(JSON.stringify({
      news,
      fetchedAt: new Date().toISOString(),
      totalItems: news.length,
      source: 'database',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Live mode: check cache first (skip cache if user has custom feeds)
  if (!userId && cachedResponse && Date.now() - cachedResponse.timestamp < CACHE_TTL) {
    console.log('Returning cached response');
    return new Response(cachedResponse.data, {
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Cache': 'HIT' },
    });
  }

  try {
    // Build feed list: built-in + user custom feeds
    const allFeeds = [...RSS_FEEDS];

    if (userId) {
      const { data: customFeeds } = await supabase
        .from('custom_feeds')
        .select('*')
        .eq('user_id', userId)
        .eq('enabled', true);

      if (customFeeds) {
        for (const cf of customFeeds) {
          allFeeds.push({
            name: `custom_${cf.id.slice(0, 8)}`,
            url: cf.url,
            sourceLabel: cf.source_label,
          });
        }
        console.log(`Added ${customFeeds.length} custom feeds for user`);
      }
    }

    const results = await Promise.allSettled(allFeeds.map(fetchFeed));
    const allNews: NewsItem[] = [];
    for (const result of results) {
      if (result.status === 'fulfilled') allNews.push(...result.value);
    }

    // Content-hash dedup
    const dedupMap = new Map<string, NewsItem>();
    for (const item of allNews) {
      const hash = await contentHash(item.title, item.summary);
      if (!dedupMap.has(hash)) {
        dedupMap.set(hash, item);
      }
    }
    const deduped = Array.from(dedupMap.values());
    deduped.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    // Persist to database (upsert by content_hash)
    const dbRows = [];
    for (const [hash, item] of dedupMap.entries()) {
      dbRows.push({
        external_id: item.id,
        content_hash: hash,
        title: item.title,
        summary: item.summary || null,
        source: item.source,
        url: item.url || null,
        published_at: item.publishedAt,
        severity: item.severity,
        category: item.category,
        lat: item.lat ?? null,
        lng: item.lng ?? null,
      });
    }

    if (dbRows.length > 0) {
      for (let i = 0; i < dbRows.length; i += 100) {
        const chunk = dbRows.slice(i, i + 100);
        const { error } = await supabase
          .from('articles')
          .upsert(chunk, { onConflict: 'content_hash', ignoreDuplicates: true });
        if (error) console.warn('DB upsert error:', error.message);
      }
      console.log(`Persisted ${dbRows.length} articles to database`);
    }

    const responseBody = JSON.stringify({
      news: deduped,
      fetchedAt: new Date().toISOString(),
      sourcesQueried: allFeeds.length,
      totalItems: deduped.length,
    });

    // Only cache if no custom feeds (shared cache)
    if (!userId) {
      cachedResponse = { data: responseBody, timestamp: Date.now() };
    }

    return new Response(responseBody, {
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Cache': 'MISS' },
    });
  } catch (err) {
    console.error('RSS feed error:', err);
    return new Response(JSON.stringify({ error: 'Failed to fetch news feeds', news: [] }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
