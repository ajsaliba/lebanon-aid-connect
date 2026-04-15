import { useNetworkOutages } from '@/services/infrastructureService';
import { FeedHealthBadge } from '@/components/FeedHealthBadge';
import { Wifi, Signal, Globe, Zap, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import type { NetworkOutage } from '@/services/types';

type OutageType = NetworkOutage['outageType'];

const typeConfig: Record<OutageType, { icon: React.ReactNode; color: string; label: string }> = {
  internet: { icon: <Wifi className="h-3 w-3" />, color: 'text-primary', label: 'Internet' },
  mobile: { icon: <Signal className="h-3 w-3" />, color: 'text-success', label: 'Mobile' },
  fixed: { icon: <Globe className="h-3 w-3" />, color: 'text-info', label: 'Fixed' },
  power: { icon: <Zap className="h-3 w-3" />, color: 'text-warning', label: 'Power' },
};

const severityColors: Record<NetworkOutage['severity'], string> = {
  minor: 'text-muted-foreground',
  moderate: 'text-warning',
  major: 'text-danger',
  total: 'text-danger',
};

export function ConnectivityPanel() {
  const { t } = useTranslation();
  const { data: outages = [], isLoading } = useNetworkOutages();

  if (isLoading) return <div className="border border-border rounded-lg p-4 text-center text-[9px] text-muted-foreground">Loading...</div>;

  const active = outages.filter(o => o.resolvedAt === null);
  const resolved = outages.filter(o => o.resolvedAt !== null);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="p-2 border-b border-border bg-card">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-info flex items-center gap-1.5">
          <Wifi className="h-3 w-3" /> {t('connectivity.title')}
          <FeedHealthBadge feedName="network_outages" />
        </h3>
        <p className="text-[8px] text-muted-foreground mt-0.5">{t('connectivity.subtitle')}</p>
      </div>

      <div className="p-2 grid grid-cols-2 gap-1">
        <div className="bg-muted/30 rounded p-1 text-center">
          <div className="text-[10px] font-bold">{outages.length}</div>
          <div className="text-[7px] text-muted-foreground">{t('connectivity.points')}</div>
        </div>
        <div className="bg-success/10 rounded p-1 text-center">
          <div className="text-[10px] font-bold text-success">{active.length}</div>
          <div className="text-[7px] text-muted-foreground">{t('connectivity.active')}</div>
        </div>
      </div>

      <div className="p-2 space-y-1.5">
        {outages.map(outage => {
          const cfg = typeConfig[outage.outageType];
          const isActive = outage.resolvedAt === null;
          return (
            <div key={outage.id} className={cn('border rounded p-2 space-y-0.5', isActive ? 'border-border' : 'border-danger/30 bg-danger/5')}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium flex items-center gap-1">
                  <span className={cfg.color}>{cfg.icon}</span> {outage.region}
                </span>
                <span className={cn('text-[7px] px-1 py-0.5 rounded font-bold', isActive ? 'bg-danger/20 text-danger' : 'bg-success/20 text-success')}>
                  {isActive ? 'ACTIVE' : 'RESOLVED'}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 text-[8px] text-muted-foreground">
                <span className={cn('font-bold', cfg.color)}>{cfg.label}</span>
                <span>{outage.country}</span>
                <span className={cn('font-bold uppercase', severityColors[outage.severity])}>{outage.severity}</span>
                {outage.affectedUsers && <span>👥 {outage.affectedUsers.toLocaleString()}</span>}
              </div>
              <div className="flex flex-wrap gap-2 text-[8px] text-muted-foreground">
                <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" /> {new Date(outage.startedAt).toLocaleString()}</span>
                <span>📡 {outage.source} ({Math.round(outage.sourceReliability * 100)}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
