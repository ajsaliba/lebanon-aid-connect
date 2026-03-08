/**
 * Trending Keywords Detection — rolling window keyword analysis with anomaly detection.
 * Compares 2-hour rolling window vs 24h baseline to flag surging terms.
 */

import { useMemo } from 'react';
import { type NewsItem } from '@/data/mockData';
import { sanitizeFeedText } from '@/lib/sanitizeFeedText';

const STOP_WORDS = new Set([
  'the','a','an','and','or','but','in','on','at','to','for','of','with','by','from','is','are','was','were',
  'be','been','being','have','has','had','do','does','did','will','would','could','should','may','might',
  'shall','can','it','its','this','that','these','those','i','you','he','she','we','they','me','him','her',
  'us','them','my','your','his','our','their','what','which','who','whom','how','when','where','why','not',
  'no','nor','so','if','then','than','too','very','just','about','up','out','into','over','after','before',
  'new','says','said','also','more','as','all','any','each','most','other','some','such','news','update',
  'report','reports','according','amid','been','first','one','two','three','people','would','could','latest',
]);

export interface TrendingKeyword {
  word: string;
  /** Count in recent window */
  recentCount: number;
  /** Count in baseline */
  baselineCount: number;
  /** Surge ratio (recent / expected) */
  surgeRatio: number;
  /** Is it a new term not in baseline? */
  isNew: boolean;
}

export function useTrendingKeywords(news: NewsItem[], max = 12): TrendingKeyword[] {
  return useMemo(() => {
    const now = Date.now();
    const twoHours = 2 * 3600000;
    const twentyFourHours = 24 * 3600000;

    const recentNews = news.filter(n => now - new Date(n.publishedAt).getTime() < twoHours);
    const baselineNews = news.filter(n => {
      const age = now - new Date(n.publishedAt).getTime();
      return age >= twoHours && age < twentyFourHours;
    });

    function countWords(articles: NewsItem[]): Record<string, number> {
      const freq: Record<string, number> = {};
      for (const item of articles) {
        const text = sanitizeFeedText(`${item.title} ${item.summary}`).toLowerCase();
        const words = text.split(/[^a-z'-]+/).filter(w => w.length > 3 && !STOP_WORDS.has(w));
        const seen = new Set<string>();
        for (const w of words) {
          if (!seen.has(w)) { seen.add(w); freq[w] = (freq[w] || 0) + 1; }
        }
      }
      return freq;
    }

    const recentFreq = countWords(recentNews);
    const baselineFreq = countWords(baselineNews);

    // Normalize baseline to 2h equivalent
    const baselineHours = Math.max(1, (twentyFourHours - twoHours) / 3600000);
    const recentHours = Math.max(1, twoHours / 3600000);
    const normFactor = recentHours / baselineHours;

    const trending: TrendingKeyword[] = [];

    for (const [word, recentCount] of Object.entries(recentFreq)) {
      if (recentCount < 2) continue;
      const baselineCount = baselineFreq[word] || 0;
      const expectedCount = baselineCount * normFactor;
      const surgeRatio = expectedCount > 0 ? recentCount / expectedCount : recentCount * 5;
      const isNew = baselineCount === 0;

      if (surgeRatio >= 2.0 || isNew) {
        trending.push({ word, recentCount, baselineCount, surgeRatio, isNew });
      }
    }

    return trending
      .sort((a, b) => b.surgeRatio - a.surgeRatio)
      .slice(0, max);
  }, [news, max]);
}
