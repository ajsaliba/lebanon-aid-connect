import { useNewsFeedContext } from '@/contexts/NewsFeedContext';
import { useStrategicRisk, RISK_LEVEL_CONFIG } from '@/hooks/useStrategicRisk';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, RefreshCw, Shield } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const trendIcons = {
  escalating: TrendingUp,
  stable: Minus,
  'de-escalating': TrendingDown,
};

export function StrategicRiskPanel() {
  const { news } = useNewsFeedContext();
  const risk = useStrategicRisk(news);
  const cfg = RISK_LEVEL_CONFIG[risk.level];
  const TrendIcon = trendIcons[risk.trend];

  return (
    <div className="rounded-lg border border-border bg-card/50 p-3 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-bold uppercase tracking-wider">Strategic Risk Overview</h3>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-[9px] text-muted-foreground cursor-help">?</span>
          </TooltipTrigger>
          <TooltipContent side="left" className="text-[10px] max-w-[220px]">
            <p className="font-bold mb-1">Methodology</p>
            <p>Composite score (0-100) blending:</p>
            <ul className="list-disc list-inside">
              <li>50% Country Instability (top 5)</li>
              <li>30% Geographic convergence</li>
              <li>20% Infrastructure incidents</li>
            </ul>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Score display */}
      <div className="flex items-center gap-4">
        <div className={cn('text-4xl font-mono font-bold', cfg.color)}>{risk.score}</div>
        <div>
          <div className={cn('text-sm font-bold', cfg.color)}>{cfg.label}</div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <span>Trend</span>
            <TrendIcon className={cn('h-3 w-3', risk.trend === 'escalating' ? 'text-danger' : risk.trend === 'de-escalating' ? 'text-success' : 'text-muted-foreground')} />
            <span className={cn(risk.trend === 'escalating' ? 'text-danger' : risk.trend === 'de-escalating' ? 'text-success' : '')}>
              {risk.trend === 'escalating' ? '📈 Escalating' : risk.trend === 'de-escalating' ? '📉 De-escalating' : '→ Stable'}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          { label: 'Convergence', value: risk.convergenceCount },
          { label: 'CII Deviation', value: risk.ciiDeviation.toFixed(1) },
          { label: 'Infra Events', value: risk.infraEvents },
          { label: 'High Alerts', value: risk.highAlerts },
        ].map(m => (
          <div key={m.label} className="rounded bg-muted/50 p-1.5">
            <div className="text-sm font-bold font-mono text-foreground">{m.value}</div>
            <div className="text-[8px] text-muted-foreground">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Recent alerts */}
      {risk.alerts.length > 0 && (
        <div className="space-y-1">
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Recent Alerts ({risk.alerts.length})</span>
          <div className="max-h-[120px] overflow-y-auto space-y-1">
            {risk.alerts.map(alert => (
              <div key={alert.id} className="flex items-start gap-2 text-[10px] rounded bg-muted/30 p-1.5">
                <span>{alert.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className={cn('font-bold', alert.color)}>{alert.title}</div>
                  <div className="text-muted-foreground">{alert.detail}</div>
                </div>
                <span className="text-[8px] text-muted-foreground shrink-0">just now</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {risk.alerts.length === 0 && (
        <div className="text-[10px] text-muted-foreground text-center py-2">No significant risks detected</div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-[8px] text-muted-foreground">
        <span>Updated: {risk.lastUpdated.toLocaleTimeString()}</span>
        <span className="flex items-center gap-0.5"><RefreshCw className="h-2 w-2" />Auto-refresh</span>
      </div>
    </div>
  );
}
