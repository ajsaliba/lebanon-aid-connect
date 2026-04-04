import type { NewsItem } from '@/data/mockData';

export type CorrelationDomain = 'military' | 'escalation' | 'economic' | 'disaster' | 'infrastructure' | 'humanitarian';

export interface CorrelationSignal {
  domain: CorrelationDomain;
  score: number;
  articleId: string;
  source: string;
  timestamp: string;
  geoBucket: string;
  timeBucket: string;
}

export interface CorrelationCard {
  id: string;
  title: string;
  summary: string;
  confidence: number;
  domains: CorrelationDomain[];
  articleIds: string[];
  generatedAt: string;
  clusterKey?: string;
}

export interface CorrelationAdapter {
  domain: CorrelationDomain;
  weight: number;
  keywords: string[];
  score: (article: NewsItem) => number;
}

const DOMAIN_KEYWORDS: Record<CorrelationDomain, string[]> = {
  military: ['airstrike', 'missile', 'drone', 'troop', 'naval', 'artillery', 'strike', 'barrage', 'raid'],
  escalation: ['retaliation', 'mobilization', 'warning', 'escalation', 'attack', 'threat', 'incursion'],
  economic: ['inflation', 'fuel', 'currency', 'supply', 'market', 'price', 'sanction', 'shortage'],
  disaster: ['flood', 'earthquake', 'storm', 'wildfire', 'outage', 'collapse', 'damage', 'evacuation'],
  infrastructure: ['grid', 'substation', 'port', 'bridge', 'runway', 'telecom', 'network', 'internet', 'power'],
  humanitarian: ['shelter', 'aid', 'refugee', 'displaced', 'hospital', 'medical', 'corridor', 'evacuated'],
};

const DOMAIN_WEIGHT: Record<CorrelationDomain, number> = {
  military: 1.25,
  escalation: 1.15,
  economic: 1,
  disaster: 1,
  infrastructure: 1.05,
  humanitarian: 1.1,
};

const SOURCE_WEIGHT: Record<string, number> = {
  reuters: 1.15,
  ap: 1.1,
  bbc: 1.1,
  afp: 1.1,
  aljazeera: 1.05,
  'al-jazeera': 1.05,
};

const CITY_BUCKETS: Record<string, string> = {
  beirut: 'lebanon-beirut',
  tripoli: 'lebanon-tripoli',
  tyre: 'lebanon-south',
  sidon: 'lebanon-south',
  nabatieh: 'lebanon-south',
  baalbek: 'lebanon-bekaa',
  zahle: 'lebanon-bekaa',
  gaza: 'palestine-gaza',
  rafah: 'palestine-gaza',
  damascus: 'syria-damascus',
  idlib: 'syria-idlib',
  tehran: 'iran-tehran',
  baghdad: 'iraq-baghdad',
  sanaa: 'yemen-sanaa',
};

const MAX_ARTICLES = 160;
const CLUSTER_WINDOW_MS = 4 * 60 * 60 * 1000;

function keywordScore(text: string, words: string[]): number {
  const lower = text.toLowerCase();
  let hits = 0;

  for (const word of words) {
    if (lower.includes(word)) hits += 1;
  }

  return Math.min(1, hits / Math.max(2, Math.floor(words.length / 3)));
}

function severityWeight(article: NewsItem): number {
  if (article.severity === 'high') return 1.2;
  if (article.severity === 'elevated') return 1.05;
  return 0.92;
}

function sourceWeight(source: string): number {
  const normalized = source.toLowerCase().replace(/\s+/g, '');
  return SOURCE_WEIGHT[normalized] ?? 1;
}

function resolveGeoBucket(article: NewsItem): string {
  if (typeof article.lat === 'number' && typeof article.lng === 'number') {
    const latBucket = Math.round(article.lat * 2) / 2;
    const lngBucket = Math.round(article.lng * 2) / 2;
    return `geo:${latBucket.toFixed(1)}:${lngBucket.toFixed(1)}`;
  }

  const text = `${article.title} ${article.summary}`.toLowerCase();
  for (const [token, bucket] of Object.entries(CITY_BUCKETS)) {
    if (text.includes(token)) return bucket;
  }

  return 'geo:unknown';
}

function resolveTimeBucket(timestamp: string): string {
  const dateMs = new Date(timestamp).getTime();
  if (!Number.isFinite(dateMs)) return 'time:unknown';
  const bucket = Math.floor(dateMs / CLUSTER_WINDOW_MS);
  return `time:${bucket}`;
}

