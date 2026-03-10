// ─── GPS Jamming Detection ──────────────────────────────────────────
export interface GPSJammingZone {
  id: string;
  region: string;
  lat: number;
  lng: number;
  radius_km: number;
  intensity: 'low' | 'moderate' | 'severe';
  source: string;
  affected_systems: string[];
  first_detected: string;
  last_detected: string;
  active: boolean;
}

export const mockGPSJammingZones: GPSJammingZone[] = [
  { id: 'gps1', region: 'Eastern Mediterranean', lat: 34.50, lng: 35.50, radius_km: 250, intensity: 'severe', source: 'Military EW systems', affected_systems: ['GPS', 'GLONASS', 'Galileo'], first_detected: '2024-11-28T06:00:00Z', last_detected: '2024-12-01T14:00:00Z', active: true },
  { id: 'gps2', region: 'Northern Israel / S. Lebanon', lat: 33.20, lng: 35.30, radius_km: 120, intensity: 'severe', source: 'Tactical jammers', affected_systems: ['GPS', 'GLONASS'], first_detected: '2024-11-25T10:00:00Z', last_detected: '2024-12-01T14:00:00Z', active: true },
  { id: 'gps3', region: 'Strait of Hormuz', lat: 26.56, lng: 56.25, radius_km: 180, intensity: 'moderate', source: 'IRGC naval assets', affected_systems: ['GPS', 'AIS'], first_detected: '2024-12-01T08:00:00Z', last_detected: '2024-12-01T13:00:00Z', active: true },
  { id: 'gps4', region: 'Black Sea — Crimea', lat: 44.95, lng: 34.10, radius_km: 300, intensity: 'severe', source: 'Russian EW (Krasukha)', affected_systems: ['GPS', 'GLONASS', 'Galileo', 'Starlink'], first_detected: '2024-10-15T00:00:00Z', last_detected: '2024-12-01T14:00:00Z', active: true },
  { id: 'gps5', region: 'Baltic Sea — Kaliningrad', lat: 54.70, lng: 20.50, radius_km: 350, intensity: 'moderate', source: 'Russian EW systems', affected_systems: ['GPS', 'Galileo'], first_detected: '2024-11-01T00:00:00Z', last_detected: '2024-12-01T12:00:00Z', active: true },
  { id: 'gps6', region: 'Red Sea — Yemen Coast', lat: 14.80, lng: 42.95, radius_km: 100, intensity: 'low', source: 'Houthi EW assets', affected_systems: ['GPS', 'AIS'], first_detected: '2024-11-20T00:00:00Z', last_detected: '2024-12-01T10:00:00Z', active: true },
  { id: 'gps7', region: 'Sea of Japan', lat: 38.50, lng: 131.00, radius_km: 200, intensity: 'moderate', source: 'DPRK jammers', affected_systems: ['GPS'], first_detected: '2024-11-15T00:00:00Z', last_detected: '2024-11-30T18:00:00Z', active: false },
];

// ─── Protests & Civil Unrest (ACLED-style) ──────────────────────────
export type ProtestType = 'peaceful' | 'violent' | 'riot' | 'strike';
export type ProtestScale = 'small' | 'medium' | 'large' | 'mass';

export interface ProtestEvent {
  id: string;
  title: string;
  type: ProtestType;
  scale: ProtestScale;
  lat: number;
  lng: number;
  location: string;
  country: string;
  participants_est: number;
  cause: string;
  date: string;
  ongoing: boolean;
  fatalities: number;
  source: string;
}

