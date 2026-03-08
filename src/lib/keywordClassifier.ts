/**
 * Stage 1: Instant keyword-based threat classifier.
 * Runs synchronously on the client — zero API calls, zero latency.
 * Follows World Monitor's 3-stage pipeline: keyword → (browser ML) → LLM.
 */

import { type ThreatClassification } from '@/hooks/useThreatClassification';

interface KeywordRule {
  keywords: string[];
  category: ThreatClassification['primary_category'];
  threat_level: ThreatClassification['threat_level'];
  tags: string[];
  weight: number; // higher = more confident match
}

const RULES: KeywordRule[] = [
  // Military / Conflict
  { keywords: ['airstrike', 'airstrikes', 'bombing', 'bombardment', 'missile', 'missiles', 'rocket', 'rockets', 'drone strike', 'drone attack'], category: 'military', threat_level: 'critical', tags: ['airstrike', 'military-action'], weight: 3 },
  { keywords: ['invasion', 'ground offensive', 'troops deployed', 'military operation', 'incursion'], category: 'military', threat_level: 'critical', tags: ['ground-operation', 'deployment'], weight: 3 },
  { keywords: ['shelling', 'artillery', 'mortar', 'tank fire', 'rpg'], category: 'military', threat_level: 'high', tags: ['shelling', 'artillery'], weight: 2 },
  { keywords: ['ceasefire', 'truce', 'armistice', 'peace talks', 'negotiation', 'de-escalation'], category: 'military', threat_level: 'medium', tags: ['ceasefire', 'diplomacy'], weight: 2 },
  { keywords: ['military base', 'military buildup', 'naval fleet', 'aircraft carrier', 'fighter jets'], category: 'military', threat_level: 'high', tags: ['military-posture'], weight: 2 },

  // Nuclear
  { keywords: ['nuclear', 'uranium enrichment', 'centrifuge', 'nuclear warhead', 'atomic', 'radioactive', 'iaea'], category: 'nuclear', threat_level: 'critical', tags: ['nuclear', 'proliferation'], weight: 4 },

  // Terrorism
  { keywords: ['terrorist attack', 'suicide bomb', 'car bomb', 'ied', 'hostage', 'kidnapping', 'beheading'], category: 'terrorism', threat_level: 'critical', tags: ['terrorism', 'attack'], weight: 4 },
  { keywords: ['hezbollah', 'hamas', 'isis', 'isil', 'al-qaeda', 'al qaeda', 'houthi', 'militia'], category: 'terrorism', threat_level: 'high', tags: ['armed-group'], weight: 1 },

  // Humanitarian
  { keywords: ['refugee', 'refugees', 'displaced', 'displacement', 'idp', 'humanitarian crisis', 'famine', 'starvation'], category: 'humanitarian', threat_level: 'high', tags: ['displacement', 'crisis'], weight: 2 },
  { keywords: ['aid delivery', 'humanitarian corridor', 'food aid', 'medical aid', 'rescue', 'evacuation'], category: 'humanitarian', threat_level: 'medium', tags: ['aid', 'relief'], weight: 2 },
  { keywords: ['hospital attacked', 'hospital damaged', 'civilian casualties', 'mass casualty', 'war crime'], category: 'humanitarian', threat_level: 'critical', tags: ['civilian-harm', 'war-crime'], weight: 3 },

  // Political
  { keywords: ['sanctions', 'embargo', 'diplomatic', 'un resolution', 'security council', 'summit', 'treaty'], category: 'political', threat_level: 'medium', tags: ['diplomacy', 'sanctions'], weight: 1 },
  { keywords: ['coup', 'regime change', 'protest', 'uprising', 'revolution', 'martial law', 'state of emergency'], category: 'political', threat_level: 'high', tags: ['instability', 'unrest'], weight: 2 },
  { keywords: ['election', 'referendum', 'parliament', 'legislation', 'government formation'], category: 'political', threat_level: 'low', tags: ['governance'], weight: 1 },

  // Economic
  { keywords: ['oil price', 'energy crisis', 'gas pipeline', 'trade war', 'economic collapse', 'currency crash', 'hyperinflation'], category: 'economic', threat_level: 'high', tags: ['economic-crisis'], weight: 2 },
  { keywords: ['trade deal', 'economic agreement', 'investment', 'gdp', 'market'], category: 'economic', threat_level: 'info', tags: ['economy'], weight: 1 },

  // Cyber
  { keywords: ['cyberattack', 'cyber attack', 'hack', 'hacked', 'data breach', 'ransomware', 'malware', 'ddos'], category: 'cyber', threat_level: 'high', tags: ['cyber-attack'], weight: 2 },
  { keywords: ['apt', 'state-sponsored hack', 'espionage', 'cyber espionage', 'zero-day', 'vulnerability'], category: 'cyber', threat_level: 'high', tags: ['cyber-espionage'], weight: 2 },
];

export function classifyByKeywords(
  title: string,
  summary: string
): ThreatClassification | null {
  const text = `${title} ${summary}`.toLowerCase();

  let bestMatch: { rule: KeywordRule; matchCount: number } | null = null;

  for (const rule of RULES) {
    let matchCount = 0;
    for (const kw of rule.keywords) {
      if (text.includes(kw)) matchCount++;
    }
    if (matchCount > 0) {
      const score = matchCount * rule.weight;
      if (!bestMatch || score > bestMatch.matchCount * bestMatch.rule.weight) {
        bestMatch = { rule, matchCount };
      }
    }
  }

  if (!bestMatch) return null;

  const { rule, matchCount } = bestMatch;
  // Confidence: more keyword hits = higher confidence, but cap at 0.75 (keyword-only)
  const confidence = Math.min(0.75, 0.3 + matchCount * 0.15);

  return {
    index: 0,
    primary_category: rule.category,
    confidence,
    threat_level: rule.threat_level,
    tags: rule.tags,
  };
}
