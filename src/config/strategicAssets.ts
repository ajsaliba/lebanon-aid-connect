/**
 * Strategic Assets — Military bases, nuclear sites, and key infrastructure
 * near geo-located news articles. Inspired by World Monitor.
 */

export interface StrategicAsset {
  id: string;
  name: string;
  type: 'military_base' | 'nuclear_site' | 'naval_base' | 'air_base' | 'datacenter';
  lat: number;
  lng: number;
  country: string;
}

export const STRATEGIC_ASSETS: StrategicAsset[] = [
  // Middle East
  { id: 'incirlik', name: 'Incirlik Air Base', type: 'air_base', lat: 37.002, lng: 35.426, country: 'Turkey' },
  { id: 'al-udeid', name: 'Al Udeid Air Base', type: 'air_base', lat: 25.117, lng: 51.315, country: 'Qatar' },
  { id: 'al-dhafra', name: 'Al Dhafra Air Base', type: 'air_base', lat: 24.248, lng: 54.547, country: 'UAE' },
  { id: 'camp-arifjan', name: 'Camp Arifjan', type: 'military_base', lat: 28.936, lng: 48.099, country: 'Kuwait' },
  { id: 'nsab', name: 'Naval Support Activity Bahrain', type: 'naval_base', lat: 26.228, lng: 50.588, country: 'Bahrain' },
  { id: 'dimona', name: 'Dimona Nuclear Facility', type: 'nuclear_site', lat: 31.001, lng: 35.145, country: 'Israel' },
  { id: 'nevatim', name: 'Nevatim Air Base', type: 'air_base', lat: 31.208, lng: 34.928, country: 'Israel' },
  { id: 'hmeimim', name: 'Khmeimim Air Base', type: 'air_base', lat: 35.411, lng: 35.948, country: 'Syria' },
  { id: 'tartus', name: 'Tartus Naval Facility', type: 'naval_base', lat: 34.889, lng: 35.886, country: 'Syria' },
  { id: 'natanz', name: 'Natanz Nuclear Facility', type: 'nuclear_site', lat: 33.725, lng: 51.726, country: 'Iran' },
  { id: 'isfahan', name: 'Isfahan Nuclear Technology Center', type: 'nuclear_site', lat: 32.656, lng: 51.677, country: 'Iran' },
  { id: 'bushehr', name: 'Bushehr Nuclear Power Plant', type: 'nuclear_site', lat: 28.829, lng: 50.885, country: 'Iran' },
  { id: 'bandar-abbas', name: 'Bandar Abbas Naval Base', type: 'naval_base', lat: 27.148, lng: 56.267, country: 'Iran' },
  // Europe
  { id: 'ramstein', name: 'Ramstein Air Base', type: 'air_base', lat: 49.437, lng: 7.600, country: 'Germany' },
  { id: 'raf-lakenheath', name: 'RAF Lakenheath', type: 'air_base', lat: 52.409, lng: 0.560, country: 'UK' },
  { id: 'raf-croughton', name: 'Royal Air Force Croughton', type: 'military_base', lat: 51.991, lng: -1.218, country: 'UK' },
  { id: 'raf-mildenhall', name: 'RAF Mildenhall', type: 'air_base', lat: 52.362, lng: 0.486, country: 'UK' },
  { id: 'aviano', name: 'Aviano Air Base', type: 'air_base', lat: 46.031, lng: 12.595, country: 'Italy' },
  { id: 'deveselu', name: 'Deveselu Aegis Ashore', type: 'military_base', lat: 44.063, lng: 24.381, country: 'Romania' },
  { id: 'redzikowo', name: 'Redzikowo Aegis Ashore', type: 'military_base', lat: 54.478, lng: 17.100, country: 'Poland' },
  // Pacific
  { id: 'yokosuka', name: 'Naval Base Yokosuka', type: 'naval_base', lat: 35.283, lng: 139.670, country: 'Japan' },
  { id: 'kadena', name: 'Kadena Air Base', type: 'air_base', lat: 26.352, lng: 127.768, country: 'Japan' },
  { id: 'guam', name: 'Andersen Air Force Base', type: 'air_base', lat: 13.583, lng: 144.924, country: 'Guam' },
  { id: 'camp-humphreys', name: 'Camp Humphreys', type: 'military_base', lat: 36.963, lng: 127.031, country: 'South Korea' },
  // Africa
  { id: 'djibouti', name: 'Camp Lemonnier', type: 'military_base', lat: 11.547, lng: 43.155, country: 'Djibouti' },
];

const ASSET_TYPE_CONFIG: Record<StrategicAsset['type'], { label: string; icon: string }> = {
  military_base: { label: 'Military Bases', icon: '🏛' },
  nuclear_site: { label: 'Nuclear Sites', icon: '☢' },
  naval_base: { label: 'Naval Bases', icon: '⚓' },
  air_base: { label: 'Air Bases', icon: '✈' },
  datacenter: { label: 'Datacenter', icon: '🖥' },
};

export function getAssetTypeConfig(type: StrategicAsset['type']) {
  return ASSET_TYPE_CONFIG[type];
}

/** Haversine distance in km */
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export interface NearbyAsset {
  asset: StrategicAsset;
  distanceKm: number;
}

export function findNearbyAssets(lat: number, lng: number, radiusKm = 600, limit = 3): NearbyAsset[] {
  return STRATEGIC_ASSETS
    .map(asset => ({ asset, distanceKm: Math.round(haversineKm(lat, lng, asset.lat, asset.lng)) }))
    .filter(a => a.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
}
