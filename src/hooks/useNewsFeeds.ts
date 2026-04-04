import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { mockNews, type NewsItem } from '@/data/mockData';
import { readNewsBootstrap, writeNewsBootstrap } from '@/lib/bootstrap/runtimeCache';

type ConnectivityState = 'live' | 'cached' | 'unavailable';
type BootstrapPhase = 'fast' | 'slow' | 'ready';

interface NewsFeedResult {
  news: NewsItem[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  isLive: boolean;
  refetch: () => void;
  pollInterval: number;
  setPollInterval: (ms: number) => void;
  loadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
  connectivityState: ConnectivityState;
  cacheAgeMs: number | null;
  bootstrapPhase: BootstrapPhase;
}

const PAGE_SIZE = 500;
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const FAST_CACHE_MAX_AGE_MS = 5 * 60 * 1000;
const STALE_CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

interface CacheReadResult {
  news: NewsItem[];
  lastUpdated: Date | null;
  ageMs: number;
}

interface ArticleRow {
  external_id: string;
  title: string;
  summary: string | null;
  source: string;
  url: string | null;
  published_at: string;
  severity: NewsItem['severity'];
  category: NewsItem['category'];
  lat: number | null;
  lng: number | null;
}

function mapArticleRow(row: ArticleRow): NewsItem {
  return {
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
  };
}

/** Fire-and-forget: trigger the edge function to ingest new RSS articles into DB */
function triggerIngestion() {
  const url = `${SUPABASE_URL}/functions/v1/rss-news-feed?mode=ingest`;
  fetch(url, {
    method: 'GET',
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
  }).catch(() => { /* silent – ingestion is best-effort */ });
}

export function useNewsFeeds(): NewsFeedResult {
  const initialCache = (readNewsBootstrap(FAST_CACHE_MAX_AGE_MS) ?? readNewsBootstrap(STALE_CACHE_MAX_AGE_MS)) as CacheReadResult | null;

  const [news, setNews] = useState<NewsItem[]>(initialCache?.news ?? mockNews);
  const [isLoading, setIsLoading] = useState(!initialCache);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(initialCache?.lastUpdated ?? null);
  const [isLive, setIsLive] = useState(false);
  const [pollInterval, setPollInterval] = useState(60 * 1000);
  const [hasMore, setHasMore] = useState(true);
  const [connectivityState, setConnectivityState] = useState<ConnectivityState>(initialCache ? 'cached' : 'unavailable');
  const [cacheAgeMs, setCacheAgeMs] = useState<number | null>(initialCache?.ageMs ?? null);
  const [bootstrapPhase, setBootstrapPhase] = useState<BootstrapPhase>(initialCache ? 'fast' : 'slow');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cursorRef = useRef<string | null>(null);

  /** Fetch articles from DB directly via Supabase SDK */
  const fetchFromDB = useCallback(async (loadMore = false) => {
    try {
      if (loadMore) setIsLoadingMore(true);

      let query = supabase
        .from('articles')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(PAGE_SIZE);

      if (loadMore && cursorRef.current) {
        query = query.lt('published_at', cursorRef.current);
      }

      const { data, error: dbError } = await query;

      if (dbError) throw dbError;

      const rows = (data ?? []) as ArticleRow[];

      if (rows.length > 0) {
        const mapped: NewsItem[] = rows.map(mapArticleRow);

        // Update cursor to last item for pagination
        cursorRef.current = rows[rows.length - 1].published_at;
        setHasMore(rows.length === PAGE_SIZE);

        if (loadMore) {
          setNews(prev => {
            const existingIds = new Set(prev.map(n => n.id));
            const newItems = mapped.filter(n => !existingIds.has(n.id));
            const next = [...prev, ...newItems];
            writeNewsBootstrap(next, new Date());
            return next;
          });
        } else {
          setNews(mapped);
          writeNewsBootstrap(mapped, new Date());
        }

        setLastUpdated(new Date());
        setIsLive(true);
        setConnectivityState('live');
        setCacheAgeMs(0);
        setBootstrapPhase('ready');
        setError(null);
      } else if (!loadMore) {
        const staleCache = readNewsBootstrap(STALE_CACHE_MAX_AGE_MS) as CacheReadResult | null;

        if (staleCache) {
          setNews(staleCache.news);
          setLastUpdated(staleCache.lastUpdated);
          setCacheAgeMs(staleCache.ageMs);
          setConnectivityState('cached');
          setIsLive(false);
          setError('No fresh articles in database; showing cached payload');
        } else {
          // No articles in DB at all – keep mock data
          setIsLive(false);
          setConnectivityState('unavailable');
          setError('No articles in database yet');
          setHasMore(false);
        }

        setBootstrapPhase('ready');
      }
    } catch (err) {
      console.warn('Failed to fetch from DB:', err);
      if (!loadMore) {
        const staleCache = readNewsBootstrap(STALE_CACHE_MAX_AGE_MS) as CacheReadResult | null;
        if (staleCache) {
          setNews(staleCache.news);
          setLastUpdated(staleCache.lastUpdated);
          setCacheAgeMs(staleCache.ageMs);
          setError('Using cached data (stale fallback)');
          setConnectivityState('cached');
          setIsLive(false);
        } else {
          setError('Using fallback data');
          setConnectivityState('unavailable');
          setIsLive(false);
          setNews(mockNews);
        }
        setBootstrapPhase('ready');
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  const refetch = useCallback(() => {
    cursorRef.current = null;
    setHasMore(true);
    fetchFromDB(false);
    triggerIngestion();
  }, [fetchFromDB]);

  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      fetchFromDB(true);
    }
  }, [fetchFromDB, isLoadingMore, hasMore]);

  // Two-tier bootstrap: fast cache hydration then slow network reconciliation.
  useEffect(() => {
    const freshCache = readNewsBootstrap(FAST_CACHE_MAX_AGE_MS) as CacheReadResult | null;
    const staleCache = readNewsBootstrap(STALE_CACHE_MAX_AGE_MS) as CacheReadResult | null;
    const cacheToUse = freshCache ?? staleCache;

    if (cacheToUse) {
      setNews(cacheToUse.news);
      setLastUpdated(cacheToUse.lastUpdated);
      setCacheAgeMs(cacheToUse.ageMs);
      setConnectivityState('cached');
      setBootstrapPhase('fast');
      setIsLoading(false);
    }

    setBootstrapPhase('slow');
    fetchFromDB(false);
    triggerIngestion();
  }, [fetchFromDB]);

  // Polling: re-query DB on interval
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (pollInterval > 0) {
      intervalRef.current = setInterval(() => {
        if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
        if (typeof navigator !== 'undefined' && !navigator.onLine) return;
        // Reset cursor to get latest articles
        cursorRef.current = null;
        fetchFromDB(false);
      }, pollInterval);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [fetchFromDB, pollInterval]);

  // Realtime: listen for new articles via Supabase Realtime
  useEffect(() => {
    const channel = supabase
      .channel('articles-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'articles' },
        (payload) => {
          const row = payload.new as ArticleRow;
          const newItem: NewsItem = mapArticleRow(row);
          setNews(prev => {
            if (prev.some(n => n.id === newItem.id)) return prev;
            const updated = [newItem, ...prev];
            updated.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
            writeNewsBootstrap(updated, new Date());
            return updated;
          });
          setLastUpdated(new Date());
          setIsLive(true);
          setConnectivityState('live');
          setCacheAgeMs(0);
          setBootstrapPhase('ready');
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Background sync on tab visibility
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        cursorRef.current = null;
        fetchFromDB(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [fetchFromDB]);

  useEffect(() => {
    const handleOnline = () => {
      cursorRef.current = null;
      fetchFromDB(false);
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [fetchFromDB]);

  return {
    news,
    isLoading,
    error,
    lastUpdated,
    isLive,
    refetch,
    pollInterval,
    setPollInterval,
    loadMore,
    hasMore,
    isLoadingMore,
    connectivityState,
    cacheAgeMs,
    bootstrapPhase,
  };
}
