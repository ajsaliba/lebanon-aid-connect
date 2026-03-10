// ─── Safe Buildings ──────────────────────────────────────────────────
export interface SafeBuilding {
  id: string;
  name: string;
  lat: number;
  lng: number;
  city: string;
  has_basement: boolean;
  reinforced: boolean;
  functions_as_shelter: boolean;
  capacity: number;
  safety_rating: number; // 1-5
  notes: string;
}

export const mockSafeBuildings: SafeBuilding[] = [
  { id: 'sb1', name: 'Al-Amine Mosque Basement', lat: 33.8938, lng: 35.5018, city: 'Beirut', has_basement: true, reinforced: true, functions_as_shelter: true, capacity: 200, safety_rating: 5, notes: 'Underground prayer hall — thick concrete walls' },
  { id: 'sb2', name: 'AUB Medical Center Parking', lat: 33.9003, lng: 35.4784, city: 'Beirut', has_basement: true, reinforced: true, functions_as_shelter: false, capacity: 150, safety_rating: 4, notes: '3-level underground garage, reinforced columns' },
  { id: 'sb3', name: 'Verdun Commercial Center', lat: 33.8827, lng: 35.4762, city: 'Beirut', has_basement: true, reinforced: false, functions_as_shelter: false, capacity: 80, safety_rating: 3, notes: 'Basement level accessible 24/7' },
  { id: 'sb4', name: 'Sidon Khan el-Franj', lat: 33.5585, lng: 35.3722, city: 'Sidon', has_basement: false, reinforced: true, functions_as_shelter: true, capacity: 120, safety_rating: 4, notes: 'Ottoman-era stone structure, very thick walls' },
  { id: 'sb5', name: 'Tripoli Citadel', lat: 34.4353, lng: 35.8429, city: 'Tripoli', has_basement: true, reinforced: true, functions_as_shelter: true, capacity: 300, safety_rating: 5, notes: 'Historical fortress, deep underground chambers' },
  { id: 'sb6', name: 'Baalbek School Complex', lat: 34.0047, lng: 36.2110, city: 'Baalbek', has_basement: true, reinforced: false, functions_as_shelter: true, capacity: 100, safety_rating: 3, notes: 'Ground floor classrooms with basement storage' },
];

// ─── Fuel Stations ──────────────────────────────────────────────────
export type FuelType = 'gasoline' | 'diesel' | 'both';
export interface FuelStation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  city: string;
  fuel_type: FuelType;
  available: boolean;
  queue_length: number; // minutes
  price_usd: number;
  operating_hours: string;
  updated_at: string;
}

export const mockFuelStations: FuelStation[] = [
  { id: 'fs1', name: 'Total Hamra', lat: 33.8942, lng: 35.4817, city: 'Beirut', fuel_type: 'both', available: true, queue_length: 45, price_usd: 1.12, operating_hours: '6AM–8PM', updated_at: '2024-12-01T14:00:00Z' },
  { id: 'fs2', name: 'IPT Jounieh', lat: 33.9808, lng: 35.6178, city: 'Jounieh', fuel_type: 'gasoline', available: true, queue_length: 20, price_usd: 1.08, operating_hours: '7AM–6PM', updated_at: '2024-12-01T13:00:00Z' },
  { id: 'fs3', name: 'Coral Sidon', lat: 33.5600, lng: 35.3750, city: 'Sidon', fuel_type: 'both', available: false, queue_length: 0, price_usd: 0, operating_hours: 'CLOSED', updated_at: '2024-12-01T11:00:00Z' },
  { id: 'fs4', name: 'Medco Tripoli', lat: 34.4380, lng: 35.8400, city: 'Tripoli', fuel_type: 'diesel', available: true, queue_length: 60, price_usd: 1.05, operating_hours: '8AM–4PM', updated_at: '2024-12-01T12:00:00Z' },
  { id: 'fs5', name: 'Hypco Bekaa', lat: 33.8500, lng: 35.8600, city: 'Zahle', fuel_type: 'both', available: true, queue_length: 30, price_usd: 1.10, operating_hours: '6AM–7PM', updated_at: '2024-12-01T10:00:00Z' },
  { id: 'fs6', name: 'APT Nabatieh', lat: 33.3780, lng: 35.4830, city: 'Nabatieh', fuel_type: 'gasoline', available: false, queue_length: 0, price_usd: 0, operating_hours: 'CLOSED — Damage', updated_at: '2024-12-01T09:00:00Z' },
];

// ─── Safe Parking ───────────────────────────────────────────────────
export interface SafeParking {
  id: string;
  name: string;
  lat: number;
  lng: number;
  city: string;
  capacity: number;
  available_spots: number;
  covered: boolean;
  guarded: boolean;
}

export const mockSafeParking: SafeParking[] = [
  { id: 'sp1', name: 'Port District Lot', lat: 33.9010, lng: 35.5150, city: 'Beirut', capacity: 200, available_spots: 45, covered: false, guarded: true },
  { id: 'sp2', name: 'ABC Dbayeh Garage', lat: 33.9200, lng: 35.5600, city: 'Dbayeh', capacity: 500, available_spots: 180, covered: true, guarded: true },
  { id: 'sp3', name: 'Jounieh Marina Parking', lat: 33.9750, lng: 35.6200, city: 'Jounieh', capacity: 150, available_spots: 90, covered: false, guarded: false },
  { id: 'sp4', name: 'Tripoli Fair Ground', lat: 34.4400, lng: 35.8330, city: 'Tripoli', capacity: 300, available_spots: 200, covered: false, guarded: true },
];

// ─── Carpool / Evacuation Rides ─────────────────────────────────────
export interface CarpoolRide {
  id: string;
  driver_name: string;
  from_location: string;
  to_location: string;
  from_lat: number;
  from_lng: number;
  to_lat: number;
  to_lng: number;
  seats_available: number;
  departure_time: string;
  phone: string;
  vehicle_type: string;
  status: 'available' | 'full' | 'departed';
}

