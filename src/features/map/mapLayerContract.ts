export interface MapLayerToggleState {
  hotspots: boolean;
  airstrikes: boolean;
  shelters: boolean;
  housing: boolean;
  news: boolean;
  hospitals: boolean;
  infrastructure: boolean;
  sos: boolean;
  daynight: boolean;
  protests: boolean;
  displacement: boolean;
  weather: boolean;
  cyber: boolean;
  maritime: boolean;
  telecom: boolean;
  powerGrid: boolean;
  satellite: boolean;
  borders: boolean;
  supplyRoutes: boolean;
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
  { key: 'sos', labelKey: 'map.sos', colorClass: 'text-destructive', group: 'humanitarian' },
  { key: 'hotspots', labelKey: 'map.hotspots', colorClass: 'text-[#a855f7]', group: 'core' },
  { key: 'airstrikes', labelKey: 'map.conflicts', colorClass: 'text-danger', group: 'core' },
  { key: 'news', labelKey: 'map.news', colorClass: 'text-warning', group: 'core' },
  { key: 'shelters', labelKey: 'map.shelters', colorClass: 'text-success', group: 'humanitarian' },
  { key: 'housing', labelKey: 'map.housing', colorClass: 'text-info', group: 'humanitarian' },
  { key: 'hospitals', labelKey: 'map.hospitals', colorClass: 'text-[#ef4444]', group: 'humanitarian' },
  { key: 'infrastructure', labelKey: 'map.infra', colorClass: 'text-[#06b6d4]', group: 'infra' },
  { key: 'powerGrid', labelKey: 'map.powerGrid', colorClass: 'text-[#f59e0b]', group: 'infra' },
  { key: 'telecom', labelKey: 'map.telecom', colorClass: 'text-[#38bdf8]', group: 'infra' },
  { key: 'supplyRoutes', labelKey: 'map.supplyRoutes', colorClass: 'text-[#10b981]', group: 'infra' },
  { key: 'maritime', labelKey: 'map.maritime', colorClass: 'text-[#60a5fa]', group: 'infra' },
  { key: 'satellite', labelKey: 'map.satellite', colorClass: 'text-[#e879f9]', group: 'intelligence' },
  { key: 'cyber', labelKey: 'map.cyber', colorClass: 'text-[#22d3ee]', group: 'intelligence' },
  { key: 'protests', labelKey: 'map.protests', colorClass: 'text-[#fb7185]', group: 'intelligence' },
  { key: 'displacement', labelKey: 'map.displacement', colorClass: 'text-[#84cc16]', group: 'humanitarian' },
  { key: 'weather', labelKey: 'map.weather', colorClass: 'text-[#93c5fd]', group: 'core' },
  { key: 'borders', labelKey: 'map.borders', colorClass: 'text-[#f8fafc]', group: 'core' },
  { key: 'daynight', labelKey: 'map.dayNight', colorClass: 'text-[#fbbf24]', group: 'core' },
];

export const DEFAULT_MAP_LAYER_STATE: MapLayerToggleState = {
  hotspots: true,
  airstrikes: true,
  shelters: true,
  housing: true,
  news: true,
  hospitals: true,
  infrastructure: true,
  sos: true,
  protests: true,
  displacement: true,
  weather: true,
  cyber: true,
  maritime: true,
  telecom: true,
  powerGrid: true,
  satellite: false,
  borders: true,
  supplyRoutes: true,
  daynight: false,
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
