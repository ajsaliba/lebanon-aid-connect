import { describe, expect, it } from 'vitest';
import type { NewsItem } from '@/data/mockData';
import { buildCorrelationCards, buildCorrelationSignals } from '@/lib/correlation/engine';

const baseTime = new Date('2026-04-02T10:00:00.000Z').toISOString();

function makeNews(partial: Partial<NewsItem> & Pick<NewsItem, 'id' | 'title'>): NewsItem {
  return {
    id: partial.id,
    title: partial.title,
    summary: partial.summary ?? 'No summary',
    source: partial.source ?? 'Reuters',
    url: partial.url ?? 'https://example.com',
    publishedAt: partial.publishedAt ?? baseTime,
    severity: partial.severity ?? 'elevated',
    category: partial.category ?? 'conflict',
    lat: partial.lat,
    lng: partial.lng,
  };
}

describe('correlation engine', () => {
  it('creates clustered cards from multi-domain convergence', () => {
    const news: NewsItem[] = [
      makeNews({
        id: 'n1',
        title: 'Airstrike hits power grid as hospital aid corridor opens',
        summary: 'Missile strike damaged telecom grid while shelter aid convoys moved civilians.',
        lat: 33.89,
        lng: 35.5,
        severity: 'high',
      }),
      makeNews({
        id: 'n2',
        title: 'Fuel shortage and displaced families reported after attack',
        summary: 'Economic pressure rising as refugees seek shelter in Beirut.',
        lat: 33.9,
        lng: 35.49,
      }),
      makeNews({
        id: 'n3',
        title: 'Storm disrupts bridge and telecom network in same district',
        summary: 'Infrastructure and humanitarian demand increased after flood warnings.',
        lat: 33.91,
        lng: 35.48,
      }),
    ];

    const cards = buildCorrelationCards(news);

    expect(cards.length).toBeGreaterThan(0);
    expect(cards[0].domains.length).toBeGreaterThanOrEqual(2);
    expect(cards[0].articleIds.length).toBeGreaterThan(1);
    expect(cards[0].confidence).toBeGreaterThan(0.5);
  });

  it('builds bounded signal volume for large datasets', () => {
    const news: NewsItem[] = Array.from({ length: 220 }, (_, index) => makeNews({
      id: `item-${index}`,
      title: 'Airstrike and outage trigger humanitarian shelter demand',
      summary: 'Missile incident disrupted power grid and telecom links.',
      lat: 33.8 + ((index % 5) * 0.01),
      lng: 35.4 + ((index % 5) * 0.01),
    }));

    const signals = buildCorrelationSignals(news);

    expect(signals.length).toBeLessThanOrEqual(160 * 6);
  });
});
