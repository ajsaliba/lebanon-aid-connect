import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { mockNews, type NewsItem } from '@/data/mockData';

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
}

const PAGE_SIZE = 500;
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/** Fire-and-forget: trigger the edge function to ingest new RSS articles into DB */
function triggerIngestion() {
  const url = `${SUPABASE_URL}/functions/v1/rss-news-feed?mode=ingest`;
  fetch(url, {
    method: 'GET',
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
  }).catch(() => { /* silent – ingestion is best-effort */ });
}

export function useNewsFeeds(): NewsFeedResult {
  const [news, setNews] = useState<NewsItem[]>(mockNews);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [pollInterval, setPollInterval] = useState(60 * 1000);
  const [hasMore, setHasMore] = useState(true);
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

      if (data && data.length > 0) {
        const mapped: NewsItem[] = data.map(row => ({
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

        // Update cursor to last item for pagination
        cursorRef.current = data[data.length - 1].published_at;
        setHasMore(data.length === PAGE_SIZE);

        if (loadMore) {
          setNews(prev => {
            const existingIds = new Set(prev.map(n => n.id));
            const newItems = mapped.filter(n => !existingIds.has(n.id));
            return [...prev, ...newItems];
          });
        } else {
          setNews(mapped);
        }

        setLastUpdated(new Date());
        setIsLive(true);
        setError(null);
      } else if (!loadMore) {
        // No articles in DB at all – keep mock data
        setIsLive(false);
        setError('No articles in database yet');
        setHasMore(false);
      }
    } catch (err) {
      console.warn('Failed to fetch from DB:', err);
      if (!loadMore) {
        setError('Using cached data');
        setIsLive(false);
        setNews(mockNews);
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

  // Initial fetch + trigger ingestion
  useEffect(() => {
    fetchFromDB(false);
    triggerIngestion();
  }, [fetchFromDB]);

  // Polling: re-query DB on interval
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (pollInterval > 0) {
      intervalRef.current = setInterval(() => {
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
          const row = payload.new as any;
          const newItem: NewsItem = {
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
          setNews(prev => {
            if (prev.some(n => n.id === newItem.id)) return prev;
            const updated = [newItem, ...prev];
            updated.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
            return updated;
          });
          setLastUpdated(new Date());
          setIsLive(true);
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

  return { news, isLoading, error, lastUpdated, isLive, refetch, pollInterval, setPollInterval, loadMore, hasMore, isLoadingMore };
}
