import { mockDiasporaDonors, mockInternationalAid } from '@/data/newFeaturesMockData2';
import { Globe, Heart, Home, Users, DollarSign, CheckCircle2, Clock, Handshake } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

const supportTypeConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  financial: { color: 'text-green-400', icon: <DollarSign className="h-3 w-3" />, label: 'Financial' },
  housing: { color: 'text-blue-400', icon: <Home className="h-3 w-3" />, label: 'Housing' },
  sponsorship: { color: 'text-violet-400', icon: <Heart className="h-3 w-3" />, label: 'Sponsorship' },
  volunteer: { color: 'text-amber-400', icon: <Users className="h-3 w-3" />, label: 'Volunteer' },
};

const aidStatusColor: Record<string, string> = {
  pledged: 'text-warning',
  disbursed: 'text-primary',
  delivered: 'text-success',
};

export function DiasporaSupportPanel() {
  const { t } = useTranslation();
  const totalAid = mockInternationalAid.reduce((s, a) => s + a.amount_usd, 0);
  const deliveredAid = mockInternationalAid.filter(a => a.status === 'delivered').reduce((s, a) => s + a.amount_usd, 0);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="p-2 border-b border-border bg-card">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
          <Globe className="h-3 w-3" /> {t('diasporaSupport.title')}
        </h3>
        <p className="text-[8px] text-muted-foreground mt-0.5">{t('diasporaSupport.subtitle')}</p>
      </div>

      {/* Diaspora donors */}
      <div className="p-2 space-y-1 border-b border-border">
        <p className="text-[9px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
          <Handshake className="h-2.5 w-2.5" /> Diaspora Support
        </p>
        {mockDiasporaDonors.map(d => {
          const cfg = supportTypeConfig[d.support_type];
          return (
            <div key={d.id} className="border border-border rounded p-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium flex items-center gap-1">
                  <span className={cfg.color}>{cfg.icon}</span>
                  {d.name}
                  {d.verified && <span className="text-[7px] bg-primary/20 text-primary rounded px-1">✓</span>}
                </span>
                <span className="text-[8px] text-muted-foreground">{d.country}</span>
              </div>
              <p className="text-[8px] text-muted-foreground mt-0.5">{d.description}</p>
              {d.amount && <p className="text-[8px] text-success font-medium mt-0.5">{d.amount}</p>}
            </div>
          );
        })}
      </div>

      {/* International Aid */}
      <div className="p-2 space-y-1">
        <p className="text-[9px] font-semibold text-muted-foreground uppercase flex items-center gap-1 mb-1">
          <Globe className="h-2.5 w-2.5" /> International Aid — ${(totalAid / 1e6).toFixed(0)}M total
        </p>
        {mockInternationalAid.map(a => (
          <div key={a.id} className="border border-border rounded p-1.5 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px]">{a.country}</span>
                <span className="text-[9px] font-medium">{a.organization}</span>
              </div>
              <div className="text-[8px] text-muted-foreground">{a.aid_type}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold">${(a.amount_usd / 1e6).toFixed(0)}M</div>
              <span className={cn('text-[7px] font-bold uppercase flex items-center gap-0.5', aidStatusColor[a.status])}>
                {a.status === 'delivered' ? <CheckCircle2 className="h-2 w-2" /> : <Clock className="h-2 w-2" />}
                {a.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
