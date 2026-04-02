import { useEffect, useMemo, useState } from 'react';
import type { NewsItem } from '@/data/mockData';
import { mlWorkerManager } from '@/lib/ml/workerManager';

export interface MlIntelState {
  summary: string;
  sentimentLabel: 'positive' | 'neutral' | 'negative';
  sentimentScore: number;
  semanticMatches: Array<{ id: string; score: number }>;
  loading: boolean;
}

const INITIAL_STATE: MlIntelState = {
  summary: 'No summary generated yet.',
  sentimentLabel: 'neutral',
  sentimentScore: 0,
  semanticMatches: [],
  loading: false,
};

export function useMlIntel(news: NewsItem[]) {
  const [state, setState] = useState<MlIntelState>(INITIAL_STATE);

  const topNews = useMemo(() => news.slice(0, 40), [news]);

  useEffect(() => {
    let mounted = true;

    async function run() {
      if (topNews.length === 0) {
        setState(INITIAL_STATE);
        return;
      }

      setState(prev => ({ ...prev, loading: true }));

      try {
        const headlines = topNews.slice(0, 8).map(item => item.title);
        const combinedText = topNews.slice(0, 12).map(item => `${item.title} ${item.summary}`).join(' ');

        const [summary, sentiment, matches] = await Promise.all([
          mlWorkerManager.summarize(headlines),
          mlWorkerManager.sentiment(combinedText),
          mlWorkerManager.semanticSearch('urgent shelter medical corridor', topNews.map(item => ({
            id: item.id,
            text: `${item.title} ${item.summary}`,
          }))),
        ]);

        if (!mounted) return;

        setState({
          summary,
          sentimentLabel: sentiment.label,
          sentimentScore: sentiment.score,
          semanticMatches: matches,
          loading: false,
        });
      } catch {
        if (!mounted) return;
        setState(prev => ({ ...prev, loading: false }));
      }
    }

    run();

    return () => {
      mounted = false;
    };
  }, [topNews]);

  return state;
}
