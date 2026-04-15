import { useBridgedResourceForecasts } from '@/services/mockBridge';
import { TrendingDown, AlertTriangle, Clock, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

const severityConfig: Record<string, { color: string; bg: string }> = {
  critical: { color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/30' },
  warning: { color: 'text-warning', bg: 'bg-warning/10 border-warning/30' },
  watch: { color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30' },
  stable: { color: 'text-success', bg: 'bg-success/10 border-success/30' },
};

const categoryEmoji: Record<string, string> = {
  food: '🍞',
  fuel: '⛽',
  medicine: '💊',
  water: '💧',
  electricity: '⚡',
};

export function ResourceForecastPanel() {
  const { data: mockResourceForecasts = [], isLoading } = useBridgedResourceForecasts();
  const { t } = useTranslation();

  if (isLoading) return <div className="border border-border rounded-lg p-4 text-center text-[9px] text-muted-foreground">Loading...</div>;

  const criticalCount = mockResourceForecasts.filter(r => r.severity === 'critical').length;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="p-2 border-b border-border bg-card">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-yellow-400 flex items-center gap-1.5">
          <BarChart3 className="h-3 w-3" /> {t('resourceForecast.title')}
        </h3>
        <p className="text-[8px] text-muted-foreground mt-0.5">{t('resourceForecast.subtitle')}</p>
      </div>

      {/* Critical alert */}
      {criticalCount > 0 && (
        <div className="p-2 border-b border-border bg-destructive/5 flex items-center gap-1.5">
          <AlertTriangle className="h-3 w-3 text-destructive" />
          <span className="text-[9px] text-destructive font-medium">{criticalCount} critical shortages detected</span>
        </div>
      )}

      <div className="p-2 space-y-1.5">
        {mockResourceForecasts.map(r => {
          const cfg = severityConfig[r.severity];
          return (
            <div key={r.id} className={cn('border rounded p-2 space-y-1', cfg.bg)}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">
                  {categoryEmoji[r.category]} {r.resource}
                </span>
                <span className={cn('text-[7px] font-bold uppercase rounded px-1 py-0.5', cfg.color,
                  r.severity === 'critical' ? 'bg-destructive/20' : r.severity === 'warning' ? 'bg-warning/20' : 'bg-muted'
                )}>
                  {r.severity}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-[8px] text-muted-foreground">{r.region}</div>
                </div>
                <div className="text-right">
                  <div className={cn('text-[10px] font-bold', r.current_stock_days <= 3 ? 'text-destructive' : 'text-foreground')}>
                    {r.current_stock_days === 0 ? 'DEPLETED' : `${r.current_stock_days} days`}
                  </div>
                  <div className="text-[7px] text-muted-foreground">remaining</div>
                </div>
              </div>

              {r.forecast_depletion_date !== 'N/A' && (
                <div className="flex items-center gap-1 text-[8px] text-muted-foreground">
                  <Clock className="h-2.5 w-2.5" />
                  <span>Depletion: {r.forecast_depletion_date}</span>
                  <TrendingDown className="h-2.5 w-2.5 text-destructive ml-1" />
                </div>
              )}

              <p className="text-[8px] text-muted-foreground italic">{r.recommendation}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
