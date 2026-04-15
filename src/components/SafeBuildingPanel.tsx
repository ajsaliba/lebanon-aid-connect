import { useBridgedSafeBuildings } from '@/services/mockBridge';
import { Building2, ShieldCheck, ArrowDown, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

const ratingColors = ['', 'text-danger', 'text-warning', 'text-yellow-500', 'text-success', 'text-primary'];

export function SafeBuildingPanel() {
  const { data: mockSafeBuildings = [], isLoading } = useBridgedSafeBuildings();
  const { t } = useTranslation();

  if (isLoading) return <div className="border border-border rounded-lg p-4 text-center text-[9px] text-muted-foreground">Loading...</div>;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="p-2 border-b border-border bg-card">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
          <Building2 className="h-3 w-3" /> {t('safeBuilding.title')}
        </h3>
        <p className="text-[8px] text-muted-foreground mt-0.5">{t('safeBuilding.subtitle')}</p>
      </div>

      <div className="p-2 grid grid-cols-3 gap-1">
        <div className="bg-muted/30 rounded p-1 text-center">
          <div className="text-[10px] font-bold">{mockSafeBuildings.length}</div>
          <div className="text-[7px] text-muted-foreground">{t('safeBuilding.buildings')}</div>
        </div>
        <div className="bg-success/10 rounded p-1 text-center">
          <div className="text-[10px] font-bold text-success">{mockSafeBuildings.filter(b => b.has_basement).length}</div>
          <div className="text-[7px] text-muted-foreground">{t('safeBuilding.withBasement')}</div>
        </div>
        <div className="bg-primary/10 rounded p-1 text-center">
          <div className="text-[10px] font-bold text-primary">{mockSafeBuildings.reduce((s, b) => s + b.capacity, 0)}</div>
          <div className="text-[7px] text-muted-foreground">{t('safeBuilding.totalCapacity')}</div>
        </div>
      </div>

      <div className="p-2 space-y-1.5">
        {mockSafeBuildings.map(b => (
          <div key={b.id} className="border border-border rounded p-2 space-y-1 hover:bg-muted/20 transition-colors">
            <div className="flex items-start justify-between gap-1">
              <div className="flex items-center gap-1">
                <Building2 className="h-3 w-3 text-primary" />
                <span className="text-xs font-medium">{b.name}</span>
              </div>
              <span className={cn('text-[8px] font-bold', ratingColors[b.safety_rating])}>
                {'★'.repeat(b.safety_rating)}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[8px] text-muted-foreground">
              <span>{b.city}</span>
              {b.has_basement && <span className="flex items-center gap-0.5 text-success"><ArrowDown className="h-2.5 w-2.5" />{t('safeBuilding.basement')}</span>}
              {b.reinforced && <span className="flex items-center gap-0.5 text-primary"><ShieldCheck className="h-2.5 w-2.5" />{t('safeBuilding.reinforced')}</span>}
              <span className="flex items-center gap-0.5"><Users className="h-2.5 w-2.5" />{b.capacity}</span>
            </div>
            <p className="text-[8px] text-muted-foreground">{b.notes}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
