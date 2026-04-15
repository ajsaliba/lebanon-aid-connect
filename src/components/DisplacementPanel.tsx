import { useRefugeeCamps } from '@/services/humanitarianService';
import { FeedHealthBadge } from '@/components/FeedHealthBadge';
import { Building, Tent, Home, Droplets, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

export function DisplacementPanel() {
  const { t } = useTranslation();
  const { data: camps = [], isLoading } = useRefugeeCamps();

  if (isLoading) {
    return (
      <div className="border border-border rounded-lg p-4 text-center text-[9px] text-muted-foreground">
        Loading...
      </div>
    );
  }

  const totalCampCapacity = camps.reduce((s, c) => s + c.capacity, 0);
  const totalCampOccupancy = camps.reduce((s, c) => s + c.currentOccupancy, 0);
  const occupancyPct = totalCampCapacity > 0 ? Math.round((totalCampOccupancy / totalCampCapacity) * 100) : 0;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="p-2 border-b border-border bg-card">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-info flex items-center gap-1.5">
          <Tent className="h-3 w-3" /> {t('displacement.title')}
          <FeedHealthBadge feedName="refugee_camps" className="ml-auto" />
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
          {camps.map(camp => {
            const pct = camp.capacity > 0 ? Math.round((camp.currentOccupancy / camp.capacity) * 100) : 0;
            return (
              <div key={camp.id} className="border border-border rounded p-1.5 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-medium">{camp.name}</span>
                  <span className={cn('text-[8px] font-bold', pct > 100 ? 'text-danger' : pct > 80 ? 'text-warning' : 'text-success')}>
                    {camp.currentOccupancy.toLocaleString()}/{camp.capacity.toLocaleString()}
                  </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className={cn('h-full rounded-full', pct > 100 ? 'bg-danger' : pct > 80 ? 'bg-warning' : 'bg-success')}
                    style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
                <div className="flex flex-wrap gap-1 text-[7px] text-muted-foreground">
                  <span>{camp.region}</span>
                  <span>• {camp.managedBy}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Empty Buildings placeholder */}
      <div className="p-2">
        <h4 className="text-[9px] font-bold uppercase tracking-wider text-primary flex items-center gap-1 mb-1">
          <Building className="h-3 w-3" /> {t('displacement.emptyBuildings')}
        </h4>
        <p className="text-[8px] text-muted-foreground italic">
          Empty building data will be available when the live feed is connected.
        </p>
      </div>
    </div>
  );
}
