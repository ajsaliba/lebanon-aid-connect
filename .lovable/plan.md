

## Problem Analysis

The edge function fetches **107 RSS sources** and returns **2,218 articles** in a single JSON response. This is unreliable because:
- The function may timeout trying to scrape all feeds before responding
- The response body is several MB of JSON, causing slow/failed parsing
- When it fails, the client falls back to mock data (6 items) -- explaining the low count

Meanwhile, all 2,221 articles are already **persisted in the `articles` database table** on every successful fetch. The client should read from the database directly instead of depending on the edge function's response.

## Plan

### 1. Change client to read articles from database directly

Rewrite `useNewsFeeds.ts` to:
- **Primary data source**: Query `articles` table via Supabase SDK with `.select('*').order('published_at', { ascending: false }).limit(2000)`
- **Background refresh**: Fire-and-forget call to the edge function (no `await` on response) to trigger RSS ingestion
- **Incremental polling**: On poll intervals, re-query the DB rather than re-calling the edge function
- Keep Realtime subscription for instant new article pushes

### 2. Update edge function to respond fast, ingest in background

Modify `rss-news-feed/index.ts`:
- When called without `mode=history`, immediately return a lightweight `{ status: 'ingesting', sourcesQueried: 107 }` response
- Continue RSS fetching and DB persistence in the background (using `waitUntil` pattern or just fire-and-forget promises after response)
- OR: Keep current behavior but add a `mode=quick` that just returns cached/DB articles without re-fetching RSS

### 3. Add pagination support

- Initial load: fetch latest 500 articles from DB
- "Load more" or infinite scroll: fetch next batch using cursor (`published_at < lastItem.publishedAt`)
- Virtual scrolling already handles rendering 1000+ items efficiently

### Summary of changes

| File | Change |
|------|--------|
| `src/hooks/useNewsFeeds.ts` | Read from `articles` table via Supabase SDK; fire-and-forget edge function call for ingestion |
| `supabase/functions/rss-news-feed/index.ts` | Add early response mode; keep ingestion logic |
| `src/components/NewsFeed.tsx` | Add "Load more" button or auto-pagination at scroll end |

