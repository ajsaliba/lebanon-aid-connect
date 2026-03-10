// Extended mock data for new features
// All types & sample data for aid matching, medical resources, volunteering, etc.

// ─── Aid Matching (Feature 4) ──────────────────────────────────────

export type AidCategory = 'food' | 'water' | 'medicine' | 'baby_supplies' | 'blankets' | 'generators' | 'fuel' | 'hygiene_kits';
export type OfferCategory = 'donated_goods' | 'transportation' | 'storage_space' | 'volunteer_help';
export type AidPriority = 'critical' | 'high' | 'medium' | 'low';
export type AidStatus = 'open' | 'matched' | 'in_transit' | 'delivered';

export interface AidRequest {
  id: string;
  type: 'request';
  category: AidCategory;
  description: string;
  quantity: number;
  unit: string;
  priority: AidPriority;
  status: AidStatus;
  lat: number;
  lng: number;
  location: string;
  contact: string;
  people_count: number;
  created_at: string;
  matched_offer_id?: string;
}

export interface AidOffer {
  id: string;
  type: 'offer';
  category: AidCategory | OfferCategory;
  description: string;
  quantity: number;
  unit: string;
  status: AidStatus;
  lat: number;
  lng: number;
  location: string;
  contact: string;
  available_until: string;
  created_at: string;
  matched_request_id?: string;
}

export const mockAidRequests: AidRequest[] = [
  { id: 'ar1', type: 'request', category: 'water', description: 'Clean drinking water for 50 families', quantity: 500, unit: 'liters', priority: 'critical', status: 'open', lat: 33.8938, lng: 35.5018, location: 'Dahieh, Beirut', contact: '+961 3 123 456', people_count: 250, created_at: '2024-12-01T10:00:00Z' },
  { id: 'ar2', type: 'request', category: 'medicine', description: 'Insulin and blood pressure medication', quantity: 30, unit: 'units', priority: 'critical', status: 'open', lat: 33.3633, lng: 35.4717, location: 'Nabatieh', contact: '+961 3 234 567', people_count: 30, created_at: '2024-12-01T09:00:00Z' },
  { id: 'ar3', type: 'request', category: 'food', description: 'Rice, canned food, and bread for displaced families', quantity: 200, unit: 'meals', priority: 'high', status: 'open', lat: 33.5094, lng: 35.3737, location: 'Sidon', contact: '+961 3 345 678', people_count: 80, created_at: '2024-12-01T08:00:00Z' },
  { id: 'ar4', type: 'request', category: 'blankets', description: 'Blankets for shelter occupants', quantity: 100, unit: 'pieces', priority: 'high', status: 'matched', lat: 33.8547, lng: 35.8623, location: 'Bekaa Valley', contact: '+961 3 456 789', people_count: 100, created_at: '2024-11-30T22:00:00Z', matched_offer_id: 'ao2' },
  { id: 'ar5', type: 'request', category: 'baby_supplies', description: 'Baby formula, diapers, and wipes', quantity: 50, unit: 'kits', priority: 'critical', status: 'open', lat: 34.4333, lng: 35.8333, location: 'Tripoli', contact: '+961 3 567 890', people_count: 50, created_at: '2024-12-01T07:00:00Z' },
  { id: 'ar6', type: 'request', category: 'generators', description: 'Generator for hospital backup power', quantity: 2, unit: 'units', priority: 'critical', status: 'open', lat: 33.2721, lng: 35.2033, location: 'Tyre', contact: '+961 7 740 534', people_count: 200, created_at: '2024-12-01T06:00:00Z' },
  { id: 'ar7', type: 'request', category: 'hygiene_kits', description: 'Hygiene kits including soap, toothbrush, sanitizer', quantity: 150, unit: 'kits', priority: 'medium', status: 'open', lat: 33.8833, lng: 35.5500, location: 'Hadat', contact: '+961 5 457 111', people_count: 150, created_at: '2024-12-01T05:00:00Z' },
  { id: 'ar8', type: 'request', category: 'fuel', description: 'Diesel fuel for generators', quantity: 500, unit: 'liters', priority: 'high', status: 'open', lat: 33.8463, lng: 35.9020, location: 'Zahle', contact: '+961 8 801 116', people_count: 300, created_at: '2024-11-30T20:00:00Z' },
];

export const mockAidOffers: AidOffer[] = [
  { id: 'ao1', type: 'offer', category: 'food', description: 'Fresh bread daily from bakery — 500 loaves/day', quantity: 500, unit: 'loaves', status: 'open', lat: 33.8972, lng: 35.4819, location: 'Clemenceau, Beirut', contact: '+961 1 374 888', available_until: '2024-12-15T00:00:00Z', created_at: '2024-12-01T09:00:00Z' },
  { id: 'ao2', type: 'offer', category: 'blankets', description: '200 wool blankets from warehouse stock', quantity: 200, unit: 'pieces', status: 'matched', lat: 33.9003, lng: 35.4784, location: 'Hamra, Beirut', contact: '+961 1 350 000', available_until: '2024-12-20T00:00:00Z', created_at: '2024-11-30T18:00:00Z', matched_request_id: 'ar4' },
  { id: 'ao3', type: 'offer', category: 'transportation', description: 'Truck available for aid delivery (South Lebanon route)', quantity: 1, unit: 'vehicle', status: 'open', lat: 33.8558, lng: 35.4917, location: 'Sahel, Beirut', contact: '+961 1 840 026', available_until: '2024-12-10T00:00:00Z', created_at: '2024-12-01T08:00:00Z' },
  { id: 'ao4', type: 'offer', category: 'storage_space', description: 'Empty warehouse available for aid storage — 200m²', quantity: 200, unit: 'sqm', status: 'open', lat: 34.4350, lng: 35.8350, location: 'Tripoli', contact: '+961 6 432 071', available_until: '2025-01-01T00:00:00Z', created_at: '2024-12-01T07:00:00Z' },
  { id: 'ao5', type: 'offer', category: 'donated_goods', description: 'Medical supplies — bandages, antiseptics, painkillers', quantity: 100, unit: 'kits', status: 'open', lat: 33.9025, lng: 35.5050, location: 'Ashrafieh, Beirut', contact: '+961 1 441 000', available_until: '2024-12-31T00:00:00Z', created_at: '2024-12-01T06:00:00Z' },
  { id: 'ao6', type: 'offer', category: 'volunteer_help', description: '5 volunteers available for aid distribution', quantity: 5, unit: 'people', status: 'open', lat: 33.8903, lng: 35.5225, location: 'Geitaoui, Beirut', contact: '+961 1 580 680', available_until: '2024-12-14T00:00:00Z', created_at: '2024-12-01T05:00:00Z' },
];