export const mockCarpoolRides: CarpoolRide[] = [
  { id: 'cp1', driver_name: 'Ahmad K.', from_location: 'Nabatieh', to_location: 'Sidon', from_lat: 33.378, from_lng: 35.483, to_lat: 33.558, to_lng: 35.372, seats_available: 3, departure_time: '2024-12-01T15:00:00Z', phone: '+961 71 234 567', vehicle_type: 'SUV', status: 'available' },
  { id: 'cp2', driver_name: 'Fatima H.', from_location: 'Dahieh', to_location: 'Jounieh', from_lat: 33.850, from_lng: 35.490, to_lat: 33.980, to_lng: 35.617, seats_available: 2, departure_time: '2024-12-01T16:00:00Z', phone: '+961 76 345 678', vehicle_type: 'Sedan', status: 'available' },
  { id: 'cp3', driver_name: 'George M.', from_location: 'Tyre', to_location: 'Beirut', from_lat: 33.270, from_lng: 35.200, to_lat: 33.890, to_lng: 35.500, seats_available: 0, departure_time: '2024-12-01T14:00:00Z', phone: '+961 03 456 789', vehicle_type: 'Van (7-seat)', status: 'full' },
  { id: 'cp4', driver_name: 'Rami S.', from_location: 'Baalbek', to_location: 'Zahle', from_lat: 34.005, from_lng: 36.211, to_lat: 33.850, to_lng: 35.860, seats_available: 4, departure_time: '2024-12-01T17:00:00Z', phone: '+961 70 567 890', vehicle_type: 'Pickup Truck', status: 'available' },
  { id: 'cp5', driver_name: 'Nadia L.', from_location: 'Sidon', to_location: 'Beirut', from_lat: 33.558, from_lng: 35.372, to_lat: 33.890, to_lng: 35.500, seats_available: 1, departure_time: '2024-12-01T18:00:00Z', phone: '+961 78 678 901', vehicle_type: 'Sedan', status: 'available' },
];

// ─── Border Crossings & Checkpoints ─────────────────────────────────
export type CrossingStatus = 'open' | 'restricted' | 'closed';
export interface BorderCrossing {
  id: string;
  name: string;
  lat: number;
  lng: number;
  country: string;
  status: CrossingStatus;
  wait_time_minutes: number;
  notes: string;
  updated_at: string;
}

export const mockBorderCrossings: BorderCrossing[] = [
  { id: 'bc1', name: 'Masnaa (Bekaa)', lat: 33.765, lng: 36.098, country: 'Syria', status: 'restricted', wait_time_minutes: 180, notes: 'Open for humanitarian cases only', updated_at: '2024-12-01T12:00:00Z' },
  { id: 'bc2', name: 'Abboudiyeh (North)', lat: 34.620, lng: 36.155, country: 'Syria', status: 'closed', wait_time_minutes: 0, notes: 'Closed since Nov 28 — security concerns', updated_at: '2024-12-01T08:00:00Z' },
  { id: 'bc3', name: 'Arida (North)', lat: 34.658, lng: 36.099, country: 'Syria', status: 'open', wait_time_minutes: 90, notes: 'Open 6AM-6PM, passport required', updated_at: '2024-12-01T13:00:00Z' },
  { id: 'bc4', name: 'Rafic Hariri Intl Airport', lat: 33.821, lng: 35.488, country: 'International', status: 'restricted', wait_time_minutes: 240, notes: 'Limited flights — check airlines', updated_at: '2024-12-01T14:00:00Z' },
  { id: 'bc5', name: 'Beirut Port', lat: 33.901, lng: 35.519, country: 'International (Sea)', status: 'open', wait_time_minutes: 60, notes: 'Ferry to Cyprus Tue/Thu/Sat', updated_at: '2024-12-01T10:00:00Z' },
];

export type CheckpointType = 'military' | 'police' | 'blocked_road';
export interface Checkpoint {
  id: string;
  type: CheckpointType;
  location: string;
  lat: number;
  lng: number;
  severity: 'passable' | 'delayed' | 'blocked';
  description: string;
  updated_at: string;
}

export const mockCheckpoints: Checkpoint[] = [
  { id: 'ck1', type: 'military', location: 'Litani Bridge, South', lat: 33.350, lng: 35.290, severity: 'blocked', description: 'Military checkpoint — no civilian traffic', updated_at: '2024-12-01T13:00:00Z' },
  { id: 'ck2', type: 'police', location: 'Sidon North Entry', lat: 33.570, lng: 35.380, severity: 'delayed', description: 'ID checks, ~30 min delay', updated_at: '2024-12-01T14:00:00Z' },
  { id: 'ck3', type: 'blocked_road', location: 'Chouf Mountain Road', lat: 33.730, lng: 35.570, severity: 'blocked', description: 'Landslide debris — road impassable', updated_at: '2024-12-01T11:00:00Z' },
  { id: 'ck4', type: 'military', location: 'Bekaa Valley Highway', lat: 33.900, lng: 35.800, severity: 'passable', description: 'LAF checkpoint — quick ID check', updated_at: '2024-12-01T12:00:00Z' },
  { id: 'ck5', type: 'blocked_road', location: 'Baalbek-Hermel Road', lat: 34.100, lng: 36.150, severity: 'blocked', description: 'Crater from airstrike — use alternate route via Ras Baalbek', updated_at: '2024-12-01T09:00:00Z' },
  { id: 'ck6', type: 'police', location: 'Jounieh Highway', lat: 33.985, lng: 35.625, severity: 'passable', description: 'Routine check — minimal delay', updated_at: '2024-12-01T14:30:00Z' },
];

