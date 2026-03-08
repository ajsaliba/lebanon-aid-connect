import { describe, it, expect } from 'vitest';
import { computeHotspotScores, HOTSPOTS } from '@/config/hotspots';
import { type NewsItem } from '@/data/mockData';

const makeArticle = (title: string, severity: 'high' | 'elevated' | 'monitoring' = 'elevated'): NewsItem => ({
  id: Math.random().toString(), title, summary: '', source: 'Test',
  category: 'conflict', severity, publishedAt: new Date().toISOString(), url: '',
});

describe('HOTSPOTS', () => {
  it('contains 7 hotspots', () => {
    expect(HOTSPOTS).toHaveLength(7);
  });

  it('all hotspots have required fields', () => {
    for (const h of HOTSPOTS) {
      expect(h.id).toBeTruthy();
      expect(h.keywords.length).toBeGreaterThan(0);
      expect(h.radiusKm).toBeGreaterThan(0);
    }
  });
});

describe('computeHotspotScores', () => {
  it('returns calm for empty news', () => {
    const scores = computeHotspotScores([]);
    expect(scores.every(s => s.level === 'calm')).toBe(true);
    expect(scores.every(s => s.score === 0)).toBe(true);
  });

  it('increases score for matching articles', () => {
    const articles = Array.from({ length: 20 }, () => makeArticle('Beirut Lebanon conflict', 'high'));
    const scores = computeHotspotScores(articles);
    const lebanon = scores.find(s => s.hotspot.id === 'lebanon');
    expect(lebanon!.score).toBeGreaterThan(0);
    expect(lebanon!.articleCount).toBe(20);
  });

  it('high severity articles boost score', () => {
    const low = computeHotspotScores([makeArticle('Gaza update', 'low')]);
    const high = computeHotspotScores([makeArticle('Gaza update', 'high')]);
    const gazaLow = low.find(s => s.hotspot.id === 'gaza')!;
    const gazaHigh = high.find(s => s.hotspot.id === 'gaza')!;
    expect(gazaHigh.score).toBeGreaterThan(gazaLow.score);
  });
});