// ─── Medical Resources (Feature 5) ─────────────────────────────────

export type FacilityType = 'hospital' | 'clinic' | 'pharmacy' | 'blood_bank' | 'ambulance_station' | 'mobile_unit';
export type FacilityStatus = 'open' | 'overwhelmed' | 'damaged' | 'closed';

export interface MedicalFacility {
  id: string;
  name: string;
  type: FacilityType;
  status: FacilityStatus;
  lat: number;
  lng: number;
  city: string;
  phone: string;
  capacity?: number;
  current_load?: number;
  medicine_shortage: boolean;
  blood_available: boolean;
  specialties?: string[];
  last_updated: string;
}

export const mockMedicalFacilities: MedicalFacility[] = [
  { id: 'mf1', name: 'AUBMC', type: 'hospital', status: 'overwhelmed', lat: 33.9003, lng: 35.4784, city: 'Beirut', phone: '+961 1 350 000', capacity: 350, current_load: 340, medicine_shortage: true, blood_available: true, specialties: ['trauma', 'surgery', 'ICU'], last_updated: '2024-12-01T14:00:00Z' },
  { id: 'mf2', name: 'Rafik Hariri University Hospital', type: 'hospital', status: 'open', lat: 33.8333, lng: 35.4833, city: 'Beirut', phone: '+961 1 830 000', capacity: 500, current_load: 380, medicine_shortage: false, blood_available: true, specialties: ['trauma', 'pediatrics', 'surgery'], last_updated: '2024-12-01T13:30:00Z' },
  { id: 'mf3', name: 'Hotel Dieu de France', type: 'hospital', status: 'open', lat: 33.8917, lng: 35.5139, city: 'Beirut', phone: '+961 1 615 300', capacity: 280, current_load: 200, medicine_shortage: false, blood_available: true, specialties: ['cardiology', 'oncology'], last_updated: '2024-12-01T13:00:00Z' },
  { id: 'mf4', name: 'Jabal Amel Hospital', type: 'hospital', status: 'damaged', lat: 33.2721, lng: 35.2033, city: 'Tyre', phone: '+961 7 740 534', capacity: 120, current_load: 45, medicine_shortage: true, blood_available: false, specialties: ['general', 'emergency'], last_updated: '2024-12-01T12:00:00Z' },
  { id: 'mf5', name: 'Nabatieh Gov. Hospital', type: 'hospital', status: 'damaged', lat: 33.3633, lng: 35.4717, city: 'Nabatieh', phone: '+961 7 760 868', capacity: 100, current_load: 30, medicine_shortage: true, blood_available: false, specialties: ['general'], last_updated: '2024-12-01T11:00:00Z' },
  { id: 'mf6', name: 'Bekaa Hospital', type: 'hospital', status: 'overwhelmed', lat: 33.8463, lng: 35.9020, city: 'Zahle', phone: '+961 8 801 116', capacity: 150, current_load: 148, medicine_shortage: true, blood_available: true, specialties: ['general', 'surgery'], last_updated: '2024-12-01T10:00:00Z' },
  { id: 'mf7', name: 'Notre Dame des Secours', type: 'hospital', status: 'open', lat: 34.1236, lng: 35.6511, city: 'Byblos', phone: '+961 9 547 254', capacity: 200, current_load: 120, medicine_shortage: false, blood_available: true, specialties: ['pediatrics', 'orthopedics'], last_updated: '2024-12-01T09:00:00Z' },
  { id: 'mf8', name: 'Nini Hospital', type: 'hospital', status: 'open', lat: 34.4333, lng: 35.8333, city: 'Tripoli', phone: '+961 6 410 610', capacity: 180, current_load: 90, medicine_shortage: false, blood_available: true, specialties: ['general', 'ICU'], last_updated: '2024-12-01T08:00:00Z' },
  // Clinics
  { id: 'mf9', name: 'Hamra Medical Clinic', type: 'clinic', status: 'open', lat: 33.8950, lng: 35.4800, city: 'Beirut', phone: '+961 1 340 000', medicine_shortage: false, blood_available: false, last_updated: '2024-12-01T14:00:00Z' },
  { id: 'mf10', name: 'Sidon Community Clinic', type: 'clinic', status: 'overwhelmed', lat: 33.5594, lng: 35.3717, city: 'Sidon', phone: '+961 7 725 000', medicine_shortage: true, blood_available: false, last_updated: '2024-12-01T13:00:00Z' },
  // Pharmacies
  { id: 'mf11', name: 'Byblos Pharmacy', type: 'pharmacy', status: 'open', lat: 34.1200, lng: 35.6500, city: 'Byblos', phone: '+961 9 540 100', medicine_shortage: false, blood_available: false, last_updated: '2024-12-01T14:00:00Z' },
  { id: 'mf12', name: 'Tripoli Central Pharmacy', type: 'pharmacy', status: 'open', lat: 34.4360, lng: 35.8340, city: 'Tripoli', phone: '+961 6 421 000', medicine_shortage: true, blood_available: false, last_updated: '2024-12-01T12:00:00Z' },
  // Blood Banks
  { id: 'mf13', name: 'Donner Sang Compter (Beirut)', type: 'blood_bank', status: 'open', lat: 33.8900, lng: 35.5100, city: 'Beirut', phone: '+961 1 612 500', medicine_shortage: false, blood_available: true, last_updated: '2024-12-01T14:00:00Z' },
  { id: 'mf14', name: 'Lebanese Red Cross Blood Bank', type: 'blood_bank', status: 'open', lat: 33.8800, lng: 35.5000, city: 'Beirut', phone: '140', medicine_shortage: false, blood_available: true, last_updated: '2024-12-01T13:00:00Z' },
  // Ambulance Stations
  { id: 'mf15', name: 'Red Cross Beirut Station', type: 'ambulance_station', status: 'open', lat: 33.8850, lng: 35.5050, city: 'Beirut', phone: '140', medicine_shortage: false, blood_available: false, last_updated: '2024-12-01T14:00:00Z' },
  // Mobile Units
  { id: 'mf16', name: 'MSF Mobile Clinic — South', type: 'mobile_unit', status: 'open', lat: 33.3500, lng: 35.4500, city: 'South Lebanon', phone: '+961 1 330 301', medicine_shortage: false, blood_available: false, specialties: ['primary care', 'trauma'], last_updated: '2024-12-01T14:00:00Z' },
];

