/**
 * Task 23 – Mock-to-live bridge.
 *
 * Provides React Query hooks that try Supabase first and fall back
 * to the existing mock datasets. Each panel can import its data
 * from here instead of directly from src/data/*.
 *
 * This is an incremental migration path: panels get loading/error
 * states and health telemetry without rewriting their rendering.
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { publishFeedHeartbeat } from './healthService';

// ── Generic bridge factory ─────────────────────────────────

interface BridgeOptions<T> {
  /** Supabase table name to try first */
  table: string;
  /** Feed name for health telemetry */
  feedName: string;
  /** Domain for health telemetry */
  domain: 'humanitarian' | 'financial' | 'infrastructure' | 'intelligence';
  /** Order column */
  orderCol?: string;
  /** Row mapper from snake_case DB row → T (optional, defaults to identity) */
  mapper?: (row: any) => T;
  /** Lazy import of mock fallback data */
  mockFallback: () => Promise<T[]>;
  /** React Query stale time in ms */
  staleTime?: number;
  /** Limit rows */
  limit?: number;
}

export function useBridgedData<T>(opts: BridgeOptions<T>) {
  return useQuery<T[]>({
    queryKey: [opts.table],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from(opts.table)
          .select('*')
          .order(opts.orderCol ?? 'created_at', { ascending: false })
          .limit(opts.limit ?? 500);
        if (error) throw error;
        if (data && data.length > 0) {
          publishFeedHeartbeat(opts.feedName, opts.domain, true, 300).catch(() => {});
          return opts.mapper ? data.map(opts.mapper) : (data as T[]);
        }
      } catch (err) {
        publishFeedHeartbeat(opts.feedName, opts.domain, false, 300, String(err)).catch(() => {});
      }
      // Fall back to mock data
      return opts.mockFallback();
    },
    staleTime: opts.staleTime ?? 60_000,
  });
}

// ────────────────────────────────────────────────────────────
// Pre-built bridges for every mock dataset
// ────────────────────────────────────────────────────────────

// — extendedMockData bridges —

export function useBridgedMedicalFacilities() {
  return useBridgedData({
    table: 'humanitarian_facilities',
    feedName: 'medical_facilities',
    domain: 'humanitarian',
    orderCol: 'updated_at',
    mockFallback: async () => {
      const m = await import('@/data/extendedMockData');
      return m.mockMedicalFacilities ?? [];
    },
  });
}

export function useBridgedSafeRoutes() {
  return useBridgedData({
    table: 'safe_routes',
    feedName: 'safe_routes',
    domain: 'humanitarian',
    orderCol: 'created_at',
    mockFallback: async () => {
      const m = await import('@/data/extendedMockData');
      return m.mockSafeRoutes ?? [];
    },
  });
}

export function useBridgedHazardPoints() {
  return useBridgedData({
    table: 'hazard_points',
    feedName: 'hazard_points',
    domain: 'humanitarian',
    mockFallback: async () => {
      const m = await import('@/data/extendedMockData');
      return m.mockHazardPoints ?? [];
    },
  });
}

export function useBridgedAidRequests() {
  return useBridgedData({
    table: 'aid_requests',
    feedName: 'aid_requests',
    domain: 'humanitarian',
    mockFallback: async () => {
      const m = await import('@/data/extendedMockData');
      return m.mockAidRequests ?? [];
    },
  });
}

export function useBridgedAidOffers() {
  return useBridgedData({
    table: 'aid_offers',
    feedName: 'aid_offers',
    domain: 'humanitarian',
    mockFallback: async () => {
      const m = await import('@/data/extendedMockData');
      return m.mockAidOffers ?? [];
    },
  });
}

export function useBridgedDisplacementFlows() {
  return useBridgedData({
    table: 'displacement_flows',
    feedName: 'displacement',
    domain: 'humanitarian',
    mockFallback: async () => {
      const m = await import('@/data/extendedMockData');
      return m.mockDisplacementFlows ?? [];
    },
  });
}

export function useBridgedReconstructionProjects() {
  return useBridgedData({
    table: 'reconstruction_projects',
    feedName: 'reconstruction',
    domain: 'humanitarian',
    mockFallback: async () => {
      const m = await import('@/data/extendedMockData');
      return m.mockReconstructionProjects ?? [];
    },
  });
}

