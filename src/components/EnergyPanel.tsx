import { useEnergyData } from '@/services/financialService';
import { FeedHealthBadge } from '@/components/FeedHealthBadge';
import { Zap, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

const trendIcons: Record<string, React.ReactNode> = {
  rising: <TrendingUp className="h-2.5 w-2.5 text-success" />,
  falling: <TrendingDown className="h-2.5 w-2.5 text-danger" />,
  stable: <Minus className="h-2.5 w-2.5 text-muted-foreground" />,
};

const metricLabels: Record<string, string> = {
  wti: 'WTI Crude',
  brent: 'Brent Crude',
  natgas: 'Natural Gas',
  production: 'Production',
  inventory: 'Inventory',
  demand: 'Demand',
};

export function EnergyPanel() {
  const { t } = useTranslation();
  const { data: energyPoints = [], isLoading } = useEnergyData();

  if (isLoading) return <div className="border border-border rounded-lg p-4 text-center text-[9px] text-muted-foreground">Loading...</div>;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="p-2 border-b border-border bg-card">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-warning flex items-center gap-1.5">
          <Zap className="h-3 w-3" /> {t('energy.title')}
          <FeedHealthBadge feedName="energy_data" />
        </h3>
        <p className="text-[8px] text-muted-foreground mt-0.5">{t('energy.subtitle')}</p>
      </div>

      {/* Summary row */}
      <div className="p-2 grid grid-cols-3 gap-1">
        {(['rising', 'falling', 'stable'] as const).map(trend => {
          const count = energyPoints.filter(e => e.trend === trend).length;
          return (
            <div key={trend} className="bg-muted/30 rounded p-1 text-center">
              <div className="flex justify-center mb-0.5">{trendIcons[trend]}</div>
              <div className="text-[10px] font-bold">{count}</div>
              <div className="text-[7px] text-muted-foreground capitalize">{trend}</div>
            </div>
          );
        })}
      </div>

      {/* Energy metric cards */}
      <div className="p-2 space-y-1.5">
        {energyPoints.map(ep => (
          <div key={ep.id} className="border border-border rounded p-2 space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium flex items-center gap-1">
                <Zap className="h-3 w-3 text-warning" />
                {metricLabels[ep.metric] ?? ep.metric}
              </span>
              <span className="flex items-center gap-1">
                {trendIcons[ep.trend]}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold">
                {ep.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {ep.unit}
              </span>
              <span className={cn('text-[9px] font-medium', ep.change24h >= 0 ? 'text-success' : 'text-danger')}>
                {ep.change24h >= 0 ? '+' : ''}{ep.change24h.toFixed(2)}%
              </span>
            </div>
            <div className="flex items-center justify-between text-[8px] text-muted-foreground">
              <span>{ep.source}</span>
              <span>{new Date(ep.timestamp).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