export const mockProtestEvents: ProtestEvent[] = [
  { id: 'pe1', title: 'Anti-war protests in Beirut', type: 'peaceful', scale: 'large', lat: 33.8938, lng: 35.5018, location: 'Martyrs Square, Beirut', country: 'Lebanon', participants_est: 15000, cause: 'Anti-war / ceasefire demand', date: '2024-12-01T10:00:00Z', ongoing: true, fatalities: 0, source: 'ACLED' },
  { id: 'pe2', title: 'Fuel price protests in Tripoli', type: 'violent', scale: 'medium', lat: 34.4333, lng: 35.8333, location: 'Tripoli', country: 'Lebanon', participants_est: 3000, cause: 'Fuel prices / economic crisis', date: '2024-12-01T08:00:00Z', ongoing: true, fatalities: 0, source: 'ACLED' },
  { id: 'pe3', title: 'Tehran anti-government rally', type: 'peaceful', scale: 'mass', lat: 35.6892, lng: 51.3890, location: 'Azadi Square, Tehran', country: 'Iran', participants_est: 50000, cause: 'Anti-regime / freedom movement', date: '2024-12-01T12:00:00Z', ongoing: true, fatalities: 2, source: 'OSINT' },
  { id: 'pe4', title: 'Baghdad solidarity march', type: 'peaceful', scale: 'large', lat: 33.3152, lng: 44.3661, location: 'Tahrir Square, Baghdad', country: 'Iraq', participants_est: 8000, cause: 'Solidarity with Lebanon / Palestine', date: '2024-12-01T09:00:00Z', ongoing: false, fatalities: 0, source: 'ACLED' },
  { id: 'pe5', title: 'General strike in Sidon', type: 'strike', scale: 'medium', lat: 33.5594, lng: 35.3717, location: 'Sidon', country: 'Lebanon', participants_est: 5000, cause: 'Economic conditions / safety', date: '2024-12-01T06:00:00Z', ongoing: true, fatalities: 0, source: 'Local reports' },
  { id: 'pe6', title: 'Pro-Palestine rally London', type: 'peaceful', scale: 'mass', lat: 51.5074, lng: -0.1278, location: 'Trafalgar Square, London', country: 'UK', participants_est: 100000, cause: 'Pro-Palestine / ceasefire', date: '2024-11-30T14:00:00Z', ongoing: false, fatalities: 0, source: 'ACLED' },
  { id: 'pe7', title: 'Student protest Paris', type: 'peaceful', scale: 'large', lat: 48.8566, lng: 2.3522, location: 'Place de la République, Paris', country: 'France', participants_est: 20000, cause: 'Anti-war / arms embargo', date: '2024-11-30T12:00:00Z', ongoing: false, fatalities: 0, source: 'ACLED' },
  { id: 'pe8', title: 'Amman embassy protest', type: 'violent', scale: 'medium', lat: 31.9454, lng: 35.9284, location: 'US Embassy Area, Amman', country: 'Jordan', participants_est: 4000, cause: 'Anti-US / anti-Israel', date: '2024-12-01T11:00:00Z', ongoing: true, fatalities: 0, source: 'ACLED' },
];

// ─── Weather & Climate Alerts ───────────────────────────────────────
export type WeatherSeverity = 'advisory' | 'watch' | 'warning' | 'extreme';
export type WeatherType = 'storm' | 'flood' | 'heat' | 'cold' | 'wind' | 'earthquake' | 'tsunami' | 'wildfire';

export interface WeatherAlert {
  id: string;
  type: WeatherType;
  severity: WeatherSeverity;
  title: string;
  description: string;
  lat: number;
  lng: number;
  region: string;
  issued_at: string;
  expires_at: string;
  source: string;
  active: boolean;
}

export const mockWeatherAlerts: WeatherAlert[] = [
  { id: 'wa1', type: 'storm', severity: 'warning', title: 'Mediterranean Storm — Heavy Rain', description: 'Heavy rainfall expected across coastal Lebanon. Risk of flash flooding in damaged infrastructure areas.', lat: 33.89, lng: 35.50, region: 'Coastal Lebanon', issued_at: '2024-12-01T10:00:00Z', expires_at: '2024-12-02T10:00:00Z', source: 'WMO', active: true },
  { id: 'wa2', type: 'flood', severity: 'watch', title: 'Litani River Flood Risk', description: 'Elevated water levels in Litani River. Downstream areas at moderate flood risk.', lat: 33.35, lng: 35.40, region: 'Bekaa Valley', issued_at: '2024-12-01T08:00:00Z', expires_at: '2024-12-03T00:00:00Z', source: 'Lebanese Met', active: true },
  { id: 'wa3', type: 'cold', severity: 'advisory', title: 'Cold Snap — Mountain Areas', description: 'Sub-zero temperatures expected above 1500m. Risk for displaced populations in tents/makeshift shelters.', lat: 33.85, lng: 35.86, region: 'Mount Lebanon / Bekaa', issued_at: '2024-12-01T06:00:00Z', expires_at: '2024-12-04T00:00:00Z', source: 'WMO', active: true },
  { id: 'wa4', type: 'wind', severity: 'warning', title: 'Strong Winds — Coastal Warning', description: 'Winds up to 80 km/h along coast. Small craft advisory. Risk of structural damage to weakened buildings.', lat: 34.43, lng: 35.83, region: 'North Lebanon Coast', issued_at: '2024-12-01T12:00:00Z', expires_at: '2024-12-01T22:00:00Z', source: 'WMO', active: true },
  { id: 'wa5', type: 'earthquake', severity: 'advisory', title: 'Seismic Activity — Dead Sea Fault', description: 'M3.2 tremor detected on Dead Sea Transform. No damage expected but monitor aftershocks.', lat: 33.27, lng: 35.50, region: 'South Lebanon', issued_at: '2024-12-01T14:00:00Z', expires_at: '2024-12-01T20:00:00Z', source: 'EMSC', active: true },
  { id: 'wa6', type: 'wildfire', severity: 'extreme', title: 'Wildfire — Chouf Mountains', description: 'Large wildfire spreading in Chouf cedar reserve area. Possibly conflict-related. Evacuation advised.', lat: 33.66, lng: 35.65, region: 'Chouf', issued_at: '2024-12-01T11:00:00Z', expires_at: '2024-12-02T00:00:00Z', source: 'FIRMS/NASA', active: true },
];
