import { mockTelemedicineProviders } from '@/data/newFeaturesMockData';
import { Video, Phone, Brain, Stethoscope, HeartPulse, Baby } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import type { MedProviderType } from '@/data/newFeaturesMockData';

const typeConfig: Record<MedProviderType, { icon: React.ReactNode; color: string }> = {
  general: { icon: <Stethoscope className="h-3 w-3" />, color: 'text-primary' },
  specialist: { icon: <HeartPulse className="h-3 w-3" />, color: 'text-info' },
  therapist: { icon: <Brain className="h-3 w-3" />, color: 'text-purple-400' },
  crisis_counselor: { icon: <Phone className="h-3 w-3" />, color: 'text-danger' },
};

export function TelemedicinePanel() {
  const { t } = useTranslation();
  const availableCount = mockTelemedicineProviders.filter(p => p.available).length;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="p-2 border-b border-border bg-card">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-info flex items-center gap-1.5">
          <Video className="h-3 w-3" /> {t('telemedicine.title')}
        </h3>
        <p className="text-[8px] text-muted-foreground mt-0.5">{t('telemedicine.subtitle')}</p>
      </div>

      <div className="p-2 grid grid-cols-2 gap-1">
        <div className="bg-muted/30 rounded p-1 text-center">
          <div className="text-[10px] font-bold">{mockTelemedicineProviders.length}</div>
          <div className="text-[7px] text-muted-foreground">{t('telemedicine.providers')}</div>
        </div>
        <div className="bg-success/10 rounded p-1 text-center">
          <div className="text-[10px] font-bold text-success">{availableCount}</div>
          <div className="text-[7px] text-muted-foreground">{t('telemedicine.available')}</div>
        </div>
      </div>

      <div className="p-2 space-y-1.5">
        {mockTelemedicineProviders.map(prov => {
          const cfg = typeConfig[prov.type];
          return (
            <div key={prov.id} className={cn('border rounded p-2 space-y-0.5', prov.available ? 'border-border' : 'border-muted bg-muted/10')}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium flex items-center gap-1">
                  <span className={cfg.color}>{cfg.icon}</span> {prov.name}
                </span>
                <span className={cn('h-2 w-2 rounded-full', prov.available ? 'bg-success' : 'bg-muted-foreground')} />
              </div>
              <div className="text-[9px] text-muted-foreground font-medium">{prov.specialty}</div>
              <div className="flex flex-wrap gap-2 text-[8px] text-muted-foreground">
                <span>🗣️ {prov.languages.join(', ')}</span>
                <span>📱 {prov.platform}</span>
                <span>🕐 {prov.hours}</span>
              </div>
              {prov.available && (
                <div className="text-[8px] text-primary flex items-center gap-1">
                  <Phone className="h-2.5 w-2.5" /> {prov.phone}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