// ─── Food & Water ───────────────────────────────────────────────────
export type FoodPointType = 'distribution' | 'soup_kitchen' | 'community_kitchen' | 'grocery' | 'water_point';
export interface FoodWaterPoint {
  id: string;
  type: FoodPointType;
  name: string;
  lat: number;
  lng: number;
  city: string;
  available: boolean;
  hours: string;
  description: string;
  serves_per_day: number;
  updated_at: string;
}

export const mockFoodWaterPoints: FoodWaterPoint[] = [
  { id: 'fw1', type: 'distribution', name: 'WFP Distribution — Cola', lat: 33.875, lng: 35.496, city: 'Beirut', available: true, hours: '8AM–2PM', description: 'UN WFP food parcels — bring ID', serves_per_day: 500, updated_at: '2024-12-01T14:00:00Z' },
  { id: 'fw2', type: 'soup_kitchen', name: 'Beit el-Baraka Kitchen', lat: 33.890, lng: 35.505, city: 'Beirut', available: true, hours: '11AM–3PM', description: 'Hot meals for displaced families', serves_per_day: 300, updated_at: '2024-12-01T12:00:00Z' },
  { id: 'fw3', type: 'community_kitchen', name: 'Sidon Community Cooks', lat: 33.560, lng: 35.375, city: 'Sidon', available: true, hours: '12PM–6PM', description: 'Local volunteers cooking for 200+ daily', serves_per_day: 200, updated_at: '2024-12-01T11:00:00Z' },
  { id: 'fw4', type: 'grocery', name: 'Spinneys Hamra (Limited)', lat: 33.895, lng: 35.480, city: 'Beirut', available: true, hours: '9AM–5PM', description: 'Limited stock — bread, canned goods, water', serves_per_day: 0, updated_at: '2024-12-01T13:00:00Z' },
  { id: 'fw5', type: 'water_point', name: 'UNICEF Water Tank — Shatila', lat: 33.862, lng: 35.493, city: 'Beirut', available: true, hours: '7AM–7PM', description: 'Clean water distribution, bring containers', serves_per_day: 1000, updated_at: '2024-12-01T10:00:00Z' },
  { id: 'fw6', type: 'water_point', name: 'IRC Water Truck — Tyre', lat: 33.275, lng: 35.205, city: 'Tyre', available: false, hours: 'Suspended', description: 'Suspended due to security — check back', serves_per_day: 0, updated_at: '2024-12-01T09:00:00Z' },
  { id: 'fw7', type: 'distribution', name: 'Red Crescent — Tripoli', lat: 34.435, lng: 35.835, city: 'Tripoli', available: true, hours: '9AM–1PM', description: 'Food + hygiene kits', serves_per_day: 400, updated_at: '2024-12-01T14:00:00Z' },
  { id: 'fw8', type: 'community_kitchen', name: 'Bekaa Valley Kitchen', lat: 33.855, lng: 35.860, city: 'Zahle', available: true, hours: '10AM–4PM', description: 'Hot meals by local church group', serves_per_day: 150, updated_at: '2024-12-01T12:00:00Z' },
];

// ─── Pharmacy & Blood ───────────────────────────────────────────────
export interface PharmacyStock {
  id: string;
  pharmacy_name: string;
  city: string;
  lat: number;
  lng: number;
  insulin: boolean;
  antibiotics: boolean;
  painkillers: boolean;
  blood_pressure: boolean;
  first_aid: boolean;
  phone: string;
  updated_at: string;
}

export const mockPharmacyStocks: PharmacyStock[] = [
  { id: 'ph1', pharmacy_name: 'Benta Pharmacy Hamra', city: 'Beirut', lat: 33.896, lng: 35.481, insulin: true, antibiotics: true, painkillers: true, blood_pressure: true, first_aid: true, phone: '+961 01 350 000', updated_at: '2024-12-01T14:00:00Z' },
  { id: 'ph2', pharmacy_name: 'Pharmacie Aoun', city: 'Jounieh', lat: 33.978, lng: 35.618, insulin: false, antibiotics: true, painkillers: true, blood_pressure: false, first_aid: true, phone: '+961 09 830 123', updated_at: '2024-12-01T12:00:00Z' },
  { id: 'ph3', pharmacy_name: 'Al-Shifa Pharmacy', city: 'Sidon', lat: 33.560, lng: 35.373, insulin: false, antibiotics: false, painkillers: true, blood_pressure: false, first_aid: true, phone: '+961 07 720 456', updated_at: '2024-12-01T11:00:00Z' },
  { id: 'ph4', pharmacy_name: 'Pharmacie Moderne', city: 'Tripoli', lat: 34.434, lng: 35.842, insulin: true, antibiotics: true, painkillers: true, blood_pressure: true, first_aid: true, phone: '+961 06 430 789', updated_at: '2024-12-01T13:00:00Z' },
];

export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export interface BloodNeed {
  id: string;
  hospital: string;
  city: string;
  blood_type: BloodType;
  urgency: 'critical' | 'high' | 'normal';
  units_needed: number;
  phone: string;
  posted_at: string;
}

export const mockBloodNeeds: BloodNeed[] = [
  { id: 'bl1', hospital: 'AUBMC', city: 'Beirut', blood_type: 'O-', urgency: 'critical', units_needed: 8, phone: '+961 01 350 000', posted_at: '2024-12-01T14:00:00Z' },
  { id: 'bl2', hospital: 'Rafik Hariri Hospital', city: 'Beirut', blood_type: 'A+', urgency: 'high', units_needed: 5, phone: '+961 01 830 000', posted_at: '2024-12-01T13:00:00Z' },
  { id: 'bl3', hospital: 'Hammoud Hospital', city: 'Sidon', blood_type: 'B-', urgency: 'critical', units_needed: 3, phone: '+961 07 720 000', posted_at: '2024-12-01T12:00:00Z' },
  { id: 'bl4', hospital: 'Nini Hospital', city: 'Tripoli', blood_type: 'AB+', urgency: 'normal', units_needed: 2, phone: '+961 06 430 000', posted_at: '2024-12-01T11:00:00Z' },
];

