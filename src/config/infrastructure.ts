/**
 * Infrastructure Status Layer — monitors power, telecom, and internet
 * in conflict zones across the Middle East.
 */

export type InfraType = 'power' | 'telecom' | 'internet';
export type InfraStatus = 'operational' | 'degraded' | 'disrupted' | 'offline';

export interface InfraNode {
  id: string;
  name: string;
  type: InfraType;
  lat: number;
  lng: number;
  region: string;
  /** Keywords in news articles that indicate disruption to this node */
  disruptionKeywords: string[];
}

export interface InfraStatusResult {
  node: InfraNode;
  status: InfraStatus;
  /** 0-1 disruption score based on recent articles */
  disruption: number;
  articleCount: number;
}

/**
 * Known infrastructure nodes across conflict zones.
 * Positions approximate key infrastructure hubs.
 */
export const INFRA_NODES: InfraNode[] = [
  // Lebanon
  { id: 'lb-power-beirut', name: 'Beirut Power Grid', type: 'power', lat: 33.89, lng: 35.50, region: 'Lebanon', disruptionKeywords: ['power outage beirut', 'electricity beirut', 'blackout beirut', 'edl', 'electricité du liban'] },
  { id: 'lb-power-south', name: 'South Lebanon Grid', type: 'power', lat: 33.27, lng: 35.20, region: 'Lebanon', disruptionKeywords: ['power outage south lebanon', 'electricity tyre', 'blackout sidon', 'power nabatieh'] },
  { id: 'lb-telecom-beirut', name: 'Beirut Telecom Hub', type: 'telecom', lat: 33.88, lng: 35.51, region: 'Lebanon', disruptionKeywords: ['telecom beirut', 'phone network beirut', 'ogero', 'touch', 'alfa network'] },
  { id: 'lb-internet-main', name: 'Lebanon Internet', type: 'internet', lat: 33.90, lng: 35.48, region: 'Lebanon', disruptionKeywords: ['internet outage lebanon', 'internet down beirut', 'connectivity lebanon'] },

  // Gaza
  { id: 'gz-power-main', name: 'Gaza Power Plant', type: 'power', lat: 31.35, lng: 34.37, region: 'Gaza', disruptionKeywords: ['gaza power plant', 'electricity gaza', 'blackout gaza', 'power outage gaza'] },
  { id: 'gz-telecom', name: 'Gaza Telecom', type: 'telecom', lat: 31.50, lng: 34.47, region: 'Gaza', disruptionKeywords: ['telecom gaza', 'phone network gaza', 'paltel', 'jawwal'] },
  { id: 'gz-internet', name: 'Gaza Internet', type: 'internet', lat: 31.42, lng: 34.40, region: 'Gaza', disruptionKeywords: ['internet gaza', 'connectivity gaza', 'communications blackout gaza'] },

  // Syria
  { id: 'sy-power-damascus', name: 'Damascus Power', type: 'power', lat: 33.51, lng: 36.28, region: 'Syria', disruptionKeywords: ['power damascus', 'electricity syria', 'blackout damascus'] },
  { id: 'sy-power-aleppo', name: 'Aleppo Power', type: 'power', lat: 36.20, lng: 37.13, region: 'Syria', disruptionKeywords: ['power aleppo', 'electricity aleppo', 'blackout aleppo'] },
  { id: 'sy-internet', name: 'Syria Internet', type: 'internet', lat: 34.80, lng: 38.00, region: 'Syria', disruptionKeywords: ['internet syria', 'connectivity syria', 'internet shutdown syria'] },

  // Yemen
  { id: 'ye-power-sanaa', name: 'Sanaa Power', type: 'power', lat: 15.37, lng: 44.19, region: 'Yemen', disruptionKeywords: ['power sanaa', 'electricity sanaa', 'blackout yemen'] },
  { id: 'ye-telecom', name: 'Yemen Telecom', type: 'telecom', lat: 15.35, lng: 44.21, region: 'Yemen', disruptionKeywords: ['telecom yemen', 'phone network yemen', 'yemennet'] },
  { id: 'ye-internet', name: 'Yemen Internet', type: 'internet', lat: 14.80, lng: 42.95, region: 'Yemen', disruptionKeywords: ['internet yemen', 'submarine cable yemen', 'hodeidah cable'] },

  // Iraq
  { id: 'iq-power-baghdad', name: 'Baghdad Power', type: 'power', lat: 33.32, lng: 44.37, region: 'Iraq', disruptionKeywords: ['power baghdad', 'electricity iraq', 'blackout baghdad'] },
  { id: 'iq-telecom', name: 'Iraq Telecom', type: 'telecom', lat: 33.30, lng: 44.40, region: 'Iraq', disruptionKeywords: ['telecom iraq', 'phone network iraq'] },

  // Iran
  { id: 'ir-internet', name: 'Iran Internet', type: 'internet', lat: 35.69, lng: 51.39, region: 'Iran', disruptionKeywords: ['internet iran', 'internet shutdown iran', 'iran internet throttle', 'starlink iran'] },
  { id: 'ir-power-isfahan', name: 'Isfahan Power', type: 'power', lat: 32.65, lng: 51.67, region: 'Iran', disruptionKeywords: ['power isfahan', 'electricity iran', 'nuclear power iran'] },
];

/**
 * Compute infrastructure status based on news mentions.
 * More disruption keywords in recent articles = worse status.
 */
export function computeInfraStatus(
  nodes: InfraNode[],
  news: Array<{ title: string; summary: string }>
): InfraStatusResult[] {
  return nodes.map(node => {
    let articleCount = 0;

    for (const article of news) {
      const text = `${article.title} ${article.summary}`.toLowerCase();
      if (node.disruptionKeywords.some(kw => text.includes(kw))) {
        articleCount++;
      }
    }

    // Soft cap disruption score
    const disruption = Math.min(1, 1 - Math.exp(-articleCount / 5));

    const status: InfraStatus =
      disruption >= 0.7 ? 'offline' :
      disruption >= 0.4 ? 'disrupted' :
      disruption >= 0.15 ? 'degraded' :
      'operational';

    return { node, status, disruption, articleCount };
  });
}

export const INFRA_TYPE_CONFIG: Record<InfraType, { icon: string; label: string }> = {
  power:   { icon: '⚡', label: 'Power' },
  telecom: { icon: '📡', label: 'Telecom' },
  internet: { icon: '🌐', label: 'Internet' },
};

export const INFRA_STATUS_CONFIG: Record<InfraStatus, { color: string; label: string }> = {
  operational: { color: '#22c55e', label: 'Operational' },
  degraded:    { color: '#f59e0b', label: 'Degraded' },
  disrupted:   { color: '#ef4444', label: 'Disrupted' },
  offline:     { color: '#6b7280', label: 'Offline' },
};
