/**
 * Country Instability Index (CII) — inspired by World Monitor.
 * Computes 0-100 stability scores for monitored countries based on news signals.
 * Score = baseline_risk (40%) + unrest_signal (20%) + security_signal (20%) + info_velocity (20%)
 */

import { type NewsItem } from '@/data/mockData';

export interface MonitoredCountry {
  id: string;
  name: string;
  /** ISO alpha-2 code */
  code: string;
  lat: number;
  lng: number;
  /** Baseline geopolitical risk (0-100) */
  baselineRisk: number;
  /** Keywords for news matching */
  keywords: string[];
  /** Conflict-zone floor — minimum CII regardless of news */
  conflictFloor: number;
}

export const MONITORED_COUNTRIES: MonitoredCountry[] = [
  { id: 'lb', name: 'Lebanon', code: 'LB', lat: 33.85, lng: 35.86, baselineRisk: 72, conflictFloor: 55, keywords: ['lebanon', 'lebanese', 'beirut', 'hezbollah', 'nabatieh', 'sidon', 'tyre', 'baalbek', 'bekaa', 'dahiyeh'] },
  { id: 'ps', name: 'Palestine', code: 'PS', lat: 31.95, lng: 35.23, baselineRisk: 85, conflictFloor: 70, keywords: ['gaza', 'palestinian', 'palestine', 'hamas', 'rafah', 'khan younis', 'west bank', 'nablus'] },
  { id: 'il', name: 'Israel', code: 'IL', lat: 31.05, lng: 34.85, baselineRisk: 60, conflictFloor: 40, keywords: ['israel', 'israeli', 'idf', 'tel aviv', 'jerusalem', 'haifa', 'netanyahu'] },
  { id: 'sy', name: 'Syria', code: 'SY', lat: 34.80, lng: 39.00, baselineRisk: 80, conflictFloor: 60, keywords: ['syria', 'syrian', 'damascus', 'aleppo', 'idlib', 'homs', 'assad'] },
  { id: 'ir', name: 'Iran', code: 'IR', lat: 32.43, lng: 53.69, baselineRisk: 55, conflictFloor: 35, keywords: ['iran', 'iranian', 'tehran', 'isfahan', 'irgc', 'khamenei'] },
  { id: 'ye', name: 'Yemen', code: 'YE', lat: 15.55, lng: 48.52, baselineRisk: 82, conflictFloor: 65, keywords: ['yemen', 'yemeni', 'sanaa', 'houthi', 'hodeidah', 'aden'] },
  { id: 'iq', name: 'Iraq', code: 'IQ', lat: 33.22, lng: 43.68, baselineRisk: 65, conflictFloor: 45, keywords: ['iraq', 'iraqi', 'baghdad', 'basra', 'mosul', 'erbil'] },
  { id: 'eg', name: 'Egypt', code: 'EG', lat: 26.82, lng: 30.80, baselineRisk: 35, conflictFloor: 15, keywords: ['egypt', 'egyptian', 'cairo', 'sinai', 'suez'] },
  { id: 'sa', name: 'Saudi Arabia', code: 'SA', lat: 23.89, lng: 45.08, baselineRisk: 25, conflictFloor: 10, keywords: ['saudi', 'riyadh', 'jeddah', 'mbs', 'saudi arabia'] },
  { id: 'tr', name: 'Turkey', code: 'TR', lat: 38.96, lng: 35.24, baselineRisk: 35, conflictFloor: 15, keywords: ['turkey', 'turkish', 'ankara', 'istanbul', 'erdogan'] },
  { id: 'jo', name: 'Jordan', code: 'JO', lat: 30.59, lng: 36.24, baselineRisk: 25, conflictFloor: 10, keywords: ['jordan', 'jordanian', 'amman'] },
  { id: 'ua', name: 'Ukraine', code: 'UA', lat: 48.38, lng: 31.17, baselineRisk: 90, conflictFloor: 75, keywords: ['ukraine', 'ukrainian', 'kyiv', 'zelenskyy', 'kharkiv', 'donbas'] },
  { id: 'ru', name: 'Russia', code: 'RU', lat: 61.52, lng: 105.32, baselineRisk: 45, conflictFloor: 25, keywords: ['russia', 'russian', 'moscow', 'putin', 'kremlin'] },
];

export interface CIIScore {
  country: MonitoredCountry;
  /** 0-100 instability score */
  score: number;
  /** Level: stable | watch | elevated | critical */
  level: 'stable' | 'watch' | 'elevated' | 'critical';
  /** Number of matching articles */
  articleCount: number;
  /** High-severity article count */
  highCount: number;
  /** Change direction */
  trend: 'rising' | 'stable' | 'falling';
}

export const CII_LEVEL_CONFIG: Record<CIIScore['level'], { label: string; color: string; bg: string }> = {
  stable:   { label: 'Stable',   color: '#22c55e', bg: 'bg-success/20' },
  watch:    { label: 'Watch',    color: '#f59e0b', bg: 'bg-warning/20' },
  elevated: { label: 'Elevated', color: '#f97316', bg: 'bg-warning/30' },
  critical: { label: 'Critical', color: '#ef4444', bg: 'bg-danger/20' },
};

export function computeCII(news: NewsItem[]): CIIScore[] {
  return MONITORED_COUNTRIES.map(country => {
    let articleCount = 0;
    let highCount = 0;
    let conflictCount = 0;

    for (const article of news) {
      const text = `${article.title} ${article.summary}`.toLowerCase();
      if (country.keywords.some(kw => text.includes(kw))) {
        articleCount++;
        if (article.severity === 'high') highCount++;
        if (article.category === 'conflict') conflictCount++;
      }
    }

    // Components
    const baselineComponent = country.baselineRisk * 0.40;
    const unrestSignal = Math.min(1, conflictCount / 15) * 100 * 0.20;
    const securitySignal = Math.min(1, highCount / 10) * 100 * 0.20;
    const velocitySignal = Math.min(1, articleCount / 30) * 100 * 0.20;

    const rawScore = baselineComponent + unrestSignal + securitySignal + velocitySignal;
    const score = Math.min(100, Math.max(country.conflictFloor, Math.round(rawScore)));

    const level: CIIScore['level'] =
      score >= 75 ? 'critical' :
      score >= 50 ? 'elevated' :
      score >= 30 ? 'watch' : 'stable';

    return { country, score, level, articleCount, highCount, trend: 'stable' as const };
  }).sort((a, b) => b.score - a.score);
}
