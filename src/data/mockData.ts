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

export const mockShelters: Shelter[] = [];

export const mockHousing: HousingListing[] = [];

export interface Hospital {
  id: string;
  name: string;
  lat: number;
  lng: number;
  phone: string;
  city: string;
}

export const lebanonHospitals: Hospital[] = [
  // Beirut
  { id: 'h-01', name: 'American University of Beirut Medical Center (AUBMC)', lat: 33.9003, lng: 35.4784, phone: '+961 1 350 000', city: 'Beirut' },
  { id: 'h-02', name: 'Rafik Hariri University Hospital', lat: 33.8333, lng: 35.4833, phone: '+961 1 830 000', city: 'Beirut' },
  { id: 'h-03', name: 'Hotel Dieu de France', lat: 33.8917, lng: 35.5139, phone: '+961 1 615 300', city: 'Beirut' },
  { id: 'h-04', name: 'Saint George Hospital University Medical Center', lat: 33.9025, lng: 35.5050, phone: '+961 1 441 000', city: 'Beirut' },
  { id: 'h-05', name: 'Clemenceau Medical Center', lat: 33.8972, lng: 35.4819, phone: '+961 1 374 888', city: 'Beirut' },
  { id: 'h-06', name: 'Geitaoui Hospital', lat: 33.8903, lng: 35.5225, phone: '+961 1 580 680', city: 'Beirut' },
  { id: 'h-07', name: 'Makassed General Hospital', lat: 33.8828, lng: 35.5094, phone: '+961 1 636 000', city: 'Beirut' },
  { id: 'h-08', name: 'Rizk Hospital', lat: 33.8892, lng: 35.5117, phone: '+961 1 200 800', city: 'Beirut' },
  { id: 'h-09', name: 'Sahel General Hospital', lat: 33.8558, lng: 35.4917, phone: '+961 1 840 026', city: 'Beirut' },
  { id: 'h-10', name: 'Bahman Hospital', lat: 33.8519, lng: 35.4828, phone: '+961 1 300 200', city: 'Beirut' },
  // Mount Lebanon
  { id: 'h-11', name: 'Mount Lebanon Hospital', lat: 33.8833, lng: 35.5500, phone: '+961 5 457 111', city: 'Hadat' },
  { id: 'h-12', name: 'Bellevue Medical Center', lat: 33.8611, lng: 35.5639, phone: '+961 5 465 465', city: 'Mansourieh' },
  { id: 'h-13', name: 'Keserwan Medical Center', lat: 33.9806, lng: 35.6178, phone: '+961 9 857 000', city: 'Jounieh' },
  { id: 'h-14', name: 'Notre Dame des Secours (Byblos)', lat: 34.1236, lng: 35.6511, phone: '+961 9 547 254', city: 'Byblos' },
  { id: 'h-15', name: 'Hammoud Hospital', lat: 33.8522, lng: 35.4922, phone: '+961 1 840 590', city: 'Saida' },
  { id: 'h-16', name: 'Middle East Institute of Health (Bsalim)', lat: 33.8875, lng: 35.5875, phone: '+961 4 960 300', city: 'Bsalim' },
  // North
  { id: 'h-17', name: 'Nini Hospital', lat: 34.4333, lng: 35.8333, phone: '+961 6 410 610', city: 'Tripoli' },
  { id: 'h-18', name: 'Monla Hospital', lat: 34.4350, lng: 35.8350, phone: '+961 6 432 071', city: 'Tripoli' },
  { id: 'h-19', name: 'Haykal Hospital', lat: 34.4300, lng: 35.8400, phone: '+961 6 601 600', city: 'Tripoli' },
  { id: 'h-20', name: 'Zgharta Governmental Hospital', lat: 34.3983, lng: 35.8942, phone: '+961 6 660 550', city: 'Zgharta' },
  // South
  { id: 'h-21', name: 'Labib Medical Center (Sidon)', lat: 33.5594, lng: 35.3717, phone: '+961 7 725 111', city: 'Sidon' },
  { id: 'h-22', name: 'Jabal Amel Hospital (Tyre)', lat: 33.2721, lng: 35.2033, phone: '+961 7 740 534', city: 'Tyre' },
  { id: 'h-23', name: 'Nabatieh Governmental Hospital', lat: 33.3633, lng: 35.4717, phone: '+961 7 760 868', city: 'Nabatieh' },
  { id: 'h-24', name: 'Hiram Hospital (Tyre)', lat: 33.2750, lng: 35.2060, phone: '+961 7 741 592', city: 'Tyre' },
  // Bekaa
  { id: 'h-25', name: 'Chtaura Governmental Hospital', lat: 33.8150, lng: 35.8600, phone: '+961 8 543 333', city: 'Chtaura' },
  { id: 'h-26', name: 'Bekaa Hospital (Zahle)', lat: 33.8463, lng: 35.9020, phone: '+961 8 801 116', city: 'Zahle' },
  { id: 'h-27', name: 'Dar Al Amal Hospital', lat: 34.0047, lng: 36.2110, phone: '+961 8 370 714', city: 'Baalbek' },
  { id: 'h-28', name: 'Rayak Hospital', lat: 33.8500, lng: 35.9900, phone: '+961 8 900 735', city: 'Rayak' },
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
  // Official Lebanese Government & Republic
  { id: 'd-gov1', name: 'High Relief Committee (الهيئة العليا للإغاثة)', description: 'Official government body coordinating national disaster relief and aid distribution across Lebanon.', url: 'http://www.hrc-lebanon.gov.lb/', category: 'general' },
  { id: 'd-gov2', name: 'Ministry of Social Affairs (MoSA)', description: 'Government ministry managing social development centers (SDCs) for displaced families — call center for aid inquiries.', url: 'https://www.socialaffairs.gov.lb/', category: 'general' },
  { id: 'd-gov3', name: 'Presidency of the Council of Ministers', description: 'Official coordination of national crisis response and governmental aid programs.', url: 'https://pcm.gov.lb/', category: 'general' },
  // International Organizations
  { id: 'd1', name: 'International Committee of the Red Cross', description: 'Providing emergency medical care, food, and shelter to displaced families in Lebanon.', url: 'https://www.icrc.org/en/donate/lebanon', category: 'general' },
  { id: 'd2', name: 'UNHCR Lebanon', description: 'Supporting refugees and internally displaced persons with shelter and essential supplies.', url: 'https://www.unhcr.org/lb/', category: 'shelter' },
  { id: 'd3', name: 'Médecins Sans Frontières', description: 'Emergency medical assistance in conflict-affected areas of Lebanon.', url: 'https://www.msf.org/lebanon', category: 'medical' },
  { id: 'd4', name: 'World Food Programme', description: 'Providing emergency food assistance to families displaced by the conflict.', url: 'https://www.wfp.org/countries/lebanon', category: 'food' },
  { id: 'd5', name: 'Lebanese Red Cross', description: 'Local emergency response, ambulance services, and first aid across Lebanon.', url: 'https://www.redcross.org.lb/', category: 'general' },
  { id: 'd6', name: 'UNICEF Lebanon', description: 'Protecting children affected by the crisis with education, health, and psychosocial support.', url: 'https://www.unicef.org/lebanon/', category: 'general' },
  // Local NGOs
  { id: 'd7', name: 'Offre Joie', description: 'Multi-aid services including shelter, mattresses, and food across Lebanon. Call 03 628 000.', url: 'https://www.offrejoie.org/', category: 'shelter' },
  { id: 'd8', name: 'Anera', description: 'Distributing food, healthcare, hygiene kits, clothes, and blankets across Lebanon.', url: 'https://www.anera.org/', category: 'general' },
  { id: 'd9', name: 'Basmeh & Zeitooneh', description: 'Non-food items, ready-to-eat meals, hygiene kits, and psychosocial support for displaced families.', url: 'https://www.basmeh-zeitooneh.org/', category: 'general' },
];

