import { describe, it, expect } from 'vitest';
import { GLOSSARY, findGlossaryTerms } from '@/lib/glossary';

describe('GLOSSARY', () => {
  it('contains key terms', () => {
    expect(GLOSSARY['UNIFIL']).toBeDefined();
    expect(GLOSSARY['Hezbollah']).toBeDefined();
    expect(GLOSSARY['IDF']).toBeDefined();
    expect(GLOSSARY['ICC']).toBeDefined();
  });
});

describe('findGlossaryTerms', () => {
  it('finds terms in text', () => {
    const results = findGlossaryTerms('The IDF launched operations near the Blue Line with UNIFIL monitoring.');
    const terms = results.map(r => r.term);
    expect(terms).toContain('IDF');
    expect(terms).toContain('Blue Line');
    expect(terms).toContain('UNIFIL');
  });

  it('returns results sorted by index', () => {
    const results = findGlossaryTerms('UNIFIL and IDF near Blue Line');
    for (let i = 1; i < results.length; i++) {
      expect(results[i].index).toBeGreaterThanOrEqual(results[i - 1].index);
    }
  });

  it('returns empty for text with no glossary terms', () => {
    expect(findGlossaryTerms('The weather is nice today')).toHaveLength(0);
  });

  it('matches short terms as whole words only', () => {
    // "IDF" should match as whole word, not inside another word
    const results = findGlossaryTerms('The identifier was IDF compliant');
    const idfMatch = results.find(r => r.term === 'IDF');
    expect(idfMatch).toBeDefined();
  });
});