// ─── Telemedicine & Psych Support ───────────────────────────────────
export type MedProviderType = 'general' | 'specialist' | 'therapist' | 'crisis_counselor';
export interface TelemedicineProvider {
  id: string;
  name: string;
  type: MedProviderType;
  specialty: string;
  languages: string[];
  available: boolean;
  hours: string;
  platform: string;
  phone: string;
}

export const mockTelemedicineProviders: TelemedicineProvider[] = [
  { id: 'tm1', name: 'Dr. Hala Nassar', type: 'general', specialty: 'General Medicine', languages: ['Arabic', 'English'], available: true, hours: '9AM–5PM', platform: 'WhatsApp Video', phone: '+961 71 111 222' },
  { id: 'tm2', name: 'Dr. Pierre Khoury', type: 'specialist', specialty: 'Pediatrics', languages: ['Arabic', 'French', 'English'], available: true, hours: '10AM–4PM', platform: 'Zoom', phone: '+961 70 333 444' },
  { id: 'tm3', name: 'Sara Hammoud, LMFT', type: 'therapist', specialty: 'Trauma & PTSD', languages: ['Arabic', 'English'], available: true, hours: '11AM–7PM', platform: 'Signal Video', phone: '+961 76 555 666' },
  { id: 'tm4', name: 'IMC Crisis Line', type: 'crisis_counselor', specialty: 'Crisis Counseling', languages: ['Arabic', 'English', 'French'], available: true, hours: '24/7', platform: 'Phone Call', phone: '+961 01 565 180' },
  { id: 'tm5', name: 'Dr. Maya Abbas', type: 'specialist', specialty: 'Internal Medicine', languages: ['Arabic'], available: false, hours: 'Unavailable', platform: 'WhatsApp', phone: '+961 78 777 888' },
  { id: 'tm6', name: 'Rania Fadel, PsyD', type: 'therapist', specialty: 'Child Psychology', languages: ['Arabic', 'French'], available: true, hours: '9AM–3PM', platform: 'WhatsApp Video', phone: '+961 03 999 000' },
];

// ─── Vulnerable Groups (Elderly, Children, Pets) ────────────────────
export type VulnerableType = 'elderly' | 'disabled' | 'child' | 'pet';
export interface VulnerableCase {
  id: string;
  type: VulnerableType;
  name: string;
  description: string;
  location: string;
  lat: number;
  lng: number;
  needs: string[];
  status: 'needs_help' | 'assigned' | 'resolved';
  contact: string;
  reported_at: string;
}

export const mockVulnerableCases: VulnerableCase[] = [
  { id: 'vc1', type: 'elderly', name: 'Um Hassan (78)', description: 'Elderly woman alone, needs medication refill and food delivery', location: 'Dahieh, Beirut', lat: 33.852, lng: 35.490, needs: ['medication', 'food'], status: 'needs_help', contact: '+961 71 100 200', reported_at: '2024-12-01T13:00:00Z' },
  { id: 'vc2', type: 'disabled', name: 'Ali M. (42)', description: 'Wheelchair-bound, needs evacuation assistance from 3rd floor', location: 'Nabatieh', lat: 33.380, lng: 35.485, needs: ['evacuation', 'wheelchair'], status: 'needs_help', contact: '+961 76 200 300', reported_at: '2024-12-01T12:00:00Z' },
  { id: 'vc3', type: 'child', name: 'Lina (6)', description: 'Separated from family during evacuation from Tyre', location: 'Sidon shelter', lat: 33.558, lng: 35.372, needs: ['family_reunification'], status: 'assigned', contact: 'Red Cross #140', reported_at: '2024-12-01T11:00:00Z' },
  { id: 'vc4', type: 'pet', name: '2 dogs + 3 cats', description: 'Abandoned pets in damaged building, need rescue', location: 'Haret Hreik, Beirut', lat: 33.849, lng: 35.492, needs: ['rescue', 'shelter'], status: 'needs_help', contact: 'Animals Lebanon: +961 01 325 692', reported_at: '2024-12-01T10:00:00Z' },
  { id: 'vc5', type: 'elderly', name: 'Abu Khalil (85)', description: 'Bedridden, needs medical check and water supply', location: 'Tripoli', lat: 34.437, lng: 35.840, needs: ['medical', 'water'], status: 'assigned', contact: '+961 06 400 500', reported_at: '2024-12-01T09:00:00Z' },
  { id: 'vc6', type: 'child', name: 'Omar (4) & Sara (7)', description: 'Siblings found near collapsed building — parents unknown', location: 'South Beirut', lat: 33.860, lng: 35.495, needs: ['family_reunification', 'shelter'], status: 'needs_help', contact: 'UNICEF: +961 01 787 057', reported_at: '2024-12-01T14:00:00Z' },
  { id: 'vc7', type: 'pet', name: 'Golden Retriever', description: 'Injured dog near rubble — broken leg', location: 'Tyre', lat: 33.272, lng: 35.203, needs: ['veterinary', 'rescue'], status: 'needs_help', contact: 'BETA: +961 71 992 992', reported_at: '2024-12-01T13:30:00Z' },
];

// ─── Energy (Generators, Solar, Battery) ────────────────────────────
export type EnergyPointType = 'generator' | 'solar_station' | 'battery_swap';
export interface EnergyPoint {
  id: string;
  type: EnergyPointType;
  name: string;
  lat: number;
  lng: number;
  city: string;
  available: boolean;
  capacity_info: string;
  hours: string;
  free: boolean;
  notes: string;
}

