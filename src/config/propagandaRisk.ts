/**
 * Propaganda Risk Indicators — flag state-affiliated media sources.
 * Inspired by World Monitor's propaganda risk system.
 */

export type PropagandaRisk = 'high' | 'medium' | 'none';

export interface PropagandaProfile {
  risk: PropagandaRisk;
  stateAffiliation: string;
  notes: string;
}

const PROPAGANDA_PROFILES: Record<string, PropagandaProfile> = {
  // High risk — direct state control
  'Al Manar': { risk: 'high', stateAffiliation: 'Hezbollah (Lebanon)', notes: 'Official Hezbollah media outlet' },
  'Fars News': { risk: 'high', stateAffiliation: 'Iran (IRGC)', notes: 'Semi-official IRGC-affiliated news agency' },
  'Xinhua': { risk: 'high', stateAffiliation: 'China (CCP)', notes: 'Official state news agency of PRC' },
  'TASS': { risk: 'high', stateAffiliation: 'Russia', notes: 'State-owned news agency' },
  'RT': { risk: 'high', stateAffiliation: 'Russia', notes: 'Registered foreign agent in US' },
  'CGTN': { risk: 'high', stateAffiliation: 'China (CCP)', notes: 'China Global Television Network' },
  'PressTV': { risk: 'high', stateAffiliation: 'Iran', notes: 'Iranian state broadcaster, English-language arm' },
  'IRNA': { risk: 'high', stateAffiliation: 'Iran', notes: 'Islamic Republic News Agency' },
  'SANA': { risk: 'high', stateAffiliation: 'Syria', notes: 'Syrian Arab News Agency' },
  // Medium risk — significant state influence
  'Anadolu': { risk: 'medium', stateAffiliation: 'Turkey', notes: 'Turkish state-run news agency' },
  'Al Arabiya': { risk: 'medium', stateAffiliation: 'Saudi Arabia (MBC)', notes: 'Saudi-owned, government-aligned editorial' },
  'سكاي نيوز عربية': { risk: 'medium', stateAffiliation: 'UAE', notes: 'Abu Dhabi-backed Sky News Arabia' },
  'TRT World': { risk: 'medium', stateAffiliation: 'Turkey', notes: 'Turkish state broadcaster' },
  'CGTN Tel Aviv': { risk: 'high', stateAffiliation: 'China (CCP)', notes: 'Chinese state media bureau' },
};

export function getPropagandaProfile(source: string): PropagandaProfile | null {
  return PROPAGANDA_PROFILES[source] || null;
}

export const PROPAGANDA_RISK_CONFIG: Record<PropagandaRisk, { label: string; color: string; icon: string }> = {
  high:   { label: 'State Media', color: 'text-danger', icon: '⚠' },
  medium: { label: 'Caution',     color: 'text-warning', icon: '!' },
  none:   { label: '',            color: '',              icon: '' },
};
