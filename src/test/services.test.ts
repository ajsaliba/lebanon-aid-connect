/**
 * Contract tests for the new domain service types and utilities.
 */
import { describe, it, expect } from 'vitest';
import {
  computeFreshness,
  type FeedHealthEntry,
  type DisplacementFlow,
  type MarketQuote,
  type ChokepointStatus,
  type CyberActor,
  type ProtestEvent,
  type MapLayerPreset,
} from '@/services/types';

describe('computeFreshness', () => {
  const base: FeedHealthEntry = {
    id: '1',
    feedName: 'test',
    domain: 'humanitarian',
    lastSuccess: new Date().toISOString(),
    lastAttempt: new Date().toISOString(),
    errorCount: 0,
    timeToLive: 300,
    status: 'healthy',
    message: null,
    createdAt: new Date().toISOString(),
  };

  it('returns "live" when lastSuccess is within TTL', () => {
    expect(computeFreshness(base)).toBe('live');
  });

  it('returns "cached" when lastSuccess is between 1x-3x TTL', () => {
    const entry = {
      ...base,
      lastSuccess: new Date(Date.now() - 600_000).toISOString(), // 10 min ago, TTL=300s
    };
    expect(computeFreshness(entry)).toBe('cached');
  });

  it('returns "stale" when lastSuccess is between 3x-10x TTL', () => {
    const entry = {
      ...base,
      lastSuccess: new Date(Date.now() - 1_500_000).toISOString(), // 25 min ago
    };
    expect(computeFreshness(entry)).toBe('stale');
  });

  it('returns "unavailable" when lastSuccess is beyond 10x TTL', () => {
    const entry = {
      ...base,
      lastSuccess: new Date(Date.now() - 5_000_000).toISOString(), // ~83 min ago
    };
    expect(computeFreshness(entry)).toBe('unavailable');
  });

  it('returns "unavailable" for null entry', () => {
    expect(computeFreshness(null)).toBe('unavailable');
    expect(computeFreshness(undefined)).toBe('unavailable');
  });

  it('returns "unavailable" when lastSuccess is null', () => {
    const entry = { ...base, lastSuccess: null };
    expect(computeFreshness(entry)).toBe('unavailable');
  });
});

describe('Domain type shape contracts', () => {
  it('DisplacementFlow has all required fields', () => {
    const flow: DisplacementFlow = {
      id: 'df-1',
      originRegion: 'South Lebanon',
      destinationRegion: 'Beirut',
      populationEstimate: 15000,
      flowType: 'idp',
      source: 'OCHA',
      sourceConfidence: 0.9,
      reportedAt: '2024-01-01T00:00:00Z',
      createdAt: '2024-01-01T00:00:00Z',
      lat: 33.85,
      lng: 35.86,
    };
    expect(flow.flowType).toBe('idp');
    expect(flow.sourceConfidence).toBeGreaterThanOrEqual(0);
    expect(flow.sourceConfidence).toBeLessThanOrEqual(1);
  });

  it('MarketQuote has all required fields', () => {
    const quote: MarketQuote = {
      symbol: 'BTC',
      name: 'Bitcoin',
      assetClass: 'crypto',
      price: 65000,
      change: 1200,
      changePct: 1.88,
      volume: 42_000_000_000,
      timestamp: '2024-01-01T00:00:00Z',
      provider: 'coingecko',
    };
    expect(quote.assetClass).toBe('crypto');
    expect(['equity', 'index', 'commodity', 'crypto', 'fx', 'bond']).toContain(quote.assetClass);
  });

  it('ChokepointStatus has all required fields', () => {
    const cp: ChokepointStatus = {
      id: 'cp-1',
      name: 'Suez Canal',
      region: 'Middle East',
      lat: 30.46,
      lng: 32.35,
      disruptionScore: 25,
      confidence: 0.85,
      status: 'elevated',
      vesselCount: 42,
      avgDelayHours: 6.5,
      lastUpdated: '2024-01-01T00:00:00Z',
      source: 'AIS',
    };
    expect(cp.disruptionScore).toBeGreaterThanOrEqual(0);
    expect(cp.disruptionScore).toBeLessThanOrEqual(100);
    expect(['normal', 'elevated', 'disrupted', 'blocked']).toContain(cp.status);
  });

  it('CyberActor has all required fields', () => {
    const actor: CyberActor = {
      id: 'ca-1',
      groupName: 'APT-29',
      aliases: ['Cozy Bear', 'The Dukes'],
      sponsorCountry: 'Russia',
      ttpTags: ['spear-phishing', 'supply-chain'],
      primaryRegions: ['Europe', 'North America'],
      confidence: 0.9,
      lastActive: '2024-01-01T00:00:00Z',
      activeCampaigns: 3,
      lat: 55.75,
      lng: 37.61,
    };
    expect(actor.aliases).toHaveLength(2);
    expect(actor.confidence).toBeGreaterThanOrEqual(0);
  });

  it('ProtestEvent has corroboration fields', () => {
    const event: ProtestEvent = {
      id: 'pe-1',
      eventType: 'peaceful',
      location: 'Beirut',
      country: 'Lebanon',
      lat: 33.89,
      lng: 35.50,
      scale: 'large',
      participantEstimate: 25000,
      cause: 'Economic crisis',
      fatalities: 0,
      ongoing: true,
      sources: ['Reuters', 'Al Jazeera'],
      corroborationScore: 0.85,
      sourceCount: 2,
      reportedAt: '2024-01-01T00:00:00Z',
      createdAt: '2024-01-01T00:00:00Z',
    };
    expect(event.corroborationScore).toBeGreaterThanOrEqual(0);
    expect(event.sourceCount).toBe(2);
    expect(event.sources).toHaveLength(2);
  });
});

describe('Map layer contract', () => {
  it('normalizeMapLayerState fills all keys', async () => {
    const { normalizeMapLayerState } = await import('@/features/map/mapLayerContract');
    const state = normalizeMapLayerState({});
    // Check new layers exist
    expect('safeRoutes' in state).toBe(true);
    expect('earlyWarning' in state).toBe(true);
    expect('subseaCables' in state).toBe(true);
    expect('pipelines' in state).toBe(true);
    expect('aviation' in state).toBe(true);
    expect('militaryAssets' in state).toBe(true);
    expect('nuclearSites' in state).toBe(true);
    expect('gpsJamming' in state).toBe(true);
    expect('strategicInvestments' in state).toBe(true);
  });

  it('getPresetLayers returns correct preset for humanitarian desktop', async () => {
    const { getPresetLayers } = await import('@/features/map/mapLayerContract');
    const state = getPresetLayers('humanitarian', 'desktop');
    expect(state.sos).toBe(true);
    expect(state.shelters).toBe(true);
    expect(state.safeRoutes).toBe(true);
    expect(state.militaryAssets).toBe(false);
  });

  it('getPresetLayers returns correct preset for intel desktop', async () => {
    const { getPresetLayers } = await import('@/features/map/mapLayerContract');
    const state = getPresetLayers('intel', 'desktop');
    expect(state.militaryAssets).toBe(true);
    expect(state.cyber).toBe(true);
    expect(state.satellite).toBe(true);
    expect(state.shelters).toBe(false);
  });

  it('MAP_LAYER_DEFINITIONS has 28 layers', async () => {
    const { MAP_LAYER_DEFINITIONS } = await import('@/features/map/mapLayerContract');
    expect(MAP_LAYER_DEFINITIONS.length).toBe(28);
  });
});
