import { mockCommunityRisks } from '@/data/newFeaturesMockData';
import { Shield, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

function riskColor(score: number) {
  if (score >= 80) return 'text-danger';
  if (score >= 60) return 'text-warning';
  if (score >= 40) return 'text-yellow-500';
  return 'text-success';
}

function riskBg(score: number) {
  if (score >= 80) return 'bg-danger/10 border-danger/30';
  if (score >= 60) return 'bg-warning/10 border-warning/30';
  if (score >= 40) return 'bg-yellow-500/10 border-yellow-500/30';
  return 'bg-success/10 border-success/30';
}

const trendIcons = {
  worsening: <TrendingUp className="h-2.5 w-2.5 text-danger" />,
  stable: <Minus className="h-2.5 w-2.5 text-muted-foreground" />,
  improving: <TrendingDown className="h-2.5 w-2.5 text-success" />,
};

export function CommunityRiskPanel() {
  const { t } = useTranslation();
  const sorted = [...mockCommunityRisks].sort((a, b) => b.risk_score - a.risk_score);
  const avgRisk = Math.round(sorted.reduce((s, c) => s + c.risk_score, 0) / sorted.length);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="p-2 border-b border-border bg-card">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-danger flex items-center gap-1.5">
          <Shield className="h-3 w-3" /> {t('communityRisk.title')}
        </h3>
        <p className="text-[8px] text-muted-foreground mt-0.5">{t('communityRisk.subtitle')}</p>
      </div>

      <div className="p-2 grid grid-cols-3 gap-1">
        <div className="bg-muted/30 rounded p-1 text-center">
          <div className="text-[10px] font-bold">{sorted.length}</div>
          <div className="text-[7px] text-muted-foreground">{t('communityRisk.areas')}</div>
        </div>
        <div className={cn('rounded p-1 text-center', riskBg(avgRisk))}>
          <div className={cn('text-[10px] font-bold', riskColor(avgRisk))}>{avgRisk}</div>
          <div className="text-[7px] text-muted-foreground">{t('communityRisk.avgRisk')}</div>
        </div>
        <div className="bg-danger/10 rounded p-1 text-center">
          <div className="text-[10px] font-bold text-danger">{sorted.filter(c => c.risk_score >= 80).length}</div>
          <div className="text-[7px] text-muted-foreground">{t('communityRisk.critical')}</div>
        </div>
      </div>

      <div className="p-2 space-y-1">
        {sorted.map(cr => (
          <div key={cr.id} className={cn('border rounded p-2', riskBg(cr.risk_score))}>
            <div className="flex items-center justify-between mb-1">
              <div>
                <span className="text-xs font-medium">{cr.neighborhood}</span>
                <span className="text-[8px] text-muted-foreground ml-1">{cr.city}</span>
              </div>
              <div className="flex items-center gap-1">
                {trendIcons[cr.trend]}
                <span className={cn('text-sm font-bold', riskColor(cr.risk_score))}>{cr.risk_score}</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1 text-[7px]">
              <div>
                <div className="text-muted-foreground">{t('communityRisk.infrastructure')}</div>
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-warning rounded-full" style={{ width: `${cr.infrastructure_damage}%` }} />
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">{t('communityRisk.conflict')}</div>
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-danger rounded-full" style={{ width: `${cr.conflict_proximity}%` }} />
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">{t('communityRisk.needs')}</div>
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-info rounded-full" style={{ width: `${cr.humanitarian_needs}%` }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
