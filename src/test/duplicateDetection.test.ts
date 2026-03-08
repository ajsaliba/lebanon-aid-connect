import { describe, it, expect } from 'vitest';
import { findDuplicates } from '@/lib/duplicateDetection';
import { type NewsItem } from '@/data/mockData';

const makeArticle = (id: string, title: string, source: string): NewsItem => ({
  id, title, source,
  summary: '', category: 'conflict', severity: 'elevated',
  publishedAt: new Date().toISOString(), url: '',
});

describe('findDuplicates', () => {
  it('returns empty map for fewer than 2 articles', () => {
    expect(findDuplicates([])).toEqual(new Map());
    expect(findDuplicates([makeArticle('1', 'Test', 'Source A')])).toEqual(new Map());
  });

  it('detects duplicate titles from different sources', () => {
    const articles = [
      makeArticle('1', 'Major airstrike hits southern Lebanon border region', 'Reuters'),
      makeArticle('2', 'Airstrike hits southern Lebanon border region overnight', 'BBC ME'),
    ];
    const dupes = findDuplicates(articles);
    expect(dupes.size).toBeGreaterThan(0);
    expect(dupes.get('1')).toContain('2');
    expect(dupes.get('2')).toContain('1');
  });

  it('does NOT flag same-source articles as duplicates', () => {
    const articles = [
      makeArticle('1', 'Airstrike hits southern Lebanon', 'Reuters'),
      makeArticle('2', 'Airstrike hits southern Lebanon update', 'Reuters'),
    ];
    const dupes = findDuplicates(articles);
    expect(dupes.size).toBe(0);
  });

  it('does NOT flag completely different titles', () => {
    const articles = [
      makeArticle('1', 'Major earthquake shakes Turkey', 'Reuters'),
      makeArticle('2', 'New trade deal signed between EU and Japan', 'BBC ME'),
    ];
    const dupes = findDuplicates(articles);
    expect(dupes.size).toBe(0);
  });
});