// ─── Safe Routes (Feature 6) ───────────────────────────────────────

export type RouteHazard = 'road_damage' | 'military_activity' | 'checkpoint' | 'fire' | 'blocked' | 'fuel_station';

export interface RoutePoint {
  lat: number;
  lng: number;
  label?: string;
}

export interface SafeRoute {
  id: string;
  name: string;
  type: 'safest' | 'evacuation' | 'walking';
  from: RoutePoint;
  to: RoutePoint;
  waypoints: RoutePoint[];
  distance_km: number;
  estimated_time_min: number;
  safety_score: number; // 0-100
  hazards: { type: RouteHazard; lat: number; lng: number; description: string }[];
  shelters_along: string[]; // shelter IDs
  last_verified: string;
}

export const mockSafeRoutes: SafeRoute[] = [
  {
    id: 'sr1', name: 'Beirut → Byblos Coastal', type: 'safest',
    from: { lat: 33.8938, lng: 35.5018, label: 'Beirut' },
    to: { lat: 34.1236, lng: 35.6511, label: 'Byblos' },
    waypoints: [{ lat: 33.9806, lng: 35.6178, label: 'Jounieh' }],
    distance_km: 37, estimated_time_min: 55, safety_score: 85,
    hazards: [{ type: 'checkpoint', lat: 33.95, lng: 35.58, description: 'LAF checkpoint — ID required' }],
    shelters_along: [], last_verified: '2024-12-01T14:00:00Z',
  },
  {
    id: 'sr2', name: 'Beirut → Bekaa (Mountain Pass)', type: 'evacuation',
    from: { lat: 33.8938, lng: 35.5018, label: 'Beirut' },
    to: { lat: 33.8463, lng: 35.9020, label: 'Zahle' },
    waypoints: [{ lat: 33.8611, lng: 35.5639, label: 'Mansourieh' }, { lat: 33.8150, lng: 35.8600, label: 'Chtaura' }],
    distance_km: 52, estimated_time_min: 80, safety_score: 70,
    hazards: [
      { type: 'road_damage', lat: 33.83, lng: 35.72, description: 'Partial road damage near Dahr el Baydar' },
      { type: 'military_activity', lat: 33.82, lng: 35.80, description: 'Reported military movements' },
    ],
    shelters_along: [], last_verified: '2024-12-01T12:00:00Z',
  },
  {
    id: 'sr3', name: 'Sidon → Beirut Coastal', type: 'safest',
    from: { lat: 33.5594, lng: 35.3717, label: 'Sidon' },
    to: { lat: 33.8938, lng: 35.5018, label: 'Beirut' },
    waypoints: [{ lat: 33.7, lng: 35.44, label: 'Damour' }],
    distance_km: 45, estimated_time_min: 65, safety_score: 75,
    hazards: [
      { type: 'checkpoint', lat: 33.65, lng: 35.42, description: 'Military checkpoint' },
      { type: 'road_damage', lat: 33.72, lng: 35.45, description: 'Crater on highway — slow down' },
    ],
    shelters_along: [], last_verified: '2024-12-01T10:00:00Z',
  },
  {
    id: 'sr4', name: 'Tyre → Sidon (Walking)', type: 'walking',
    from: { lat: 33.2721, lng: 35.2033, label: 'Tyre' },
    to: { lat: 33.5594, lng: 35.3717, label: 'Sidon' },
    waypoints: [],
    distance_km: 38, estimated_time_min: 480, safety_score: 55,
    hazards: [
      { type: 'military_activity', lat: 33.35, lng: 35.30, description: 'Active conflict zone — avoid' },
      { type: 'fire', lat: 33.40, lng: 35.35, description: 'Brush fires reported' },
    ],
    shelters_along: [], last_verified: '2024-12-01T08:00:00Z',
  },
  {
    id: 'sr5', name: 'Tripoli → Byblos Coastal', type: 'evacuation',
    from: { lat: 34.4333, lng: 35.8333, label: 'Tripoli' },
    to: { lat: 34.1236, lng: 35.6511, label: 'Byblos' },
    waypoints: [{ lat: 34.25, lng: 35.75, label: 'Batroun' }],
    distance_km: 35, estimated_time_min: 45, safety_score: 90,
    hazards: [],
    shelters_along: [], last_verified: '2024-12-01T14:00:00Z',
  },
];

export const mockHazardPoints: { type: RouteHazard; lat: number; lng: number; description: string }[] = [
  { type: 'road_damage', lat: 33.83, lng: 35.72, description: 'Partial road damage near Dahr el Baydar' },
  { type: 'military_activity', lat: 33.82, lng: 35.80, description: 'Reported military movements Bekaa' },
  { type: 'checkpoint', lat: 33.95, lng: 35.58, description: 'LAF checkpoint — ID required' },
  { type: 'checkpoint', lat: 33.65, lng: 35.42, description: 'Military checkpoint near Damour' },
  { type: 'fire', lat: 33.40, lng: 35.35, description: 'Brush fires near Nabatieh' },
  { type: 'blocked', lat: 33.30, lng: 35.25, description: 'Road completely blocked in Tyre suburbs' },
  { type: 'fuel_station', lat: 33.88, lng: 35.50, description: 'Fuel station — limited diesel available' },
  { type: 'fuel_station', lat: 34.43, lng: 35.83, description: 'Fuel station operating in Tripoli' },
  { type: 'fuel_station', lat: 33.85, lng: 35.90, description: 'Generator fuel in Zahle' },
  { type: 'military_activity', lat: 33.35, lng: 35.30, description: 'Active conflict zone South Lebanon' },
];

// ─── Infrastructure Status (Feature 7) ─────────────────────────────

