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
}

const defaultValue: NewsFeedContextValue = {
  news: mockNews,
  isLoading: false,
  error: null,
  lastUpdated: null,
  isLive: false,
  refetch: () => {},
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
