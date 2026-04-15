export interface MapLayerToggleState {
  // Core
  hotspots: boolean;
  airstrikes: boolean;
  news: boolean;
  weather: boolean;
  borders: boolean;
  daynight: boolean;
  // Humanitarian
  shelters: boolean;
  housing: boolean;
  hospitals: boolean;
  sos: boolean;
  displacement: boolean;
  safeRoutes: boolean;
  earlyWarning: boolean;
  // Infrastructure
  infrastructure: boolean;
  powerGrid: boolean;
  telecom: boolean;
  supplyRoutes: boolean;
  maritime: boolean;
  subseaCables: boolean;
  pipelines: boolean;
  aviation: boolean;
  // Intelligence
  satellite: boolean;
  cyber: boolean;
  protests: boolean;
  militaryAssets: boolean;
  nuclearSites: boolean;
  gpsJamming: boolean;
  strategicInvestments: boolean;
}

export type MapTimeFilter = '1h' | '6h' | '24h' | '48h' | '7d' | 'all';

export interface MapViewportState {
  lat: number;
  lng: number;
  zoom: number;
}

export interface MapLayerContract {
  layers: MapLayerToggleState;
  timeFilter: MapTimeFilter;
}

export interface MapLayerDefinition {
  key: keyof MapLayerToggleState;
  labelKey: string;
  colorClass: string;
  group: 'core' | 'humanitarian' | 'infra' | 'intelligence';
}

export const MAP_LAYER_DEFINITIONS: MapLayerDefinition[] = [
  // Core
  { key: 'hotspots', labelKey: 'map.hotspots', colorClass: 'text-[#a855f7]', group: 'core' },
  { key: 'airstrikes', labelKey: 'map.conflicts', colorClass: 'text-danger', group: 'core' },
  { key: 'news', labelKey: 'map.news', colorClass: 'text-warning', group: 'core' },
  { key: 'weather', labelKey: 'map.weather', colorClass: 'text-[#93c5fd]', group: 'core' },
  { key: 'borders', labelKey: 'map.borders', colorClass: 'text-[#f8fafc]', group: 'core' },
  { key: 'daynight', labelKey: 'map.dayNight', colorClass: 'text-[#fbbf24]', group: 'core' },
  // Humanitarian
  { key: 'sos', labelKey: 'map.sos', colorClass: 'text-destructive', group: 'humanitarian' },
  { key: 'shelters', labelKey: 'map.shelters', colorClass: 'text-success', group: 'humanitarian' },
  { key: 'housing', labelKey: 'map.housing', colorClass: 'text-info', group: 'humanitarian' },
  { key: 'hospitals', labelKey: 'map.hospitals', colorClass: 'text-[#ef4444]', group: 'humanitarian' },
  { key: 'displacement', labelKey: 'map.displacement', colorClass: 'text-[#84cc16]', group: 'humanitarian' },
  { key: 'safeRoutes', labelKey: 'map.safeRoutes', colorClass: 'text-[#34d399]', group: 'humanitarian' },
  { key: 'earlyWarning', labelKey: 'map.earlyWarning', colorClass: 'text-[#f97316]', group: 'humanitarian' },
  // Infrastructure
  { key: 'infrastructure', labelKey: 'map.infra', colorClass: 'text-[#06b6d4]', group: 'infra' },
  { key: 'powerGrid', labelKey: 'map.powerGrid', colorClass: 'text-[#f59e0b]', group: 'infra' },
  { key: 'telecom', labelKey: 'map.telecom', colorClass: 'text-[#38bdf8]', group: 'infra' },
  { key: 'supplyRoutes', labelKey: 'map.supplyRoutes', colorClass: 'text-[#10b981]', group: 'infra' },
  { key: 'maritime', labelKey: 'map.maritime', colorClass: 'text-[#60a5fa]', group: 'infra' },
  { key: 'subseaCables', labelKey: 'map.subseaCables', colorClass: 'text-[#818cf8]', group: 'infra' },
  { key: 'pipelines', labelKey: 'map.pipelines', colorClass: 'text-[#a78bfa]', group: 'infra' },
  { key: 'aviation', labelKey: 'map.aviation', colorClass: 'text-[#67e8f9]', group: 'infra' },
  // Intelligence
  { key: 'satellite', labelKey: 'map.satellite', colorClass: 'text-[#e879f9]', group: 'intelligence' },
  { key: 'cyber', labelKey: 'map.cyber', colorClass: 'text-[#22d3ee]', group: 'intelligence' },
  { key: 'protests', labelKey: 'map.protests', colorClass: 'text-[#fb7185]', group: 'intelligence' },
  { key: 'militaryAssets', labelKey: 'map.militaryAssets', colorClass: 'text-[#f43f5e]', group: 'intelligence' },
  { key: 'nuclearSites', labelKey: 'map.nuclearSites', colorClass: 'text-[#eab308]', group: 'intelligence' },
  { key: 'gpsJamming', labelKey: 'map.gpsJamming', colorClass: 'text-[#f59e0b]', group: 'intelligence' },
  { key: 'strategicInvestments', labelKey: 'map.strategicInvestments', colorClass: 'text-[#4ade80]', group: 'intelligence' },
];

export const DEFAULT_MAP_LAYER_STATE: MapLayerToggleState = {
  // Core
  hotspots: true,
  airstrikes: true,
  news: true,
  weather: true,
  borders: true,
  daynight: false,
  // Humanitarian
  shelters: true,
  housing: true,
  hospitals: true,
  sos: true,
  displacement: true,
  safeRoutes: false,
  earlyWarning: true,
  // Infrastructure
  infrastructure: true,
  powerGrid: true,
  telecom: true,
  supplyRoutes: true,
  maritime: true,
  subseaCables: false,
  pipelines: false,
  aviation: false,
  // Intelligence
  satellite: false,
  cyber: true,
  protests: true,
  militaryAssets: false,
  nuclearSites: false,
  gpsJamming: false,
  strategicInvestments: false,
};

