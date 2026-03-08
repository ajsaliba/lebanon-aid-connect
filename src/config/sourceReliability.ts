/**
 * Source Reliability Scoring — inspired by World Monitor's trust tiers.
 * Each news source gets a tier based on editorial standards, verification processes, and track record.
 */

export type ReliabilityTier = 'verified' | 'established' | 'mixed' | 'unverified';

export interface SourceProfile {
  tier: ReliabilityTier;
  /** 0-100 trust score */
  score: number;
  /** Source category */
  type: 'wire' | 'mainstream' | 'defense' | 'think_tank' | 'ngo' | 'government' | 'independent' | 'social' | 'podcast';
}

const PROFILES: Record<string, SourceProfile> = {
  // Wire services — highest reliability
  'Reuters': { tier: 'verified', score: 95, type: 'wire' },
  'AP News': { tier: 'verified', score: 95, type: 'wire' },
  'AFP': { tier: 'verified', score: 93, type: 'wire' },
  'Bloomberg': { tier: 'verified', score: 92, type: 'wire' },

  // Major international outlets
  'BBC ME': { tier: 'verified', score: 90, type: 'mainstream' },
  'BBC عربي': { tier: 'verified', score: 90, type: 'mainstream' },
  'BBC Arabic': { tier: 'verified', score: 90, type: 'mainstream' },
  'BBC Persian': { tier: 'established', score: 85, type: 'mainstream' },
  'Al Jazeera EN': { tier: 'established', score: 82, type: 'mainstream' },
  'الجزيرة': { tier: 'established', score: 80, type: 'mainstream' },
  'France 24': { tier: 'verified', score: 88, type: 'mainstream' },
  'فرانس 24': { tier: 'verified', score: 88, type: 'mainstream' },
  'Guardian ME': { tier: 'verified', score: 88, type: 'mainstream' },
  'DW عربي': { tier: 'established', score: 85, type: 'mainstream' },

  // Regional outlets
  'Middle East Eye': { tier: 'established', score: 75, type: 'mainstream' },
  'Al Arabiya': { tier: 'established', score: 74, type: 'mainstream' },
  'Arab News': { tier: 'established', score: 73, type: 'mainstream' },
  'The New Arab': { tier: 'established', score: 72, type: 'mainstream' },
  'Al-Monitor': { tier: 'established', score: 78, type: 'mainstream' },
  'ME Monitor': { tier: 'established', score: 70, type: 'mainstream' },
  'The National': { tier: 'established', score: 74, type: 'mainstream' },
  'Haaretz': { tier: 'established', score: 80, type: 'mainstream' },
  'JPost': { tier: 'established', score: 72, type: 'mainstream' },
  'سكاي نيوز عربية': { tier: 'established', score: 73, type: 'mainstream' },
  'الشرق الأوسط': { tier: 'established', score: 74, type: 'mainstream' },
  'القدس العربي': { tier: 'mixed', score: 65, type: 'mainstream' },

  // Lebanese outlets
  'MTV Lebanon': { tier: 'established', score: 70, type: 'mainstream' },
  'LBCI': { tier: 'established', score: 70, type: 'mainstream' },
  'LBC Latest': { tier: 'established', score: 70, type: 'mainstream' },
  'LBC War': { tier: 'established', score: 68, type: 'mainstream' },
  'Naharnet': { tier: 'established', score: 68, type: 'mainstream' },
  'Daily Star': { tier: 'established', score: 68, type: 'mainstream' },
  'The961': { tier: 'mixed', score: 60, type: 'mainstream' },
  'Lebanese Forces': { tier: 'mixed', score: 55, type: 'mainstream' },
  'Al Manar': { tier: 'mixed', score: 50, type: 'mainstream' },

  // Defense & Intel
  'Defense One': { tier: 'verified', score: 88, type: 'defense' },
  'Breaking Defense': { tier: 'established', score: 82, type: 'defense' },
  'The War Zone': { tier: 'established', score: 80, type: 'defense' },
  'Janes': { tier: 'verified', score: 90, type: 'defense' },
  'Military Times': { tier: 'established', score: 82, type: 'defense' },
  'Task & Purpose': { tier: 'established', score: 75, type: 'defense' },
  'USNI News': { tier: 'established', score: 82, type: 'defense' },
  'gCaptain': { tier: 'mixed', score: 65, type: 'defense' },
  'Oryx OSINT': { tier: 'established', score: 85, type: 'defense' },
  'UK MOD': { tier: 'verified', score: 88, type: 'government' },
  'Defense News': { tier: 'established', score: 82, type: 'defense' },

  // Think tanks
  'Brookings': { tier: 'verified', score: 90, type: 'think_tank' },
  'Carnegie': { tier: 'verified', score: 90, type: 'think_tank' },
  'Crisis Group': { tier: 'verified', score: 88, type: 'think_tank' },
  'Bellingcat': { tier: 'verified', score: 88, type: 'think_tank' },
  'Atlantic Council': { tier: 'established', score: 82, type: 'think_tank' },
  'Foreign Affairs': { tier: 'verified', score: 92, type: 'think_tank' },
  'Foreign Policy': { tier: 'verified', score: 88, type: 'think_tank' },
  'CSIS': { tier: 'verified', score: 88, type: 'think_tank' },
  'RAND': { tier: 'verified', score: 90, type: 'think_tank' },
  'Middle East Institute': { tier: 'established', score: 82, type: 'think_tank' },
  'Chatham House': { tier: 'verified', score: 90, type: 'think_tank' },
  'ECFR': { tier: 'established', score: 82, type: 'think_tank' },
  'RUSI': { tier: 'verified', score: 88, type: 'think_tank' },
  'CNAS': { tier: 'established', score: 80, type: 'think_tank' },
  'AEI': { tier: 'established', score: 78, type: 'think_tank' },
  'Responsible Statecraft': { tier: 'established', score: 76, type: 'think_tank' },
  'FPRI': { tier: 'established', score: 78, type: 'think_tank' },
  'Jamestown': { tier: 'established', score: 80, type: 'think_tank' },
  'Wilson Center': { tier: 'established', score: 82, type: 'think_tank' },
  'GMF': { tier: 'established', score: 78, type: 'think_tank' },
  'Stimson Center': { tier: 'established', score: 80, type: 'think_tank' },
  'Lowy Institute': { tier: 'established', score: 80, type: 'think_tank' },

  // NGOs & International Orgs
  'Amnesty': { tier: 'verified', score: 85, type: 'ngo' },
  'MSF': { tier: 'verified', score: 90, type: 'ngo' },
  'IAEA': { tier: 'verified', score: 95, type: 'government' },
  'WHO': { tier: 'verified', score: 92, type: 'government' },
  'UNHCR': { tier: 'verified', score: 90, type: 'government' },
  'FAO': { tier: 'verified', score: 88, type: 'government' },
  'UN Middle East': { tier: 'verified', score: 90, type: 'government' },
  'UN Peace': { tier: 'verified', score: 90, type: 'government' },

  // Government
  'White House': { tier: 'verified', score: 85, type: 'government' },
  'State Dept': { tier: 'verified', score: 85, type: 'government' },
  'Pentagon': { tier: 'established', score: 82, type: 'government' },
  'Gov Press': { tier: 'established', score: 78, type: 'government' },

  // Independent / Investigative
  '+972 Magazine': { tier: 'established', score: 72, type: 'independent' },
  'Mondoweiss': { tier: 'mixed', score: 58, type: 'independent' },
  'Elec. Intifada': { tier: 'mixed', score: 55, type: 'independent' },
  'Iran International': { tier: 'mixed', score: 62, type: 'mainstream' },
  'Fars News': { tier: 'mixed', score: 45, type: 'mainstream' },
  'Rudaw': { tier: 'established', score: 68, type: 'mainstream' },
  'Asharq Business': { tier: 'established', score: 72, type: 'mainstream' },
  'Oman Observer': { tier: 'mixed', score: 60, type: 'mainstream' },
  'Anadolu': { tier: 'mixed', score: 62, type: 'mainstream' },

  // Nuclear & Arms
  'Arms Control Assn': { tier: 'verified', score: 88, type: 'think_tank' },
  'Bulletin of Atomic Scientists': { tier: 'verified', score: 88, type: 'think_tank' },
  'FAS': { tier: 'verified', score: 86, type: 'think_tank' },
  'NTI': { tier: 'verified', score: 86, type: 'think_tank' },

  // Social / Reddit / YouTube
  'r/lebanon': { tier: 'unverified', score: 30, type: 'social' },
  'r/worldnews': { tier: 'unverified', score: 28, type: 'social' },
  'r/MiddleEastNews': { tier: 'unverified', score: 28, type: 'social' },
  '▶ Al Jazeera YT': { tier: 'established', score: 75, type: 'social' },
  '▶ BBC News YT': { tier: 'verified', score: 85, type: 'social' },

  // Podcasts
  '🎙 War on the Rocks': { tier: 'established', score: 78, type: 'podcast' },
  'War on Rocks': { tier: 'established', score: 78, type: 'podcast' },
};

export function getSourceProfile(sourceLabel: string): SourceProfile {
  return PROFILES[sourceLabel] || { tier: 'unverified', score: 40, type: 'independent' };
}

export const TIER_CONFIG: Record<ReliabilityTier, { label: string; color: string; icon: string }> = {
  verified:    { label: 'Verified',    color: 'text-success',          icon: '✓' },
  established: { label: 'Established', color: 'text-info',             icon: '◆' },
  mixed:       { label: 'Mixed',       color: 'text-warning',          icon: '◇' },
  unverified:  { label: 'Unverified',  color: 'text-muted-foreground', icon: '○' },
};

export const TYPE_LABELS: Record<SourceProfile['type'], string> = {
  wire: 'Wire Service',
  mainstream: 'News Outlet',
  defense: 'Defense Intel',
  think_tank: 'Think Tank',
  ngo: 'NGO',
  government: 'Official',
  independent: 'Independent',
  social: 'Social',
  podcast: 'Podcast',
};
