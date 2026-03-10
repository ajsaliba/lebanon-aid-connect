import { mockRiskPredictions } from '@/data/extendedMockData';
import { Brain, AlertTriangle, TrendingUp, Activity } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

const riskColors: Record<string, string> = {
  critical: 'text-danger',
  high: 'text-warning',
  moderate: 'text-info',
  low: 'text-success',
};

const riskBg: Record<string, string> = {
  critical: 'bg-danger/20',
  high: 'bg-warning/20',
  moderate: 'bg-info/20',
  low: 'bg-success/20',
};

export function PredictiveRiskPanel() {
  const { t } = useTranslation();
  const sorted = [...mockRiskPredictions].sort((a, b) => b.risk_score - a.risk_score);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="p-2 border-b border-border bg-card">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
          <Brain className="h-3 w-3" /> {t('risk.model')}
        </h3>
        <p className="text-[8px] text-muted-foreground mt-0.5">{t('risk.subtitle')}</p>
      </div>

      <div className="p-2 space-y-2">
        {sorted.map(pred => (
          <div key={pred.id} className="border border-border rounded p-2 space-y-1.5">
            <div className="flex items-start justify-between gap-1">
              <div className="flex items-center gap-1">
                <AlertTriangle className={cn('h-3 w-3', riskColors[pred.risk_level])} />
                <span className="text-xs font-medium">{pred.region}</span>
              </div>
              <span className={cn('text-[8px] px-1 py-0 rounded font-bold uppercase', riskBg[pred.risk_level], riskColors[pred.risk_level])}>
                {pred.risk_level}
              </span>
            </div>

            {/* Risk Score */}
            <div className="space-y-0.5">
              <div className="flex justify-between text-[9px]">
                <span className="text-muted-foreground">{t('risk.riskScore')}</span>
                <span className={riskColors[pred.risk_level]}>{pred.risk_score}/100</span>
              </div>
              <Progress value={pred.risk_score} className="h-1" />
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-1">
              <div className="bg-muted/30 rounded p-1 text-center">
                <Activity className="h-2.5 w-2.5 mx-auto text-danger mb-0.5" />
                <div className="text-[9px] font-bold">{(pred.infrastructure_failure_prob * 100).toFixed(0)}%</div>
                <div className="text-[7px] text-muted-foreground">{t('risk.infraFailure')}</div>
              </div>
              <div className="bg-muted/30 rounded p-1 text-center">
                <TrendingUp className="h-2.5 w-2.5 mx-auto text-warning mb-0.5" />
                <div className="text-[9px] font-bold">{pred.humanitarian_demand_surge}x</div>
                <div className="text-[7px] text-muted-foreground">{t('risk.demandSurge')}</div>
              </div>
            </div>

            {/* Factors */}
            <div className="flex gap-0.5 flex-wrap">
              {pred.factors.map(f => (
                <span key={f} className="text-[7px] px-1 py-0 bg-muted rounded">{f}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
