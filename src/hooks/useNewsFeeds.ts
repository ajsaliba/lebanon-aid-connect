import { useState, useEffect, useCallback, useRef } from 'react';
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

  const fetchNews = useCallback(async () => {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/rss-news-feed`, {
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

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (pollInterval > 0) {
      intervalRef.current = setInterval(fetchNews, pollInterval);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [fetchNews, pollInterval]);

  return { news, isLoading, error, lastUpdated, isLive, refetch: fetchNews, pollInterval, setPollInterval };
}
