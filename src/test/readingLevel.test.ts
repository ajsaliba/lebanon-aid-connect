import { describe, it, expect } from 'vitest';
import { fleschKincaidGrade, readingLevelLabel } from '@/lib/readingLevel';

describe('fleschKincaidGrade', () => {
  it('returns 0 for empty text', () => {
    expect(fleschKincaidGrade('')).toBe(0);
  });

  it('returns zero or positive grade for simple text', () => {
    const grade = fleschKincaidGrade('The cat sat on the mat. The dog ran fast.');
    expect(grade).toBeGreaterThanOrEqual(0);
  });

  it('returns positive grade for longer text', () => {
    const grade = fleschKincaidGrade('The soldiers marched through the valley under heavy fire. The commander ordered a retreat to safer positions behind the mountain ridge.');
    expect(grade).toBeGreaterThan(0);
  });

  it('gives higher grade for complex text', () => {
    const simple = fleschKincaidGrade('The cat sat on the mat.');
    const complex = fleschKincaidGrade(
      'The geopolitical ramifications of unprecedented diplomatic negotiations between international stakeholders remain fundamentally indeterminate.'
    );
    expect(complex).toBeGreaterThan(simple);
  });
});

describe('readingLevelLabel', () => {
  it('labels grade 4 as Easy', () => {
    expect(readingLevelLabel(4).label).toBe('Easy');
  });

  it('labels grade 8 as Standard', () => {
    expect(readingLevelLabel(8).label).toBe('Standard');
  });

  it('labels grade 12 as Advanced', () => {
    expect(readingLevelLabel(12).label).toBe('Advanced');
  });

  it('labels grade 16 as Expert', () => {
    expect(readingLevelLabel(16).label).toBe('Expert');
  });
});