export const mockEnergyPoints: EnergyPoint[] = [
  { id: 'ep1', type: 'generator', name: 'Community Generator — Hamra', lat: 33.895, lng: 35.481, city: 'Beirut', available: true, capacity_info: '50 kVA, 20 connections', hours: '6PM–6AM', free: true, notes: 'Shared generator — bring extension cord' },
  { id: 'ep2', type: 'solar_station', name: 'UNDP Solar Hub — Verdun', lat: 33.882, lng: 35.476, city: 'Beirut', available: true, capacity_info: '30 USB ports, 10 laptop chargers', hours: '8AM–6PM', free: true, notes: 'Solar panels + battery bank' },
  { id: 'ep3', type: 'battery_swap', name: 'Power Bank Exchange — Cola', lat: 33.875, lng: 35.496, city: 'Beirut', available: true, capacity_info: '200+ power banks', hours: '9AM–5PM', free: true, notes: 'Return depleted bank, get charged one' },
  { id: 'ep4', type: 'generator', name: 'Mosque Generator — Sidon', lat: 33.558, lng: 35.374, city: 'Sidon', available: true, capacity_info: '30 kVA, community use', hours: '5PM–11PM', free: true, notes: 'Near Great Mosque' },
  { id: 'ep5', type: 'solar_station', name: 'NGO Charging Point — Tripoli', lat: 34.436, lng: 35.838, city: 'Tripoli', available: true, capacity_info: '20 USB ports', hours: '7AM–5PM', free: true, notes: 'ACTED-operated solar charging' },
  { id: 'ep6', type: 'battery_swap', name: 'Battery Kiosk — Zahle', lat: 33.848, lng: 35.862, city: 'Zahle', available: false, capacity_info: 'Out of stock', hours: 'Closed', free: true, notes: 'Restocking expected tomorrow' },
];

// ─── Connectivity ───────────────────────────────────────────────────
export type ConnectivityType = 'wifi_hotspot' | 'community_wifi' | 'sms_hub' | 'internet_cafe';
export interface ConnectivityPoint {
  id: string;
  type: ConnectivityType;
  name: string;
  lat: number;
  lng: number;
  city: string;
  active: boolean;
  speed: string;
  free: boolean;
  notes: string;
}

export const mockConnectivityPoints: ConnectivityPoint[] = [
  { id: 'cn1', type: 'wifi_hotspot', name: 'Starbucks Hamra WiFi', lat: 33.895, lng: 35.482, city: 'Beirut', active: true, speed: '10 Mbps', free: true, notes: 'Open network — no password' },
  { id: 'cn2', type: 'community_wifi', name: 'AUB Emergency WiFi', lat: 33.900, lng: 35.478, city: 'Beirut', active: true, speed: '25 Mbps', free: true, notes: 'University grounds — open to public during crisis' },
  { id: 'cn3', type: 'sms_hub', name: 'Red Cross SMS Center', lat: 33.889, lng: 35.502, city: 'Beirut', active: true, speed: 'SMS only', free: true, notes: 'Text reports to 1199 — works without internet' },
  { id: 'cn4', type: 'internet_cafe', name: 'Net Zone Jounieh', lat: 33.979, lng: 35.617, city: 'Jounieh', active: true, speed: '15 Mbps', free: false, notes: '$2/hour — generator-powered' },
  { id: 'cn5', type: 'community_wifi', name: 'Tripoli Public Library WiFi', lat: 34.433, lng: 35.840, city: 'Tripoli', active: true, speed: '8 Mbps', free: true, notes: 'Library grounds 8AM–4PM' },
  { id: 'cn6', type: 'wifi_hotspot', name: 'Sidon Shelter WiFi', lat: 33.559, lng: 35.374, city: 'Sidon', active: false, speed: 'Down', free: true, notes: 'Router damaged — repair pending' },
];

// ─── Rumor Verification ─────────────────────────────────────────────
export type RumorVerdict = 'verified_true' | 'verified_false' | 'unverified' | 'misleading';
export interface Rumor {
  id: string;
  claim: string;
  source: string;
  verdict: RumorVerdict;
  explanation: string;
  checked_by: string;
  checked_at: string;
  spread_score: number; // 1-10 virality
}

export const mockRumors: Rumor[] = [
  { id: 'rm1', claim: 'Beirut airport has been completely destroyed', source: 'Telegram groups', verdict: 'verified_false', explanation: 'Airport sustained minor damage to runway but is operational with limited flights', checked_by: 'AFP Fact-Check', checked_at: '2024-12-01T14:00:00Z', spread_score: 9 },
  { id: 'rm2', claim: 'UN convoy attacked near Sidon', source: 'Twitter/X', verdict: 'verified_true', explanation: 'UNIFIL confirmed a convoy was hit by shrapnel, 2 lightly injured', checked_by: 'Reuters', checked_at: '2024-12-01T13:00:00Z', spread_score: 7 },
  { id: 'rm3', claim: 'Ceasefire agreement signed effective midnight', source: 'WhatsApp forwards', verdict: 'verified_false', explanation: 'No official ceasefire — diplomatic talks ongoing but no agreement reached', checked_by: 'Al Jazeera Verify', checked_at: '2024-12-01T12:00:00Z', spread_score: 10 },
  { id: 'rm4', claim: 'Water supply in Tripoli contaminated', source: 'Facebook', verdict: 'misleading', explanation: 'Water quality reduced in one district due to pipe damage, not citywide contamination', checked_by: 'UNICEF Lebanon', checked_at: '2024-12-01T11:00:00Z', spread_score: 6 },
  { id: 'rm5', claim: 'Hezbollah HQ relocated to Bekaa', source: 'Israeli media', verdict: 'unverified', explanation: 'No independent confirmation — likely speculative analysis', checked_by: 'Pending verification', checked_at: '2024-12-01T10:00:00Z', spread_score: 5 },
];

