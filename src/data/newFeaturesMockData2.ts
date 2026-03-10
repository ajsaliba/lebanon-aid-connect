// ─── Emergency Plans ────────────────────────────────────────────────
export interface EmergencyPlan {
  id: string;
  family_name: string;
  meeting_points: { label: string; lat: number; lng: number }[];
  evacuation_routes: { name: string; from: string; to: string; distance_km: number; status: 'clear' | 'risky' | 'blocked' }[];
  contacts: { name: string; relation: string; phone: string }[];
  last_updated: string;
}

export const mockEmergencyPlans: EmergencyPlan[] = [
  {
    id: 'ep1',
    family_name: 'Khoury Family',
    meeting_points: [
      { label: 'Primary — AUB Main Gate', lat: 33.900, lng: 35.478 },
      { label: 'Secondary — Sanayeh Garden', lat: 33.891, lng: 35.487 },
    ],
    evacuation_routes: [
      { name: 'North to Jounieh', from: 'Hamra', to: 'Jounieh', distance_km: 18, status: 'clear' },
      { name: 'East to Aley', from: 'Hamra', to: 'Aley', distance_km: 25, status: 'risky' },
    ],
    contacts: [
      { name: 'Uncle Pierre', relation: 'Uncle', phone: '+961 03 111 222' },
      { name: 'Dr. Hala', relation: 'Family Doctor', phone: '+961 71 333 444' },
      { name: 'Red Cross', relation: 'Emergency', phone: '140' },
    ],
    last_updated: '2024-12-01T10:00:00Z',
  },
];

// ─── Emergency Kit Items ────────────────────────────────────────────
export interface KitItem {
  id: string;
  category: 'water' | 'light' | 'power' | 'medical' | 'documents' | 'food' | 'tools' | 'hygiene';
  name: string;
  quantity: string;
  essential: boolean;
  icon: string;
}

export const mockKitItems: KitItem[] = [
  { id: 'k1', category: 'water', name: 'Bottled water (1.5L)', quantity: '6 per person', essential: true, icon: '💧' },
  { id: 'k2', category: 'water', name: 'Water purification tablets', quantity: '1 pack', essential: true, icon: '💊' },
  { id: 'k3', category: 'light', name: 'Flashlight (LED)', quantity: '2', essential: true, icon: '🔦' },
  { id: 'k4', category: 'power', name: 'Batteries (AA/AAA)', quantity: '12', essential: true, icon: '🔋' },
  { id: 'k5', category: 'power', name: 'Power bank (10,000mAh)', quantity: '1', essential: true, icon: '⚡' },
  { id: 'k6', category: 'medical', name: 'First aid kit', quantity: '1', essential: true, icon: '🩹' },
  { id: 'k7', category: 'medical', name: 'Prescription medications', quantity: '7-day supply', essential: true, icon: '💊' },
  { id: 'k8', category: 'medical', name: 'Pain relievers (Paracetamol)', quantity: '1 box', essential: false, icon: '💊' },
  { id: 'k9', category: 'documents', name: 'Passport copies', quantity: 'All family', essential: true, icon: '📄' },
  { id: 'k10', category: 'documents', name: 'Birth certificates', quantity: 'All family', essential: true, icon: '📋' },
  { id: 'k11', category: 'documents', name: 'Cash (USD)', quantity: '$200+', essential: true, icon: '💵' },
  { id: 'k12', category: 'food', name: 'Canned food', quantity: '3-day supply', essential: true, icon: '🥫' },
  { id: 'k13', category: 'food', name: 'Energy bars', quantity: '10', essential: false, icon: '🍫' },
  { id: 'k14', category: 'food', name: 'Can opener', quantity: '1', essential: true, icon: '🔧' },
  { id: 'k15', category: 'tools', name: 'Multi-tool knife', quantity: '1', essential: false, icon: '🔪' },
  { id: 'k16', category: 'tools', name: 'Whistle', quantity: '1 per person', essential: true, icon: '📢' },
  { id: 'k17', category: 'tools', name: 'Duct tape', quantity: '1 roll', essential: false, icon: '🔧' },
  { id: 'k18', category: 'hygiene', name: 'Soap / hand sanitizer', quantity: '2', essential: true, icon: '🧴' },
  { id: 'k19', category: 'hygiene', name: 'Toilet paper', quantity: '4 rolls', essential: false, icon: '🧻' },
  { id: 'k20', category: 'hygiene', name: 'Trash bags', quantity: '10', essential: false, icon: '🗑️' },
];