export function useBridgedSkilledWorkers() {
  return useBridgedData({
    table: 'skilled_workers',
    feedName: 'skilled_workers',
    domain: 'humanitarian',
    mockFallback: async () => {
      const m = await import('@/data/extendedMockData');
      return m.mockSkilledWorkers ?? [];
    },
  });
}

export function useBridgedAidFunds() {
  return useBridgedData({
    table: 'aid_funds',
    feedName: 'aid_funds',
    domain: 'humanitarian',
    mockFallback: async () => {
      const m = await import('@/data/newFeaturesMockData2');
      return m.mockAidFunds ?? [];
    },
  });
}

export function useBridgedNightPowerGrid() {
  return useBridgedData({
    table: 'night_power_grid',
    feedName: 'night_power',
    domain: 'infrastructure',
    mockFallback: async () => {
      const m = await import('@/data/extendedMockData');
      return m.mockNightPowerGrid ?? [];
    },
  });
}

export function useBridgedSupplyChain() {
  return useBridgedData({
    table: 'supply_chain',
    feedName: 'supply_chain',
    domain: 'infrastructure',
    mockFallback: async () => {
      const m = await import('@/data/extendedMockData');
      return m.mockCommunitySupplies ?? [];
    },
  });
}

export function useBridgedLastMileDelivery() {
  return useBridgedData({
    table: 'last_mile_delivery',
    feedName: 'last_mile',
    domain: 'humanitarian',
    mockFallback: async () => {
      const m = await import('@/data/extendedMockData');
      return m.mockLastMileDeliveries ?? [];
    },
  });
}

// — newFeaturesMockData bridges —

export function useBridgedConnectivity() {
  return useBridgedData({
    table: 'connectivity_points',
    feedName: 'connectivity',
    domain: 'infrastructure',
    mockFallback: async () => {
      const m = await import('@/data/newFeaturesMockData');
      return m.mockConnectivityPoints ?? [];
    },
  });
}

export function useBridgedCommNodes() {
  return useBridgedData({
    table: 'comm_nodes',
    feedName: 'mesh_network',
    domain: 'infrastructure',
    mockFallback: async () => {
      const m = await import('@/data/newFeaturesMockData');
      return m.mockCommNodes ?? [];
    },
  });
}

export function useBridgedRefugeeCamps() {
  return useBridgedData({
    table: 'refugee_camps',
    feedName: 'refugee_camps',
    domain: 'humanitarian',
    mockFallback: async () => {
      const m = await import('@/data/newFeaturesMockData');
      return m.mockRefugeeCamps ?? [];
    },
  });
}

export function useBridgedEmptyBuildings() {
  return useBridgedData({
    table: 'empty_buildings',
    feedName: 'empty_buildings',
    domain: 'humanitarian',
    mockFallback: async () => {
      const m = await import('@/data/newFeaturesMockData');
      return m.mockEmptyBuildings ?? [];
    },
  });
}

// — newFeaturesMockData2 bridges —

export function useBridgedGPSJamming() {
  return useBridgedData({
    table: 'gps_jamming_zones',
    feedName: 'gps_jamming',
    domain: 'intelligence',
    mockFallback: async () => {
      const m = await import('@/data/newFeaturesMockData2');
      return m.mockGPSJammingZones ?? [];
    },
  });
}

export function useBridgedProtests() {
  return useBridgedData({
    table: 'protest_events',
    feedName: 'protests',
    domain: 'intelligence',
    orderCol: 'reported_at',
    mockFallback: async () => {
      const m = await import('@/data/worldMonitorMockData');
      return m.mockProtestEvents ?? [];
    },
  });
}

export function useBridgedWeatherAlerts() {
  return useBridgedData({
    table: 'weather_alerts',
    feedName: 'weather',
    domain: 'infrastructure',
    mockFallback: async () => {
      const m = await import('@/data/newFeaturesMockData2');
      return m.mockWeatherAlerts ?? [];
    },
  });
}

export function useBridgedEarlyWarnings() {
  return useBridgedData({
    table: 'early_warnings',
    feedName: 'early_warnings',
    domain: 'humanitarian',
    orderCol: 'detected_at',
    mockFallback: async () => {
      const m = await import('@/data/newFeaturesMockData2');
      return m.mockEarlyWarningEvents ?? [];
    },
  });
}

export function useBridgedSafeBuildings() {
  return useBridgedData({
    table: 'safe_buildings',
    feedName: 'safe_buildings',
    domain: 'humanitarian',
    mockFallback: async () => {
      const m = await import('@/data/newFeaturesMockData2');
      return m.mockSafeBuildings ?? [];
    },
  });
}

