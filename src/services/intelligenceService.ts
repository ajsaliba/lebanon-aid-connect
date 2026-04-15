/**
 * Tasks 19-22 – Intelligence & security domain service layer.
 *
 * Cyber actors/campaigns, strategic assets, country briefs,
 * and protest/social-unrest corroboration.
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  type CyberActor,
  type CyberCampaign,
  type StrategicAsset,
  type CountryBrief,
  type CountryIndicator,
  type BriefCitation,
  type ProtestEvent,
} from './types';
import { publishFeedHeartbeat } from './healthService';

// ── Mock fallbacks ─────────────────────────────────────────

let _mockProtestsLoaded = false;
let _mockProtests: ProtestEvent[] = [];

async function ensureProtestMocks() {
  if (_mockProtestsLoaded) return;
  try {
    const m = await import('@/data/worldMonitorMockData');
    _mockProtests = (m.mockProtestEvents ?? []).map((p: any, i: number) => ({
      id: p.id ?? `protest-${i}`,
      eventType: p.type ?? p.eventType ?? 'peaceful',
      location: p.location ?? '',
      country: p.country ?? 'Unknown',
      lat: p.lat ?? 33.85,
      lng: p.lng ?? 35.86,
      scale: p.scale ?? 'small',
      participantEstimate: p.participants ?? p.participantEstimate ?? null,
      cause: p.cause ?? '',
      fatalities: p.fatalities ?? 0,
      ongoing: p.ongoing ?? false,
      sources: p.sources ?? [p.source ?? 'mock'],
      corroborationScore: 0.5,
      sourceCount: 1,
      reportedAt: p.reported_at ?? p.reportedAt ?? p.date ?? new Date().toISOString(),
      createdAt: p.created_at ?? new Date().toISOString(),
    }));
  } catch { /* ignore */ }
  _mockProtestsLoaded = true;
}

// ── Generic fetcher ────────────────────────────────────────

async function fetchRows<T>(
  table: string,
  feedName: string,
  mapper: (r: any) => T,
  orderCol = 'created_at',
  limit = 500,
): Promise<T[]> {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order(orderCol, { ascending: false })
      .limit(limit);
    if (error) throw error;
    publishFeedHeartbeat(feedName, 'intelligence', true, 300).catch(() => {});
    return (data ?? []).map(mapper);
  } catch (err) {
    publishFeedHeartbeat(feedName, 'intelligence', false, 300, String(err)).catch(() => {});
    return [];
  }
}

// ── Row mappers ────────────────────────────────────────────

const mapActor = (r: any): CyberActor => ({
  id: r.id,
  groupName: r.group_name,
  aliases: typeof r.aliases === 'string' ? JSON.parse(r.aliases) : (r.aliases ?? []),
  sponsorCountry: r.sponsor_country,
  ttpTags: typeof r.ttp_tags === 'string' ? JSON.parse(r.ttp_tags) : (r.ttp_tags ?? []),
  primaryRegions: typeof r.primary_regions === 'string' ? JSON.parse(r.primary_regions) : (r.primary_regions ?? []),
  confidence: r.confidence ?? 0.5,
  lastActive: r.last_active,
  activeCampaigns: r.active_campaigns ?? 0,
  lat: r.lat,
  lng: r.lng,
});

const mapCampaign = (r: any): CyberCampaign => ({
  id: r.id,
  actorId: r.actor_id,
  name: r.name,
  targetSectors: typeof r.target_sectors === 'string' ? JSON.parse(r.target_sectors) : (r.target_sectors ?? []),
  targetCountries: typeof r.target_countries === 'string' ? JSON.parse(r.target_countries) : (r.target_countries ?? []),
  attackVector: r.attack_vector,
  severity: r.severity,
  startDate: r.start_date,
  endDate: r.end_date,
  source: r.source,
});

const mapAsset = (r: any): StrategicAsset => ({
  id: r.id,
  name: r.name,
  assetType: r.asset_type,
  country: r.country,
  operator: r.operator,
  status: r.status,
  verificationStatus: r.verification_status ?? 'unverified',
  lat: r.lat,
  lng: r.lng,
  source: r.source,
  lastVerified: r.last_verified ?? r.updated_at,
});