export type InfraType = 'electricity' | 'generator' | 'internet' | 'mobile_network' | 'water_supply' | 'fuel_station';
export type InfraStatus = 'operational' | 'partial' | 'outage' | 'unknown';

export interface InfraReport {
  id: string;
  type: InfraType;
  status: InfraStatus;
  location: string;
  lat: number;
  lng: number;
  description: string;
  reported_by: string;
  reported_at: string;
  verified: boolean;
  upvotes: number;
}

export const mockInfraReports: InfraReport[] = [
  { id: 'ir1', type: 'electricity', status: 'outage', location: 'Dahieh, Beirut', lat: 33.85, lng: 35.49, description: 'Complete power outage since morning airstrike', reported_by: 'Community', reported_at: '2024-12-01T10:00:00Z', verified: true, upvotes: 45 },
  { id: 'ir2', type: 'electricity', status: 'partial', location: 'Hamra, Beirut', lat: 33.895, lng: 35.48, description: 'Rotating blackouts 4h on / 4h off', reported_by: 'Community', reported_at: '2024-12-01T09:00:00Z', verified: true, upvotes: 30 },
  { id: 'ir3', type: 'electricity', status: 'operational', location: 'Jounieh', lat: 33.98, lng: 35.62, description: 'Power restored — grid stable', reported_by: 'EDL', reported_at: '2024-12-01T14:00:00Z', verified: true, upvotes: 12 },
  { id: 'ir4', type: 'generator', status: 'operational', location: 'Tripoli City Center', lat: 34.43, lng: 35.83, description: 'Community generator available 6pm-6am', reported_by: 'Municipality', reported_at: '2024-12-01T08:00:00Z', verified: true, upvotes: 20 },
  { id: 'ir5', type: 'internet', status: 'outage', location: 'South Lebanon', lat: 33.30, lng: 35.25, description: 'Internet completely down — fiber lines damaged', reported_by: 'Community', reported_at: '2024-12-01T06:00:00Z', verified: true, upvotes: 67 },
  { id: 'ir6', type: 'internet', status: 'partial', location: 'Zahle', lat: 33.85, lng: 35.90, description: 'Very slow connectivity — mobile data only', reported_by: 'Community', reported_at: '2024-12-01T07:00:00Z', verified: false, upvotes: 15 },
  { id: 'ir7', type: 'mobile_network', status: 'partial', location: 'Nabatieh', lat: 33.36, lng: 35.47, description: 'Touch network intermittent, Alfa down', reported_by: 'Community', reported_at: '2024-12-01T11:00:00Z', verified: true, upvotes: 38 },
  { id: 'ir8', type: 'water_supply', status: 'outage', location: 'Tyre', lat: 33.27, lng: 35.20, description: 'Water pump station damaged — no running water', reported_by: 'Community', reported_at: '2024-12-01T05:00:00Z', verified: true, upvotes: 55 },
  { id: 'ir9', type: 'water_supply', status: 'operational', location: 'Byblos', lat: 34.12, lng: 35.65, description: 'Water supply normal', reported_by: 'Municipality', reported_at: '2024-12-01T14:00:00Z', verified: true, upvotes: 5 },
  { id: 'ir10', type: 'fuel_station', status: 'partial', location: 'Beirut Port Area', lat: 33.90, lng: 35.52, description: 'Fuel available — 20L limit per vehicle, long queues', reported_by: 'Community', reported_at: '2024-12-01T12:00:00Z', verified: true, upvotes: 40 },
];

// ─── Volunteers (Feature 8) ─────────────────────────────────────────

export type VolunteerRole = 'doctor' | 'nurse' | 'driver' | 'engineer' | 'translator' | 'rescue' | 'aid_distributor';
export type VolunteerAvailability = 'available' | 'on_mission' | 'unavailable';

export interface Volunteer {
  id: string;
  name: string;
  role: VolunteerRole;
  skills: string[];
  location: string;
  lat: number;
  lng: number;
  availability: VolunteerAvailability;
  phone: string;
  languages: string[];
  created_at: string;
}

export const mockVolunteers: Volunteer[] = [
  { id: 'v1', name: 'Dr. Ahmad K.', role: 'doctor', skills: ['trauma surgery', 'emergency medicine'], location: 'Beirut', lat: 33.89, lng: 35.50, availability: 'available', phone: '+961 3 111 222', languages: ['Arabic', 'English', 'French'], created_at: '2024-11-28T10:00:00Z' },
  { id: 'v2', name: 'Sarah M.', role: 'nurse', skills: ['pediatric care', 'wound care'], location: 'Tripoli', lat: 34.43, lng: 35.83, availability: 'available', phone: '+961 3 222 333', languages: ['Arabic', 'English'], created_at: '2024-11-29T10:00:00Z' },
  { id: 'v3', name: 'Hassan J.', role: 'driver', skills: ['truck driving', 'logistics'], location: 'Sidon', lat: 33.56, lng: 35.37, availability: 'on_mission', phone: '+961 3 333 444', languages: ['Arabic'], created_at: '2024-11-30T10:00:00Z' },
  { id: 'v4', name: 'Eng. Rami B.', role: 'engineer', skills: ['structural assessment', 'electrical'], location: 'Beirut', lat: 33.88, lng: 35.51, availability: 'available', phone: '+961 3 444 555', languages: ['Arabic', 'English'], created_at: '2024-11-28T10:00:00Z' },
  { id: 'v5', name: 'Marie L.', role: 'translator', skills: ['Arabic', 'French', 'English'], location: 'Jounieh', lat: 33.98, lng: 35.62, availability: 'available', phone: '+961 3 555 666', languages: ['Arabic', 'French', 'English'], created_at: '2024-11-29T10:00:00Z' },
  { id: 'v6', name: 'Ali D.', role: 'rescue', skills: ['search and rescue', 'first aid'], location: 'Bekaa', lat: 33.85, lng: 35.86, availability: 'on_mission', phone: '+961 3 666 777', languages: ['Arabic'], created_at: '2024-11-28T10:00:00Z' },
  { id: 'v7', name: 'Fatima H.', role: 'aid_distributor', skills: ['logistics', 'organization'], location: 'Nabatieh', lat: 33.36, lng: 35.47, availability: 'available', phone: '+961 3 777 888', languages: ['Arabic', 'English'], created_at: '2024-11-30T10:00:00Z' },
  { id: 'v8', name: 'Dr. Lara S.', role: 'doctor', skills: ['internal medicine', 'infectious disease'], location: 'Zahle', lat: 33.85, lng: 35.90, availability: 'available', phone: '+961 3 888 999', languages: ['Arabic', 'French'], created_at: '2024-11-29T10:00:00Z' },
];

