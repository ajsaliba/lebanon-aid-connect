/**
 * Infrastructure Cascade Dependency Graph
 * Models subsea cables, pipelines, ports, and chokepoints with interdependencies.
 */

export type CascadeNodeType = 'cable' | 'pipeline' | 'port' | 'chokepoint';

export interface CascadeNode {
  id: string;
  name: string;
  type: CascadeNodeType;
  lat: number;
  lng: number;
  /** Countries affected */
  countries: string[];
  /** Capacity (Tbps for cables, bbl/d for pipelines, TEU for ports) */
  capacity?: number;
  capacityUnit?: string;
}

export interface CascadeLink {
  from: string;
  to: string;
  /** How much of the target depends on the source (0-1) */
  dependencyWeight: number;
}

export interface CascadeImpact {
  node: CascadeNode;
  affectedCountries: string[];
  capacityLoss: number; // percentage 0-100
  cascadeDepth: number;
  affectedNodes: CascadeNode[];
  redundantRoutes: number;
}

export const CASCADE_NODES: CascadeNode[] = [
  // Subsea Cables
  { id: 'seamewe6', name: 'SEA-ME-WE 6', type: 'cable', lat: 26.0, lng: 56.0, countries: ['Egypt', 'Saudi Arabia', 'UAE', 'India', 'Singapore'], capacity: 100, capacityUnit: 'Tbps' },
  { id: 'flag-ea', name: 'FLAG Europe-Asia', type: 'cable', lat: 30.0, lng: 50.0, countries: ['UK', 'Egypt', 'UAE', 'India', 'Japan'], capacity: 10, capacityUnit: 'Tbps' },
  { id: 'eassy', name: 'EASSy', type: 'cable', lat: -10.0, lng: 45.0, countries: ['South Africa', 'Tanzania', 'Kenya', 'Somalia', 'Djibouti'], capacity: 10, capacityUnit: 'Tbps' },
  { id: 'marea', name: 'MAREA', type: 'cable', lat: 38.0, lng: -20.0, countries: ['USA', 'Spain'], capacity: 200, capacityUnit: 'Tbps' },
  { id: 'falcon', name: 'Falcon', type: 'cable', lat: 25.0, lng: 55.0, countries: ['India', 'UAE', 'Iran', 'Iraq', 'Kuwait'], capacity: 5, capacityUnit: 'Tbps' },
  { id: 'ellalink', name: 'EllaLink', type: 'cable', lat: 20.0, lng: -25.0, countries: ['Portugal', 'Brazil'], capacity: 72, capacityUnit: 'Tbps' },
  { id: 'apg', name: 'APG', type: 'cable', lat: 15.0, lng: 110.0, countries: ['China', 'Japan', 'Vietnam', 'Thailand', 'Malaysia'], capacity: 54, capacityUnit: 'Tbps' },
  { id: 'curie', name: 'Curie', type: 'cable', lat: -15.0, lng: -85.0, countries: ['USA', 'Chile'], capacity: 72, capacityUnit: 'Tbps' },
  { id: 'wacs', name: 'WACS', type: 'cable', lat: -5.0, lng: 5.0, countries: ['UK', 'Portugal', 'Nigeria', 'South Africa'], capacity: 14, capacityUnit: 'Tbps' },
  { id: 'sjc', name: 'SJC', type: 'cable', lat: 20.0, lng: 130.0, countries: ['Japan', 'China', 'Singapore'], capacity: 28, capacityUnit: 'Tbps' },
  { id: 'farice', name: 'FARICE', type: 'cable', lat: 62.0, lng: -18.0, countries: ['Iceland', 'UK'], capacity: 5, capacityUnit: 'Tbps' },
  { id: 'faster', name: 'FASTER', type: 'cable', lat: 35.0, lng: 170.0, countries: ['USA', 'Japan'], capacity: 60, capacityUnit: 'Tbps' },
  { id: 'africa2', name: '2Africa', type: 'cable', lat: 5.0, lng: 20.0, countries: ['UK', 'France', 'Egypt', 'Saudi Arabia', 'India', 'South Africa', 'Nigeria'], capacity: 180, capacityUnit: 'Tbps' },
  { id: 'grace-hopper', name: 'Grace Hopper', type: 'cable', lat: 48.0, lng: -25.0, countries: ['USA', 'UK', 'Spain'], capacity: 350, capacityUnit: 'Tbps' },
  { id: 'havfrue', name: 'Havfrue', type: 'cable', lat: 57.0, lng: -5.0, countries: ['USA', 'Denmark', 'Norway', 'Ireland'], capacity: 108, capacityUnit: 'Tbps' },
  { id: 'indigo', name: 'Indigo', type: 'cable', lat: -25.0, lng: 110.0, countries: ['Singapore', 'Indonesia', 'Australia'], capacity: 36, capacityUnit: 'Tbps' },
  { id: 'sam1', name: 'SAm-1', type: 'cable', lat: -10.0, lng: -40.0, countries: ['USA', 'Brazil', 'Argentina'], capacity: 2, capacityUnit: 'Tbps' },
  { id: 'southern-cross', name: 'Southern Cross', type: 'cable', lat: -30.0, lng: 175.0, countries: ['Australia', 'New Zealand', 'USA'], capacity: 20, capacityUnit: 'Tbps' },

  // Pipelines (major)
  { id: 'sumed', name: 'SUMED Pipeline', type: 'pipeline', lat: 30.0, lng: 32.0, countries: ['Egypt', 'Saudi Arabia'], capacity: 2.5, capacityUnit: 'M bbl/d' },
  { id: 'bte', name: 'BTE Pipeline', type: 'pipeline', lat: 40.0, lng: 42.0, countries: ['Azerbaijan', 'Georgia', 'Turkey'], capacity: 1, capacityUnit: 'M bbl/d' },
  { id: 'east-med', name: 'East-Med Gas', type: 'pipeline', lat: 34.0, lng: 33.0, countries: ['Israel', 'Cyprus', 'Greece'], capacity: 10, capacityUnit: 'bcm/yr' },
  { id: 'nordstream', name: 'Nord Stream', type: 'pipeline', lat: 55.0, lng: 15.0, countries: ['Russia', 'Germany'], capacity: 55, capacityUnit: 'bcm/yr' },
  { id: 'turkstream', name: 'TurkStream', type: 'pipeline', lat: 43.0, lng: 32.0, countries: ['Russia', 'Turkey'], capacity: 31, capacityUnit: 'bcm/yr' },

  // Ports
  { id: 'jebel-ali', name: 'Jebel Ali', type: 'port', lat: 25.0, lng: 55.0, countries: ['UAE'], capacity: 23, capacityUnit: 'M TEU' },
  { id: 'jeddah', name: 'Jeddah Islamic Port', type: 'port', lat: 21.5, lng: 39.2, countries: ['Saudi Arabia'], capacity: 6, capacityUnit: 'M TEU' },
  { id: 'port-said', name: 'Port Said', type: 'port', lat: 31.3, lng: 32.3, countries: ['Egypt'], capacity: 4, capacityUnit: 'M TEU' },
  { id: 'piraeus', name: 'Piraeus', type: 'port', lat: 37.9, lng: 23.6, countries: ['Greece'], capacity: 5, capacityUnit: 'M TEU' },
  { id: 'haifa-port', name: 'Haifa Port', type: 'port', lat: 32.8, lng: 35.0, countries: ['Israel'], capacity: 1.5, capacityUnit: 'M TEU' },
  { id: 'beirut-port', name: 'Beirut Port', type: 'port', lat: 33.9, lng: 35.5, countries: ['Lebanon'], capacity: 1.2, capacityUnit: 'M TEU' },

  // Chokepoints
  { id: 'suez', name: 'Suez Canal', type: 'chokepoint', lat: 30.5, lng: 32.3, countries: ['Egypt'], capacity: 12, capacityUnit: '% global trade' },
  { id: 'hormuz', name: 'Strait of Hormuz', type: 'chokepoint', lat: 26.5, lng: 56.3, countries: ['Iran', 'Oman', 'UAE'], capacity: 21, capacityUnit: '% global oil' },
  { id: 'bab-al-mandab', name: 'Bab al-Mandab', type: 'chokepoint', lat: 12.5, lng: 43.3, countries: ['Yemen', 'Djibouti', 'Eritrea'], capacity: 9, capacityUnit: '% global oil' },
  { id: 'bosphorus', name: 'Bosphorus Strait', type: 'chokepoint', lat: 41.1, lng: 29.0, countries: ['Turkey'], capacity: 3, capacityUnit: '% global oil' },
  { id: 'gibraltar', name: 'Strait of Gibraltar', type: 'chokepoint', lat: 35.9, lng: -5.6, countries: ['Spain', 'Morocco'], capacity: 5, capacityUnit: '% global trade' },
  { id: 'malacca', name: 'Strait of Malacca', type: 'chokepoint', lat: 2.5, lng: 101.0, countries: ['Malaysia', 'Indonesia', 'Singapore'], capacity: 25, capacityUnit: '% global trade' },
];

