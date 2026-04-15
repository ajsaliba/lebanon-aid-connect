import { useState, useMemo } from 'react';
import { useChokepoints, useSubseaCables } from '@/services/infrastructureService';
import { FeedHealthBadge } from '@/components/FeedHealthBadge';
import type { ChokepointStatus, SubseaCable } from '@/services/types';
import {
  Zap, Wifi, Search, Anchor, Cable,
  CheckCircle2, AlertTriangle, XCircle, Radio
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTranslation, t as translate } from '@/lib/i18n';

type ChokepointStatusValue = ChokepointStatus['status'];

const statusColors: Record<ChokepointStatusValue, string> = {
  normal: 'text-success',
  elevated: 'text-warning',
  disrupted: 'text-danger',
  blocked: 'text-danger',
};

const statusIcons: Record<ChokepointStatusValue, typeof CheckCircle2> = {
  normal: CheckCircle2,
  elevated: AlertTriangle,
  disrupted: XCircle,
  blocked: XCircle,
};

const cableStatusColors: Record<SubseaCable['status'], string> = {
  active: 'text-success',
  planned: 'text-info',
  fault: 'text-danger',
  decommissioned: 'text-muted-foreground',
};

export function InfraStatusPanel() {
  const { t } = useTranslation();
  const { data: chokepoints = [], isLoading: loadingCp } = useChokepoints();
  const { data: cables = [], isLoading: loadingCables } = useSubseaCables();
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'chokepoints' | 'cables'>('chokepoints');

  const isLoading = loadingCp || loadingCables;

  if (isLoading) return <div className="border border-border rounded-lg p-4 text-center text-[9px] text-muted-foreground">Loading...</div>;

  const filteredChokepoints = useMemo(() => {
    if (!search) return chokepoints;
    const q = search.toLowerCase();
    return chokepoints.filter(cp => cp.name.toLowerCase().includes(q) || cp.region.toLowerCase().includes(q));
  }, [chokepoints, search]);

  const filteredCables = useMemo(() => {
    if (!search) return cables;
    const q = search.toLowerCase();
    return cables.filter(c => c.name.toLowerCase().includes(q) || c.owner.toLowerCase().includes(q));
  }, [cables, search]);

  // Summary
  const cpSummary = useMemo(() => {
    const normal = chokepoints.filter(c => c.status === 'normal').length;
    const elevated = chokepoints.filter(c => c.status === 'elevated').length;
    const disrupted = chokepoints.filter(c => c.status === 'disrupted' || c.status === 'blocked').length;
    return { normal, elevated, disrupted, total: chokepoints.length };
  }, [chokepoints]);

  return (
    <div className="p-3 space-y-3">
      <h2 className="text-xs font-sans font-bold uppercase tracking-wider text-primary flex items-center gap-2">
        <Zap className="h-3 w-3" /> {t('infra.title')}
        <FeedHealthBadge feedName="chokepoints" />
      </h2>

      {/* Overview Grid */}
      <div className="grid grid-cols-3 gap-1">
        <button
          onClick={() => setView('chokepoints')}
          className={cn(
            'rounded p-1.5 text-center border transition-colors',
            view === 'chokepoints' ? 'border-primary/30 bg-primary/10' : 'border-border hover:bg-muted/50'
          )}
        >
          <Anchor className="h-3 w-3 mx-auto mb-0.5 text-primary" />
          <div className="text-[8px] text-muted-foreground">Chokepoints</div>
          <div className="flex justify-center gap-0.5 mt-0.5">
            {cpSummary.normal > 0 && <span className="h-1 w-1 rounded-full bg-success" />}
            {cpSummary.elevated > 0 && <span className="h-1 w-1 rounded-full bg-warning" />}
            {cpSummary.disrupted > 0 && <span className="h-1 w-1 rounded-full bg-danger" />}
          </div>
        </button>
        <button
          onClick={() => setView('cables')}
          className={cn(
            'rounded p-1.5 text-center border transition-colors',
            view === 'cables' ? 'border-primary/30 bg-primary/10' : 'border-border hover:bg-muted/50'
          )}
        >
          <Cable className="h-3 w-3 mx-auto mb-0.5 text-info" />
          <div className="text-[8px] text-muted-foreground">Subsea Cables</div>
          <div className="flex justify-center gap-0.5 mt-0.5">
            {cables.some(c => c.status === 'active') && <span className="h-1 w-1 rounded-full bg-success" />}
            {cables.some(c => c.status === 'fault') && <span className="h-1 w-1 rounded-full bg-danger" />}
          </div>
        </button>
        <div className="rounded p-1.5 text-center border border-border">
          <div className="text-sm font-bold">{chokepoints.length + cables.length}</div>
          <div className="text-[8px] text-muted-foreground">Total Assets</div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
        <Input
          placeholder={t('infra.searchPlaceholder')}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-7 h-7 text-xs"
        />
      </div>

      {/* Items */}
      <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
        {view === 'chokepoints' && filteredChokepoints.map(cp => {
          const StatusIcon = statusIcons[cp.status];
          return (
            <div key={cp.id} className="border border-border rounded p-2 space-y-1">
              <div className="flex items-start justify-between gap-1">
                <div className="flex items-center gap-1.5">
                  <Anchor className={cn('h-3 w-3', statusColors[cp.status])} />
                  <span className="text-xs font-medium">{cp.name}</span>
                </div>
                <Badge variant="outline" className={cn('text-[8px] px-1 py-0 flex items-center gap-0.5', statusColors[cp.status])}>
                  <StatusIcon className="h-2 w-2" />
                  {cp.status}
                </Badge>
              </div>

              <div className="text-[9px] text-muted-foreground">{cp.region}</div>

              <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
                <span>Disruption: <span className={cn('font-bold', cp.disruptionScore > 70 ? 'text-danger' : cp.disruptionScore > 40 ? 'text-warning' : 'text-success')}>{cp.disruptionScore}/100</span></span>
                {cp.vesselCount != null && <span>Ships: {cp.vesselCount}</span>}
                {cp.avgDelayHours != null && <span>Delay: {cp.avgDelayHours}h</span>}
              </div>

              <div className="flex items-center justify-between text-[9px] text-muted-foreground">
                <span>Confidence: {Math.round(cp.confidence * 100)}%</span>
                <span>{getTimeAgo(cp.lastUpdated)}</span>
              </div>
            </div>
          );
        })}

        {view === 'cables' && filteredCables.map(cable => (
          <div key={cable.id} className="border border-border rounded p-2 space-y-1">
            <div className="flex items-start justify-between gap-1">
              <div className="flex items-center gap-1.5">
                <Cable className={cn('h-3 w-3', cableStatusColors[cable.status])} />
                <span className="text-xs font-medium">{cable.name}</span>
              </div>
              <Badge variant="outline" className={cn('text-[8px] px-1 py-0', cableStatusColors[cable.status])}>
                {cable.status}
              </Badge>
            </div>

            <div className="text-[9px] text-muted-foreground">Owner: {cable.owner}</div>

            {cable.capacityTbps != null && (
              <div className="text-[9px] text-muted-foreground">Capacity: {cable.capacityTbps} Tbps</div>
            )}

            {cable.landingPoints.length > 0 && (
              <div className="flex gap-0.5 flex-wrap">
                {cable.landingPoints.map((lp, i) => (
                  <span key={i} className="text-[8px] px-1 py-0 bg-muted rounded">{lp.country}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return translate('time.justNow');
  if (hours < 24) return `${hours}${translate('time.hAgo')}`;
  return `${Math.floor(hours / 24)}${translate('time.dAgo')}`;
}
