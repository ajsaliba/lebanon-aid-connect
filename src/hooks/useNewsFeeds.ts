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
}

const POLL_INTERVAL = 3 * 60 * 1000; // 3 minutes

export function useNewsFeeds(): NewsFeedResult {
  const [news, setNews] = useState<NewsItem[]>(mockNews);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLive, setIsLive] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchNews = useCallback(async () => {
    try {
      const { data, error: fnError } = await supabase.functions.invoke('rss-news-feed');

      if (fnError) {
        console.warn('Edge function error, falling back to mock data:', fnError);
        setError('Using cached data');
        setIsLive(false);
        setNews(mockNews);
        return;
      }

      if (data?.news && data.news.length > 0) {
        setNews(data.news);
        setLastUpdated(new Date(data.fetchedAt));
        setIsLive(true);
        setError(null);
      } else {
        // No items returned, keep mock data
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
    intervalRef.current = setInterval(fetchNews, POLL_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchNews]);

  return { news, isLoading, error, lastUpdated, isLive, refetch: fetchNews };
}