// ─── Early Warning Events ───────────────────────────────────────────
export type DetectionType = 'explosion' | 'drone' | 'gunfire' | 'siren' | 'aircraft';
export interface EarlyWarningEvent {
  id: string;
  type: DetectionType;
  location: string;
  lat: number;
  lng: number;
  intensity: 'low' | 'medium' | 'high';
  detected_at: string;
  source: string;
  confirmed: boolean;
  description: string;
}

export const mockEarlyWarningEvents: EarlyWarningEvent[] = [
  { id: 'ew1', type: 'explosion', location: 'Dahieh, South Beirut', lat: 33.852, lng: 35.490, intensity: 'high', detected_at: '2024-12-01T14:20:00Z', source: 'Acoustic Network', confirmed: true, description: 'Large explosion detected — 3 sensors triangulated' },
  { id: 'ew2', type: 'drone', location: 'Tyre Coast', lat: 33.275, lng: 35.200, intensity: 'medium', detected_at: '2024-12-01T14:05:00Z', source: 'Visual report', confirmed: true, description: 'Surveillance drone observed flying east' },
  { id: 'ew3', type: 'gunfire', location: 'Nabatieh outskirts', lat: 33.382, lng: 35.485, intensity: 'medium', detected_at: '2024-12-01T13:45:00Z', source: 'Acoustic Network', confirmed: false, description: 'Sustained small arms fire — 2 min duration' },
  { id: 'ew4', type: 'siren', location: 'Sidon city center', lat: 33.560, lng: 35.374, intensity: 'low', detected_at: '2024-12-01T13:30:00Z', source: 'Civil Defense', confirmed: true, description: 'Air raid siren activated — shelter in place advisory' },
  { id: 'ew5', type: 'aircraft', location: 'Bekaa Valley', lat: 33.850, lng: 35.860, intensity: 'high', detected_at: '2024-12-01T13:15:00Z', source: 'Visual + Acoustic', confirmed: true, description: 'Low-altitude military jets — heading south' },
  { id: 'ew6', type: 'explosion', location: 'Baalbek outskirts', lat: 34.010, lng: 36.215, intensity: 'medium', detected_at: '2024-12-01T12:50:00Z', source: 'Acoustic Network', confirmed: true, description: '2 sequential blasts — agricultural area' },
];

// ─── Night Power Grid ───────────────────────────────────────────────
export interface NightPowerRegion {
  id: string;
  region: string;
  lat: number;
  lng: number;
  light_index: number; // 0-100 (0 = total blackout, 100 = full power)
  change_24h: number; // percentage change
  estimated_population: number;
  status: 'blackout' | 'partial' | 'normal';
  analysis_date: string;
}

export const mockNightPowerRegions: NightPowerRegion[] = [
  { id: 'np1', region: 'Beirut Central', lat: 33.890, lng: 35.500, light_index: 62, change_24h: -8, estimated_population: 350000, status: 'partial', analysis_date: '2024-12-01' },
  { id: 'np2', region: 'Dahieh', lat: 33.852, lng: 35.490, light_index: 12, change_24h: -35, estimated_population: 200000, status: 'blackout', analysis_date: '2024-12-01' },
  { id: 'np3', region: 'Jounieh', lat: 33.980, lng: 35.617, light_index: 78, change_24h: -3, estimated_population: 120000, status: 'normal', analysis_date: '2024-12-01' },
  { id: 'np4', region: 'Sidon', lat: 33.560, lng: 35.374, light_index: 35, change_24h: -15, estimated_population: 80000, status: 'partial', analysis_date: '2024-12-01' },
  { id: 'np5', region: 'Tyre', lat: 33.272, lng: 35.203, light_index: 8, change_24h: -42, estimated_population: 60000, status: 'blackout', analysis_date: '2024-12-01' },
  { id: 'np6', region: 'Tripoli', lat: 34.436, lng: 35.838, light_index: 71, change_24h: +2, estimated_population: 230000, status: 'normal', analysis_date: '2024-12-01' },
  { id: 'np7', region: 'Baalbek', lat: 34.005, lng: 36.211, light_index: 25, change_24h: -20, estimated_population: 50000, status: 'partial', analysis_date: '2024-12-01' },
  { id: 'np8', region: 'Nabatieh', lat: 33.378, lng: 35.483, light_index: 5, change_24h: -48, estimated_population: 40000, status: 'blackout', analysis_date: '2024-12-01' },
];

// ─── Supply Chain ───────────────────────────────────────────────────
export type SupplyCategory = 'food' | 'medical' | 'fuel' | 'water' | 'equipment';
export interface CommunitySupply {
  id: string;
  neighborhood: string;
  city: string;
  category: SupplyCategory;
  item: string;
  quantity: string;
  shared_by: string;
  available: boolean;
  contact: string;
  posted_at: string;
}