// ─── Logistics (Feature 9) ──────────────────────────────────────────

export type LogisticsType = 'warehouse' | 'shipment' | 'distribution_center';
export type ShipmentStatus = 'preparing' | 'in_transit' | 'delivered' | 'delayed';

export interface LogisticsItem {
  id: string;
  type: LogisticsType;
  name: string;
  location: string;
  lat: number;
  lng: number;
  status: ShipmentStatus | 'active';
  capacity?: string;
  items?: string[];
  eta?: string;
  last_updated: string;
}

export const mockLogistics: LogisticsItem[] = [
  { id: 'lg1', type: 'warehouse', name: 'UNHCR Beirut Warehouse', location: 'Karantina, Beirut', lat: 33.90, lng: 35.52, status: 'active', capacity: '5000 metric tons', items: ['blankets', 'food packs', 'hygiene kits'], last_updated: '2024-12-01T14:00:00Z' },
  { id: 'lg2', type: 'warehouse', name: 'WFP Tripoli Depot', location: 'Tripoli Port', lat: 34.44, lng: 35.83, status: 'active', capacity: '3000 metric tons', items: ['rice', 'flour', 'oil', 'canned goods'], last_updated: '2024-12-01T12:00:00Z' },
  { id: 'lg3', type: 'distribution_center', name: 'Red Cross Sidon Center', location: 'Sidon', lat: 33.56, lng: 35.37, status: 'active', items: ['medical supplies', 'water', 'blankets'], last_updated: '2024-12-01T11:00:00Z' },
  { id: 'lg4', type: 'distribution_center', name: 'Offre Joie Bekaa Center', location: 'Chtaura', lat: 33.82, lng: 35.86, status: 'active', items: ['mattresses', 'food', 'clothing'], last_updated: '2024-12-01T10:00:00Z' },
  { id: 'lg5', type: 'shipment', name: 'Medical Supplies — Beirut → Tyre', location: 'En route', lat: 33.60, lng: 35.40, status: 'in_transit', items: ['insulin', 'antibiotics', 'surgical kits'], eta: '2024-12-01T18:00:00Z', last_updated: '2024-12-01T13:00:00Z' },
  { id: 'lg6', type: 'shipment', name: 'Food Aid — Tripoli → Akkar', location: 'En route', lat: 34.50, lng: 36.00, status: 'in_transit', items: ['flour', 'rice', 'bread'], eta: '2024-12-01T16:00:00Z', last_updated: '2024-12-01T12:00:00Z' },
  { id: 'lg7', type: 'shipment', name: 'Blankets — UNHCR → Nabatieh', location: 'Delayed', lat: 33.50, lng: 35.45, status: 'delayed', items: ['blankets', 'sleeping bags'], eta: '2024-12-02T10:00:00Z', last_updated: '2024-12-01T14:00:00Z' },
];

// ─── Family Locator (Feature 10) ────────────────────────────────────

export type PersonStatus = 'safe' | 'injured' | 'missing' | 'evacuated';

export interface MissingPerson {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  status: PersonStatus;
  last_known_lat: number;
  last_known_lng: number;
  last_known_location: string;
  description: string;
  contact: string;
  photo_placeholder: string;
  reported_at: string;
  updated_at: string;
}

export const mockMissingPersons: MissingPerson[] = [
  { id: 'mp1', name: 'Mohammad Al-Hassan', age: 45, gender: 'male', status: 'missing', last_known_lat: 33.27, last_known_lng: 35.20, last_known_location: 'Tyre City Center', description: 'Last seen wearing blue jacket, heading to work', contact: '+961 3 100 100', photo_placeholder: 'MH', reported_at: '2024-12-01T08:00:00Z', updated_at: '2024-12-01T08:00:00Z' },
  { id: 'mp2', name: 'Leila Khoury', age: 32, gender: 'female', status: 'missing', last_known_lat: 33.36, last_known_lng: 35.47, last_known_location: 'Nabatieh Market', description: 'Was shopping when airstrikes began', contact: '+961 3 200 200', photo_placeholder: 'LK', reported_at: '2024-12-01T10:00:00Z', updated_at: '2024-12-01T10:00:00Z' },
  { id: 'mp3', name: 'Ahmad Nasrallah', age: 67, gender: 'male', status: 'injured', last_known_lat: 33.85, last_known_lng: 35.49, last_known_location: 'Dahieh, Beirut', description: 'Found injured, taken to nearby clinic — family seeking', contact: '+961 3 300 300', photo_placeholder: 'AN', reported_at: '2024-12-01T06:00:00Z', updated_at: '2024-12-01T12:00:00Z' },
  { id: 'mp4', name: 'Nour Haddad', age: 8, gender: 'female', status: 'evacuated', last_known_lat: 33.56, last_known_lng: 35.37, last_known_location: 'Sidon Shelter #3', description: 'Evacuated with school group — parents searching', contact: '+961 3 400 400', photo_placeholder: 'NH', reported_at: '2024-12-01T09:00:00Z', updated_at: '2024-12-01T13:00:00Z' },
  { id: 'mp5', name: 'Karim Rida', age: 28, gender: 'male', status: 'safe', last_known_lat: 33.90, last_known_lng: 35.48, last_known_location: 'Hamra, Beirut', description: 'Confirmed safe — checked in via app', contact: '+961 3 500 500', photo_placeholder: 'KR', reported_at: '2024-12-01T07:00:00Z', updated_at: '2024-12-01T14:00:00Z' },
];

// ─── War Impact Analytics (Feature 13) ─────────────────────────────

export interface ImpactStat {
  label: string;
  value: number;
  unit: string;
  change: number; // percentage change from previous period
  trend: 'up' | 'down' | 'stable';
}

export interface ImpactTimeSeries {
  date: string;
  displaced: number;
  infrastructure_damage: number;
  casualties: number;
  aid_delivered: number;
}

