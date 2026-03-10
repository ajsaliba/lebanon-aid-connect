import { useState } from 'react';
import { Zap } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { type IntelSignal } from '@/hooks/useIntelSignals';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

const severityColors = {
  critical: 'text-danger',
  warning: 'text-warning',
  info: 'text-info',
};

export function IntelSignalsBadge({ signals }: { signals: IntelSignal[] }) {
  const { t } = useTranslation();
  if (signals.length === 0) return null;

  const criticalCount = signals.filter(s => s.severity === 'critical').length;
  const badgeColor = criticalCount > 0 ? 'bg-danger' : 'bg-warning';

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative flex items-center gap-1 px-2 py-1 rounded hover:bg-muted transition-colors">
          <Zap className={cn('h-3.5 w-3.5', criticalCount > 0 ? 'text-danger' : 'text-warning')} />
          <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">{signals.length}</span>
          <span className={cn('absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full animate-pulse', badgeColor)} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[360px] p-0" align="end">
        <div className="px-3 py-2 border-b border-border">
          <div className="flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-sans font-bold uppercase tracking-wider text-primary">{t('intel.findings')}</span>
            <span className="text-[9px] text-muted-foreground ml-auto">{signals.length} {t('intel.signalsCount')}</span>
          </div>
        </div>
        <div className="max-h-[400px] overflow-y-auto divide-y divide-border">
          {signals.map(signal => (
            <div key={signal.id} className="px-3 py-2 hover:bg-muted/50 transition-colors">
              <div className="flex items-start gap-2">
                <span className={cn('text-sm shrink-0 mt-0.5', severityColors[signal.severity])}>
                  {signal.type === 'velocity_spike' ? '🔥' :
                   signal.type === 'convergence' ? '◉' :
                   signal.type === 'triangulation' ? '△' :
                   signal.type === 'geographic_convergence' ? '🌍' : '🔺'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-semibold text-foreground">{signal.title}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{signal.description}</div>
                  <div className="flex items-center gap-2 mt-1 text-[9px] text-muted-foreground">
                    <span>{t('intel.confidence')}: {Math.round(signal.confidence * 100)}%</span>
                    <span className={cn('uppercase font-bold', severityColors[signal.severity])}>{signal.severity}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
