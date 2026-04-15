/**
 * Tasks 13-17 – Infrastructure & logistics domain service layer.
 *
 * Shipping/chokepoints, undersea cables, pipelines, trade routes,
 * network outages, and aviation status.
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  type ChokepointStatus,
  type MaritimeTrack,
  type SubseaCable,
  type Pipeline,
  type TradeRoute,
  type NetworkOutage,
  type AirportStatus,
} from './types';
import { publishFeedHeartbeat } from './healthService';

// ── Connectivity mock fallback ─────────────────────────────

let _mockOutagesLoaded = false;
let _mockOutages: NetworkOutage[] = [];

async function ensureOutageMocks() {
  if (_mockOutagesLoaded) return;
  try {
    const m = await import('@/data/newFeaturesMockData');
    _mockOutages = (m.mockConnectivityPoints ?? []).map((p: any, i: number) => ({
      id: p.id ?? `outage-${i}`,
      region: p.city ?? p.location ?? '',
      country: 'Lebanon',
      outageType: 'internet' as const,
      severity: p.status === 'down' ? 'major' as const : 'minor' as const,
      affectedUsers: null,
      startedAt: p.last_checked ?? new Date().toISOString(),
      resolvedAt: p.status === 'active' ? null : new Date().toISOString(),
      source: 'mock',
      sourceReliability: 0.5,
      lat: p.lat ?? 33.85,
      lng: p.lng ?? 35.86,
    }));
  } catch { /* ignore */ }
  _mockOutagesLoaded = true;
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
    publishFeedHeartbeat(feedName, 'infrastructure', true, 300).catch(() => {});
    return (data ?? []).map(mapper);
  } catch (err) {
    publishFeedHeartbeat(feedName, 'infrastructure', false, 300, String(err)).catch(() => {});
    return [];
  }
}

// ── Row mappers ────────────────────────────────────────────

const mapChokepoint = (r: any): ChokepointStatus => ({
  id: r.id,
  name: r.name,
  region: r.region,
  lat: r.lat,
  lng: r.lng,
  disruptionScore: r.disruption_score,
  confidence: r.confidence,
  status: r.status,
  vesselCount: r.vessel_count,
  avgDelayHours: r.avg_delay_hours,
  lastUpdated: r.last_updated ?? r.updated_at,
  source: r.source,
});

const mapMaritime = (r: any): MaritimeTrack => ({
  mmsi: r.mmsi,
  vesselName: r.vessel_name,
  vesselType: r.vessel_type,
  lat: r.lat,
  lng: r.lng,
  course: r.course,
  speed: r.speed,
  destination: r.destination,
  timestamp: r.timestamp ?? r.updated_at,
});

const mapCable = (r: any): SubseaCable => ({
  id: r.id,
  name: r.name,
  landingPoints: typeof r.landing_points === 'string' ? JSON.parse(r.landing_points) : (r.landing_points ?? []),
  capacityTbps: r.capacity_tbps,
  status: r.status,
  owner: r.owner,
  geometry: typeof r.geometry === 'string' ? JSON.parse(r.geometry) : (r.geometry ?? []),
});

const mapPipeline = (r: any): Pipeline => ({
  id: r.id,
  name: r.name,
  commodity: r.commodity,
  capacityBpd: r.capacity_bpd,
  status: r.status,
  operator: r.operator,
  geometry: typeof r.geometry === 'string' ? JSON.parse(r.geometry) : (r.geometry ?? []),
});

const mapTradeRoute = (r: any): TradeRoute => ({
  id: r.id,
  name: r.name,
  routeClass: r.route_class,
  commodities: typeof r.commodities === 'string' ? JSON.parse(r.commodities) : (r.commodities ?? []),
  riskLevel: r.risk_level,
  congestionLevel: r.congestion_level,
  chokepoints: typeof r.chokepoints === 'string' ? JSON.parse(r.chokepoints) : (r.chokepoints ?? []),
  geometry: typeof r.geometry === 'string' ? JSON.parse(r.geometry) : (r.geometry ?? []),
});

const mapOutage = (r: any): NetworkOutage => ({
  id: r.id,
  region: r.region,
  country: r.country,
  outageType: r.outage_type,
  severity: r.severity,
  affectedUsers: r.affected_users,
  startedAt: r.started_at,
  resolvedAt: r.resolved_at,
  source: r.source,
  sourceReliability: r.source_reliability ?? 0.8,
  lat: r.lat,
  lng: r.lng,
});

const mapAirport = (r: any): AirportStatus => ({
  icao: r.icao,
  iata: r.iata,
  name: r.name,
  country: r.country,
  lat: r.lat,
  lng: r.lng,
  operationalStatus: r.operational_status,
  avgDelayMinutes: r.avg_delay_minutes ?? 0,
  closureReason: r.closure_reason,
  source: r.source,
  updatedAt: r.updated_at,
});

// ── Hooks ──────────────────────────────────────────────────

export function useChokepoints() {
  return useQuery<ChokepointStatus[]>({
    queryKey: ['chokepoints'],
    queryFn: () => fetchRows('chokepoints', 'chokepoints', mapChokepoint, 'last_updated'),
    staleTime: 60_000,
  });
}

export function useMaritimeTracks() {
  return useQuery<MaritimeTrack[]>({
    queryKey: ['maritime_tracks'],
    queryFn: () => fetchRows('maritime_tracks', 'maritime_ais', mapMaritime, 'timestamp', 1000),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useSubseaCables() {
  return useQuery<SubseaCable[]>({
    queryKey: ['subsea_cables'],
    queryFn: () => fetchRows('subsea_cables', 'subsea_cables', mapCable, 'name'),
    staleTime: 3600_000,
  });
}

export function usePipelines() {
  return useQuery<Pipeline[]>({
    queryKey: ['pipelines'],
    queryFn: () => fetchRows('pipelines', 'pipelines', mapPipeline, 'name'),
    staleTime: 3600_000,
  });
}

export function useTradeRoutes() {
  return useQuery<TradeRoute[]>({
    queryKey: ['trade_routes'],
    queryFn: () => fetchRows('trade_routes', 'trade_routes', mapTradeRoute, 'name'),
    staleTime: 600_000,
  });
}

export function useNetworkOutages() {
  return useQuery<NetworkOutage[]>({
    queryKey: ['network_outages'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('network_outages')
          .select('*')
          .order('started_at', { ascending: false })
          .limit(500);
        if (error) throw error;
        if (data && data.length > 0) {
          publishFeedHeartbeat('network_outages', 'infrastructure', true, 300).catch(() => {});
          return data.map(mapOutage);
        }
      } catch (err) {
        publishFeedHeartbeat('network_outages', 'infrastructure', false, 300, String(err)).catch(() => {});
      }
      await ensureOutageMocks();
      return _mockOutages;
    },
    staleTime: 60_000,
  });
}

export function useAirportStatuses() {
  return useQuery<AirportStatus[]>({
    queryKey: ['airport_statuses'],
    queryFn: () => fetchRows('airport_statuses', 'aviation', mapAirport, 'updated_at'),
    staleTime: 120_000,
  });
}
