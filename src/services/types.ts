/**
 * Shared domain types for all service layers.
 * camelCase for app models; snake_case only in SQL column names.
 */

// ── Feed Health (Task 28) ──────────────────────────────────

export interface FeedHealthEntry {
  id: string;
  feedName: string;
  domain: DomainKey;
  lastSuccess: string | null;
  lastAttempt: string | null;
  errorCount: number;
  timeToLive: number; // seconds
  status: 'healthy' | 'degraded' | 'stale' | 'down';
  message: string | null;
  createdAt: string;
}

export type DomainKey = 'humanitarian' | 'financial' | 'infrastructure' | 'intelligence';

export type FreshnessStatus = 'live' | 'cached' | 'stale' | 'unavailable';

export function computeFreshness(entry: FeedHealthEntry | null | undefined): FreshnessStatus {
  if (!entry) return 'unavailable';
  if (!entry.lastSuccess) return 'unavailable';
  const age = (Date.now() - new Date(entry.lastSuccess).getTime()) / 1000;
  if (age <= entry.timeToLive) return 'live';
  if (age <= entry.timeToLive * 3) return 'cached';
  if (age <= entry.timeToLive * 10) return 'stale';
  return 'unavailable';
}

// ── Humanitarian (Tasks 1-5) ───────────────────────────────

export interface DisplacementFlow {
  id: string;
  originRegion: string;
  destinationRegion: string;
  populationEstimate: number;
  flowType: 'idp' | 'refugee' | 'returnee';
  source: string;
  sourceConfidence: number; // 0-1
  reportedAt: string;
  createdAt: string;
  lat: number | null;
  lng: number | null;
}

export interface RefugeeCamp {
  id: string;
  name: string;
  region: string;
  capacity: number;
  currentOccupancy: number;
  status: 'open' | 'full' | 'closed' | 'at_risk';
  managedBy: string;
  lat: number;
  lng: number;
  lastUpdated: string;
  sourceConfidence: number;
}

export interface HumanitarianFacility {
  id: string;
  name: string;
  facilityType: 'hospital' | 'clinic' | 'pharmacy' | 'blood_bank' | 'ambulance_station' | 'mobile_unit' | 'shelter' | 'food_distribution' | 'water_point' | 'fuel_station';
  status: 'open' | 'overwhelmed' | 'damaged' | 'closed' | 'limited';
  capacity: number | null;
  currentLoad: number | null;
  address: string;
  lat: number;
  lng: number;
  contact: string | null;
  lastUpdated: string;
  sourceConfidence: number;
  source: string;
}

export interface SafeRoute {
  id: string;
  name: string;
  originLat: number;
  originLng: number;
  destinationLat: number;
  destinationLng: number;
  waypoints: Array<{ lat: number; lng: number }>;
  distanceKm: number;
  estimatedMinutes: number;
  safetyScore: number; // 0-100
  hazards: RouteHazard[];
  lastVerified: string;
  status: 'verified' | 'unverified' | 'blocked' | 'risky';
}

export interface RouteHazard {
  type: 'road_damage' | 'military_activity' | 'checkpoint' | 'fire' | 'blocked' | 'flooding' | 'debris';
  lat: number;
  lng: number;
  severity: 'low' | 'medium' | 'high';
  reportedAt: string;
}

export interface EarlyWarningEvent {
  id: string;
  detectionType: 'explosion' | 'drone' | 'gunfire' | 'siren' | 'aircraft' | 'missile' | 'chemical' | 'seismic';
  intensity: 'low' | 'medium' | 'high';
  confirmed: boolean;
  lat: number;
  lng: number;
  location: string;
  source: string;
  sources: string[];
  confidenceTier: 'unconfirmed' | 'corroborated' | 'confirmed' | 'resolved';
  detectedAt: string;
  resolvedAt: string | null;
  createdAt: string;
}

export interface AidDeliveryRecord {
  id: string;
  requestId: string;
  matchId: string | null;
  status: 'requested' | 'matched' | 'dispatched' | 'in_transit' | 'delivered' | 'failed' | 'disputed' | 'partial';
  category: string;
  quantity: number;
  donorName: string | null;
  recipientLocation: string;
  lat: number | null;
  lng: number | null;
  dispatchedAt: string | null;
  deliveredAt: string | null;
  proofMediaUrls: string[];
  reviewerNotes: string | null;
  createdAt: string;
}

// ── Financial (Tasks 6-12) ─────────────────────────────────

export interface MarketQuote {
  symbol: string;
  name: string;
  assetClass: 'equity' | 'index' | 'commodity' | 'crypto' | 'fx' | 'bond';
  price: number;
  change: number;
  changePct: number;
  volume: number | null;
  timestamp: string;
  provider: string;
}

export interface MarketRadarSignal {
  id: string;
  signalName: string;
  signalType: 'liquidity' | 'flow' | 'regime' | 'trend' | 'hashrate' | 'mining_cost' | 'sentiment';
  value: number;
  status: 'bullish' | 'bearish' | 'neutral' | 'unknown';
  confidence: number; // 0-1
  updatedAt: string;
}

export interface MarketRadarVerdict {
  verdict: 'BUY' | 'CASH' | 'NEUTRAL';
  confidence: number;
  signals: MarketRadarSignal[];
  computedAt: string;
}

export interface StablecoinPeg {
  coinId: string;
  name: string;
  symbol: string;
  price: number;
  pegTarget: number;
  deviationBps: number; // basis points
  status: 'pegged' | 'warning' | 'depeg';
  history24h: Array<{ timestamp: string; price: number }>;
  updatedAt: string;
}

export interface EtfFlowEstimate {
  symbol: string;
  name: string;
  estimatedFlowUsd: number;
  direction: 'inflow' | 'outflow' | 'flat';
  volumeRatio: number;
  priceDelta: number;
  sparkline: number[];
  computedAt: string;
}