export function useBridgedFuelStations() {
  return useBridgedData({
    table: 'fuel_stations',
    feedName: 'fuel_stations',
    domain: 'infrastructure',
    mockFallback: async () => {
      const m = await import('@/data/newFeaturesMockData2');
      return m.mockFuelStations ?? [];
    },
  });
}

export function useBridgedBorderCrossings() {
  return useBridgedData({
    table: 'border_crossings',
    feedName: 'border_crossings',
    domain: 'humanitarian',
    mockFallback: async () => {
      const m = await import('@/data/newFeaturesMockData2');
      return m.mockBorderCrossings ?? [];
    },
  });
}

export function useBridgedFoodWaterPoints() {
  return useBridgedData({
    table: 'food_water_points',
    feedName: 'food_water',
    domain: 'humanitarian',
    mockFallback: async () => {
      const m = await import('@/data/newFeaturesMockData2');
      return m.mockFoodWaterPoints ?? [];
    },
  });
}

export function useBridgedPharmacyStock() {
  return useBridgedData({
    table: 'pharmacy_stock',
    feedName: 'pharmacy',
    domain: 'humanitarian',
    mockFallback: async () => {
      const m = await import('@/data/newFeaturesMockData2');
      return m.mockPharmacyStock ?? [];
    },
  });
}

export function useBridgedBloodNeeds() {
  return useBridgedData({
    table: 'blood_needs',
    feedName: 'blood_bank',
    domain: 'humanitarian',
    mockFallback: async () => {
      const m = await import('@/data/newFeaturesMockData2');
      return m.mockBloodNeeds ?? [];
    },
  });
}

export function useBridgedEmergencyPlans() {
  return useBridgedData({
    table: 'emergency_plans',
    feedName: 'emergency_plans',
    domain: 'humanitarian',
    mockFallback: async () => {
      const m = await import('@/data/newFeaturesMockData2');
      return m.mockEmergencyPlans ?? [];
    },
  });
}

export function useBridgedEmergencyKitItems() {
  return useBridgedData({
    table: 'emergency_kit_items',
    feedName: 'emergency_kit',
    domain: 'humanitarian',
    mockFallback: async () => {
      const m = await import('@/data/newFeaturesMockData2');
      return m.mockEmergencyKitItems ?? [];
    },
  });
}

export function useBridgedCarpoolRides() {
  return useBridgedData({
    table: 'carpool_rides',
    feedName: 'carpool',
    domain: 'humanitarian',
    mockFallback: async () => {
      const m = await import('@/data/newFeaturesMockData2');
      return m.mockCarpoolRides ?? [];
    },
  });
}

// — worldMonitorMockData bridges —

export function useBridgedAirstrikes() {
  return useBridgedData({
    table: 'airstrikes',
    feedName: 'airstrikes',
    domain: 'intelligence',
    mockFallback: async () => {
      const m = await import('@/data/worldMonitorMockData');
      return m.mockAirstrikes ?? [];
    },
  });
}

export function useBridgedHospitals() {
  return useBridgedData({
    table: 'hospitals',
    feedName: 'hospitals',
    domain: 'humanitarian',
    mockFallback: async () => {
      const m = await import('@/data/worldMonitorMockData');
      return m.mockHospitals ?? [];
    },
  });
}

export function useBridgedDonations() {
  return useBridgedData({
    table: 'donation_links',
    feedName: 'donations',
    domain: 'humanitarian',
    mockFallback: async () => {
      const m = await import('@/data/worldMonitorMockData');
      return m.mockDonations ?? [];
    },
  });
}

export function useBridgedEmergencyContacts() {
  return useBridgedData({
    table: 'emergency_contacts',
    feedName: 'emergency_contacts',
    domain: 'humanitarian',
    mockFallback: async () => {
      const m = await import('@/data/worldMonitorMockData');
      return m.mockEmergencyContacts ?? [];
    },
  });
}

export function useBridgedLiveStreams() {
  return useBridgedData({
    table: 'live_streams',
    feedName: 'live_streams',
    domain: 'intelligence',
    mockFallback: async () => {
      const m = await import('@/data/worldMonitorMockData');
      return m.mockLiveStreams ?? [];
    },
  });
}

// — Additional bridges for panel migration —

export function useBridgedVolunteers() {
  return useBridgedData({
    table: 'volunteers',
    feedName: 'volunteers',
    domain: 'humanitarian',
    mockFallback: async () => {
      const m = await import('@/data/extendedMockData');
      return m.mockVolunteers ?? [];
    },
  });
}

