import { useState, useCallback } from 'react';
import { type NewsItem } from '@/data/mockData';

const BOOKMARKS_KEY = 'cedarsalert_bookmarks';
const READING_LIST_KEY = 'cedarsalert_reading_list';

function loadIds(key: string): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(key) || '[]'));
  } catch { return new Set(); }
}

function saveIds(key: string, ids: Set<string>) {
  localStorage.setItem(key, JSON.stringify([...ids]));
}

export function useBookmarks() {
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => loadIds(BOOKMARKS_KEY));

  const toggleBookmark = useCallback((id: string) => {
    setBookmarkedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      saveIds(BOOKMARKS_KEY, next);
      return next;
    });
  }, []);

  const isBookmarked = useCallback((id: string) => bookmarkedIds.has(id), [bookmarkedIds]);

  return { bookmarkedIds, toggleBookmark, isBookmarked };
}

export function useReadingList() {
  const [readingListIds, setReadingListIds] = useState<Set<string>>(() => loadIds(READING_LIST_KEY));

  const toggleReadingList = useCallback((id: string) => {
    setReadingListIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      saveIds(READING_LIST_KEY, next);
      return next;
    });
  }, []);

  const isInReadingList = useCallback((id: string) => readingListIds.has(id), [readingListIds]);

  return { readingListIds, toggleReadingList, isInReadingList };
}

export function estimateReadTime(text: string): number {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function shareArticle(item: NewsItem, platform: 'copy' | 'twitter' | 'whatsapp' | 'telegram') {
  const text = item.title;
  const url = item.url && item.url !== '#' ? item.url : window.location.href;

  switch (platform) {
    case 'copy':
      navigator.clipboard.writeText(`${text}\n${url}`).catch(() => {});
      return true;
    case 'twitter':
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
      return true;
    case 'whatsapp':
      window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`, '_blank');
      return true;
    case 'telegram':
      window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
      return true;
  }
}