export interface EnergyDataPoint {
  id: string;
  metric: 'wti' | 'brent' | 'natgas' | 'production' | 'inventory' | 'demand';
  value: number;
  unit: string;
  trend: 'rising' | 'falling' | 'stable';
  change24h: number;
  timestamp: string;
  source: string;
}

export interface PolicyRateEntry {
  country: string;
  centralBank: string;
  currentRate: number;
  previousRate: number;
  lastChange: string;
  nextMeeting: string | null;
  direction: 'hiking' | 'cutting' | 'holding';
}

export interface TradeRestriction {
  id: string;
  imposingCountry: string;
  targetCountry: string;
  restrictionType: 'tariff' | 'sanction' | 'embargo' | 'quota' | 'ban';
  sector: string;
  description: string;
  effectiveDate: string;
  source: string;
}

export interface StrategicInvestment {
  id: string;
  investorEntity: string;
  investorCountry: string;
  targetEntity: string;
  targetCountry: string;
  sector: string;
  valueUsd: number | null;
  status: 'announced' | 'in_progress' | 'completed' | 'cancelled';
  year: number;
  lat: number;
  lng: number;
  source: string;
}

// ── Infrastructure (Tasks 13-17) ───────────────────────────

export interface ChokepointStatus {
  id: string;
  name: string;
  region: string;
  lat: number;
  lng: number;
  disruptionScore: number; // 0-100
  confidence: number;
  status: 'normal' | 'elevated' | 'disrupted' | 'blocked';
  vesselCount: number | null;
  avgDelayHours: number | null;
  lastUpdated: string;
  source: string;
}

export interface MaritimeTrack {
  mmsi: string;
  vesselName: string;
  vesselType: string;
  lat: number;
  lng: number;
  course: number;
  speed: number;
  destination: string | null;
  timestamp: string;
}

export interface SubseaCable {
  id: string;
  name: string;
  landingPoints: Array<{ country: string; lat: number; lng: number }>;
  capacityTbps: number | null;
  status: 'active' | 'planned' | 'fault' | 'decommissioned';
  owner: string;
  geometry: Array<{ lat: number; lng: number }>;
}

export interface Pipeline {
  id: string;
  name: string;
  commodity: 'oil' | 'gas' | 'multi';
  capacityBpd: number | null;
  status: 'active' | 'planned' | 'disrupted' | 'decommissioned';
  operator: string;
  geometry: Array<{ lat: number; lng: number }>;
}

export interface TradeRoute {
  id: string;
  name: string;
  routeClass: 'maritime' | 'land' | 'air';
  commodities: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  congestionLevel: number; // 0-100
  chokepoints: string[];
  geometry: Array<{ lat: number; lng: number }>;
}

export interface NetworkOutage {
  id: string;
  region: string;
  country: string;
  outageType: 'internet' | 'mobile' | 'fixed' | 'power';
  severity: 'minor' | 'moderate' | 'major' | 'total';
  affectedUsers: number | null;
  startedAt: string;
  resolvedAt: string | null;
  source: string;
  sourceReliability: number; // 0-1
  lat: number;
  lng: number;
}

export interface AirportStatus {
  icao: string;
  iata: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  operationalStatus: 'normal' | 'delays' | 'ground_stop' | 'closed';
  avgDelayMinutes: number;
  closureReason: string | null;
  source: string;
  updatedAt: string;
}

// ── Intelligence (Tasks 19-22) ─────────────────────────────

export interface CyberActor {
  id: string;
  groupName: string;
  aliases: string[];
  sponsorCountry: string | null;
  ttpTags: string[];
  primaryRegions: string[];
  confidence: number; // 0-1
  lastActive: string | null;
  activeCampaigns: number;
  lat: number | null;
  lng: number | null;
}

export interface CyberCampaign {
  id: string;
  actorId: string;
  name: string;
  targetSectors: string[];
  targetCountries: string[];
  attackVector: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  startDate: string;
  endDate: string | null;
  source: string;
}

export interface StrategicAsset {
  id: string;
  name: string;
  assetType: 'military_base' | 'nuclear_site' | 'launch_facility' | 'naval_port' | 'air_base' | 'radar_station' | 'space_facility';
  country: string;
  operator: string;
  status: 'active' | 'inactive' | 'under_construction' | 'decommissioned';
  verificationStatus: 'verified' | 'probable' | 'unverified';
  lat: number;
  lng: number;
  source: string;
  lastVerified: string;
}

export interface CountryBrief {
  country: string;
  countryCode: string;
  summary: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  keyIndicators: CountryIndicator[];
  citations: BriefCitation[];
  generatedAt: string;
  dataFreshness: FreshnessStatus;
}

export interface CountryIndicator {
  name: string;
  value: number;
  trend: 'improving' | 'stable' | 'worsening';
  source: string;
}

export interface BriefCitation {
  text: string;
  source: string;
  url: string | null;
  publishedAt: string;
}

export interface ProtestEvent {
  id: string;
  eventType: 'peaceful' | 'violent' | 'riot' | 'strike';
  location: string;
  country: string;
  lat: number;
  lng: number;
  scale: 'small' | 'medium' | 'large' | 'mass';
  participantEstimate: number | null;
  cause: string;
  fatalities: number;
  ongoing: boolean;
  sources: string[];
  corroborationScore: number; // 0-1
  sourceCount: number;
  reportedAt: string;
  createdAt: string;
}

// ── Map Layers (Task 18) ───────────────────────────────────

export interface MapLayerPreset {
  name: string;
  missionType: 'humanitarian' | 'intel' | 'operations' | 'recovery';
  platform: 'desktop' | 'mobile';
  enabledLayers: string[];
}
