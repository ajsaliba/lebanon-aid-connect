import { createContext, useContext, type ReactNode } from 'react';
import { useNewsFeeds } from '@/hooks/useNewsFeeds';
import { mockNews, type NewsItem } from '@/data/mockData';

interface NewsFeedContextValue {
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
  connectivityState: 'live' | 'cached' | 'unavailable';
  cacheAgeMs: number | null;
  bootstrapPhase: 'fast' | 'slow' | 'ready';
}

const defaultValue: NewsFeedContextValue = {
  news: mockNews,
  isLoading: false,
  error: null,
  lastUpdated: null,
  isLive: false,
  refetch: () => {},
  pollInterval: 60000,
  setPollInterval: () => {},
  loadMore: () => {},
  hasMore: false,
  isLoadingMore: false,
  connectivityState: 'unavailable',
  cacheAgeMs: null,
  bootstrapPhase: 'ready',
};

const NewsFeedContext = createContext<NewsFeedContextValue>(defaultValue);

export function NewsFeedProvider({ children }: { children: ReactNode }) {
  const feedData = useNewsFeeds();
  return (
    <NewsFeedContext.Provider value={feedData}>
      {children}
    </NewsFeedContext.Provider>
  );
}

export function useNewsFeedContext() {
  return useContext(NewsFeedContext);
}
