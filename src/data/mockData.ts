export interface AirstrikeEvent {
  id: string;
  lat: number;
  lng: number;
  date: string;
  description: string;
  severity: 'high' | 'elevated' | 'monitoring';
  source: string;
}

export interface Shelter {
  id: string;
  name: string;
  lat: number;
  lng: number;
  capacity: number;
  currentOccupancy: number;
  address: string;
  contact: string;
  status: 'open' | 'full' | 'closed';
  amenities: string[];
}

export interface HousingListing {
  id: string;
  title: string;
  lat: number;
  lng: number;
  price: number;
  currency: string;
  bedrooms: number;
  address: string;
  contact: string;
  available: boolean;
  description: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: string;
  severity: 'high' | 'elevated' | 'monitoring';
  category: 'conflict' | 'humanitarian' | 'political' | 'infrastructure';
  lat?: number;
  lng?: number;
}

export interface DonationOrg {
  id: string;
  name: string;
  description: string;
  url: string;
  logo?: string;
  category: 'medical' | 'food' | 'shelter' | 'general';
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  category: 'emergency' | 'embassy' | 'ngo' | 'medical';
  description: string;
}

export const mockAirstrikes: AirstrikeEvent[] = [
  // Lebanon
  { id: '1', lat: 33.8938, lng: 35.5018, date: '2024-12-01T14:30:00Z', description: 'Airstrike reported in southern Beirut suburbs', severity: 'high', source: 'Al Jazeera' },
  { id: '2', lat: 33.2721, lng: 35.2033, date: '2024-12-01T12:15:00Z', description: 'Multiple strikes in Tyre district', severity: 'high', source: 'Reuters' },
  { id: '3', lat: 33.5094, lng: 35.3737, date: '2024-12-01T10:45:00Z', description: 'Strike near Sidon outskirts', severity: 'elevated', source: 'AFP' },
  { id: '4', lat: 34.4333, lng: 35.8333, date: '2024-12-01T08:00:00Z', description: 'Reported activity near Baalbek', severity: 'elevated', source: 'LBC' },
  { id: '5', lat: 33.3633, lng: 35.4717, date: '2024-12-01T06:30:00Z', description: 'Strike in Nabatieh governorate', severity: 'high', source: 'NNA' },
  { id: '6', lat: 33.8547, lng: 35.8623, date: '2024-11-30T22:00:00Z', description: 'Bekaa Valley - infrastructure targeted', severity: 'monitoring', source: 'Reuters' },
  // Gaza / Palestine
  { id: '7', lat: 31.5017, lng: 34.4668, date: '2024-12-01T13:00:00Z', description: 'Heavy bombardment in Gaza City', severity: 'high', source: 'Al Jazeera' },
  { id: '8', lat: 31.2969, lng: 34.2455, date: '2024-12-01T11:30:00Z', description: 'Strikes near Rafah crossing', severity: 'high', source: 'AFP' },
  { id: '9', lat: 31.3462, lng: 34.3065, date: '2024-12-01T09:00:00Z', description: 'Khan Younis area targeted', severity: 'high', source: 'Reuters' },
  // Syria
  { id: '10', lat: 33.5138, lng: 36.2765, date: '2024-12-01T07:00:00Z', description: 'Airstrikes reported near Damascus outskirts', severity: 'elevated', source: 'Al Arabiya' },
  { id: '11', lat: 35.9306, lng: 36.6339, date: '2024-12-01T05:30:00Z', description: 'Strikes in Idlib province', severity: 'high', source: 'Reuters' },
  { id: '12', lat: 35.3359, lng: 40.1408, date: '2024-11-30T20:00:00Z', description: 'Deir ez-Zor military targets struck', severity: 'elevated', source: 'AFP' },
  // Yemen
  { id: '13', lat: 15.3694, lng: 44.1910, date: '2024-12-01T04:00:00Z', description: 'Coalition strikes in Sanaa', severity: 'high', source: 'Al Jazeera' },
  { id: '14', lat: 14.7980, lng: 42.9511, date: '2024-12-01T02:00:00Z', description: 'Port of Hodeidah targeted', severity: 'elevated', source: 'Reuters' },
  // Iran
  { id: '15', lat: 35.6892, lng: 51.3890, date: '2024-12-01T01:00:00Z', description: 'Strikes reported near Tehran military installations', severity: 'high', source: 'BBC' },
  { id: '16', lat: 32.6546, lng: 51.6680, date: '2024-11-30T23:00:00Z', description: 'Isfahan nuclear facility area targeted', severity: 'high', source: 'France 24' },
  // Iraq
  { id: '17', lat: 33.3152, lng: 44.3661, date: '2024-11-30T21:00:00Z', description: 'Baghdad - militia positions struck', severity: 'elevated', source: 'Al Arabiya' },
  { id: '18', lat: 36.3566, lng: 43.1593, date: '2024-11-30T19:00:00Z', description: 'Mosul area - suspected insurgent targets', severity: 'monitoring', source: 'Reuters' },
];

