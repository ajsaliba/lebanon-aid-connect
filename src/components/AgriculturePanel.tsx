import { useBridgedFarmReports, useBridgedSeedShares } from '@/services/mockBridge';
import { Sprout, Wheat, Leaf, AlertTriangle, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

const statusColor: Record<string, string> = {
  needs_help: 'text-destructive',
  receiving_aid: 'text-warning',
  recovering: 'text-success',
};

const statusLabel: Record<string, string> = {
  needs_help: 'Needs Help',
  receiving_aid: 'Receiving Aid',
  recovering: 'Recovering',
};

export function AgriculturePanel() {
  const { data: mockFarmReports = [], isLoading: isLoadingFarm } = useBridgedFarmReports();
  const { data: mockSeedShares = [], isLoading: isLoadingSeed } = useBridgedSeedShares();
  const { t } = useTranslation();

  if (isLoadingFarm || isLoadingSeed) return <div className="border border-border rounded-lg p-4 text-center text-[9px] text-muted-foreground">Loading...</div>;

  const avgDamage = mockFarmReports.length > 0 ? Math.round(mockFarmReports.reduce((s, f) => s + f.damage_percent, 0) / mockFarmReports.length) : 0;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="p-2 border-b border-border bg-card">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-lime-500 flex items-center gap-1.5">
          <Sprout className="h-3 w-3" /> {t('agriculture.title')}
        </h3>
        <p className="text-[8px] text-muted-foreground mt-0.5">{t('agriculture.subtitle')}</p>
      </div>

      {/* Damage overview */}
      <div className="p-2 grid grid-cols-3 gap-1 border-b border-border">
        <div className="bg-muted/30 rounded p-1 text-center">
          <div className="text-[10px] font-bold text-destructive">{avgDamage}%</div>
          <div className="text-[7px] text-muted-foreground">Avg Damage</div>
        </div>
        <div className="bg-muted/30 rounded p-1 text-center">
          <div className="text-[10px] font-bold text-warning">{mockFarmReports.filter(f => f.status === 'needs_help').length}</div>
          <div className="text-[7px] text-muted-foreground">Need Help</div>
        </div>
        <div className="bg-muted/30 rounded p-1 text-center">
          <div className="text-[10px] font-bold text-success">{mockSeedShares.filter(s => s.available).length}</div>
          <div className="text-[7px] text-muted-foreground">Seeds Avail.</div>
        </div>
      </div>

      {/* Farm reports */}
      <div className="p-2 space-y-1.5 border-b border-border">
        <p className="text-[9px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
          <Wheat className="h-2.5 w-2.5" /> Farm Reports
        </p>
        {mockFarmReports.map(farm => (
          <div key={farm.id} className="border border-border rounded p-1.5 space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium">{farm.farmer_name} — {farm.location}</span>
              <span className={cn('text-[7px] font-bold uppercase', statusColor[farm.status])}>{statusLabel[farm.status]}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[8px] text-muted-foreground">{farm.crop_type}</span>
              <span className={cn('text-[8px] font-bold', farm.damage_percent > 50 ? 'text-destructive' : 'text-warning')}>
                <AlertTriangle className="h-2 w-2 inline" /> {farm.damage_percent}% damaged
              </span>
            </div>
            <div className="flex flex-wrap gap-1 mt-0.5">
              {farm.needs.map(need => (
                <span key={need} className="text-[7px] bg-muted rounded px-1 py-0.5">{need}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Seed sharing */}
      <div className="p-2 space-y-1">
        <p className="text-[9px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
          <Leaf className="h-2.5 w-2.5" /> Seed Sharing
        </p>
        {mockSeedShares.map(seed => (
          <div key={seed.id} className={cn('border rounded p-1.5 flex items-center justify-between',
            seed.available ? 'border-border' : 'border-muted bg-muted/10'
          )}>
            <div>
              <p className="text-[10px] font-medium">{seed.seed_type}</p>
              <div className="text-[8px] text-muted-foreground flex gap-2">
                <span>{seed.provider}</span>
                <span>{seed.quantity}</span>
                <span>{seed.location}</span>
              </div>
            </div>
            <span className={cn('h-2 w-2 rounded-full', seed.available ? 'bg-success' : 'bg-muted-foreground')} />
          </div>
        ))}
      </div>
    </div>
  );
}
