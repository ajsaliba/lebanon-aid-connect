import { describe, it, expect } from 'vitest';
import { getSourceProfile, TIER_CONFIG, TYPE_LABELS } from '@/config/sourceReliability';

describe('getSourceProfile', () => {
  it('returns verified tier for Reuters', () => {
    const profile = getSourceProfile('Reuters');
    expect(profile.tier).toBe('verified');
    expect(profile.score).toBe(95);
    expect(profile.type).toBe('wire');
  });

  it('returns unverified fallback for unknown sources', () => {
    const profile = getSourceProfile('Unknown Blog XYZ');
    expect(profile.tier).toBe('unverified');
    expect(profile.score).toBe(40);
  });

  it('recognizes mixed-tier sources', () => {
    expect(getSourceProfile('Al Manar').tier).toBe('mixed');
    expect(getSourceProfile('Fars News').tier).toBe('mixed');
  });

  it('recognizes think tanks', () => {
    expect(getSourceProfile('Brookings').type).toBe('think_tank');
    expect(getSourceProfile('RAND').type).toBe('think_tank');
  });
});

describe('TIER_CONFIG', () => {
  it('has all four tiers', () => {
    expect(Object.keys(TIER_CONFIG)).toEqual(['verified', 'established', 'mixed', 'unverified']);
  });
});

describe('TYPE_LABELS', () => {
  it('has labels for all types', () => {
    expect(TYPE_LABELS.wire).toBe('Wire Service');
    expect(TYPE_LABELS.ngo).toBe('NGO');
  });
});
