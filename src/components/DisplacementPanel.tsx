import { mockEmptyBuildings, mockRefugeeCamps } from '@/data/newFeaturesMockData';
import { Building, Tent, Home, Droplets, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

const conditionColors: Record<string, string> = {
  good: 'text-success',
  fair: 'text-warning',
  damaged: 'text-danger',
};

export function DisplacementPanel() {
  const { t } = useTranslation();
  const totalCampCapacity = mockRefugeeCamps.reduce((s, c) => s + c.capacity, 0);
  const totalCampOccupancy = mockRefugeeCamps.reduce((s, c) => s + c.current_occupancy, 0);
  const occupancyPct = Math.round((totalCampOccupancy / totalCampCapacity) * 100);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="p-2 border-b border-border bg-card">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-info flex items-center gap-1.5">
          <Tent className="h-3 w-3" /> {t('displacement.title')}
        </h3>
        <p className="text-[8px] text-muted-foreground mt-0.5">{t('displacement.subtitle')}</p>
      </div>

      {/* Camp Tracker */}
      <div className="p-2 border-b border-border">
        <h4 className="text-[9px] font-bold uppercase tracking-wider text-warning flex items-center gap-1 mb-1">
          <Tent className="h-3 w-3" /> {t('displacement.camps')}
          <span className={cn('ml-auto text-[8px] font-bold', occupancyPct > 100 ? 'text-danger' : 'text-warning')}>{occupancyPct}% {t('displacement.occupied')}</span>
        </h4>
        <div className="space-y-1">
          {mockRefugeeCamps.map(camp => {
            const pct = Math.round((camp.current_occupancy / camp.capacity) * 100);
            return (
              <div key={camp.id} className="border border-border rounded p-1.5 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-medium">{camp.name}</span>
                  <span className={cn('text-[8px] font-bold', pct > 100 ? 'text-danger' : pct > 80 ? 'text-warning' : 'text-success')}>
                    {camp.current_occupancy.toLocaleString()}/{camp.capacity.toLocaleString()}
                  </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className={cn('h-full rounded-full', pct > 100 ? 'bg-danger' : pct > 80 ? 'bg-warning' : 'bg-success')}
                    style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
                <div className="flex flex-wrap gap-1 text-[7px] text-muted-foreground">
                  <span>{camp.city}</span>
                  <span>• {camp.managed_by}</span>
                  {camp.services.map(s => <span key={s} className="bg-muted/50 px-1 rounded">{s}</span>)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Empty Buildings */}
      <div className="p-2">
        <h4 className="text-[9px] font-bold uppercase tracking-wider text-primary flex items-center gap-1 mb-1">
          <Building className="h-3 w-3" /> {t('displacement.emptyBuildings')}
        </h4>
        <div className="space-y-1">
          {mockEmptyBuildings.map(eb => (
            <div key={eb.id} className="border border-border rounded p-1.5 space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-medium">{eb.name}</span>
                <span className={cn('text-[7px] font-bold', conditionColors[eb.condition])}>{eb.condition.toUpperCase()}</span>
              </div>
              <div className="flex flex-wrap gap-2 text-[8px] text-muted-foreground">
                <span>{eb.city}</span>
                <span className="capitalize">{eb.building_type}</span>
                <span>👥 {eb.estimated_capacity}</span>
                {eb.has_water && <span className="text-blue-400 flex items-center gap-0.5"><Droplets className="h-2.5 w-2.5" />Water</span>}
                {eb.has_electricity && <span className="text-yellow-400 flex items-center gap-0.5"><Zap className="h-2.5 w-2.5" />Power</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
