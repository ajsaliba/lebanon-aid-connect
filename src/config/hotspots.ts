import { type NewsItem } from '@/data/mockData';

/**
 * Intel Hotspots — named conflict zones with keyword arrays.
 * Inspired by World Monitor's escalation scoring approach.
 * Each hotspot has a center, radius, keywords, and a dynamically computed escalation score.
 */

export interface Hotspot {
  id: string;
  name: string;
  lat: number;
  lng: number;
  /** Map display radius in km */
  radiusKm: number;
  /** Keywords that associate an article with this hotspot */
  keywords: string[];
}

export const HOTSPOTS: Hotspot[] = [
  {
    id: 'lebanon',
    name: 'Lebanon',
    lat: 33.8547,
    lng: 35.8623,
    radiusKm: 80,
    keywords: ['lebanon', 'lebanese', 'beirut', 'hezbollah', 'sidon', 'tyre', 'baalbek', 'nabatieh', 'dahiyeh', 'jounieh', 'tripoli', 'bekaa', 'zahle', 'lbci', 'mtv lebanon', 'naharnet', 'لبنان', 'حزب الله'],
  },
  {
    id: 'gaza',
    name: 'Gaza',
    lat: 31.5017,
    lng: 34.4668,
    radiusKm: 40,
    keywords: ['gaza', 'hamas', 'rafah', 'khan younis', 'palestinian', 'palestine', 'غزة', 'فلسطين', 'حماس'],
  },
  {
    id: 'israel',
    name: 'Israel',
    lat: 31.7683,
    lng: 35.2137,
    radiusKm: 60,
    keywords: ['israel', 'israeli', 'idf', 'tel aviv', 'jerusalem', 'haifa', 'netanyahu', 'west bank', 'nablus'],
  },
  {
    id: 'syria',
    name: 'Syria',
    lat: 34.8021,
    lng: 38.9968,
    radiusKm: 120,
    keywords: ['syria', 'syrian', 'damascus', 'aleppo', 'idlib', 'homs', 'deir ez-zor', 'assad', 'سوريا'],
  },
  {
    id: 'iran',
    name: 'Iran',
    lat: 32.4279,
    lng: 53.6880,
    radiusKm: 200,
    keywords: ['iran', 'iranian', 'tehran', 'isfahan', 'irgc', 'khamenei', 'tabriz', 'shiraz', 'mashhad', 'إيران'],
  },
  {
    id: 'yemen',
    name: 'Yemen',
    lat: 15.5527,
    lng: 48.5164,
    radiusKm: 150,
    keywords: ['yemen', 'yemeni', 'sanaa', 'houthi', 'hodeidah', 'aden', 'marib', 'اليمن'],
  },
  {
    id: 'iraq',
    name: 'Iraq',
    lat: 33.2232,
    lng: 43.6793,
    radiusKm: 150,
    keywords: ['iraq', 'iraqi', 'baghdad', 'basra', 'mosul', 'erbil', 'kirkuk'],
  },
];

export interface HotspotScore {
  hotspot: Hotspot;
  /** Number of articles mentioning this hotspot */
  articleCount: number;
  /** Number of high-severity articles */
  highCount: number;
  /** 0-1 normalized escalation score */
  score: number;
  /** Label: calm | elevated | critical */
  level: 'calm' | 'elevated' | 'critical';
}

/**
 * Compute escalation scores for all hotspots based on current news.
 * Score = weighted sum of article counts (high severity articles count 3x).
 * Normalized to 0-1 range using a soft cap (tanh-like).
 */
export function computeHotspotScores(news: NewsItem[]): HotspotScore[] {
  return HOTSPOTS.map(hotspot => {
    let articleCount = 0;
    let highCount = 0;

    for (const article of news) {
      const text = `${article.title} ${article.summary}`.toLowerCase();
      const matches = hotspot.keywords.some(kw => text.includes(kw));
      if (matches) {
        articleCount++;
        if (article.severity === 'high') highCount++;
      }
    }

    // Weighted raw score: high-severity articles count 3x
    const raw = articleCount + highCount * 2;
    // Soft cap using 1 - e^(-x/k) where k controls saturation speed
    const score = Math.min(1, 1 - Math.exp(-raw / 30));

    const level: HotspotScore['level'] =
      score >= 0.6 ? 'critical' :
      score >= 0.25 ? 'elevated' :
      'calm';

    return { hotspot, articleCount, highCount, score, level };
  });
}