export const mockImpactStats: ImpactStat[] = [
  { label: 'Displaced Persons', value: 1200000, unit: 'people', change: 15, trend: 'up' },
  { label: 'Buildings Damaged', value: 8500, unit: 'structures', change: 8, trend: 'up' },
  { label: 'Casualty Estimates', value: 4200, unit: 'people', change: 5, trend: 'up' },
  { label: 'Aid Deliveries', value: 3400, unit: 'shipments', change: 12, trend: 'up' },
  { label: 'Electricity Coverage', value: 45, unit: '%', change: -10, trend: 'down' },
  { label: 'Active Shelters', value: 340, unit: 'facilities', change: 20, trend: 'up' },
];

export const mockImpactTimeSeries: ImpactTimeSeries[] = [
  { date: '2024-11-25', displaced: 800000, infrastructure_damage: 5200, casualties: 2800, aid_delivered: 1800 },
  { date: '2024-11-26', displaced: 850000, infrastructure_damage: 5800, casualties: 3000, aid_delivered: 2100 },
  { date: '2024-11-27', displaced: 920000, infrastructure_damage: 6400, casualties: 3200, aid_delivered: 2400 },
  { date: '2024-11-28', displaced: 980000, infrastructure_damage: 7000, casualties: 3500, aid_delivered: 2700 },
  { date: '2024-11-29', displaced: 1050000, infrastructure_damage: 7600, casualties: 3700, aid_delivered: 2900 },
  { date: '2024-11-30', displaced: 1120000, infrastructure_damage: 8000, casualties: 3900, aid_delivered: 3100 },
  { date: '2024-12-01', displaced: 1200000, infrastructure_damage: 8500, casualties: 4200, aid_delivered: 3400 },
];

// ─── Damage & Reconstruction (Feature 15) ─────────────────────────

export type DamageLevel = 'minor' | 'moderate' | 'severe' | 'destroyed';
export type ReconstructionStatus = 'not_started' | 'assessment' | 'in_progress' | 'completed';

export interface DamageReport {
  id: string;
  building_type: string;
  damage_level: DamageLevel;
  reconstruction_status: ReconstructionStatus;
  location: string;
  lat: number;
  lng: number;
  description: string;
  reported_at: string;
  progress_pct: number;
}

export const mockDamageReports: DamageReport[] = [
  { id: 'dr1', building_type: 'Residential', damage_level: 'destroyed', reconstruction_status: 'not_started', location: 'Dahieh, Beirut', lat: 33.85, lng: 35.49, description: 'Multi-story residential building collapsed', reported_at: '2024-12-01T06:00:00Z', progress_pct: 0 },
  { id: 'dr2', building_type: 'Hospital', damage_level: 'severe', reconstruction_status: 'assessment', location: 'Nabatieh', lat: 33.36, lng: 35.47, description: 'Hospital wing heavily damaged — partial operations', reported_at: '2024-12-01T08:00:00Z', progress_pct: 10 },
  { id: 'dr3', building_type: 'School', damage_level: 'moderate', reconstruction_status: 'in_progress', location: 'Sidon', lat: 33.56, lng: 35.37, description: 'School windows blown out, walls cracked', reported_at: '2024-11-28T10:00:00Z', progress_pct: 40 },
  { id: 'dr4', building_type: 'Bridge', damage_level: 'severe', reconstruction_status: 'assessment', location: 'Litani River', lat: 33.35, lng: 35.40, description: 'Bridge partially destroyed, impassable', reported_at: '2024-11-30T12:00:00Z', progress_pct: 5 },
  { id: 'dr5', building_type: 'Water Plant', damage_level: 'moderate', reconstruction_status: 'in_progress', location: 'Tyre', lat: 33.27, lng: 35.20, description: 'Water treatment plant damaged — reduced capacity', reported_at: '2024-11-29T09:00:00Z', progress_pct: 55 },
  { id: 'dr6', building_type: 'Residential', damage_level: 'minor', reconstruction_status: 'completed', location: 'Jounieh', lat: 33.98, lng: 35.62, description: 'Shrapnel damage to facade — repaired', reported_at: '2024-11-25T10:00:00Z', progress_pct: 100 },
];

// ─── Economic Survival Tools (Feature 16) ──────────────────────────

export type JobType = 'temporary' | 'remote' | 'service_exchange' | 'barter';

export interface EconomicListing {
  id: string;
  type: JobType;
  title: string;
  description: string;
  location: string;
  lat: number;
  lng: number;
  contact: string;
  compensation: string;
  category: string;
  created_at: string;
  urgent: boolean;
}

export const mockEconomicListings: EconomicListing[] = [
  { id: 'el1', type: 'temporary', title: 'Aid Distribution Helper', description: 'Assist in distributing food and supplies at Beirut shelter', location: 'Verdun, Beirut', lat: 33.88, lng: 35.48, contact: '+961 3 100 100', compensation: '$25/day', category: 'Aid Work', created_at: '2024-12-01T08:00:00Z', urgent: true },
  { id: 'el2', type: 'temporary', title: 'Emergency Translator (Arabic/English)', description: 'Translate for international aid organizations on the ground', location: 'Tripoli', lat: 34.43, lng: 35.83, contact: '+961 3 200 200', compensation: '$30/day', category: 'Translation', created_at: '2024-12-01T07:00:00Z', urgent: true },
  { id: 'el3', type: 'remote', title: 'Data Entry — Crisis Documentation', description: 'Remote data entry logging damage reports and aid distribution', location: 'Remote', lat: 33.89, lng: 35.50, contact: 'jobs@relief-org.example', compensation: '$15/hour', category: 'Data Entry', created_at: '2024-12-01T06:00:00Z', urgent: false },
  { id: 'el4', type: 'service_exchange', title: 'Electrician — Will fix wiring for food', description: 'Licensed electrician offering services in exchange for food supplies', location: 'Zahle', lat: 33.85, lng: 35.90, contact: '+961 3 400 400', compensation: 'Food exchange', category: 'Electrical', created_at: '2024-12-01T05:00:00Z', urgent: false },
  { id: 'el5', type: 'barter', title: 'Generator fuel for baby formula', description: 'Have 50L diesel, need baby formula and diapers', location: 'Nabatieh', lat: 33.36, lng: 35.47, contact: '+961 3 500 500', compensation: 'Barter', category: 'Supplies', created_at: '2024-12-01T04:00:00Z', urgent: true },
  { id: 'el6', type: 'temporary', title: 'Rubble Clearance Worker', description: 'Help clear rubble from damaged buildings in Tyre area', location: 'Tyre', lat: 33.27, lng: 35.20, contact: '+961 7 740 534', compensation: '$20/day', category: 'Manual Labor', created_at: '2024-12-01T03:00:00Z', urgent: true },
  { id: 'el7', type: 'remote', title: 'Social Media Coordinator', description: 'Manage social channels for relief organization', location: 'Remote', lat: 33.89, lng: 35.50, contact: 'comms@ngo.example', compensation: '$500/month', category: 'Communications', created_at: '2024-11-30T10:00:00Z', urgent: false },
];