export const mockShelters: Shelter[] = [
  { id: 's1', name: 'Beirut Central Shelter', lat: 33.8969, lng: 35.4730, capacity: 500, currentOccupancy: 423, address: 'Downtown Beirut, Martyrs Square', contact: '+961 1 234 567', status: 'open', amenities: ['Water', 'Food', 'Medical', 'WiFi'] },
  { id: 's2', name: 'Tripoli Community Center', lat: 34.4333, lng: 35.8333, capacity: 300, currentOccupancy: 300, address: 'Tripoli, Al-Mina District', contact: '+961 6 234 567', status: 'full', amenities: ['Water', 'Food', 'Blankets'] },
  { id: 's3', name: 'Jounieh School Shelter', lat: 33.9806, lng: 35.6178, capacity: 200, currentOccupancy: 145, address: 'Jounieh, Main Street', contact: '+961 9 234 567', status: 'open', amenities: ['Water', 'Food', 'Medical'] },
  { id: 's4', name: 'Byblos Relief Center', lat: 34.1236, lng: 35.6511, capacity: 150, currentOccupancy: 88, address: 'Byblos, Old Souk Area', contact: '+961 9 876 543', status: 'open', amenities: ['Water', 'Food', 'Childcare'] },
];

export const mockHousing: HousingListing[] = [
  { id: 'h1', title: '2BR Apartment - Safe Zone', lat: 33.9806, lng: 35.6178, price: 300, currency: 'USD', bedrooms: 2, address: 'Jounieh, Kaslik', contact: '+961 70 123 456', available: true, description: 'Furnished apartment in safe area, suitable for families.' },
  { id: 'h2', title: 'Studio - Central Beirut', lat: 33.8938, lng: 35.5018, price: 200, currency: 'USD', bedrooms: 1, address: 'Beirut, Hamra', contact: '+961 70 234 567', available: true, description: 'Small studio near essential services.' },
  { id: 'h3', title: '3BR House - Mountain', lat: 33.9500, lng: 35.6500, price: 450, currency: 'USD', bedrooms: 3, address: 'Broummana, Mount Lebanon', contact: '+961 70 345 678', available: true, description: 'Spacious house in mountain area, away from conflict zones.' },
];