export const mockCommunitySupplies: CommunitySupply[] = [
  { id: 'cs1', neighborhood: 'Hamra', city: 'Beirut', category: 'fuel', item: 'Diesel — 50L', quantity: '50 liters', shared_by: 'Ahmad M.', available: true, contact: '+961 71 100 100', posted_at: '2024-12-01T14:00:00Z' },
  { id: 'cs2', neighborhood: 'Jounieh', city: 'Jounieh', category: 'medical', item: 'Amoxicillin (500mg)', quantity: '3 boxes', shared_by: 'Pharmacie Aoun', available: true, contact: '+961 09 830 123', posted_at: '2024-12-01T13:00:00Z' },
  { id: 'cs3', neighborhood: 'Verdun', city: 'Beirut', category: 'food', item: 'Rice — 25kg bags', quantity: '10 bags', shared_by: 'Local bakery', available: true, contact: '+961 01 350 222', posted_at: '2024-12-01T12:00:00Z' },
  { id: 'cs4', neighborhood: 'Sidon', city: 'Sidon', category: 'equipment', item: 'Portable generator 2kVA', quantity: '1', shared_by: 'Khalil H.', available: false, contact: '+961 07 720 333', posted_at: '2024-12-01T11:00:00Z' },
  { id: 'cs5', neighborhood: 'Tripoli', city: 'Tripoli', category: 'water', item: 'Bottled water (1.5L cases)', quantity: '20 cases', shared_by: 'Church group', available: true, contact: '+961 06 430 444', posted_at: '2024-12-01T10:00:00Z' },
  { id: 'cs6', neighborhood: 'Bekaa', city: 'Zahle', category: 'fuel', item: 'LPG cooking gas', quantity: '5 tanks', shared_by: 'Distributor', available: true, contact: '+961 08 800 555', posted_at: '2024-12-01T09:00:00Z' },
];

export interface LastMileDelivery {
  id: string;
  from: string;
  to: string;
  items: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'blocked';
  driver: string;
  eta_minutes: number;
  urgency: 'critical' | 'high' | 'normal';
}

export const mockLastMileDeliveries: LastMileDelivery[] = [
  { id: 'lm1', from: 'WFP Beirut Depot', to: 'Shatila Camp', items: 'Food parcels (200)', status: 'in_transit', driver: 'Red Cross Team 4', eta_minutes: 25, urgency: 'high' },
  { id: 'lm2', from: 'ICRC Medical Store', to: 'Tyre Field Hospital', items: 'Surgical kits (10)', status: 'blocked', driver: 'MSF Van 2', eta_minutes: 0, urgency: 'critical' },
  { id: 'lm3', from: 'UNICEF Warehouse', to: 'Bekaa ITS Cluster', items: 'Water + hygiene kits', status: 'pending', driver: 'Unassigned', eta_minutes: 0, urgency: 'high' },
  { id: 'lm4', from: 'Tripoli Port', to: 'Tripoli Shelter', items: 'Blankets (500)', status: 'delivered', driver: 'LRC Team 7', eta_minutes: 0, urgency: 'normal' },
  { id: 'lm5', from: 'Sidon Depot', to: 'Nabatieh community', items: 'Baby formula + diapers', status: 'in_transit', driver: 'Volunteer Van', eta_minutes: 45, urgency: 'critical' },
];

// ─── Reconstruction ─────────────────────────────────────────────────
export interface ReconstructionProject {
  id: string;
  area: string;
  city: string;
  damage_type: 'residential' | 'infrastructure' | 'commercial' | 'school' | 'hospital';
  funding_received_usd: number;
  funding_needed_usd: number;
  status: 'assessment' | 'funded' | 'in_progress' | 'completed';
  organization: string;
}

export const mockReconstructionProjects: ReconstructionProject[] = [
  { id: 'rp1', area: 'Port District', city: 'Beirut', damage_type: 'infrastructure', funding_received_usd: 2500000, funding_needed_usd: 15000000, status: 'in_progress', organization: 'World Bank' },
  { id: 'rp2', area: 'Dahieh Residential', city: 'Beirut', damage_type: 'residential', funding_received_usd: 800000, funding_needed_usd: 5000000, status: 'assessment', organization: 'UNDP' },
  { id: 'rp3', area: 'Sidon Public School', city: 'Sidon', damage_type: 'school', funding_received_usd: 300000, funding_needed_usd: 300000, status: 'funded', organization: 'UNICEF' },
  { id: 'rp4', area: 'Tyre Hospital Wing', city: 'Tyre', damage_type: 'hospital', funding_received_usd: 1200000, funding_needed_usd: 4000000, status: 'in_progress', organization: 'ICRC' },
  { id: 'rp5', area: 'Tripoli Market', city: 'Tripoli', damage_type: 'commercial', funding_received_usd: 150000, funding_needed_usd: 1000000, status: 'assessment', organization: 'Local gov' },
];