export const CASCADE_LINKS: CascadeLink[] = [
  // Suez disruption affects multiple cables and trade
  { from: 'suez', to: 'seamewe6', dependencyWeight: 0.8 },
  { from: 'suez', to: 'flag-ea', dependencyWeight: 0.9 },
  { from: 'suez', to: 'africa2', dependencyWeight: 0.5 },
  { from: 'suez', to: 'port-said', dependencyWeight: 1.0 },
  // Hormuz affects Gulf oil
  { from: 'hormuz', to: 'sumed', dependencyWeight: 0.6 },
  { from: 'hormuz', to: 'jebel-ali', dependencyWeight: 0.9 },
  { from: 'hormuz', to: 'falcon', dependencyWeight: 0.7 },
  // Bab al-Mandab affects Red Sea shipping
  { from: 'bab-al-mandab', to: 'suez', dependencyWeight: 0.7 },
  { from: 'bab-al-mandab', to: 'jeddah', dependencyWeight: 0.8 },
  { from: 'bab-al-mandab', to: 'eassy', dependencyWeight: 0.5 },
  // Cable dependencies
  { from: 'seamewe6', to: 'falcon', dependencyWeight: 0.3 },
  { from: 'flag-ea', to: 'seamewe6', dependencyWeight: 0.2 },
  // Port dependencies
  { from: 'beirut-port', to: 'east-med', dependencyWeight: 0.3 },
  { from: 'haifa-port', to: 'east-med', dependencyWeight: 0.5 },
];

