/**
 * Tasks 1-5 – Humanitarian domain service layer.
 *
 * Replaces direct mock-data imports for displacement, facilities,
 * route safety, early warning, and aid accountability panels.
 * Every hook falls back to mock data when Supabase tables are empty
 * or unavailable so the UI never breaks.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  type DisplacementFlow,
  type RefugeeCamp,
  type HumanitarianFacility,
  type SafeRoute,
  type EarlyWarningEvent,
  type AidDeliveryRecord,
} from './types';
import { publishFeedHeartbeat } from './healthService';

// ── Mock-data fallbacks (imported lazily) ──────────────────

let _mockFallbacksLoaded = false;
let _mockRefugeeCamps: RefugeeCamp[] = [];
let _mockFacilities: HumanitarianFacility[] = [];
let _mockRoutes: SafeRoute[] = [];
let _mockWarnings: EarlyWarningEvent[] = [];

async function ensureMockFallbacks() {
  if (_mockFallbacksLoaded) return;
  try {
    const [m1, m2] = await Promise.all([
      import('@/data/newFeaturesMockData'),
      import('@/data/newFeaturesMockData2'),
    ]);
    // Map mock shapes to our domain types with safe defaults
    _mockRefugeeCamps = (m1.mockRefugeeCamps ?? []).map((c: any, i: number) => ({
      id: c.id ?? `camp-${i}`,
      name: c.name ?? 'Unknown Camp',
      region: c.region ?? c.location ?? '',
      capacity: c.capacity ?? 0,
      currentOccupancy: c.current_occupancy ?? c.currentOccupancy ?? 0,
      status: c.status ?? 'open',
      managedBy: c.managed_by ?? c.managedBy ?? 'Unknown',
      lat: c.lat ?? 33.85,
      lng: c.lng ?? 35.86,
      lastUpdated: c.last_updated ?? new Date().toISOString(),
      sourceConfidence: 0.5,
    }));
    _mockFacilities = [
      ...(m1.mockMedicalFacilities ?? []),
      ...(m1.mockFuelStations ?? []),
      ...(m2.mockFuelStations ?? []),
    ].map((f: any, i: number) => ({
      id: f.id ?? `fac-${i}`,
      name: f.name ?? 'Unknown',
      facilityType: f.type ?? f.facilityType ?? 'clinic',
      status: f.status ?? 'open',
      capacity: f.capacity ?? null,
      currentLoad: f.current_load ?? f.currentLoad ?? null,
      address: f.address ?? f.location ?? '',
      lat: f.lat ?? 33.85,
      lng: f.lng ?? 35.86,
      contact: f.contact ?? null,
      lastUpdated: f.last_updated ?? new Date().toISOString(),
      sourceConfidence: 0.5,
      source: 'mock',
    }));
    _mockRoutes = (m1.mockSafeRoutes ?? []).map((r: any, i: number) => ({
      id: r.id ?? `route-${i}`,
      name: r.name ?? `Route ${i + 1}`,
      originLat: r.waypoints?.[0]?.lat ?? 33.85,
      originLng: r.waypoints?.[0]?.lng ?? 35.86,
      destinationLat: r.waypoints?.[r.waypoints.length - 1]?.lat ?? 34.0,
      destinationLng: r.waypoints?.[r.waypoints.length - 1]?.lng ?? 36.0,
      waypoints: r.waypoints ?? [],
      distanceKm: r.distance_km ?? r.distanceKm ?? 0,
      estimatedMinutes: r.estimated_time ?? r.estimatedMinutes ?? 0,
      safetyScore: r.safety_score ?? r.safetyScore ?? 50,
      hazards: (r.hazards ?? []).map((h: any) => ({
        type: h.type ?? 'road_damage',
        lat: h.lat ?? 33.85,
        lng: h.lng ?? 35.86,
        severity: h.severity ?? 'low',
        reportedAt: h.reported_at ?? new Date().toISOString(),
      })),
      lastVerified: r.last_verified ?? new Date().toISOString(),
      status: r.status ?? 'unverified',
    }));
    _mockWarnings = (m2.mockEarlyWarningEvents ?? []).map((e: any, i: number) => ({
      id: e.id ?? `ew-${i}`,
      detectionType: e.detection_type ?? e.detectionType ?? 'explosion',
      intensity: e.intensity ?? 'medium',
      confirmed: e.confirmed ?? false,
      lat: e.lat ?? 33.85,
      lng: e.lng ?? 35.86,
      location: e.location ?? '',
      source: e.source ?? 'mock',
      sources: e.sources ?? [e.source ?? 'mock'],
      confidenceTier: e.confirmed ? 'confirmed' : 'unconfirmed',
      detectedAt: e.detected_at ?? e.detectedAt ?? e.timestamp ?? new Date().toISOString(),
      resolvedAt: null,
      createdAt: e.created_at ?? new Date().toISOString(),
    }));
    _mockFallbacksLoaded = true;
  } catch {
    _mockFallbacksLoaded = true;
  }
}

// ── Generic fetcher with fallback ──────────────────────────

async function fetchWithFallback<T>(
  table: string,
  feedName: string,
  mapper: (row: any) => T,
  mockFallback: () => T[],
  orderCol = 'created_at',
): Promise<T[]> {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order(orderCol, { ascending: false })
      .limit(500);
    if (error) throw error;
    if (data && data.length > 0) {
      publishFeedHeartbeat(feedName, 'humanitarian', true, 300).catch(() => {});
      return data.map(mapper);
    }
  } catch (err) {
    publishFeedHeartbeat(feedName, 'humanitarian', false, 300, String(err)).catch(() => {});
  }
  await ensureMockFallbacks();
  return mockFallback();
}

// ── Row mappers ────────────────────────────────────────────

function mapDisplacement(r: any): DisplacementFlow {
  return {
    id: r.id,
    originRegion: r.origin_region,
    destinationRegion: r.destination_region,
    populationEstimate: r.population_estimate,
    flowType: r.flow_type,
    source: r.source,
    sourceConfidence: r.source_confidence,
    reportedAt: r.reported_at,
    createdAt: r.created_at,
    lat: r.lat,
    lng: r.lng,
  };
}

function mapCamp(r: any): RefugeeCamp {
  return {
    id: r.id,
    name: r.name,
    region: r.region,
    capacity: r.capacity,
    currentOccupancy: r.current_occupancy,
    status: r.status,
    managedBy: r.managed_by,
    lat: r.lat,
    lng: r.lng,
    lastUpdated: r.last_updated ?? r.updated_at,
    sourceConfidence: r.source_confidence ?? 0.8,
  };
}

function mapFacility(r: any): HumanitarianFacility {
  return {
    id: r.id,
    name: r.name,
    facilityType: r.facility_type,
    status: r.status,
    capacity: r.capacity,
    currentLoad: r.current_load,
    address: r.address,
    lat: r.lat,
    lng: r.lng,
    contact: r.contact,
    lastUpdated: r.last_updated ?? r.updated_at,
    sourceConfidence: r.source_confidence ?? 0.8,
    source: r.source ?? 'supabase',
  };
}

function mapRoute(r: any): SafeRoute {
  return {
    id: r.id,
    name: r.name,
    originLat: r.origin_lat,
    originLng: r.origin_lng,
    destinationLat: r.destination_lat,
    destinationLng: r.destination_lng,
    waypoints: typeof r.waypoints === 'string' ? JSON.parse(r.waypoints) : (r.waypoints ?? []),
    distanceKm: r.distance_km,
    estimatedMinutes: r.estimated_minutes,
    safetyScore: r.safety_score,
    hazards: typeof r.hazards === 'string' ? JSON.parse(r.hazards) : (r.hazards ?? []),
    lastVerified: r.last_verified,
    status: r.status,
  };
}

function mapWarning(r: any): EarlyWarningEvent {
  return {
    id: r.id,
    detectionType: r.detection_type,
    intensity: r.intensity,
    confirmed: r.confirmed,
    lat: r.lat,
    lng: r.lng,
    location: r.location,
    source: r.source,
    sources: typeof r.sources === 'string' ? JSON.parse(r.sources) : (r.sources ?? []),
    confidenceTier: r.confidence_tier,
    detectedAt: r.detected_at,
    resolvedAt: r.resolved_at,
    createdAt: r.created_at,
  };
}

function mapDelivery(r: any): AidDeliveryRecord {
  return {
    id: r.id,
    requestId: r.request_id,
    matchId: r.match_id,
    status: r.status,
    category: r.category,
    quantity: r.quantity,
    donorName: r.donor_name,
    recipientLocation: r.recipient_location,
    lat: r.lat,
    lng: r.lng,
    dispatchedAt: r.dispatched_at,
    deliveredAt: r.delivered_at,
    proofMediaUrls: typeof r.proof_media_urls === 'string' ? JSON.parse(r.proof_media_urls) : (r.proof_media_urls ?? []),
    reviewerNotes: r.reviewer_notes,
    createdAt: r.created_at,
  };
}

// ── Query hooks ────────────────────────────────────────────

export function useDisplacementFlows() {
  return useQuery<DisplacementFlow[]>({
    queryKey: ['displacement_flows'],
    queryFn: () =>
      fetchWithFallback('displacement_flows', 'displacement', mapDisplacement, () => []),
    staleTime: 60_000,
  });
}

export function useRefugeeCamps() {
  return useQuery<RefugeeCamp[]>({
    queryKey: ['refugee_camps'],
    queryFn: () =>
      fetchWithFallback('refugee_camps', 'refugee_camps', mapCamp, () => _mockRefugeeCamps),
    staleTime: 60_000,
  });
}

export function useHumanitarianFacilities(facilityType?: string) {
  return useQuery<HumanitarianFacility[]>({
    queryKey: ['humanitarian_facilities', facilityType],
    queryFn: async () => {
      try {
        let q = supabase.from('humanitarian_facilities').select('*').order('last_updated', { ascending: false }).limit(500);
        if (facilityType) q = q.eq('facility_type', facilityType);
        const { data, error } = await q;
        if (error) throw error;
        if (data && data.length > 0) {
          publishFeedHeartbeat('facilities', 'humanitarian', true, 300).catch(() => {});
          return data.map(mapFacility);
        }
      } catch (err) {
        publishFeedHeartbeat('facilities', 'humanitarian', false, 300, String(err)).catch(() => {});
      }
      await ensureMockFallbacks();
      if (facilityType) return _mockFacilities.filter((f) => f.facilityType === facilityType);
      return _mockFacilities;
    },
    staleTime: 60_000,
  });
}

export function useSafeRoutes() {
  return useQuery<SafeRoute[]>({
    queryKey: ['safe_routes'],
    queryFn: () =>
      fetchWithFallback('safe_routes', 'safe_routes', mapRoute, () => _mockRoutes, 'last_verified'),
    staleTime: 120_000,
  });
}

export function useEarlyWarnings() {
  return useQuery<EarlyWarningEvent[]>({
    queryKey: ['early_warnings'],
    queryFn: () =>
      fetchWithFallback('early_warnings', 'early_warnings', mapWarning, () => _mockWarnings, 'detected_at'),
    staleTime: 30_000,
  });
}

export function useAidDeliveries() {
  return useQuery<AidDeliveryRecord[]>({
    queryKey: ['aid_deliveries'],
    queryFn: () =>
      fetchWithFallback('aid_deliveries', 'aid_deliveries', mapDelivery, () => []),
    staleTime: 30_000,
  });
}

// ── Mutations ──────────────────────────────────────────────

export function useUpdateDeliveryStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      notes,
    }: {
      id: string;
      status: AidDeliveryRecord['status'];
      notes?: string;
    }) => {
      const updates: Record<string, unknown> = { status };
      if (status === 'dispatched') updates.dispatched_at = new Date().toISOString();
      if (status === 'delivered') updates.delivered_at = new Date().toISOString();
      if (notes) updates.reviewer_notes = notes;
      const { error } = await supabase.from('aid_deliveries').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['aid_deliveries'] }),
  });
}
