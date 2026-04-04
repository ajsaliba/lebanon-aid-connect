import { useEffect, useMemo, useState } from 'react';
import type { NewsItem } from '@/data/mockData';
import { mlWorkerManager } from '@/lib/ml/workerManager';

export interface MlIntelState {
  summary: string;
  sentimentLabel: 'positive' | 'neutral' | 'negative';
  sentimentScore: number;
  semanticMatches: Array<{ id: string; score: number }>;
  riskScore: number;
  riskChannels: string[];
  workerAvailable: boolean;
  loading: boolean;
}

const INITIAL_STATE: MlIntelState = {
  summary: 'No summary generated yet.',
  sentimentLabel: 'neutral',
  sentimentScore: 0,
  semanticMatches: [],
  riskScore: 0,
  riskChannels: [],
  workerAvailable: false,
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
        const workerReady = await mlWorkerManager.initialize();
        if (!workerReady) {
          if (!mounted) return;
          setState(prev => ({
            ...prev,
            loading: false,
            workerAvailable: false,
          }));
          return;
        }

        const headlines = topNews.slice(0, 8).map(item => item.title);
        const combinedText = topNews.slice(0, 12).map(item => `${item.title} ${item.summary}`).join(' ');

        const [summary, sentiment, matches, risk] = await Promise.all([
          mlWorkerManager.summarize(headlines, 9000),
          mlWorkerManager.sentiment(combinedText, 9000),
          mlWorkerManager.semanticSearch('urgent shelter medical corridor', topNews.map(item => ({
            id: item.id,
            text: `${item.title} ${item.summary}`,
          })), 9000),
          mlWorkerManager.riskProfile(combinedText, 9000),
        ]);

        if (!mounted) return;

        setState({
          summary,
          sentimentLabel: sentiment.label,
          sentimentScore: sentiment.score,
          semanticMatches: matches,
          riskScore: risk.riskScore,
          riskChannels: risk.channels,
          workerAvailable: true,
          loading: false,
        });
      } catch {
        if (!mounted) return;
        setState(prev => ({
          ...prev,
          loading: false,
          workerAvailable: false,
        }));
      }
    }

    run();

    return () => {
      mounted = false;
    };
  }, [topNews]);

  return state;
}
