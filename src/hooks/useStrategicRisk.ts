/**
 * Strategic Risk Overview — composite 0-100 score blending:
 * - 50% Country Instability (top 5 weighted)
 * - 30% Geographic convergence zones
 * - 20% Infrastructure incidents
 * Auto-refreshes with news changes.
 */

import { useMemo, useRef, useState, useEffect } from 'react';
import { type NewsItem } from '@/data/mockData';
import { computeCII, type CIIScore } from '@/config/countryInstability';
import { computeInfraStatus, INFRA_NODES } from '@/config/infrastructure';
import { useIntelSignals } from '@/hooks/useIntelSignals';

export type RiskTrend = 'escalating' | 'stable' | 'de-escalating';

export interface StrategicAlert {
  id: string;
  icon: string;
  color: string;
  title: string;
  detail: string;
  timestamp: string;
}

export interface StrategicRiskData {
  score: number;
  level: 'low' | 'guarded' | 'elevated' | 'high' | 'severe';
  trend: RiskTrend;
  convergenceCount: number;
  ciiDeviation: number;
  infraEvents: number;
  highAlerts: number;
  alerts: StrategicAlert[];
  lastUpdated: Date;
}

const RISK_LEVELS: Array<{ max: number; level: StrategicRiskData['level']; label: string }> = [
  { max: 20, level: 'low', label: 'Low' },
  { max: 40, level: 'guarded', label: 'Guarded' },
  { max: 60, level: 'elevated', label: 'Elevated' },
  { max: 80, level: 'high', label: 'High' },
  { max: 101, level: 'severe', label: 'Severe' },
];

export const RISK_LEVEL_CONFIG: Record<StrategicRiskData['level'], { label: string; color: string; bg: string }> = {
  low: { label: 'Low', color: 'text-success', bg: 'bg-success/20' },
  guarded: { label: 'Guarded', color: 'text-info', bg: 'bg-info/20' },
  elevated: { label: 'Elevated', color: 'text-warning', bg: 'bg-warning/20' },
  high: { label: 'High', color: 'text-[#f97316]', bg: 'bg-warning/30' },
  severe: { label: 'Severe', color: 'text-danger', bg: 'bg-danger/20' },
};

export function useStrategicRisk(news: NewsItem[]): StrategicRiskData {
  const signals = useIntelSignals(news);
  const prevScoreRef = useRef(0);
  const [alerts, setAlerts] = useState<StrategicAlert[]>([]);
  const prevCIIRef = useRef<Map<string, number>>(new Map());

  return useMemo(() => {
    const ciiScores = computeCII(news);
    const infraResults = computeInfraStatus(INFRA_NODES, news);

    // 1. CII component (50%) — weighted average of top 5
    const top5 = ciiScores.slice(0, 5);
    const weights = [0.3, 0.25, 0.2, 0.15, 0.1];
    const ciiComponent = top5.reduce((sum, s, i) => sum + s.score * (weights[i] || 0.1), 0);

    // CII deviation from baseline
    const ciiDeviation = top5.length > 0
      ? Math.round(top5.reduce((sum, s) => sum + Math.abs(s.score - s.country.baselineRisk), 0) / top5.length)
      : 0;

    // 2. Convergence component (30%)
    const convergenceSignals = signals.filter(s => s.type === 'convergence' || s.type === 'geographic_convergence');
    const convergenceComponent = Math.min(100, convergenceSignals.length * 20);

    // 3. Infrastructure component (20%)
    const infraEvents = infraResults.filter(r => r.status === 'disrupted' || r.status === 'offline').length;
    const infraComponent = Math.min(100, infraEvents * 25);

    const rawScore = ciiComponent * 0.5 + convergenceComponent * 0.3 + infraComponent * 0.2;
    const score = Math.min(100, Math.max(0, Math.round(rawScore)));

    const level = RISK_LEVELS.find(l => score < l.max)?.level || 'severe';
    const highAlerts = ciiScores.filter(s => s.level === 'critical').length;

    // Trend detection
    let trend: RiskTrend = 'stable';
    if (prevScoreRef.current > 0) {
      const diff = score - prevScoreRef.current;
      if (diff > 3) trend = 'escalating';
      else if (diff < -3) trend = 'de-escalating';
    }
    prevScoreRef.current = score;

    // Generate CII change alerts
    const newAlerts: StrategicAlert[] = [];
    for (const cii of ciiScores) {
      const prev = prevCIIRef.current.get(cii.country.id);
      if (prev !== undefined) {
        const diff = cii.score - prev;
        if (Math.abs(diff) >= 5) {
          const colorEmoji = cii.level === 'critical' ? '🔴' : cii.level === 'elevated' ? '🟠' : cii.level === 'watch' ? '🟡' : '🟢';
          newAlerts.push({
            id: `cii-${cii.country.id}-${Date.now()}`,
            icon: '📊',
            color: cii.level === 'critical' ? 'text-danger' : cii.level === 'elevated' ? 'text-[#f97316]' : 'text-warning',
            title: `${colorEmoji} ${cii.country.name} Instability ${diff > 0 ? 'Rising' : 'Falling'}`,
            detail: `Instability index ${diff > 0 ? 'rose' : 'fell'} from ${prev} to ${cii.score} (${diff > 0 ? '+' : ''}${diff})`,
            timestamp: new Date().toISOString(),
          });
        }
      }
      prevCIIRef.current.set(cii.country.id, cii.score);
    }

    return {
      score, level, trend,
      convergenceCount: convergenceSignals.length,
      ciiDeviation,
      infraEvents,
      highAlerts,
      alerts: [...newAlerts, ...alerts].slice(0, 20),
      lastUpdated: new Date(),
    };
  }, [news, signals, alerts]);
}
