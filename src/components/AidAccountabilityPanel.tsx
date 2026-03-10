import { mockAidFunds } from '@/data/newFeaturesMockData2';
import { Eye, DollarSign, CheckCircle2, Clock, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

export function AidAccountabilityPanel() {
  const { t } = useTranslation();
  const totalPledged = mockAidFunds.reduce((s, f) => s + f.amount_usd, 0);
  const totalDisbursed = mockAidFunds.filter(f => f.disbursed).reduce((s, f) => s + f.amount_usd, 0);
  const avgTransparency = Math.round(mockAidFunds.reduce((s, f) => s + f.transparency_score, 0) / mockAidFunds.length);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="p-2 border-b border-border bg-card">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
          <Eye className="h-3 w-3" /> {t('aidAccountability.title')}
        </h3>
        <p className="text-[8px] text-muted-foreground mt-0.5">{t('aidAccountability.subtitle')}</p>
      </div>

      {/* Summary */}
      <div className="p-2 grid grid-cols-3 gap-1 border-b border-border">
        <div className="bg-muted/30 rounded p-1 text-center">
          <div className="text-[10px] font-bold text-primary">${(totalPledged / 1e6).toFixed(1)}M</div>
          <div className="text-[7px] text-muted-foreground">Total</div>
        </div>
        <div className="bg-muted/30 rounded p-1 text-center">
          <div className="text-[10px] font-bold text-success">${(totalDisbursed / 1e6).toFixed(1)}M</div>
          <div className="text-[7px] text-muted-foreground">Disbursed</div>
        </div>
        <div className="bg-muted/30 rounded p-1 text-center">
          <div className={cn('text-[10px] font-bold', avgTransparency >= 80 ? 'text-success' : avgTransparency >= 60 ? 'text-warning' : 'text-destructive')}>{avgTransparency}%</div>
          <div className="text-[7px] text-muted-foreground">Transparency</div>
        </div>
      </div>

      <div className="p-2 space-y-1.5">
        {mockAidFunds.map(fund => (
          <div key={fund.id} className="border border-border rounded p-2 space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">{fund.organization}</span>
              <span className="text-[9px] text-muted-foreground">{fund.source_country}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold flex items-center gap-0.5">
                <DollarSign className="h-2.5 w-2.5 text-success" />
                ${(fund.amount_usd / 1e6).toFixed(1)}M
              </span>
              <span className={cn('text-[8px] flex items-center gap-0.5 font-medium',
                fund.disbursed ? 'text-success' : 'text-warning'
              )}>
                {fund.disbursed ? <CheckCircle2 className="h-2.5 w-2.5" /> : <Clock className="h-2.5 w-2.5" />}
                {fund.disbursed ? `Disbursed ${fund.disbursement_date}` : 'Pending'}
              </span>
            </div>
            <div className="text-[8px] text-muted-foreground">{fund.purpose} — {fund.region}</div>
            <div className="flex items-center gap-1 mt-0.5">
              <Shield className="h-2.5 w-2.5 text-muted-foreground" />
              <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                <div className={cn('h-full rounded-full',
                  fund.transparency_score >= 80 ? 'bg-success' : fund.transparency_score >= 60 ? 'bg-warning' : 'bg-destructive'
                )} style={{ width: `${fund.transparency_score}%` }} />
              </div>
              <span className="text-[8px] text-muted-foreground">{fund.transparency_score}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