export interface SkilledWorker {
  id: string;
  name: string;
  skill: 'engineer' | 'electrician' | 'builder' | 'plumber' | 'welder';
  city: string;
  available: boolean;
  experience_years: number;
  phone: string;
}

export const mockSkilledWorkers: SkilledWorker[] = [
  { id: 'sw1', name: 'Hassan Faour', skill: 'engineer', city: 'Beirut', available: true, experience_years: 15, phone: '+961 03 111 000' },
  { id: 'sw2', name: 'Michel Haddad', skill: 'electrician', city: 'Jounieh', available: true, experience_years: 10, phone: '+961 70 222 000' },
  { id: 'sw3', name: 'Ali Hammoud', skill: 'builder', city: 'Sidon', available: false, experience_years: 20, phone: '+961 07 333 000' },
  { id: 'sw4', name: 'Georges Karam', skill: 'plumber', city: 'Tripoli', available: true, experience_years: 8, phone: '+961 06 444 000' },
  { id: 'sw5', name: 'Mahmoud Saleh', skill: 'welder', city: 'Bekaa', available: true, experience_years: 12, phone: '+961 08 555 000' },
];

// ─── Mesh Network & Communications ──────────────────────────────────
export type CommType = 'mesh_node' | 'radio_tower' | 'offline_hub';
export interface CommNode {
  id: string;
  type: CommType;
  name: string;
  lat: number;
  lng: number;
  city: string;
  active: boolean;
  range_km: number;
  users_connected: number;
  frequency?: string;
  notes: string;
}

export const mockCommNodes: CommNode[] = [
  { id: 'cn1', type: 'mesh_node', name: 'Hamra Mesh Relay', lat: 33.895, lng: 35.481, city: 'Beirut', active: true, range_km: 0.5, users_connected: 34, notes: 'Bluetooth + WiFi Direct relay' },
  { id: 'cn2', type: 'mesh_node', name: 'AUB Campus Node', lat: 33.900, lng: 35.478, city: 'Beirut', active: true, range_km: 0.3, users_connected: 120, notes: 'LoRa mesh on university grounds' },
  { id: 'cn3', type: 'radio_tower', name: 'Civil Defense Radio — Beirut', lat: 33.888, lng: 35.505, city: 'Beirut', active: true, range_km: 25, users_connected: 0, frequency: '87.5 FM', notes: '24/7 emergency broadcasts in Arabic' },
  { id: 'cn4', type: 'radio_tower', name: 'Red Cross Radio — South', lat: 33.350, lng: 35.290, city: 'South Lebanon', active: true, range_km: 40, users_connected: 0, frequency: '92.3 FM', notes: 'Hourly updates on safe routes & shelters' },
  { id: 'cn5', type: 'offline_hub', name: 'Library Offline Hub — Tripoli', lat: 34.433, lng: 35.840, city: 'Tripoli', active: true, range_km: 0.1, users_connected: 15, notes: 'Raspberry Pi running local wiki + crisis info' },
  { id: 'cn6', type: 'offline_hub', name: 'School Offline Hub — Sidon', lat: 33.558, lng: 35.373, city: 'Sidon', active: false, range_km: 0.1, users_connected: 0, notes: 'Currently offline — power issue' },
  { id: 'cn7', type: 'mesh_node', name: 'Bekaa Valley Relay', lat: 33.848, lng: 35.862, city: 'Zahle', active: true, range_km: 1.0, users_connected: 22, notes: 'Long-range LoRa relay' },
];

// ─── Resource Shortage Forecast ─────────────────────────────────────
export interface ResourceForecast {
  id: string;
  resource: string;
  category: 'food' | 'fuel' | 'medicine' | 'water' | 'electricity';
  region: string;
  current_stock_days: number;
  burn_rate_per_day: number;
  forecast_depletion_date: string;
  severity: 'critical' | 'warning' | 'watch' | 'stable';
  recommendation: string;
}

