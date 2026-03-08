import { describe, it, expect } from 'vitest';
import { getPropagandaProfile, PROPAGANDA_RISK_CONFIG } from '@/config/propagandaRisk';

describe('getPropagandaProfile', () => {
  it('flags Al Manar as high risk', () => {
    const profile = getPropagandaProfile('Al Manar');
    expect(profile).not.toBeNull();
    expect(profile!.risk).toBe('high');
    expect(profile!.stateAffiliation).toContain('Hezbollah');
  });

  it('flags Anadolu as medium risk', () => {
    const profile = getPropagandaProfile('Anadolu');
    expect(profile).not.toBeNull();
    expect(profile!.risk).toBe('medium');
  });

  it('returns null for non-propaganda sources', () => {
    expect(getPropagandaProfile('Reuters')).toBeNull();
    expect(getPropagandaProfile('BBC ME')).toBeNull();
  });
});

describe('PROPAGANDA_RISK_CONFIG', () => {
  it('has config for all risk levels', () => {
    expect(PROPAGANDA_RISK_CONFIG.high.label).toBe('State Media');
    expect(PROPAGANDA_RISK_CONFIG.medium.label).toBe('Caution');
    expect(PROPAGANDA_RISK_CONFIG.none.label).toBe('');
  });
});
