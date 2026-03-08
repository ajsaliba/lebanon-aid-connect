import { createContext, useContext, type ReactNode } from 'react';
import { useNewsFeeds } from '@/hooks/useNewsFeeds';
import type { NewsItem } from '@/data/mockData';

interface NewsFeedContextValue {
  news: NewsItem[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  isLive: boolean;
  refetch: () => void;
}

const NewsFeedContext = createContext<NewsFeedContextValue | null>(null);

export function NewsFeedProvider({ children }: { children: ReactNode }) {
  const feedData = useNewsFeeds();
  return (
    <NewsFeedContext.Provider value={feedData}>
      {children}
    </NewsFeedContext.Provider>
  );
}

export function useNewsFeedContext() {
  const ctx = useContext(NewsFeedContext);
  if (!ctx) throw new Error('useNewsFeedContext must be used within NewsFeedProvider');
  return ctx;
}