export const mockResourceForecasts: ResourceForecast[] = [
  { id: 'rf1', resource: 'Bread flour', category: 'food', region: 'South Lebanon', current_stock_days: 3, burn_rate_per_day: 15, forecast_depletion_date: '2024-12-04', severity: 'critical', recommendation: 'Emergency resupply from Beirut depot needed within 48h' },
  { id: 'rf2', resource: 'Diesel fuel', category: 'fuel', region: 'Bekaa Valley', current_stock_days: 5, burn_rate_per_day: 8, forecast_depletion_date: '2024-12-06', severity: 'warning', recommendation: 'Reduce generator hours, prioritize hospitals & shelters' },
  { id: 'rf3', resource: 'Insulin', category: 'medicine', region: 'Beirut', current_stock_days: 7, burn_rate_per_day: 2, forecast_depletion_date: '2024-12-08', severity: 'warning', recommendation: 'Coordinate with ICRC for medical supply airlift' },
  { id: 'rf4', resource: 'Clean water', category: 'water', region: 'Tyre', current_stock_days: 2, burn_rate_per_day: 20, forecast_depletion_date: '2024-12-03', severity: 'critical', recommendation: 'Immediate water trucking needed — UNICEF alerted' },
  { id: 'rf5', resource: 'LPG cooking gas', category: 'fuel', region: 'Tripoli', current_stock_days: 12, burn_rate_per_day: 3, forecast_depletion_date: '2024-12-13', severity: 'watch', recommendation: 'Monitor — community kitchens increasing demand' },
  { id: 'rf6', resource: 'Antibiotics', category: 'medicine', region: 'South Lebanon', current_stock_days: 4, burn_rate_per_day: 5, forecast_depletion_date: '2024-12-05', severity: 'critical', recommendation: 'MSF mobile pharmacy dispatched' },
  { id: 'rf7', resource: 'Grid electricity', category: 'electricity', region: 'Nabatieh', current_stock_days: 0, burn_rate_per_day: 0, forecast_depletion_date: 'N/A', severity: 'critical', recommendation: 'Total grid failure — rely on generators & solar only' },
];

// ─── Neighborhood Leaders ───────────────────────────────────────────
export interface NeighborhoodLeader {
  id: string;
  name: string;
  neighborhood: string;
  city: string;
  role: 'coordinator' | 'medical_lead' | 'logistics_lead' | 'security_lead';
  phone: string;
  verified: boolean;
  people_covered: number;
  skills: string[];
}

export const mockNeighborhoodLeaders: NeighborhoodLeader[] = [
  { id: 'nl1', name: 'Kamal Barakat', neighborhood: 'Hamra', city: 'Beirut', role: 'coordinator', phone: '+961 03 100 100', verified: true, people_covered: 450, skills: ['first aid', 'logistics'] },
  { id: 'nl2', name: 'Dr. Samia Jaber', neighborhood: 'Mar Elias', city: 'Beirut', role: 'medical_lead', phone: '+961 71 200 200', verified: true, people_covered: 300, skills: ['emergency medicine', 'triage'] },
  { id: 'nl3', name: 'Bilal Khalife', neighborhood: 'Old Sidon', city: 'Sidon', role: 'logistics_lead', phone: '+961 07 300 300', verified: true, people_covered: 600, skills: ['supply management', 'driving'] },
  { id: 'nl4', name: 'Rima Chaaban', neighborhood: 'El Mina', city: 'Tripoli', role: 'coordinator', phone: '+961 06 400 400', verified: true, people_covered: 500, skills: ['crisis coordination', 'Arabic/English'] },
  { id: 'nl5', name: 'Antoine Saliba', neighborhood: 'Jounieh Center', city: 'Jounieh', role: 'security_lead', phone: '+961 09 500 500', verified: false, people_covered: 250, skills: ['security', 'communications'] },
];

export interface CommunityTask {
  id: string;
  title: string;
  category: 'supply_transport' | 'repair' | 'medical' | 'evacuation' | 'cooking' | 'childcare';
  location: string;
  posted_by: string;
  volunteers_needed: number;
  volunteers_signed: number;
  urgency: 'critical' | 'high' | 'normal';
  status: 'open' | 'in_progress' | 'done';
  posted_at: string;
}