export const DEFAULT_MAP_VIEWPORT: MapViewportState = {
  lat: 33.8547,
  lng: 35.8623,
  zoom: 6,
};

export function normalizeMapLayerState(input?: Partial<MapLayerToggleState>): MapLayerToggleState {
  return {
    ...DEFAULT_MAP_LAYER_STATE,
    ...(input ?? {}),
  };
}

export const DEFAULT_MAP_CONTRACT: MapLayerContract = {
  layers: normalizeMapLayerState(),
  timeFilter: 'all',
};

// ── Mission-type presets (Task 18) ─────────────────────────

export type MissionType = 'humanitarian' | 'intel' | 'operations' | 'recovery';
export type Platform = 'desktop' | 'mobile';

export interface MapLayerPreset {
  missionType: MissionType;
  platform: Platform;
  enabledLayers: (keyof MapLayerToggleState)[];
}

export const MAP_LAYER_PRESETS: MapLayerPreset[] = [
  {
    missionType: 'humanitarian',
    platform: 'desktop',
    enabledLayers: ['sos', 'shelters', 'housing', 'hospitals', 'displacement', 'safeRoutes', 'earlyWarning', 'weather', 'news'],
  },
  {
    missionType: 'humanitarian',
    platform: 'mobile',
    enabledLayers: ['sos', 'shelters', 'hospitals', 'safeRoutes', 'earlyWarning'],
  },
  {
    missionType: 'intel',
    platform: 'desktop',
    enabledLayers: ['hotspots', 'airstrikes', 'protests', 'cyber', 'satellite', 'militaryAssets', 'nuclearSites', 'gpsJamming', 'maritime', 'news', 'earlyWarning'],
  },
  {
    missionType: 'intel',
    platform: 'mobile',
    enabledLayers: ['hotspots', 'airstrikes', 'protests', 'earlyWarning', 'news'],
  },
  {
    missionType: 'operations',
    platform: 'desktop',
    enabledLayers: ['hotspots', 'airstrikes', 'shelters', 'hospitals', 'infrastructure', 'powerGrid', 'telecom', 'maritime', 'aviation', 'supplyRoutes', 'earlyWarning', 'news', 'sos'],
  },
  {
    missionType: 'operations',
    platform: 'mobile',
    enabledLayers: ['hotspots', 'airstrikes', 'shelters', 'sos', 'infrastructure', 'earlyWarning', 'news'],
  },
  {
    missionType: 'recovery',
    platform: 'desktop',
    enabledLayers: ['shelters', 'housing', 'infrastructure', 'powerGrid', 'supplyRoutes', 'displacement', 'safeRoutes', 'news', 'daynight', 'strategicInvestments'],
  },
  {
    missionType: 'recovery',
    platform: 'mobile',
    enabledLayers: ['shelters', 'housing', 'infrastructure', 'safeRoutes', 'daynight'],
  },
];

export function getPresetLayers(missionType: MissionType, platform: Platform): MapLayerToggleState {
  const preset = MAP_LAYER_PRESETS.find(p => p.missionType === missionType && p.platform === platform);
  if (!preset) return DEFAULT_MAP_LAYER_STATE;
  const state = { ...DEFAULT_MAP_LAYER_STATE };
  for (const key of Object.keys(state) as (keyof MapLayerToggleState)[]) {
    state[key] = preset.enabledLayers.includes(key);
  }
  return state;
}

// ── Per-layer clustering rules ─────────────────────────────

export interface LayerClusterConfig {
  layer: keyof MapLayerToggleState;
  clusterRadius: number;      // pixels
  maxZoomForCluster: number;  // stop clustering above this zoom
  minPointsToCluster: number;
}

export const LAYER_CLUSTER_CONFIGS: LayerClusterConfig[] = [
  { layer: 'hotspots', clusterRadius: 50, maxZoomForCluster: 12, minPointsToCluster: 3 },
  { layer: 'airstrikes', clusterRadius: 40, maxZoomForCluster: 14, minPointsToCluster: 2 },
  { layer: 'shelters', clusterRadius: 30, maxZoomForCluster: 13, minPointsToCluster: 3 },
  { layer: 'hospitals', clusterRadius: 30, maxZoomForCluster: 13, minPointsToCluster: 2 },
  { layer: 'sos', clusterRadius: 25, maxZoomForCluster: 15, minPointsToCluster: 2 },
  { layer: 'displacement', clusterRadius: 60, maxZoomForCluster: 10, minPointsToCluster: 3 },
  { layer: 'protests', clusterRadius: 50, maxZoomForCluster: 11, minPointsToCluster: 3 },
  { layer: 'cyber', clusterRadius: 60, maxZoomForCluster: 8, minPointsToCluster: 2 },
  { layer: 'militaryAssets', clusterRadius: 40, maxZoomForCluster: 10, minPointsToCluster: 2 },
  { layer: 'maritime', clusterRadius: 70, maxZoomForCluster: 8, minPointsToCluster: 5 },
  { layer: 'earlyWarning', clusterRadius: 35, maxZoomForCluster: 14, minPointsToCluster: 2 },
  { layer: 'news', clusterRadius: 50, maxZoomForCluster: 11, minPointsToCluster: 3 },
];