export function useBridgedLogistics() {
  return useBridgedData({
    table: 'logistics',
    feedName: 'logistics',
    domain: 'infrastructure',
    mockFallback: async () => {
      const m = await import('@/data/extendedMockData');
      return m.mockLogistics ?? [];
    },
  });
}

export function useBridgedDiasporaDonors() {
  return useBridgedData({
    table: 'diaspora_donors',
    feedName: 'diaspora_donors',
    domain: 'humanitarian',
    mockFallback: async () => {
      const m = await import('@/data/newFeaturesMockData2');
      return m.mockDiasporaDonors ?? [];
    },
  });
}

export function useBridgedInternationalAid() {
  return useBridgedData({
    table: 'international_aid',
    feedName: 'international_aid',
    domain: 'humanitarian',
    mockFallback: async () => {
      const m = await import('@/data/newFeaturesMockData2');
      return m.mockInternationalAid ?? [];
    },
  });
}

export function useBridgedVaultDocuments() {
  return useBridgedData({
    table: 'vault_documents',
    feedName: 'vault_documents',
    domain: 'humanitarian',
    mockFallback: async () => {
      const m = await import('@/data/newFeaturesMockData2');
      return m.mockVaultDocuments ?? [];
    },
  });
}

export function useBridgedDIYTutorials() {
  return useBridgedData({
    table: 'diy_tutorials',
    feedName: 'diy_tutorials',
    domain: 'humanitarian',
    mockFallback: async () => {
      const m = await import('@/data/newFeaturesMockData');
      return m.mockDIYTutorials ?? [];
    },
  });
}

export function useBridgedCommunityChannels() {
  return useBridgedData({
    table: 'community_channels',
    feedName: 'community_channels',
    domain: 'humanitarian',
    mockFallback: async () => {
      const m = await import('@/data/extendedMockData');
      return m.mockCommunityChannels ?? [];
    },
  });
}

export function useBridgedCommunityRisks() {
  return useBridgedData({
    table: 'community_risks',
    feedName: 'community_risks',
    domain: 'humanitarian',
    mockFallback: async () => {
      const m = await import('@/data/newFeaturesMockData');
      return m.mockCommunityRisks ?? [];
    },
  });
}

export function useBridgedKnowledgeArticles() {
  return useBridgedData({
    table: 'knowledge_articles',
    feedName: 'knowledge_articles',
    domain: 'humanitarian',
    mockFallback: async () => {
      const m = await import('@/data/extendedMockData');
      return m.mockKnowledgeArticles ?? [];
    },
  });
}

export function useBridgedTimelineEvents() {
  return useBridgedData({
    table: 'timeline_events',
    feedName: 'timeline_events',
    domain: 'intelligence',
    orderCol: 'occurred_at',
    mockFallback: async () => {
      const m = await import('@/data/newFeaturesMockData');
      return m.mockTimelineEvents ?? [];
    },
  });
}

export function useBridgedVulnerableCases() {
  return useBridgedData({
    table: 'vulnerable_cases',
    feedName: 'vulnerable_cases',
    domain: 'humanitarian',
    mockFallback: async () => {
      const m = await import('@/data/newFeaturesMockData');
      return m.mockVulnerableCases ?? [];
    },
  });
}

export function useBridgedImpactStats() {
  return useBridgedData({
    table: 'impact_stats',
    feedName: 'impact_stats',
    domain: 'humanitarian',
    mockFallback: async () => {
      const m = await import('@/data/extendedMockData');
      return m.mockImpactStats ?? [];
    },
  });
}

export function useBridgedImpactTimeSeries() {
  return useBridgedData({
    table: 'impact_time_series',
    feedName: 'impact_time_series',
    domain: 'humanitarian',
    mockFallback: async () => {
      const m = await import('@/data/extendedMockData');
      return m.mockImpactTimeSeries ?? [];
    },
  });
}

export function useBridgedFieldHospitalGuides() {
  return useBridgedData({
    table: 'field_hospital_guides',
    feedName: 'field_hospital_guides',
    domain: 'humanitarian',
    mockFallback: async () => {
      const m = await import('@/data/newFeaturesMockData2');
      return m.mockFieldHospitalGuides ?? [];
    },
  });
}

