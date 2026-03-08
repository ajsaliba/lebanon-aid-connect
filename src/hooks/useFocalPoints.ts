/**
 * AI Focal Points — entity correlation engine.
 * Links news mentions of countries/orgs with map signals (military, protests, outages)
 * to produce CRITICAL/ELEVATED/WATCH badges with counts.
 */

import { useMemo } from 'react';
import { type NewsItem } from '@/data/mockData';
import { MONITORED_COUNTRIES } from '@/config/countryInstability';
import { computeInfraStatus, INFRA_NODES } from '@/config/infrastructure';
import { HOTSPOTS, computeHotspotScores } from '@/config/hotspots';
import { sanitizeFeedText } from '@/lib/sanitizeFeedText';

export type FocalLevel = 'critical' | 'elevated' | 'watch' | 'monitoring';

export interface FocalPoint {
  id: string;
  name: string;
  level: FocalLevel;
  newsCount: number;
  signalCount: number;
  topHeadline?: { title: string; url?: string };
  /** Countries or org names that converge here */
  entities: string[];
}

export const FOCAL_LEVEL_CONFIG: Record<FocalLevel, { label: string; color: string; bg: string }> = {
  critical:   { label: 'CRITICAL',   color: 'text-danger',    bg: 'bg-danger/20' },
  elevated:   { label: 'ELEVATED',   color: 'text-[#f97316]', bg: 'bg-warning/30' },
  watch:      { label: 'WATCH',      color: 'text-warning',   bg: 'bg-warning/20' },
  monitoring: { label: 'MONITORING', color: 'text-info',      bg: 'bg-info/20' },
};

export function useFocalPoints(news: NewsItem[]): FocalPoint[] {
  return useMemo(() => {
    const hotspotScores = computeHotspotScores(news);
    const infraStatus = computeInfraStatus(INFRA_NODES, news);
    const points: FocalPoint[] = [];

    for (const country of MONITORED_COUNTRIES) {
      // Count matching news
      const matching = news.filter(n => {
        const text = `${sanitizeFeedText(n.title)} ${sanitizeFeedText(n.summary)}`.toLowerCase();
        return country.keywords.some(kw => text.includes(kw));
      });

      if (matching.length === 0) continue;

      // Count signals from hotspots, infrastructure, high-severity
      let signalCount = 0;
      const entities: string[] = [];

      // Hotspot signals
      for (const hs of hotspotScores) {
        if (hs.hotspot.keywords.some(k => country.keywords.some(ck => k.includes(ck) || ck.includes(k)))) {
          signalCount += hs.score;
          entities.push(hs.hotspot.name);
        }
      }

      // Infrastructure signals
      for (const infra of infraStatus) {
        if (infra.node.region.toLowerCase().includes(country.name.toLowerCase()) && infra.status !== 'operational') {
          signalCount += infra.status === 'offline' ? 30 : infra.status === 'disrupted' ? 20 : 10;
          entities.push(infra.node.name);
        }
      }

      // High severity article boost
      const highSeverity = matching.filter(m => m.severity === 'high').length;
      signalCount += highSeverity * 5;

      // Determine level
      const total = matching.length + signalCount;
      const level: FocalLevel =
        total >= 100 ? 'critical' :
        total >= 50  ? 'elevated' :
        total >= 20  ? 'watch' :
        'monitoring';

      const topArticle = matching.sort((a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      )[0];

      points.push({
        id: country.id,
        name: country.name,
        level,
        newsCount: matching.length,
        signalCount: Math.round(signalCount),
        topHeadline: topArticle ? {
          title: sanitizeFeedText(topArticle.title).slice(0, 80),
          url: topArticle.url !== '#' ? topArticle.url : undefined,
        } : undefined,
        entities: [...new Set(entities)].slice(0, 3),
      });
    }

    return points
      .filter(p => p.newsCount >= 2 || p.signalCount >= 10)
      .sort((a, b) => {
        const levelOrder = { critical: 0, elevated: 1, watch: 2, monitoring: 3 };
        if (levelOrder[a.level] !== levelOrder[b.level]) return levelOrder[a.level] - levelOrder[b.level];
        return (b.newsCount + b.signalCount) - (a.newsCount + a.signalCount);
      })
      .slice(0, 10);
  }, [news]);
}