// ─── Conflict Timeline ──────────────────────────────────────────────
export type TimelineEventType = 'airstrike' | 'ground_operation' | 'ceasefire_talk' | 'humanitarian' | 'displacement' | 'infrastructure';
export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  title: string;
  description: string;
  location: string;
  timestamp: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  source: string;
}

export const mockTimelineEvents: TimelineEvent[] = [
  { id: 'te1', type: 'airstrike', title: 'Heavy airstrikes on Dahieh', description: '12+ strikes reported on southern suburbs of Beirut, multiple buildings hit', location: 'Dahieh, Beirut', timestamp: '2024-12-01T14:30:00Z', severity: 'critical', source: 'NNA' },
  { id: 'te2', type: 'displacement', title: 'Mass evacuation from Nabatieh', description: '15,000 civilians flee northward after evacuation order', location: 'Nabatieh', timestamp: '2024-12-01T13:00:00Z', severity: 'high', source: 'UNHCR' },
  { id: 'te3', type: 'humanitarian', title: 'ICRC medical supplies arrive', description: '40 tons of medical supplies delivered to Rafik Hariri Hospital', location: 'Beirut Airport', timestamp: '2024-12-01T12:00:00Z', severity: 'medium', source: 'ICRC' },
  { id: 'te4', type: 'ceasefire_talk', title: 'UN Security Council emergency session', description: 'Emergency session called — draft resolution circulated', location: 'New York', timestamp: '2024-12-01T11:00:00Z', severity: 'medium', source: 'UN News' },
  { id: 'te5', type: 'infrastructure', title: 'Power grid failure in South', description: 'EDL reports total grid failure in Tyre-Sidon corridor', location: 'South Lebanon', timestamp: '2024-12-01T10:00:00Z', severity: 'high', source: 'EDL' },
  { id: 'te6', type: 'ground_operation', title: 'Clashes near border villages', description: 'Ground exchanges reported near Kfar Kila and Aitaroun', location: 'South Lebanon border', timestamp: '2024-12-01T09:30:00Z', severity: 'critical', source: 'Al Mayadeen' },
  { id: 'te7', type: 'airstrike', title: 'Strike on Baalbek outskirts', description: 'Two missiles struck agricultural area, no casualties reported', location: 'Baalbek', timestamp: '2024-12-01T08:00:00Z', severity: 'high', source: 'NNA' },
  { id: 'te8', type: 'humanitarian', title: 'WFP food distribution begins', description: 'Emergency food packages for 10,000 families at 12 distribution points', location: 'Nationwide', timestamp: '2024-12-01T07:00:00Z', severity: 'low', source: 'WFP' },
];

// ─── Community Risk Scores ──────────────────────────────────────────
export interface CommunityRisk {
  id: string;
  neighborhood: string;
  city: string;
  lat: number;
  lng: number;
  risk_score: number; // 0-100
  infrastructure_damage: number; // 0-100
  conflict_proximity: number; // 0-100
  humanitarian_needs: number; // 0-100
  population_density: 'high' | 'medium' | 'low';
  trend: 'worsening' | 'stable' | 'improving';
}

export const mockCommunityRisks: CommunityRisk[] = [
  { id: 'cr1', neighborhood: 'Dahieh', city: 'Beirut', lat: 33.852, lng: 35.490, risk_score: 95, infrastructure_damage: 85, conflict_proximity: 100, humanitarian_needs: 90, population_density: 'high', trend: 'worsening' },
  { id: 'cr2', neighborhood: 'Haret Hreik', city: 'Beirut', lat: 33.849, lng: 35.492, risk_score: 92, infrastructure_damage: 80, conflict_proximity: 95, humanitarian_needs: 88, population_density: 'high', trend: 'worsening' },
  { id: 'cr3', neighborhood: 'Tyre City', city: 'Tyre', lat: 33.272, lng: 35.203, risk_score: 88, infrastructure_damage: 70, conflict_proximity: 90, humanitarian_needs: 85, population_density: 'medium', trend: 'stable' },
  { id: 'cr4', neighborhood: 'Nabatieh Center', city: 'Nabatieh', lat: 33.378, lng: 35.483, risk_score: 85, infrastructure_damage: 65, conflict_proximity: 88, humanitarian_needs: 80, population_density: 'medium', trend: 'worsening' },
  { id: 'cr5', neighborhood: 'Hamra', city: 'Beirut', lat: 33.895, lng: 35.481, risk_score: 45, infrastructure_damage: 20, conflict_proximity: 40, humanitarian_needs: 50, population_density: 'high', trend: 'stable' },
  { id: 'cr6', neighborhood: 'Jounieh', city: 'Jounieh', lat: 33.980, lng: 35.617, risk_score: 25, infrastructure_damage: 10, conflict_proximity: 15, humanitarian_needs: 30, population_density: 'medium', trend: 'improving' },
  { id: 'cr7', neighborhood: 'Byblos', city: 'Byblos', lat: 34.120, lng: 35.650, risk_score: 15, infrastructure_damage: 5, conflict_proximity: 10, humanitarian_needs: 20, population_density: 'low', trend: 'improving' },
  { id: 'cr8', neighborhood: 'Baalbek', city: 'Baalbek', lat: 34.005, lng: 36.211, risk_score: 78, infrastructure_damage: 55, conflict_proximity: 80, humanitarian_needs: 75, population_density: 'medium', trend: 'worsening' },
];

// ─── Displacement (Empty Buildings, Camps, Relocation) ──────────────
export interface EmptyBuilding {
  id: string;
  name: string;
  lat: number;
  lng: number;
  city: string;
  building_type: 'residential' | 'commercial' | 'school' | 'warehouse';
  estimated_capacity: number;
  condition: 'good' | 'fair' | 'damaged';
  has_water: boolean;
  has_electricity: boolean;
  owner_contact: string;
}