export const mockEmergencyContacts: EmergencyContact[] = [
  // Official Lebanese Government Hotlines
  { id: 'e-gov1', name: 'Ministry of Public Health Hotline', phone: '1787', category: 'medical', description: 'MoPH emergency hotline for displaced persons — health & medication' },
  { id: 'e-gov2', name: 'Ministry of Social Affairs Call Center', phone: '1308', category: 'ngo', description: 'MoSA aid inquiries, social development centers, cash assistance' },
  { id: 'e-gov3', name: 'High Relief Committee', phone: '+961 1 981 501', category: 'emergency', description: 'Official government disaster relief coordination' },
  // Emergency Services
  { id: 'e1', name: 'Lebanese Red Cross', phone: '140', category: 'emergency', description: 'Ambulance and emergency services' },
  { id: 'e2', name: 'Civil Defense', phone: '125', category: 'emergency', description: 'Fire and rescue services' },
  { id: 'e3', name: 'Internal Security Forces', phone: '112', category: 'emergency', description: 'Police and security' },
  // Mental Health
  { id: 'e-mh1', name: 'Embrace Lifeline', phone: '1564', category: 'medical', description: '24/7 emotional support & suicide prevention' },
  // International
  { id: 'e4', name: 'UNHCR Hotline', phone: '+961 1 611 900', category: 'ngo', description: 'UN refugee agency assistance' },
  { id: 'e5', name: 'US Embassy Beirut', phone: '+961 4 543 600', category: 'embassy', description: 'American citizens emergency' },
  { id: 'e6', name: 'UK Embassy Beirut', phone: '+961 1 960 800', category: 'embassy', description: 'British citizens emergency' },
  { id: 'e7', name: 'Rafik Hariri Hospital', phone: '+961 1 830 000', category: 'medical', description: 'Major hospital in Beirut' },
  // GBV Support
  { id: 'e-gbv1', name: 'Abaad GBV Emergency Safe Line', phone: '+961 81 78 81 78', category: 'ngo', description: '24/7 gender-based violence emergency support' },
];

