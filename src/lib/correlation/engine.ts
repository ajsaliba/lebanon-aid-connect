import type { NewsItem } from '@/data/mockData';

export type CorrelationDomain = 'military' | 'escalation' | 'economic' | 'disaster';

export interface CorrelationSignal {
  domain: CorrelationDomain;
  score: number;
  articleId: string;
  source: string;
  timestamp: string;
}

export interface CorrelationCard {
  id: string;
  title: string;
  summary: string;
  confidence: number;
  domains: CorrelationDomain[];
  articleIds: string[];
  generatedAt: string;
}

export interface CorrelationAdapter {
  domain: CorrelationDomain;
  score: (article: NewsItem) => number;
}

const DICTIONARY: Record<CorrelationDomain, string[]> = {
  military: ['airstrike', 'missile', 'drone', 'troop', 'naval', 'artillery', 'strike'],
  escalation: ['retaliation', 'mobilization', 'warning', 'escalation', 'attack', 'threat'],
  economic: ['inflation', 'fuel', 'currency', 'supply', 'market', 'price', 'sanction'],
  disaster: ['flood', 'earthquake', 'storm', 'wildfire', 'outage', 'collapse', 'damage'],
};

function keywordScore(text: string, words: string[]): number {
  const lower = text.toLowerCase();
  let hits = 0;
  for (const word of words) {
    if (lower.includes(word)) hits += 1;
  }
  return Math.min(1, hits / 3);
}

export const DEFAULT_CORRELATION_ADAPTERS: CorrelationAdapter[] = [
  {
    domain: 'military',
    score: article => keywordScore(`${article.title} ${article.summary}`, DICTIONARY.military),
  },
  {
    domain: 'escalation',
    score: article => keywordScore(`${article.title} ${article.summary}`, DICTIONARY.escalation),
  },
  {
    domain: 'economic',
    score: article => keywordScore(`${article.title} ${article.summary}`, DICTIONARY.economic),
  },
  {
    domain: 'disaster',
    score: article => keywordScore(`${article.title} ${article.summary}`, DICTIONARY.disaster),
  },
];

export function buildCorrelationSignals(news: NewsItem[], adapters = DEFAULT_CORRELATION_ADAPTERS): CorrelationSignal[] {
  const recent = news.slice(0, 120);
  const signals: CorrelationSignal[] = [];

  for (const article of recent) {
    for (const adapter of adapters) {
      const score = adapter.score(article);
      if (score < 0.34) continue;

      signals.push({
        domain: adapter.domain,
        score,
        articleId: article.id,
        source: article.source,
        timestamp: article.publishedAt,
      });
    }
  }

  return signals;
}

export function buildCorrelationCards(news: NewsItem[], adapters = DEFAULT_CORRELATION_ADAPTERS): CorrelationCard[] {
  const signals = buildCorrelationSignals(news, adapters);
  if (signals.length === 0) return [];

  const signalsByArticle = new Map<string, CorrelationSignal[]>();
  for (const signal of signals) {
    const existing = signalsByArticle.get(signal.articleId) ?? [];
    existing.push(signal);
    signalsByArticle.set(signal.articleId, existing);
  }

  const cards: CorrelationCard[] = [];
  const generatedAt = new Date().toISOString();

  for (const [articleId, articleSignals] of signalsByArticle.entries()) {
    const domainSet = new Set(articleSignals.map(signal => signal.domain));
    if (domainSet.size < 2) continue;

    const article = news.find(item => item.id === articleId);
    if (!article) continue;

    const confidence = Math.min(
      0.99,
      articleSignals.reduce((total, signal) => total + signal.score, 0) / articleSignals.length,
    );

    cards.push({
      id: `corr-${articleId}`,
      title: `Convergence: ${article.title.slice(0, 52)}`,
      summary: `${Array.from(domainSet).join(' + ')} signals converged around ${article.source}.`,
      confidence,
      domains: Array.from(domainSet),
      articleIds: [articleId],
      generatedAt,
    });
  }

  return cards
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 8);
}