// ─── Community Communication (Feature 23) ──────────────────────────

export interface CommunityChannel {
  id: string;
  name: string;
  type: 'neighborhood' | 'emergency' | 'announcement';
  location: string;
  members: number;
  last_activity: string;
  pinned_message?: string;
}

export const mockCommunityChannels: CommunityChannel[] = [
  { id: 'cc1', name: 'Beirut Downtown Updates', type: 'neighborhood', location: 'Beirut', members: 1250, last_activity: '2024-12-01T14:30:00Z', pinned_message: 'Water tanker arriving at 3pm — bring containers' },
  { id: 'cc2', name: 'South Lebanon Emergency', type: 'emergency', location: 'South Lebanon', members: 3400, last_activity: '2024-12-01T14:00:00Z', pinned_message: '⚠️ Avoid coastal road south of Sidon — active shelling' },
  { id: 'cc3', name: 'Tripoli Community Aid', type: 'neighborhood', location: 'Tripoli', members: 890, last_activity: '2024-12-01T13:00:00Z', pinned_message: 'Free bread distribution at central mosque 4pm daily' },
  { id: 'cc4', name: 'Bekaa Valley Support', type: 'neighborhood', location: 'Bekaa', members: 650, last_activity: '2024-12-01T12:00:00Z' },
  { id: 'cc5', name: 'Official Crisis Updates', type: 'announcement', location: 'National', members: 15000, last_activity: '2024-12-01T14:00:00Z', pinned_message: 'Ceasefire talks scheduled — stay tuned for updates' },
  { id: 'cc6', name: 'Sidon Neighborhood Watch', type: 'neighborhood', location: 'Sidon', members: 520, last_activity: '2024-12-01T11:00:00Z' },
];

// ─── Refugee Flow (Feature 24) ──────────────────────────────────────

export interface DisplacementFlow {
  id: string;
  from_location: string;
  to_location: string;
  from_lat: number;
  from_lng: number;
  to_lat: number;
  to_lng: number;
  people_count: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  date: string;
}

export const mockDisplacementFlows: DisplacementFlow[] = [
  { id: 'df1', from_location: 'Tyre', to_location: 'Sidon', from_lat: 33.27, from_lng: 35.20, to_lat: 33.56, to_lng: 35.37, people_count: 45000, trend: 'increasing', date: '2024-12-01' },
  { id: 'df2', from_location: 'Nabatieh', to_location: 'Beirut', from_lat: 33.36, from_lng: 35.47, to_lat: 33.89, to_lng: 35.50, people_count: 80000, trend: 'increasing', date: '2024-12-01' },
  { id: 'df3', from_location: 'Dahieh', to_location: 'Jounieh', from_lat: 33.85, from_lng: 35.49, to_lat: 33.98, to_lng: 35.62, people_count: 35000, trend: 'stable', date: '2024-12-01' },
  { id: 'df4', from_location: 'South Lebanon', to_location: 'Bekaa Valley', from_lat: 33.30, from_lng: 35.25, to_lat: 33.85, to_lng: 35.86, people_count: 120000, trend: 'increasing', date: '2024-12-01' },
  { id: 'df5', from_location: 'Baalbek', to_location: 'Tripoli', from_lat: 34.00, from_lng: 36.21, to_lat: 34.43, to_lng: 35.83, people_count: 25000, trend: 'decreasing', date: '2024-12-01' },
];

// ─── Satellite Intel (Feature 21) ───────────────────────────────────

export type SatelliteEventType = 'fire' | 'smoke_plume' | 'infrastructure_damage' | 'power_outage';

export interface SatelliteEvent {
  id: string;
  type: SatelliteEventType;
  lat: number;
  lng: number;
  location: string;
  confidence: number; // 0-100
  detected_at: string;
  source: string;
  description: string;
}

export const mockSatelliteEvents: SatelliteEvent[] = [
  { id: 'se1', type: 'fire', lat: 33.85, lng: 35.49, location: 'Dahieh, Beirut', confidence: 95, detected_at: '2024-12-01T14:00:00Z', source: 'VIIRS', description: 'Large thermal anomaly — active fire' },
  { id: 'se2', type: 'smoke_plume', lat: 33.36, lng: 35.47, location: 'Nabatieh', confidence: 88, detected_at: '2024-12-01T13:00:00Z', source: 'MODIS', description: 'Smoke plume extending 3km NE' },
  { id: 'se3', type: 'infrastructure_damage', lat: 33.27, lng: 35.20, location: 'Tyre', confidence: 92, detected_at: '2024-12-01T12:00:00Z', source: 'Sentinel-2', description: 'Before/after comparison shows building destruction' },
  { id: 'se4', type: 'power_outage', lat: 33.30, lng: 35.25, location: 'South Lebanon', confidence: 85, detected_at: '2024-12-01T11:00:00Z', source: 'VIIRS NTL', description: 'Night-time light reduction >80% vs baseline' },
  { id: 'se5', type: 'fire', lat: 33.40, lng: 35.35, location: 'Between Nabatieh and Sidon', confidence: 78, detected_at: '2024-12-01T10:00:00Z', source: 'VIIRS', description: 'Brush fire detected — possibly from shelling' },
  { id: 'se6', type: 'infrastructure_damage', lat: 33.35, lng: 35.40, location: 'Litani Bridge', confidence: 90, detected_at: '2024-12-01T09:00:00Z', source: 'Sentinel-2', description: 'Bridge damage confirmed via SAR analysis' },
];

