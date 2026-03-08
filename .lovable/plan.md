

# Live RSS News Feeds Integration

Replace mock news data with live RSS feeds from Al Jazeera, LBC, Al Arabiya, France 24, and other Middle East news sources. No API key required.

## Architecture

```text
RSS Sources (Al Jazeera, Al Arabiya, LBC, etc.)
         │
         ▼
  Supabase Edge Function (proxy + XML parser)
         │
         ▼
  React Frontend (polling every 2-5 min)
```

## What gets built

### 1. Edge Function: `rss-news-feed`
- Fetches RSS/XML feeds from multiple sources in parallel:
  - Al Jazeera English: `https://www.aljazeera.com/xml/rss/all.xml`
  - Al Arabiya English: `https://english.alarabiya.net/tools/rss`
  - France 24 Middle East: `https://www.france24.com/en/middle-east/rss`
  - Reuters Middle East: `https://www.reutersagency.com/feed/`
  - LBC (Lebanese Broadcasting): scrape their RSS endpoint
- Parses XML to JSON, normalizes into the existing `NewsItem` interface
- Filters for Lebanon/Middle East keywords
- Returns merged, deduplicated, time-sorted results
- CORS headers for browser access

### 2. Custom React hook: `useNewsFeeds`
- Calls the edge function via `supabase.functions.invoke('rss-news-feed')`
- Polls every 3 minutes for fresh data
- Falls back to mock data if the edge function fails
- Returns `{ news, isLoading, error, lastUpdated }`

### 3. Update existing components
- **NewsFeed.tsx**: Use `useNewsFeeds()` instead of `mockNews`, show loading skeleton, display source logos and real timestamps
- **AlertTicker.tsx**: Use live high-severity news items from the hook
- **CrisisMap.tsx**: Use geotagged live news for the news layer markers
- **StatusBar.tsx**: Show "Last updated" timestamp from the feed

### 4. Supabase Cloud setup
- Needs Lovable Cloud enabled to deploy the edge function
- No secrets needed (RSS is public)

## Technical details

- XML parsing in Deno uses the built-in `DOMParser` or a lightweight XML parser
- Each RSS item gets mapped to: `{ id, title, summary, source, url, publishedAt, severity, category }`
- Severity auto-assigned by keyword matching (airstrike/bomb → high, ceasefire/aid → monitoring)
- Category auto-assigned similarly (military → conflict, UN/aid → humanitarian, etc.)
- Geo-coding: some feeds include coordinates; otherwise approximate from known Lebanon city names in titles