export const mockCommunityTasks: CommunityTask[] = [
  { id: 'ct1', title: 'Move medical supplies to Shatila', category: 'supply_transport', location: 'Beirut → Shatila', posted_by: 'Dr. Samia', volunteers_needed: 4, volunteers_signed: 1, urgency: 'critical', status: 'open', posted_at: '2024-12-01T14:00:00Z' },
  { id: 'ct2', title: 'Repair water pipe at shelter', category: 'repair', location: 'Sidon Shelter', posted_by: 'Bilal K.', volunteers_needed: 2, volunteers_signed: 2, urgency: 'high', status: 'in_progress', posted_at: '2024-12-01T12:00:00Z' },
  { id: 'ct3', title: 'Cook meals for 50 displaced families', category: 'cooking', location: 'Tripoli Community Center', posted_by: 'Rima C.', volunteers_needed: 6, volunteers_signed: 3, urgency: 'high', status: 'open', posted_at: '2024-12-01T11:00:00Z' },
  { id: 'ct4', title: 'Watch children while parents seek aid', category: 'childcare', location: 'Beirut Shelter', posted_by: 'Kamal B.', volunteers_needed: 3, volunteers_signed: 0, urgency: 'normal', status: 'open', posted_at: '2024-12-01T10:00:00Z' },
  { id: 'ct5', title: 'Transport elderly from Nabatieh', category: 'evacuation', location: 'Nabatieh → Sidon', posted_by: 'Red Cross', volunteers_needed: 2, volunteers_signed: 2, urgency: 'critical', status: 'done', posted_at: '2024-12-01T09:00:00Z' },
];

// ─── Field Hospital & Medical Equipment ─────────────────────────────
export interface FieldHospitalGuide {
  id: string;
  title: string;
  category: 'setup' | 'triage' | 'supply_list' | 'infection_control' | 'patient_flow';
  steps: string[];
  icon: string;
}

export const mockFieldHospitalGuides: FieldHospitalGuide[] = [
  { id: 'fh1', title: 'Site Selection & Setup', category: 'setup', steps: ['Select flat, covered area (school gym, warehouse)', 'Ensure 2+ exits for safety', 'Set up generator for lighting', 'Mark zones: triage, treatment, rest, morgue', 'Position water and sanitation 20m away'], icon: '🏥' },
  { id: 'fh2', title: 'Triage Protocol (START)', category: 'triage', steps: ['Walk → Minor (GREEN)', 'Not breathing after repositioning → Deceased (BLACK)', 'Breathing >30/min → Immediate (RED)', 'No radial pulse OR cannot follow commands → Immediate (RED)', 'Has pulse + follows commands → Delayed (YELLOW)'], icon: '🚨' },
  { id: 'fh3', title: 'Essential Supply Checklist', category: 'supply_list', steps: ['Stretchers × 10', 'IV kits + saline × 20', 'Wound dressing packs × 50', 'Surgical instrument set × 2', 'Antibiotics supply', 'Tetanus vaccines', 'Pain management (ketamine, morphine)', 'Oxygen concentrator × 2'], icon: '📦' },
  { id: 'fh4', title: 'Infection Control Basics', category: 'infection_control', steps: ['Handwashing stations at every zone entrance', 'Wear PPE: gloves, masks minimum', 'Separate clean and contaminated areas', 'Proper sharps disposal in yellow containers', 'Sterilize instruments between patients'], icon: '🧤' },
];

export interface MedicalEquipmentItem {
  id: string;
  name: string;
  location: string;
  city: string;
  available: boolean;
  quantity: number;
  condition: 'good' | 'fair' | 'needs_repair';
  contact: string;
}

export const mockMedicalEquipment: MedicalEquipmentItem[] = [
  { id: 'me1', name: 'Oxygen concentrator', location: 'AUBMC', city: 'Beirut', available: true, quantity: 5, condition: 'good', contact: '+961 01 350 000' },
  { id: 'me2', name: 'Portable ventilator', location: 'Rafik Hariri Hospital', city: 'Beirut', available: false, quantity: 0, condition: 'good', contact: '+961 01 830 000' },
  { id: 'me3', name: 'Surgical kit (field)', location: 'ICRC Warehouse', city: 'Sidon', available: true, quantity: 12, condition: 'good', contact: '+961 07 754 050' },
  { id: 'me4', name: 'Defibrillator', location: 'Nini Hospital', city: 'Tripoli', available: true, quantity: 3, condition: 'fair', contact: '+961 06 430 000' },
  { id: 'me5', name: 'Generator (medical grade)', location: 'MSF Field Office', city: 'Tyre', available: true, quantity: 2, condition: 'good', contact: 'msf.lebanon@msf.org' },
];

// ─── Aid Accountability ─────────────────────────────────────────────
export interface AidFundEntry {
  id: string;
  organization: string;
  amount_usd: number;
  purpose: string;
  region: string;
  disbursed: boolean;
  disbursement_date: string;
  transparency_score: number; // 0-100
  source_country: string;
}