export function useBridgedMedicalEquipment() {
  return useBridgedData({
    table: 'medical_equipment',
    feedName: 'medical_equipment',
    domain: 'humanitarian',
    mockFallback: async () => {
      const m = await import('@/data/newFeaturesMockData2');
      return m.mockMedicalEquipment ?? [];
    },
  });
}

export function useBridgedSafeParking() {
  return useBridgedData({
    table: 'safe_parking',
    feedName: 'safe_parking',
    domain: 'infrastructure',
    mockFallback: async () => {
      const m = await import('@/data/newFeaturesMockData');
      return m.mockSafeParking ?? [];
    },
  });
}

export function useBridgedTelemedicineProviders() {
  return useBridgedData({
    table: 'telemedicine_providers',
    feedName: 'telemedicine_providers',
    domain: 'humanitarian',
    mockFallback: async () => {
      const m = await import('@/data/newFeaturesMockData');
      return m.mockTelemedicineProviders ?? [];
    },
  });
}

// — Remaining panel bridges —

export function useBridgedSOSContacts() {
  return useBridgedData({
    table: 'emergency_contacts',
    feedName: 'sos_contacts',
    domain: 'humanitarian',
    mockFallback: async () => {
      const m = await import('@/data/mockData');
      return m.mockEmergencyContacts ?? [];
    },
  });
}

export function useBridgedSatelliteEvents() {
  return useBridgedData({
    table: 'satellite_events',
    feedName: 'satellite',
    domain: 'intelligence',
    mockFallback: async () => {
      const m = await import('@/data/extendedMockData');
      return m.mockSatelliteEvents ?? [];
    },
  });
}

export function useBridgedResourceForecasts() {
  return useBridgedData({
    table: 'resource_forecasts',
    feedName: 'resource_forecasts',
    domain: 'humanitarian',
    mockFallback: async () => {
      const m = await import('@/data/newFeaturesMockData2');
      return m.mockResourceForecasts ?? [];
    },
  });
}

export function useBridgedRumors() {
  return useBridgedData({
    table: 'rumors',
    feedName: 'rumors',
    domain: 'intelligence',
    mockFallback: async () => {
      const m = await import('@/data/newFeaturesMockData');
      return m.mockRumors ?? [];
    },
  });
}

export function useBridgedNeighborhoodLeaders() {
  return useBridgedData({
    table: 'neighborhood_leaders',
    feedName: 'neighborhood_leaders',
    domain: 'humanitarian',
    mockFallback: async () => {
      const m = await import('@/data/newFeaturesMockData2');
      return m.mockNeighborhoodLeaders ?? [];
    },
  });
}

export function useBridgedCommunityTasks() {
  return useBridgedData({
    table: 'community_tasks',
    feedName: 'community_tasks',
    domain: 'humanitarian',
    mockFallback: async () => {
      const m = await import('@/data/newFeaturesMockData2');
      return m.mockCommunityTasks ?? [];
    },
  });
}

export function useBridgedNGOActivities() {
  return useBridgedData({
    table: 'ngo_activities',
    feedName: 'ngo_activities',
    domain: 'humanitarian',
    mockFallback: async () => {
      const m = await import('@/data/newFeaturesMockData');
      return m.mockNGOActivities ?? [];
    },
  });
}

export function useBridgedVolunteerMissions() {
  return useBridgedData({
    table: 'volunteer_missions',
    feedName: 'volunteer_missions',
    domain: 'humanitarian',
    mockFallback: async () => {
      const m = await import('@/data/newFeaturesMockData');
      return m.mockVolunteerMissions ?? [];
    },
  });
}

export function useBridgedRiskPredictions() {
  return useBridgedData({
    table: 'risk_predictions',
    feedName: 'risk_predictions',
    domain: 'intelligence',
    mockFallback: async () => {
      const m = await import('@/data/extendedMockData');
      return m.mockRiskPredictions ?? [];
    },
  });
}

export function useBridgedFarmReports() {
  return useBridgedData({
    table: 'farm_reports',
    feedName: 'agriculture',
    domain: 'humanitarian',
    mockFallback: async () => {
      const m = await import('@/data/newFeaturesMockData2');
      return m.mockFarmReports ?? [];
    },
  });
}

export function useBridgedSeedShares() {
  return useBridgedData({
    table: 'seed_shares',
    feedName: 'seed_shares',
    domain: 'humanitarian',
    mockFallback: async () => {
      const m = await import('@/data/newFeaturesMockData2');
      return m.mockSeedShares ?? [];
    },
  });
}