export const mockEmptyBuildings: EmptyBuilding[] = [
  { id: 'eb1', name: 'Vacant Apartment Block — Hamra', lat: 33.894, lng: 35.480, city: 'Beirut', building_type: 'residential', estimated_capacity: 40, condition: 'good', has_water: true, has_electricity: false, owner_contact: '+961 01 350 111' },
  { id: 'eb2', name: 'Closed School — Jounieh', lat: 33.978, lng: 35.619, city: 'Jounieh', building_type: 'school', estimated_capacity: 100, condition: 'good', has_water: true, has_electricity: true, owner_contact: '+961 09 830 222' },
  { id: 'eb3', name: 'Empty Warehouse — Tripoli Port', lat: 34.450, lng: 35.825, city: 'Tripoli', building_type: 'warehouse', estimated_capacity: 200, condition: 'fair', has_water: false, has_electricity: false, owner_contact: '+961 06 440 333' },
  { id: 'eb4', name: 'Commercial Building — Zahle', lat: 33.847, lng: 35.861, city: 'Zahle', building_type: 'commercial', estimated_capacity: 60, condition: 'good', has_water: true, has_electricity: true, owner_contact: '+961 08 800 444' },
];

export interface RefugeeCamp {
  id: string;
  name: string;
  lat: number;
  lng: number;
  city: string;
  capacity: number;
  current_occupancy: number;
  managed_by: string;
  services: string[];
}

export const mockRefugeeCamps: RefugeeCamp[] = [
  { id: 'rc1', name: 'Shatila Camp', lat: 33.862, lng: 35.493, city: 'Beirut', capacity: 8000, current_occupancy: 11500, managed_by: 'UNRWA', services: ['medical', 'school', 'food distribution'] },
  { id: 'rc2', name: 'Ain el-Hilweh', lat: 33.555, lng: 35.380, city: 'Sidon', capacity: 12000, current_occupancy: 18000, managed_by: 'UNRWA', services: ['medical', 'school', 'water'] },
  { id: 'rc3', name: 'Bekaa ITS Cluster', lat: 33.860, lng: 35.870, city: 'Bekaa', capacity: 5000, current_occupancy: 7200, managed_by: 'UNHCR', services: ['food', 'water', 'medical'] },
  { id: 'rc4', name: 'Tripoli Emergency Shelter', lat: 34.438, lng: 35.838, city: 'Tripoli', capacity: 2000, current_occupancy: 1400, managed_by: 'Lebanese Red Cross', services: ['food', 'blankets', 'medical'] },
];

// ─── Marketplace & Micro-Grants ─────────────────────────────────────
export type ListingType = 'micro_grant' | 'marketplace' | 'work_for_aid';
export interface MarketplaceListing {
  id: string;
  type: ListingType;
  title: string;
  description: string;
  location: string;
  contact: string;
  amount?: string;
  posted_at: string;
}

export const mockMarketplaceListings: MarketplaceListing[] = [
  { id: 'ml1', type: 'micro_grant', title: '$50 Emergency Family Grant', description: 'Direct cash for displaced families — apply via WhatsApp', location: 'Nationwide', contact: '+961 81 000 111', amount: '$50', posted_at: '2024-12-01T14:00:00Z' },
  { id: 'ml2', type: 'micro_grant', title: 'Rent Assistance — 1 Month', description: 'Cover 1 month rent for families who lost homes', location: 'Beirut', contact: 'apply@aid-fund.org', amount: '$200', posted_at: '2024-12-01T13:00:00Z' },
  { id: 'ml3', type: 'marketplace', title: 'Baby Formula — 6 cans', description: 'Selling at cost — Aptamil Stage 1', location: 'Hamra, Beirut', contact: '+961 71 222 333', amount: '$30', posted_at: '2024-12-01T12:00:00Z' },
  { id: 'ml4', type: 'marketplace', title: 'Generator — 3kVA', description: 'Used Honda generator, working condition', location: 'Jounieh', contact: '+961 03 444 555', amount: '$400', posted_at: '2024-12-01T11:00:00Z' },
  { id: 'ml5', type: 'work_for_aid', title: 'Plumbing repair for food', description: 'Can fix pipes/plumbing — need food supplies for family', location: 'Sidon', contact: '+961 76 666 777', posted_at: '2024-12-01T10:00:00Z' },
  { id: 'ml6', type: 'work_for_aid', title: 'Teaching English for shelter', description: 'English teacher — can tutor children in exchange for shared room', location: 'Tripoli', contact: '+961 70 888 999', posted_at: '2024-12-01T09:00:00Z' },
];

// ─── DIY Tools / Survival Tutorials ─────────────────────────────────
export interface DIYTutorial {
  id: string;
  title: string;
  category: 'water_purification' | 'emergency_cooking' | 'power_generation' | 'first_aid' | 'shelter_repair';
  difficulty: 'easy' | 'medium' | 'hard';
  time_minutes: number;
  materials: string[];
  steps: string[];
  icon: string;
}