export const mockAidFunds: AidFundEntry[] = [
  { id: 'af1', organization: 'USAID', amount_usd: 5000000, purpose: 'Emergency food + shelter', region: 'Nationwide', disbursed: true, disbursement_date: '2024-11-28', transparency_score: 85, source_country: 'USA' },
  { id: 'af2', organization: 'EU Emergency Fund', amount_usd: 3000000, purpose: 'Medical supplies', region: 'Beirut + South', disbursed: true, disbursement_date: '2024-11-30', transparency_score: 90, source_country: 'EU' },
  { id: 'af3', organization: 'Saudi Red Crescent', amount_usd: 2000000, purpose: 'Winterization kits', region: 'Bekaa + North', disbursed: false, disbursement_date: 'Pending', transparency_score: 65, source_country: 'Saudi Arabia' },
  { id: 'af4', organization: 'Qatar Fund', amount_usd: 4000000, purpose: 'Reconstruction', region: 'Beirut', disbursed: false, disbursement_date: 'Pending', transparency_score: 70, source_country: 'Qatar' },
  { id: 'af5', organization: 'DFID (UK)', amount_usd: 1500000, purpose: 'Water & sanitation', region: 'South Lebanon', disbursed: true, disbursement_date: '2024-12-01', transparency_score: 92, source_country: 'UK' },
  { id: 'af6', organization: 'Canada Aid', amount_usd: 800000, purpose: 'Education in emergencies', region: 'Bekaa', disbursed: true, disbursement_date: '2024-11-29', transparency_score: 88, source_country: 'Canada' },
];

// ─── Digital Vault ──────────────────────────────────────────────────
export interface VaultDocument {
  id: string;
  name: string;
  type: 'passport' | 'id_card' | 'birth_cert' | 'medical_record' | 'property_deed' | 'insurance' | 'diploma';
  family_member: string;
  uploaded_at: string;
  encrypted: boolean;
  backed_up: boolean;
  icon: string;
}

export const mockVaultDocuments: VaultDocument[] = [
  { id: 'vd1', name: 'Passport — Ahmad', type: 'passport', family_member: 'Ahmad Khoury', uploaded_at: '2024-11-20', encrypted: true, backed_up: true, icon: '🛂' },
  { id: 'vd2', name: 'ID Card — Fatima', type: 'id_card', family_member: 'Fatima Khoury', uploaded_at: '2024-11-20', encrypted: true, backed_up: true, icon: '🪪' },
  { id: 'vd3', name: 'Birth Certificate — Sara', type: 'birth_cert', family_member: 'Sara Khoury', uploaded_at: '2024-11-21', encrypted: true, backed_up: true, icon: '📋' },
  { id: 'vd4', name: 'Medical Records — Ahmad', type: 'medical_record', family_member: 'Ahmad Khoury', uploaded_at: '2024-11-25', encrypted: true, backed_up: false, icon: '🏥' },
  { id: 'vd5', name: 'Property Deed — Beirut Apt', type: 'property_deed', family_member: 'Family', uploaded_at: '2024-11-22', encrypted: true, backed_up: true, icon: '🏠' },
  { id: 'vd6', name: 'Insurance Policy', type: 'insurance', family_member: 'Family', uploaded_at: '2024-11-23', encrypted: true, backed_up: true, icon: '📄' },
];

// ─── Agriculture Recovery ───────────────────────────────────────────
export interface FarmReport {
  id: string;
  farmer_name: string;
  location: string;
  city: string;
  crop_type: string;
  damage_percent: number;
  needs: string[];
  status: 'needs_help' | 'receiving_aid' | 'recovering';
  contact: string;
}

export const mockFarmReports: FarmReport[] = [
  { id: 'fr1', farmer_name: 'Abu Fadi', location: 'Bekaa Valley West', city: 'Bekaa', crop_type: 'Wheat & barley', damage_percent: 80, needs: ['seeds', 'irrigation repair', 'machinery'], status: 'needs_help', contact: '+961 08 100 111' },
  { id: 'fr2', farmer_name: 'Hassan Taha', location: 'Tyre plains', city: 'Tyre', crop_type: 'Citrus & olive', damage_percent: 60, needs: ['seeds', 'fertilizer'], status: 'receiving_aid', contact: '+961 07 200 222' },
  { id: 'fr3', farmer_name: 'Mariam Khalil', location: 'Akkar highlands', city: 'Akkar', crop_type: 'Potatoes & vegetables', damage_percent: 30, needs: ['greenhouse repair'], status: 'recovering', contact: '+961 06 300 333' },
  { id: 'fr4', farmer_name: 'Cooperative Qaraoun', location: 'West Bekaa', city: 'Bekaa', crop_type: 'Grapes & cannabis (legal)', damage_percent: 45, needs: ['irrigation', 'labor'], status: 'needs_help', contact: '+961 08 400 444' },
];

