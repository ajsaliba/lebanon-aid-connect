import { useState, useEffect, useRef } from 'react';
import { computeHotspotScores, type HotspotScore } from '@/config/hotspots';
import { type NewsItem } from '@/data/mockData';

const MAX_HISTORY = 30; // Keep last 30 data points

/**
 * Track hotspot escalation scores over time (sampled every poll cycle).
 * Returns the current scores and a history map for sparkline rendering.
 */
export function useEscalationHistory(news: NewsItem[]) {
  const [historyMap, setHistoryMap] = useState<Map<string, number[]>>(new Map());
  const [scores, setScores] = useState<HotspotScore[]>([]);
  const prevNewsLengthRef = useRef(0);

  useEffect(() => {
    const currentScores = computeHotspotScores(news);
    setScores(currentScores);

    // Only add a data point when news changes (new articles arrived)
    if (news.length !== prevNewsLengthRef.current) {
      prevNewsLengthRef.current = news.length;

      setHistoryMap(prev => {
        const next = new Map(prev);
        for (const hs of currentScores) {
          const existing = next.get(hs.hotspot.id) || [];
          const updated = [...existing, hs.score].slice(-MAX_HISTORY);
          next.set(hs.hotspot.id, updated);
        }
        return next;
      });
    }
  }, [news]);

  return { scores, historyMap };
}
