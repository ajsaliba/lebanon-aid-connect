import { mockEnergyPoints } from '@/data/newFeaturesMockData';
import { Zap, Sun, BatteryCharging, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import type { EnergyPointType } from '@/data/newFeaturesMockData';

const typeConfig: Record<EnergyPointType, { icon: React.ReactNode; color: string; label: string }> = {
  generator: { icon: <Zap className="h-3 w-3" />, color: 'text-warning', label: 'Generator' },
  solar_station: { icon: <Sun className="h-3 w-3" />, color: 'text-yellow-400', label: 'Solar' },
  battery_swap: { icon: <BatteryCharging className="h-3 w-3" />, color: 'text-success', label: 'Battery Swap' },
};

export function EnergyPanel() {
  const { t } = useTranslation();
  const available = mockEnergyPoints.filter(e => e.available);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="p-2 border-b border-border bg-card">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-warning flex items-center gap-1.5">
          <Zap className="h-3 w-3" /> {t('energy.title')}
        </h3>
        <p className="text-[8px] text-muted-foreground mt-0.5">{t('energy.subtitle')}</p>
      </div>

      <div className="p-2 grid grid-cols-3 gap-1">
        {(['generator', 'solar_station', 'battery_swap'] as EnergyPointType[]).map(type => {
          const cfg = typeConfig[type];
          const count = mockEnergyPoints.filter(e => e.type === type && e.available).length;
          const total = mockEnergyPoints.filter(e => e.type === type).length;
          return (
            <div key={type} className="bg-muted/30 rounded p-1 text-center">
              <div className={cn('text-[10px] font-bold', cfg.color)}>{count}/{total}</div>
              <div className="text-[7px] text-muted-foreground">{cfg.label}</div>
            </div>
          );
        })}
      </div>

      <div className="p-2 space-y-1.5">
        {mockEnergyPoints.map(ep => {
          const cfg = typeConfig[ep.type];
          return (
            <div key={ep.id} className={cn('border rounded p-2 space-y-0.5', ep.available ? 'border-border' : 'border-muted bg-muted/10')}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium flex items-center gap-1">
                  <span className={cfg.color}>{cfg.icon}</span> {ep.name}
                </span>
                <span className={cn('h-2 w-2 rounded-full', ep.available ? 'bg-success' : 'bg-muted-foreground')} />
              </div>
              <div className="flex flex-wrap gap-2 text-[8px] text-muted-foreground">
                <span>{ep.city}</span>
                <span>{ep.capacity_info}</span>
                <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{ep.hours}</span>
                {ep.free && <span className="text-success font-bold">{t('energy.free')}</span>}
              </div>
              <p className="text-[8px] text-muted-foreground">{ep.notes}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