const mapProtest = (r: any): ProtestEvent => ({
  id: r.id,
  eventType: r.event_type,
  location: r.location,
  country: r.country,
  lat: r.lat,
  lng: r.lng,
  scale: r.scale,
  participantEstimate: r.participant_estimate,
  cause: r.cause,
  fatalities: r.fatalities ?? 0,
  ongoing: r.ongoing ?? false,
  sources: typeof r.sources === 'string' ? JSON.parse(r.sources) : (r.sources ?? []),
  corroborationScore: r.corroboration_score ?? 0.5,
  sourceCount: r.source_count ?? 1,
  reportedAt: r.reported_at,
  createdAt: r.created_at,
});

const mapBrief = (r: any): CountryBrief => ({
  country: r.country,
  countryCode: r.country_code,
  summary: r.summary,
  riskLevel: r.risk_level,
  keyIndicators: typeof r.key_indicators === 'string' ? JSON.parse(r.key_indicators) : (r.key_indicators ?? []),
  citations: typeof r.citations === 'string' ? JSON.parse(r.citations) : (r.citations ?? []),
  generatedAt: r.generated_at ?? r.updated_at,
  dataFreshness: 'live',
});

// ── Hooks ──────────────────────────────────────────────────

export function useCyberActors() {
  return useQuery<CyberActor[]>({
    queryKey: ['cyber_actors'],
    queryFn: () => fetchRows('cyber_actors', 'cyber_actors', mapActor, 'last_active'),
    staleTime: 300_000,
  });
}

export function useCyberCampaigns(actorId?: string) {
  return useQuery<CyberCampaign[]>({
    queryKey: ['cyber_campaigns', actorId],
    queryFn: async () => {
      try {
        let q = supabase.from('cyber_campaigns').select('*').order('start_date', { ascending: false }).limit(200);
        if (actorId) q = q.eq('actor_id', actorId);
        const { data, error } = await q;
        if (error) throw error;
        publishFeedHeartbeat('cyber_campaigns', 'intelligence', true, 300).catch(() => {});
        return (data ?? []).map(mapCampaign);
      } catch (err) {
        publishFeedHeartbeat('cyber_campaigns', 'intelligence', false, 300, String(err)).catch(() => {});
        return [];
      }
    },
    staleTime: 300_000,
  });
}

export function useStrategicAssets(assetType?: string) {
  return useQuery<StrategicAsset[]>({
    queryKey: ['strategic_assets', assetType],
    queryFn: async () => {
      try {
        let q = supabase.from('strategic_assets').select('*').order('name').limit(1000);
        if (assetType) q = q.eq('asset_type', assetType);
        const { data, error } = await q;
        if (error) throw error;
        publishFeedHeartbeat('strategic_assets', 'intelligence', true, 3600).catch(() => {});
        return (data ?? []).map(mapAsset);
      } catch (err) {
        publishFeedHeartbeat('strategic_assets', 'intelligence', false, 3600, String(err)).catch(() => {});
        return [];
      }
    },
    staleTime: 600_000,
  });
}

export function useCountryBrief(countryCode: string) {
  return useQuery<CountryBrief | null>({
    queryKey: ['country_brief', countryCode],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('country_briefs')
          .select('*')
          .eq('country_code', countryCode)
          .order('generated_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (error) throw error;
        if (!data) return null;
        publishFeedHeartbeat('country_briefs', 'intelligence', true, 3600).catch(() => {});
        return mapBrief(data);
      } catch (err) {
        publishFeedHeartbeat('country_briefs', 'intelligence', false, 3600, String(err)).catch(() => {});
        return null;
      }
    },
    staleTime: 300_000,
  });
}

export function useProtestEvents() {
  return useQuery<ProtestEvent[]>({
    queryKey: ['protest_events'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('protest_events')
          .select('*')
          .order('reported_at', { ascending: false })
          .limit(500);
        if (error) throw error;
        if (data && data.length > 0) {
          publishFeedHeartbeat('protests', 'intelligence', true, 300).catch(() => {});
          return data.map(mapProtest);
        }
      } catch (err) {
        publishFeedHeartbeat('protests', 'intelligence', false, 300, String(err)).catch(() => {});
      }
      await ensureProtestMocks();
      return _mockProtests;
    },
    staleTime: 60_000,
  });
}
