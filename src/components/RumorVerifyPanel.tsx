import { useBridgedRumors } from '@/services/mockBridge';
import { ShieldAlert, CheckCircle, XCircle, AlertTriangle, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import type { RumorVerdict } from '@/data/newFeaturesMockData';

const verdictConfig: Record<RumorVerdict, { icon: React.ReactNode; color: string; label: string }> = {
  verified_true: { icon: <CheckCircle className="h-3 w-3" />, color: 'text-success', label: 'TRUE' },
  verified_false: { icon: <XCircle className="h-3 w-3" />, color: 'text-danger', label: 'FALSE' },
  misleading: { icon: <AlertTriangle className="h-3 w-3" />, color: 'text-warning', label: 'MISLEADING' },
  unverified: { icon: <HelpCircle className="h-3 w-3" />, color: 'text-muted-foreground', label: 'UNVERIFIED' },
};

export function RumorVerifyPanel() {
  const { data: mockRumors = [], isLoading } = useBridgedRumors();
  const { t } = useTranslation();

  if (isLoading) return <div className="border border-border rounded-lg p-4 text-center text-[9px] text-muted-foreground">Loading...</div>;

  const falseCount = mockRumors.filter(r => r.verdict === 'verified_false').length;
  const trueCount = mockRumors.filter(r => r.verdict === 'verified_true').length;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="p-2 border-b border-border bg-card">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-warning flex items-center gap-1.5">
          <ShieldAlert className="h-3 w-3" /> {t('rumor.title')}
        </h3>
        <p className="text-[8px] text-muted-foreground mt-0.5">{t('rumor.subtitle')}</p>
      </div>

      <div className="p-2 grid grid-cols-4 gap-1">
        <div className="bg-muted/30 rounded p-1 text-center">
          <div className="text-[10px] font-bold">{mockRumors.length}</div>
          <div className="text-[7px] text-muted-foreground">{t('rumor.tracked')}</div>
        </div>
        <div className="bg-success/10 rounded p-1 text-center">
          <div className="text-[10px] font-bold text-success">{trueCount}</div>
          <div className="text-[7px] text-muted-foreground">{t('rumor.true')}</div>
        </div>
        <div className="bg-danger/10 rounded p-1 text-center">
          <div className="text-[10px] font-bold text-danger">{falseCount}</div>
          <div className="text-[7px] text-muted-foreground">{t('rumor.false')}</div>
        </div>
        <div className="bg-warning/10 rounded p-1 text-center">
          <div className="text-[10px] font-bold text-warning">{mockRumors.filter(r => r.verdict === 'misleading').length}</div>
          <div className="text-[7px] text-muted-foreground">{t('rumor.misleading')}</div>
        </div>
      </div>

      <div className="p-2 space-y-1.5">
        {mockRumors.map(rm => {
          const cfg = verdictConfig[rm.verdict];
          return (
            <div key={rm.id} className={cn('border rounded p-2 space-y-1',
              rm.verdict === 'verified_false' ? 'border-danger/30 bg-danger/5' :
              rm.verdict === 'verified_true' ? 'border-success/30 bg-success/5' :
              rm.verdict === 'misleading' ? 'border-warning/30 bg-warning/5' : 'border-border'
            )}>
              <div className="flex items-start justify-between gap-1">
                <p className="text-xs font-medium flex-1">"{rm.claim}"</p>
                <span className={cn('text-[7px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 shrink-0', cfg.color, `bg-current/10`)}>
                  {cfg.icon} {cfg.label}
                </span>
              </div>
              <p className="text-[8px] text-muted-foreground">{rm.explanation}</p>
              <div className="flex items-center justify-between text-[7px] text-muted-foreground">
                <span>📡 {rm.source}</span>
                <span>✅ {rm.checked_by}</span>
                <span className="flex items-center gap-0.5">🔥 Virality: {rm.spread_score}/10</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
