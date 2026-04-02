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
}

export type MapTimeFilter = '1h' | '6h' | '24h' | '48h' | '7d' | 'all';

export interface MapLayerContract {
  layers: MapLayerToggleState;
  timeFilter: MapTimeFilter;
}

export const DEFAULT_MAP_LAYER_STATE: MapLayerToggleState = {
  hotspots: true,
  airstrikes: true,
  shelters: true,
  housing: true,
  news: true,
  hospitals: true,
  infrastructure: true,
  sos: true,
  daynight: false,
};

export const DEFAULT_MAP_CONTRACT: MapLayerContract = {
  layers: DEFAULT_MAP_LAYER_STATE,
  timeFilter: 'all',
};