export const CASCADE_TYPE_CONFIG: Record<CascadeNodeType, { icon: string; label: string; color: string }> = {
  cable:      { icon: '🔌', label: 'Cables',      color: 'text-info' },
  pipeline:   { icon: '🛢️', label: 'Pipelines',   color: 'text-warning' },
  port:       { icon: '⚓', label: 'Ports',        color: 'text-success' },
  chokepoint: { icon: '🚢', label: 'Chokepoints', color: 'text-danger' },
};

/**
 * Simulate cascade impact of a node failure.
 * BFS through the dependency graph to find all affected nodes.
 */
export function simulateCascade(failedNodeId: string): CascadeImpact | null {
  const node = CASCADE_NODES.find(n => n.id === failedNodeId);
  if (!node) return null;

  const visited = new Set<string>([failedNodeId]);
  const queue: Array<{ id: string; depth: number; weight: number }> = [{ id: failedNodeId, depth: 0, weight: 1 }];
  const affectedNodes: CascadeNode[] = [];
  const allCountries = new Set(node.countries);
  let maxDepth = 0;
  let totalLoss = 0;

  while (queue.length > 0) {
    const current = queue.shift()!;
    const links = CASCADE_LINKS.filter(l => l.from === current.id);

    for (const link of links) {
      if (visited.has(link.to)) continue;
      visited.add(link.to);

      const targetNode = CASCADE_NODES.find(n => n.id === link.to);
      if (!targetNode) continue;

      affectedNodes.push(targetNode);
      targetNode.countries.forEach(c => allCountries.add(c));
      maxDepth = Math.max(maxDepth, current.depth + 1);
      totalLoss += link.dependencyWeight * current.weight * 100;

      queue.push({ id: link.to, depth: current.depth + 1, weight: current.weight * link.dependencyWeight });
    }
  }

  // Count redundant routes (nodes with multiple incoming links)
  const redundantRoutes = affectedNodes.filter(n =>
    CASCADE_LINKS.filter(l => l.to === n.id).length > 1
  ).length;

  return {
    node,
    affectedCountries: [...allCountries],
    capacityLoss: Math.min(100, Math.round(totalLoss / Math.max(1, affectedNodes.length))),
    cascadeDepth: maxDepth,
    affectedNodes,
    redundantRoutes,
  };
}