export const mockDIYTutorials: DIYTutorial[] = [
  { id: 'diy1', title: 'Solar Water Purification (SODIS)', category: 'water_purification', difficulty: 'easy', time_minutes: 360, materials: ['Clear plastic bottles', 'Sunlight (6+ hours)'], steps: ['Fill clear PET bottle with water', 'Shake vigorously to add oxygen', 'Place on reflective surface in direct sun', 'Wait 6 hours (full sun) or 2 days (cloudy)', 'Water is safe to drink'], icon: '💧' },
  { id: 'diy2', title: 'Rocket Stove from Tin Cans', category: 'emergency_cooking', difficulty: 'medium', time_minutes: 30, materials: ['3 large tin cans', 'Tin snips or knife', 'Small sticks for fuel'], steps: ['Cut opening in bottom of largest can', 'Insert medium can as fuel chamber at 45° angle', 'Create insulation layer with ash/dirt', 'Feed small sticks into the fuel channel', 'Place pot on top — cooks with very little fuel'], icon: '🔥' },
  { id: 'diy3', title: 'USB Charger from Car Battery', category: 'power_generation', difficulty: 'hard', time_minutes: 15, materials: ['12V car battery', 'USB car charger adapter', 'Wires or jumper cables'], steps: ['Connect USB car charger to battery terminals', 'Red to positive (+), black to negative (−)', 'Plug phone USB cable into charger', 'Monitor battery voltage — stop below 11.8V', 'One car battery = ~20 full phone charges'], icon: '🔋' },
  { id: 'diy4', title: 'Emergency Wound Closure', category: 'first_aid', difficulty: 'medium', time_minutes: 10, materials: ['Clean cloth strips or butterfly bandages', 'Clean water', 'Antiseptic if available'], steps: ['Clean wound thoroughly with clean water', 'Apply pressure to stop bleeding', 'Bring wound edges together', 'Apply butterfly strips across wound', 'Cover with clean bandage, change daily', 'Seek medical help as soon as possible'], icon: '🩹' },
  { id: 'diy5', title: 'Tarp Shelter in 10 Minutes', category: 'shelter_repair', difficulty: 'easy', time_minutes: 10, materials: ['Tarp or large plastic sheet', 'Rope/cord (3m)', '4 heavy objects or stakes'], steps: ['Tie rope between two supports (trees, poles, walls)', 'Drape tarp over rope at center', 'Anchor edges with rocks or stakes', 'Angle sides for rain runoff', 'Use extra material as ground sheet'], icon: '⛺' },
];

// ─── NGO Activity & Missions ────────────────────────────────────────
export interface NGOActivity {
  id: string;
  organization: string;
  sector: 'medical' | 'food' | 'shelter' | 'protection' | 'education' | 'wash' | 'logistics';
  region: string;
  lat: number;
  lng: number;
  description: string;
  contact: string;
  active: boolean;
}

export const mockNGOActivities: NGOActivity[] = [
  { id: 'ngo1', organization: 'UNHCR', sector: 'shelter', region: 'Bekaa Valley', lat: 33.855, lng: 35.860, description: 'Emergency shelter kits for 5,000 families', contact: 'unhcr-leb@unhcr.org', active: true },
  { id: 'ngo2', organization: 'MSF / Doctors Without Borders', sector: 'medical', region: 'South Lebanon', lat: 33.350, lng: 35.300, description: 'Mobile clinics in Tyre & Nabatieh', contact: 'msf.lebanon@msf.org', active: true },
  { id: 'ngo3', organization: 'WFP', sector: 'food', region: 'Nationwide', lat: 33.890, lng: 35.500, description: 'Food parcel distribution at 12 centers', contact: 'wfp.lebanon@wfp.org', active: true },
  { id: 'ngo4', organization: 'UNICEF', sector: 'wash', region: 'Beirut', lat: 33.870, lng: 35.495, description: 'Water trucking & sanitation in shelters', contact: 'unicef-leb@unicef.org', active: true },
  { id: 'ngo5', organization: 'ICRC', sector: 'protection', region: 'South Lebanon', lat: 33.270, lng: 35.200, description: 'Family tracing & protection monitoring', contact: '+961 01 754 050', active: true },
  { id: 'ngo6', organization: 'ACTED', sector: 'shelter', region: 'Tripoli', lat: 34.436, lng: 35.838, description: 'Winterization kits for 2,000 families', contact: 'acted-leb@acted.org', active: true },
  { id: 'ngo7', organization: 'World Vision', sector: 'education', region: 'Bekaa', lat: 33.848, lng: 35.862, description: 'Emergency education for displaced children', contact: 'wv-leb@wvi.org', active: true },
];

export interface VolunteerMission {
  id: string;
  organization: string;
  title: string;
  urgency: 'critical' | 'high' | 'normal';
  location: string;
  skills_needed: string[];
  volunteers_needed: number;
  volunteers_signed: number;
  description: string;
  contact: string;
}

export const mockVolunteerMissions: VolunteerMission[] = [
  { id: 'vm1', organization: 'Lebanese Red Cross', title: 'Emergency Medical Team — Sidon', urgency: 'critical', location: 'Sidon', skills_needed: ['first aid', 'nursing'], volunteers_needed: 10, volunteers_signed: 4, description: 'Staff field hospital for influx of wounded', contact: 'ops@redcross.org.lb' },
  { id: 'vm2', organization: 'UNHCR', title: 'Shelter Registration — Bekaa', urgency: 'high', location: 'Bekaa Valley', skills_needed: ['data entry', 'Arabic'], volunteers_needed: 6, volunteers_signed: 2, description: 'Register new arrivals at Bekaa shelters', contact: 'vol@unhcr.org' },
  { id: 'vm3', organization: 'WFP', title: 'Food Distribution Helpers', urgency: 'high', location: 'Beirut (multiple sites)', skills_needed: ['physical fitness', 'logistics'], volunteers_needed: 20, volunteers_signed: 8, description: 'Load/unload and distribute food parcels', contact: 'ops@wfp.org' },
  { id: 'vm4', organization: 'Animals Lebanon', title: 'Pet Rescue — South Beirut', urgency: 'normal', location: 'Dahieh, Beirut', skills_needed: ['animal handling'], volunteers_needed: 4, volunteers_signed: 1, description: 'Rescue abandoned animals from damaged buildings', contact: 'rescue@animalslebanon.org' },
];