function buildDefaultAdapters(): CorrelationAdapter[] {
  return (Object.keys(DOMAIN_KEYWORDS) as CorrelationDomain[]).map(domain => ({
    domain,
    weight: DOMAIN_WEIGHT[domain],
    keywords: DOMAIN_KEYWORDS[domain],
    score: (article: NewsItem) => {
      const text = `${article.title} ${article.summary}`;
      const base = keywordScore(text, DOMAIN_KEYWORDS[domain]);
      const weighted = base * DOMAIN_WEIGHT[domain] * severityWeight(article) * sourceWeight(article.source);
      return Math.max(0, Math.min(1, weighted));
    },
  }));
}

export const DEFAULT_CORRELATION_ADAPTERS: CorrelationAdapter[] = buildDefaultAdapters();

export function buildCorrelationSignals(news: NewsItem[], adapters = DEFAULT_CORRELATION_ADAPTERS): CorrelationSignal[] {
  const recent = news.slice(0, MAX_ARTICLES);
  const signals: CorrelationSignal[] = [];

  for (const article of recent) {
    const geoBucket = resolveGeoBucket(article);
    const timeBucket = resolveTimeBucket(article.publishedAt);

    for (const adapter of adapters) {
      const score = adapter.score(article);
      if (score < 0.34) continue;

      signals.push({
        domain: adapter.domain,
        score,
        articleId: article.id,
        source: article.source,
        timestamp: article.publishedAt,
        geoBucket,
        timeBucket,
      });
    }
  }

  return signals;
}

interface SignalCluster {
  key: string;
  signals: CorrelationSignal[];
  articleIds: Set<string>;
  domainScores: Map<CorrelationDomain, number[]>;
}

function buildClusters(signals: CorrelationSignal[]): SignalCluster[] {
  const clusters = new Map<string, SignalCluster>();

  for (const signal of signals) {
    const key = `${signal.geoBucket}|${signal.timeBucket}`;
    const existing = clusters.get(key) ?? {
      key,
      signals: [],
      articleIds: new Set<string>(),
      domainScores: new Map<CorrelationDomain, number[]>(),
    };

    existing.signals.push(signal);
    existing.articleIds.add(signal.articleId);

    const currentScores = existing.domainScores.get(signal.domain) ?? [];
    currentScores.push(signal.score);
    existing.domainScores.set(signal.domain, currentScores);

    clusters.set(key, existing);
  }

  return Array.from(clusters.values());
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function summarizeDomains(domains: CorrelationDomain[]): string {
  return domains
    .map(domain => domain[0].toUpperCase() + domain.slice(1))
    .join(', ');
}

function resolveRepresentativeArticle(cluster: SignalCluster, newsById: Map<string, NewsItem>): NewsItem | null {
  const scored = Array.from(cluster.articleIds)
    .map(articleId => {
      const article = newsById.get(articleId);
      if (!article) return null;

      const signalScore = cluster.signals
        .filter(signal => signal.articleId === articleId)
        .reduce((total, signal) => total + signal.score, 0);

      return { article, score: signalScore };
    })
    .filter((entry): entry is { article: NewsItem; score: number } => !!entry)
    .sort((a, b) => b.score - a.score);

  return scored[0]?.article ?? null;
}

export function buildCorrelationCards(news: NewsItem[], adapters = DEFAULT_CORRELATION_ADAPTERS): CorrelationCard[] {
  const signals = buildCorrelationSignals(news, adapters);
  if (signals.length === 0) return [];

  const clusters = buildClusters(signals);
  const newsById = new Map(news.map(item => [item.id, item]));
  const generatedAt = new Date().toISOString();

  const cards: CorrelationCard[] = [];

  for (const cluster of clusters) {
    const domainAverages = Array.from(cluster.domainScores.entries())
      .map(([domain, scores]) => ({ domain, score: mean(scores) }))
      .sort((a, b) => b.score - a.score);

    const domains = domainAverages
      .filter(entry => entry.score >= 0.38)
      .map(entry => entry.domain);

    if (domains.length < 2) continue;

    const representativeArticle = resolveRepresentativeArticle(cluster, newsById);
    if (!representativeArticle) continue;

    const averageScore = mean(domainAverages.map(entry => entry.score));
    const densityBoost = Math.min(0.22, cluster.articleIds.size * 0.04);
    const diversityBoost = Math.min(0.18, (domains.length - 1) * 0.05);
    const confidence = Math.min(0.99, averageScore + densityBoost + diversityBoost);

    cards.push({
      id: `corr-${cluster.key}`,
      clusterKey: cluster.key,
      title: `Convergence: ${representativeArticle.title.slice(0, 72)}`,
      summary: `${summarizeDomains(domains)} converged across ${cluster.articleIds.size} linked reports in this geo-time cluster.`,
      confidence,
      domains,
      articleIds: Array.from(cluster.articleIds),
      generatedAt,
    });
  }

  return cards
    .sort((a, b) => b.confidence - a.confidence || b.articleIds.length - a.articleIds.length)
    .slice(0, 10);
}