export interface SeedShare {
  id: string;
  provider: string;
  seed_type: string;
  quantity: string;
  location: string;
  available: boolean;
  contact: string;
}

export const mockSeedShares: SeedShare[] = [
  { id: 'ss1', provider: 'FAO Lebanon', seed_type: 'Wheat seeds', quantity: '500 kg', location: 'Bekaa distribution', available: true, contact: 'fao-leb@fao.org' },
  { id: 'ss2', provider: 'Local cooperative', seed_type: 'Vegetable mix (tomato, cucumber, pepper)', quantity: '200 packs', location: 'Akkar', available: true, contact: '+961 06 500 555' },
  { id: 'ss3', provider: 'ICARDA', seed_type: 'Drought-resistant barley', quantity: '300 kg', location: 'Bekaa Valley', available: true, contact: 'icarda@cgiar.org' },
  { id: 'ss4', provider: 'Community garden', seed_type: 'Herb seeds (mint, thyme, parsley)', quantity: '100 packs', location: 'Tripoli', available: false, contact: '+961 06 600 666' },
];

// ─── Diaspora Support ───────────────────────────────────────────────
export interface DiasporaDonor {
  id: string;
  name: string;
  country: string;
  support_type: 'financial' | 'housing' | 'sponsorship' | 'volunteer';
  description: string;
  amount?: string;
  contact: string;
  verified: boolean;
}

export const mockDiasporaDonors: DiasporaDonor[] = [
  { id: 'dd1', name: 'Lebanese American Foundation', country: 'USA', support_type: 'financial', description: 'Emergency fund for displaced families', amount: '$500,000 available', contact: 'aid@laf.org', verified: true },
  { id: 'dd2', name: 'Nadim Khoury', country: 'Canada', support_type: 'housing', description: 'Offering 2-bedroom apartment in Montreal for refugee family', contact: 'nadim.k@email.com', verified: true },
  { id: 'dd3', name: 'Lebanese-Australian Network', country: 'Australia', support_type: 'sponsorship', description: 'Sponsor 20 families for relocation assistance', amount: 'AUD $2,000/family', contact: 'lan@network.org.au', verified: true },
  { id: 'dd4', name: 'Paris Lebanese Community', country: 'France', support_type: 'financial', description: 'Monthly contributions to medical supplies', amount: '€15,000/month', contact: 'aide@liban-paris.fr', verified: true },
  { id: 'dd5', name: 'Dr. Maya Saade', country: 'Germany', support_type: 'volunteer', description: 'Surgeon — available for remote telemedicine consultations', contact: 'maya.s@hospital.de', verified: false },
];

export interface InternationalAid {
  id: string;
  country: string;
  organization: string;
  aid_type: string;
  amount_usd: number;
  status: 'pledged' | 'disbursed' | 'delivered';
  date: string;
}

export const mockInternationalAid: InternationalAid[] = [
  { id: 'ia1', country: '🇺🇸 USA', organization: 'USAID', aid_type: 'Humanitarian package', amount_usd: 50000000, status: 'disbursed', date: '2024-11-28' },
  { id: 'ia2', country: '🇪🇺 EU', organization: 'ECHO', aid_type: 'Emergency relief', amount_usd: 30000000, status: 'disbursed', date: '2024-11-30' },
  { id: 'ia3', country: '🇸🇦 Saudi Arabia', organization: 'KSRelief', aid_type: 'Shelter + food', amount_usd: 20000000, status: 'pledged', date: '2024-12-01' },
  { id: 'ia4', country: '🇶🇦 Qatar', organization: 'Qatar Fund', aid_type: 'Reconstruction', amount_usd: 40000000, status: 'pledged', date: '2024-12-01' },
  { id: 'ia5', country: '🇬🇧 UK', organization: 'FCDO', aid_type: 'WASH + education', amount_usd: 15000000, status: 'delivered', date: '2024-12-01' },
  { id: 'ia6', country: '🇨🇦 Canada', organization: 'GAC', aid_type: 'Medical supplies', amount_usd: 8000000, status: 'disbursed', date: '2024-11-29' },
  { id: 'ia7', country: '🇫🇷 France', organization: 'AFD', aid_type: 'Infrastructure', amount_usd: 12000000, status: 'pledged', date: '2024-12-02' },
];