export const liveStreams = [
  // --- News Channels ---
  { id: 'ls1', name: 'Al Jazeera English', embedId: 'gCNeDWCI0vo', channel: 'Al Jazeera EN', category: 'news', live: true },
  { id: 'ls2', name: 'Al Jazeera Arabic', embedId: 'bNyUyrR0PHo', channel: 'الجزيرة', category: 'news', live: true },
  { id: 'ls3', name: 'Al Arabiya', embedId: '6LL9m-Xhob0', channel: 'Al Arabiya', category: 'news', live: true },
  { id: 'ls4', name: 'France 24 English', embedId: 'Ap-EvaCBaRA', channel: 'France 24', category: 'news', live: true },
  { id: 'ls5', name: 'Agenda-Free TV – US/Israel/Iran', embedId: 'qCqAP2jWL0k', channel: 'Agenda-Free', category: 'news', live: true },
  { id: 'ls6', name: 'Sky News Live', embedId: '9Auq9mYxFEE', channel: 'Sky News', category: 'news', live: true },

  // --- Lebanese TV ---
  { id: 'ls20', name: 'LBCI Lebanon Live', embedId: 'noLGOxGMRPs', channel: 'LBCI', category: 'lebanese', live: true },
  { id: 'ls21', name: 'MTV Lebanon', embedId: 'XQdQWViDi4A', channel: 'MTV', category: 'lebanese', live: false },
  { id: 'ls22', name: 'Al Jadeed / الجديد', embedId: 'lp_s37hYWx8', channel: 'Al Jadeed', category: 'lebanese', live: false },
  { id: 'ls23', name: 'OTV Lebanon', embedId: 'RL32tWyFyUs', channel: 'OTV', category: 'lebanese', live: false },
  { id: 'ls24', name: 'Al Manar TV', embedId: 'WXo0Xj4uymw', channel: 'Al Manar', category: 'lebanese', live: true },

  // --- Live Cameras ---
  { id: 'ls30', name: 'Middle East Multi-Cam 24/7', embedId: 'gmtlJ_m2r5A', channel: 'Source Global', category: 'camera' },
  { id: 'ls31', name: 'Iran/Israel/ME HD Cameras', embedId: 'Pdwghh0hZ3E', channel: 'NEMICO', category: 'camera' },
  { id: 'ls32', name: 'Israel & US Attack Iran – Multi-Cam', embedId: '6ccj1_fFExY', channel: 'Multi-Cam', category: 'camera' },
  { id: 'ls33', name: 'Iran Realtime HD Cameras', embedId: 'DcyV79s0oWU', channel: 'Iran Cams', category: 'camera' },
  { id: 'ls34', name: 'Rafah, Gaza – Live View', embedId: 'TV5UujqIoKs', channel: 'Rafah Cam', category: 'camera' },
  { id: 'ls35', name: 'Gaza/Israel/Beirut Multi-Cam', embedId: 'TVy8Jgw0M7M', channel: 'ME Live', category: 'camera' },
  { id: 'ls36', name: 'Middle East Licensed Cams', embedId: 's-xhXyWcU0A', channel: 'Cyprus1Click', category: 'camera' },
  { id: 'ls37', name: 'Israel/Gaza Multi-Cam', embedId: 'r4HVC0vzaHc', channel: 'DD Cyprus', category: 'camera' },
  { id: 'ls38', name: 'ME HD Camera Feeds', embedId: 'NTmcWcxkA18', channel: 'ME HD Cams', category: 'camera' },
  { id: 'ls39', name: 'Tel Aviv Skyline – AP', embedId: 'qUDZ-lve5_k', channel: 'Tel Aviv AP', category: 'camera' },
  { id: 'ls40', name: 'Tel Aviv Skyline – AP 2', embedId: 'eerhMyVGAHw', channel: 'Tel Aviv AP2', category: 'camera' },
  { id: 'ls41', name: 'Tel Aviv Live Cam', embedId: 'JXl8FsriOs0', channel: 'Tel Aviv Cam', category: 'camera' },
  { id: 'ls42', name: 'Tel Aviv – CGTN', embedId: 'ymgF6Z1FBbI', channel: 'CGTN Tel Aviv', category: 'camera' },
  { id: 'ls43', name: 'Rafah Gaza – Live Camera', embedId: 'HrbUuxtoBa4', channel: 'Rafah Cam 2', category: 'camera' },
];
