import { mockFoodWaterPoints } from '@/data/newFeaturesMockData';
import { UtensilsCrossed, Droplets, Store, Soup, Package, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import type { FoodPointType } from '@/data/newFeaturesMockData';

const typeConfig: Record<FoodPointType, { icon: React.ReactNode; color: string; label: string }> = {
  distribution: { icon: <Package className="h-3 w-3" />, color: 'text-primary', label: 'Distribution' },
  soup_kitchen: { icon: <Soup className="h-3 w-3" />, color: 'text-warning', label: 'Soup Kitchen' },
  community_kitchen: { icon: <UtensilsCrossed className="h-3 w-3" />, color: 'text-success', label: 'Community Kitchen' },
  grocery: { icon: <Store className="h-3 w-3" />, color: 'text-info', label: 'Grocery' },
  water_point: { icon: <Droplets className="h-3 w-3" />, color: 'text-blue-400', label: 'Water Point' },
};

export function FoodWaterPanel() {
  const { t } = useTranslation();
  const available = mockFoodWaterPoints.filter(p => p.available);
  const totalServed = mockFoodWaterPoints.reduce((s, p) => s + p.serves_per_day, 0);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="p-2 border-b border-border bg-card">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-success flex items-center gap-1.5">
          <UtensilsCrossed className="h-3 w-3" /> {t('foodWater.title')}
        </h3>
        <p className="text-[8px] text-muted-foreground mt-0.5">{t('foodWater.subtitle')}</p>
      </div>

      <div className="p-2 grid grid-cols-3 gap-1">
        <div className="bg-muted/30 rounded p-1 text-center">
          <div className="text-[10px] font-bold">{mockFoodWaterPoints.length}</div>
          <div className="text-[7px] text-muted-foreground">{t('foodWater.points')}</div>
        </div>
        <div className="bg-success/10 rounded p-1 text-center">
          <div className="text-[10px] font-bold text-success">{available.length}</div>
          <div className="text-[7px] text-muted-foreground">{t('foodWater.active')}</div>
        </div>
        <div className="bg-primary/10 rounded p-1 text-center">
          <div className="text-[10px] font-bold text-primary">{totalServed.toLocaleString()}</div>
          <div className="text-[7px] text-muted-foreground">{t('foodWater.servedDaily')}</div>
        </div>
      </div>

      <div className="p-2 space-y-1.5">
        {mockFoodWaterPoints.map(point => {
          const cfg = typeConfig[point.type];
          return (
            <div key={point.id} className={cn('border rounded p-2 space-y-0.5', point.available ? 'border-border' : 'border-danger/30 bg-danger/5')}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium flex items-center gap-1">
                  <span className={cfg.color}>{cfg.icon}</span> {point.name}
                </span>
                <span className={cn('text-[7px] font-bold px-1 py-0.5 rounded', point.available ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger')}>
                  {point.available ? t('foodWater.open') : t('foodWater.closedLabel')}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 text-[8px] text-muted-foreground">
                <span className={cn('font-bold uppercase', cfg.color)}>{cfg.label}</span>
                <span>{point.city}</span>
                <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{point.hours}</span>
              </div>
              <p className="text-[8px] text-muted-foreground">{point.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
