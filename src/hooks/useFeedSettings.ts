import { useState, useCallback, useEffect } from 'react';

const SETTINGS_KEY = 'cedarsalert_feed_settings';
const MUTED_KEY = 'cedarsalert_muted_keywords';
const READ_HISTORY_KEY = 'cedarsalert_read_history';

export type CardStyle = 'standard' | 'headlines' | 'list';
export type PollFrequency = 15 | 30 | 60 | 0; // 0 = manual

export type RetentionDays = 0 | 7 | 30 | 90; // 0 = keep forever

export interface FeedSettings {
  pollFrequency: PollFrequency;
  defaultCategory: string | null;
  defaultTimeFilter: string;
  cardStyle: CardStyle;
  retentionDays: RetentionDays;
}

const defaultSettings: FeedSettings = {
  pollFrequency: 60,
  defaultCategory: null,
  defaultTimeFilter: 'All',
  cardStyle: 'standard',
  retentionDays: 0,
};

function loadSettings(): FeedSettings {
  try {
    return { ...defaultSettings, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') };
  } catch { return defaultSettings; }
}

function loadSet(key: string): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(key) || '[]')); }
  catch { return new Set(); }
}

export function useFeedSettings() {
  const [settings, setSettings] = useState<FeedSettings>(loadSettings);
  const [mutedKeywords, setMutedKeywords] = useState<Set<string>>(() => loadSet(MUTED_KEY));
  const [readHistory, setReadHistory] = useState<Set<string>>(() => loadSet(READ_HISTORY_KEY));

  const updateSettings = useCallback((partial: Partial<FeedSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...partial };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const addMutedKeyword = useCallback((keyword: string) => {
    const k = keyword.toLowerCase().trim();
    if (!k) return;
    setMutedKeywords(prev => {
      const next = new Set(prev);
      next.add(k);
      localStorage.setItem(MUTED_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  const removeMutedKeyword = useCallback((keyword: string) => {
    setMutedKeywords(prev => {
      const next = new Set(prev);
      next.delete(keyword);
      localStorage.setItem(MUTED_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  const markAsRead = useCallback((id: string) => {
    setReadHistory(prev => {
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem(READ_HISTORY_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  const isRead = useCallback((id: string) => readHistory.has(id), [readHistory]);

  const exportSettings = useCallback(() => {
    const data = {
      settings,
      mutedKeywords: [...mutedKeywords],
      bookmarks: JSON.parse(localStorage.getItem('cedarsalert_bookmarks') || '[]'),
      readingList: JSON.parse(localStorage.getItem('cedarsalert_reading_list') || '[]'),
      searchHistory: JSON.parse(localStorage.getItem('cedarsalert_search_history') || '[]'),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cedarsalert-settings.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [settings, mutedKeywords]);

  const importSettings = useCallback((json: string) => {
    try {
      const data = JSON.parse(json);
      if (data.settings) {
        const merged = { ...defaultSettings, ...data.settings };
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
        setSettings(merged);
      }
      if (data.mutedKeywords) {
        const s = new Set<string>(data.mutedKeywords);
        localStorage.setItem(MUTED_KEY, JSON.stringify([...s]));
        setMutedKeywords(s);
      }
      if (data.bookmarks) localStorage.setItem('cedarsalert_bookmarks', JSON.stringify(data.bookmarks));
      if (data.readingList) localStorage.setItem('cedarsalert_reading_list', JSON.stringify(data.readingList));
      if (data.searchHistory) localStorage.setItem('cedarsalert_search_history', JSON.stringify(data.searchHistory));
      return true;
    } catch { return false; }
  }, []);

  return {
    settings, updateSettings,
    mutedKeywords, addMutedKeyword, removeMutedKeyword,
    readHistory, markAsRead, isRead,
    exportSettings, importSettings,
  };
}