// ─── Predictive Risk (Feature 25) ───────────────────────────────────

export interface RiskPrediction {
  id: string;
  region: string;
  lat: number;
  lng: number;
  risk_score: number; // 0-100
  risk_level: 'critical' | 'high' | 'moderate' | 'low';
  infrastructure_failure_prob: number; // 0-1
  humanitarian_demand_surge: number; // multiplier
  factors: string[];
  predicted_at: string;
}

export const mockRiskPredictions: RiskPrediction[] = [
  { id: 'rp1', region: 'South Lebanon', lat: 33.30, lng: 35.25, risk_score: 95, risk_level: 'critical', infrastructure_failure_prob: 0.89, humanitarian_demand_surge: 3.2, factors: ['active conflict', 'infrastructure damage', 'displacement surge'], predicted_at: '2024-12-01T14:00:00Z' },
  { id: 'rp2', region: 'Dahieh, Beirut', lat: 33.85, lng: 35.49, risk_score: 88, risk_level: 'critical', infrastructure_failure_prob: 0.75, humanitarian_demand_surge: 2.8, factors: ['recent airstrikes', 'power outage', 'high population density'], predicted_at: '2024-12-01T14:00:00Z' },
  { id: 'rp3', region: 'Nabatieh', lat: 33.36, lng: 35.47, risk_score: 82, risk_level: 'high', infrastructure_failure_prob: 0.70, humanitarian_demand_surge: 2.5, factors: ['ongoing shelling', 'hospital damage', 'water shortage'], predicted_at: '2024-12-01T14:00:00Z' },
  { id: 'rp4', region: 'Bekaa Valley', lat: 33.85, lng: 35.86, risk_score: 65, risk_level: 'moderate', infrastructure_failure_prob: 0.40, humanitarian_demand_surge: 1.8, factors: ['displacement influx', 'resource strain'], predicted_at: '2024-12-01T14:00:00Z' },
  { id: 'rp5', region: 'Tripoli', lat: 34.43, lng: 35.83, risk_score: 35, risk_level: 'low', infrastructure_failure_prob: 0.15, humanitarian_demand_surge: 1.2, factors: ['displacement influx', 'stable infrastructure'], predicted_at: '2024-12-01T14:00:00Z' },
  { id: 'rp6', region: 'Byblos', lat: 34.12, lng: 35.65, risk_score: 25, risk_level: 'low', infrastructure_failure_prob: 0.10, humanitarian_demand_surge: 1.1, factors: ['far from conflict zone'], predicted_at: '2024-12-01T14:00:00Z' },
];

// ─── Crisis Knowledge Center (Feature 22) ──────────────────────────

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: 'preparedness' | 'first_aid' | 'evacuation' | 'shelter_building';
  summary: string;
  steps: string[];
  icon: string;
}

export const mockKnowledgeArticles: KnowledgeArticle[] = [
  {
    id: 'ka1', title: 'Emergency Go-Bag Checklist', category: 'preparedness', icon: '🎒',
    summary: 'Essential items to pack for emergency evacuation.',
    steps: ['Water (1L per person per day for 3 days)', 'Non-perishable food and can opener', 'First aid kit', 'Flashlight and extra batteries', 'Phone charger / power bank', 'Important documents (ID, passport, insurance) in waterproof bag', 'Cash in small denominations', 'Medications (7-day supply)', 'Whistle to signal for help', 'Dust mask and plastic sheeting'],
  },
  {
    id: 'ka2', title: 'Basic First Aid', category: 'first_aid', icon: '🩹',
    summary: 'Essential first aid procedures for common injuries.',
    steps: ['Stop bleeding: Apply firm pressure with clean cloth', 'Burns: Cool with running water for 10+ minutes', 'Fractures: Immobilize and do not try to set', 'CPR: 30 chest compressions, 2 rescue breaths', 'Shock: Lay person down, elevate legs, keep warm', 'Choking: 5 back blows, then 5 abdominal thrusts', 'Call emergency services: Lebanese Red Cross 140'],
  },
  {
    id: 'ka3', title: 'Evacuation Planning', category: 'evacuation', icon: '🚪',
    summary: 'How to plan and execute a safe evacuation.',
    steps: ['Identify two exit routes from your building', 'Agree on a family meeting point outside', 'Keep go-bag near the door at all times', 'Know the location of the nearest shelter', 'Register your evacuation plan with family', 'Charge all phones and power banks daily', 'Keep vehicle fueled at least half-tank', 'Monitor alerts via this app and radio'],
  },
  {
    id: 'ka4', title: 'Improvised Shelter Construction', category: 'shelter_building', icon: '🏗️',
    summary: 'Building emergency shelter with available materials.',
    steps: ['Find a protected area away from damaged structures', 'Use tarps, blankets, or plastic sheeting as cover', 'Create walls with sandbags, rubble, or furniture', 'Insulate floor with cardboard, rugs, or mattresses', 'Ensure ventilation — leave gaps for airflow', 'Reinforce entrance with heavy objects', 'Mark shelter location visibly for rescuers'],
  },
  {
    id: 'ka5', title: 'Water Purification Methods', category: 'preparedness', icon: '💧',
    summary: 'How to make water safe when supply is disrupted.',
    steps: ['Boiling: Bring to rolling boil for 1+ minute', 'Bleach: 2 drops unscented bleach per liter, wait 30 min', 'Solar: Fill clear bottle, place in direct sun for 6+ hours', 'Filter: Use clean cloth to remove particles first', 'Collect rainwater in clean containers as backup', 'Avoid water from unknown sources near damaged areas'],
  },
  {
    id: 'ka6', title: 'During an Airstrike', category: 'preparedness', icon: '⚠️',
    summary: 'What to do when you hear incoming strikes.',
    steps: ['Move to the lowest floor or basement immediately', 'Stay away from windows, mirrors, and glass', 'Take cover under sturdy furniture or against interior walls', 'Cover head and neck with arms', 'Stay put until the all-clear — secondary strikes common', 'Check yourself and others for injuries', 'Turn off gas if you smell a leak', 'Do not use elevators — use stairs only'],
  },
];
