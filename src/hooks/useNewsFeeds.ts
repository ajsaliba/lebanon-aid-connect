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
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export function useNewsFeeds(): NewsFeedResult {
  const [news, setNews] = useState<NewsItem[]>(mockNews);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [pollInterval, setPollInterval] = useState(60 * 1000);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchNews = useCallback(async (retentionDays?: number) => {
    try {
      const params = new URLSearchParams();
      if (retentionDays && retentionDays > 0) params.set('retention', String(retentionDays));
      const url = `${SUPABASE_URL}/functions/v1/rss-news-feed${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      if (data?.news && data.news.length > 0) {
        setNews(data.news);
        setLastUpdated(new Date(data.fetchedAt));
        setIsLive(true);
        setError(null);
      } else {
        setIsLive(false);
        setError('No live data available');
      }
    } catch (err) {
      console.warn('Failed to fetch live news, using mock data:', err);
      setError('Using cached data');
      setIsLive(false);
      setNews(mockNews);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // Polling fallback
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (pollInterval > 0) {
      intervalRef.current = setInterval(fetchNews, pollInterval);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [fetchNews, pollInterval]);

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
            // Deduplicate by id
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

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Background sync: refetch when tab becomes visible
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchNews();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [fetchNews]);

  return { news, isLoading, error, lastUpdated, isLive, refetch: fetchNews, pollInterval, setPollInterval };
}