export const mockNews: NewsItem[] = [
  { id: 'n1', title: 'Heavy airstrikes reported across southern Lebanon', summary: 'Multiple airstrikes hit residential areas in southern Beirut and Tyre, displacing thousands of families.', source: 'Al Jazeera', url: '#', publishedAt: '2024-12-01T14:30:00Z', severity: 'high', category: 'conflict', lat: 33.8938, lng: 35.5018 },
  { id: 'n2', title: 'UN calls for immediate ceasefire', summary: 'The United Nations Security Council convenes emergency session on Lebanon crisis.', source: 'Reuters', url: '#', publishedAt: '2024-12-01T13:00:00Z', severity: 'elevated', category: 'political' },
  { id: 'n3', title: 'Humanitarian corridor established in Bekaa Valley', summary: 'Aid organizations establish safe passage for civilians fleeing conflict zones.', source: 'AFP', url: '#', publishedAt: '2024-12-01T11:00:00Z', severity: 'monitoring', category: 'humanitarian', lat: 33.8547, lng: 35.8623 },
  { id: 'n4', title: 'Hospital in Nabatieh damaged by nearby strike', summary: 'Medical facilities report structural damage, patients being evacuated.', source: 'MSF', url: '#', publishedAt: '2024-12-01T09:30:00Z', severity: 'high', category: 'infrastructure', lat: 33.3633, lng: 35.4717 },
  { id: 'n5', title: 'Red Cross deploys additional teams to Lebanon', summary: 'International Committee of the Red Cross sends emergency response teams.', source: 'ICRC', url: '#', publishedAt: '2024-12-01T08:00:00Z', severity: 'monitoring', category: 'humanitarian' },
  { id: 'n6', title: 'Power grid disruptions across multiple governorates', summary: 'Infrastructure damage causes widespread blackouts in southern and eastern regions.', source: 'LBC', url: '#', publishedAt: '2024-12-01T06:00:00Z', severity: 'elevated', category: 'infrastructure' },
];

export const mockDonations: DonationOrg[] = [
  { id: 'd1', name: 'International Committee of the Red Cross', description: 'Providing emergency medical care, food, and shelter to displaced families in Lebanon.', url: 'https://www.icrc.org/en/donate/lebanon', category: 'general' },
  { id: 'd2', name: 'UNHCR Lebanon', description: 'Supporting refugees and internally displaced persons with shelter and essential supplies.', url: 'https://www.unhcr.org/lb/', category: 'shelter' },
  { id: 'd3', name: 'Médecins Sans Frontières', description: 'Emergency medical assistance in conflict-affected areas of Lebanon.', url: 'https://www.msf.org/lebanon', category: 'medical' },
  { id: 'd4', name: 'World Food Programme', description: 'Providing emergency food assistance to families displaced by the conflict.', url: 'https://www.wfp.org/countries/lebanon', category: 'food' },
  { id: 'd5', name: 'Lebanese Red Cross', description: 'Local emergency response, ambulance services, and first aid across Lebanon.', url: 'https://www.redcross.org.lb/', category: 'general' },
  { id: 'd6', name: 'UNICEF Lebanon', description: 'Protecting children affected by the crisis with education, health, and psychosocial support.', url: 'https://www.unicef.org/lebanon/', category: 'general' },
];

export const mockEmergencyContacts: EmergencyContact[] = [
  { id: 'e1', name: 'Lebanese Red Cross', phone: '140', category: 'emergency', description: 'Ambulance and emergency services' },
  { id: 'e2', name: 'Civil Defense', phone: '125', category: 'emergency', description: 'Fire and rescue services' },
  { id: 'e3', name: 'Internal Security Forces', phone: '112', category: 'emergency', description: 'Police and security' },
  { id: 'e4', name: 'UNHCR Hotline', phone: '+961 1 611 900', category: 'ngo', description: 'UN refugee agency assistance' },
  { id: 'e5', name: 'US Embassy Beirut', phone: '+961 4 543 600', category: 'embassy', description: 'American citizens emergency' },
  { id: 'e6', name: 'UK Embassy Beirut', phone: '+961 1 960 800', category: 'embassy', description: 'British citizens emergency' },
  { id: 'e7', name: 'Rafik Hariri Hospital', phone: '+961 1 830 000', category: 'medical', description: 'Major hospital in Beirut' },
];

export const liveStreams = [
  { id: 'ls1', name: 'Al Jazeera English', embedId: 'gCNeDWCI0vo', channel: 'Al Jazeera' },
  { id: 'ls2', name: 'Al Jazeera Arabic', embedId: 'bNyUyrR0PHo', channel: 'الجزيرة' },
  { id: 'ls3', name: 'Al Arabiya', embedId: '6LL9m-Xhob0', channel: 'Al Arabiya' },
  { id: 'ls4', name: 'France 24 English', embedId: 'Ap-EvaCBaRA', channel: 'France 24' },
  { id: 'ls5', name: 'Sky News', embedId: '9Auq9mYxFEE', channel: 'Sky News' },
];
