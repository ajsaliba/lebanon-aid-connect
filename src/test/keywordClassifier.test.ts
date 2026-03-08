import { describe, it, expect } from 'vitest';
import { classifyByKeywords } from '@/lib/keywordClassifier';

describe('keywordClassifier', () => {
  it('classifies military airstrike articles as critical military', () => {
    const result = classifyByKeywords('Airstrike hits southern Lebanon', 'Missiles launched overnight');
    expect(result).not.toBeNull();
    expect(result!.primary_category).toBe('military');
    expect(result!.threat_level).toBe('critical');
    expect(result!.tags).toContain('airstrike');
  });

  it('classifies nuclear articles as critical nuclear', () => {
    const result = classifyByKeywords('Iran uranium enrichment reaches new levels', 'IAEA inspectors denied access');
    expect(result).not.toBeNull();
    expect(result!.primary_category).toBe('nuclear');
    expect(result!.threat_level).toBe('critical');
  });

  it('classifies terrorism articles', () => {
    const result = classifyByKeywords('Terrorist attack in city center', 'Suicide bomb kills dozens');
    expect(result).not.toBeNull();
    expect(result!.primary_category).toBe('terrorism');
    expect(result!.threat_level).toBe('critical');
  });

  it('classifies humanitarian crisis', () => {
    const result = classifyByKeywords('Thousands of refugees displaced', 'Humanitarian crisis worsens with famine');
    expect(result).not.toBeNull();
    expect(result!.primary_category).toBe('humanitarian');
    expect(result!.threat_level).toBe('high');
  });

  it('classifies political events', () => {
    const result = classifyByKeywords('UN Security Council passes new resolution', 'Sanctions imposed on regime');
    expect(result).not.toBeNull();
    expect(result!.primary_category).toBe('political');
  });

  it('classifies cyber attacks', () => {
    const result = classifyByKeywords('Major cyberattack targets infrastructure', 'Ransomware cripples systems');
    expect(result).not.toBeNull();
    expect(result!.primary_category).toBe('cyber');
    expect(result!.threat_level).toBe('high');
  });

  it('classifies economic events', () => {
    const result = classifyByKeywords('Oil price surge amid energy crisis', 'Economic collapse feared');
    expect(result).not.toBeNull();
    expect(result!.primary_category).toBe('economic');
  });

  it('returns null for unrelated content', () => {
    const result = classifyByKeywords('Local bakery opens new branch', 'Fresh bread available daily');
    expect(result).toBeNull();
  });

  it('confidence is capped at 0.75', () => {
    const result = classifyByKeywords(
      'Airstrike bombing missile rockets drone strike',
      'Bombardment with missiles and rockets'
    );
    expect(result).not.toBeNull();
    expect(result!.confidence).toBeLessThanOrEqual(0.75);
  });

  it('higher weight rules win over lower weight matches', () => {
    // Nuclear (weight 4) should beat political (weight 1) when both match
    const result = classifyByKeywords('Nuclear sanctions on Iran IAEA', 'UN resolution on uranium enrichment');
    expect(result).not.toBeNull();
    expect(result!.primary_category).toBe('nuclear');
  });

  it('returns stage undefined (added by hook, not classifier)', () => {
    const result = classifyByKeywords('Airstrike on Beirut', '');
    expect(result).not.toBeNull();
    expect(result!.stage).toBeUndefined();
  });
});
