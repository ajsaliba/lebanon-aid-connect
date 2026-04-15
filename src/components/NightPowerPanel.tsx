import { useBridgedNightPowerGrid } from '@/services/mockBridge';
import { Moon, TrendingDown, TrendingUp, Minus, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

const statusColor: Record<string, string> = {
  blackout: 'text-destructive',
  partial: 'text-warning',
  normal: 'text-success',
};

const statusBg: Record<string, string> = {
  blackout: 'bg-destructive/10 border-destructive/30',
  partial: 'bg-warning/10 border-warning/30',
  normal: 'bg-success/10 border-success/30',
};

export function NightPowerPanel() {
  const { data: mockNightPowerRegions = [], isLoading } = useBridgedNightPowerGrid();
  const { t } = useTranslation();
  const blackoutPop = mockNightPowerRegions.filter(r => r.status === 'blackout').reduce((sum, r) => sum + r.estimated_population, 0);
  const totalPop = mockNightPowerRegions.reduce((sum, r) => sum + r.estimated_population, 0);

  if (isLoading) return <div className="border border-border rounded-lg p-4 text-center text-[9px] text-muted-foreground">Loading...</div>;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="p-2 border-b border-border bg-card">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
          <Moon className="h-3 w-3" /> {t('nightPower.title')}
        </h3>
        <p className="text-[8px] text-muted-foreground mt-0.5">{t('nightPower.subtitle')}</p>
      </div>

      {/* Summary */}
      <div className="p-2 grid grid-cols-3 gap-1 border-b border-border">
        <div className="bg-destructive/10 rounded p-1 text-center">
          <div className="text-[10px] font-bold text-destructive">{mockNightPowerRegions.filter(r => r.status === 'blackout').length}</div>
          <div className="text-[7px] text-muted-foreground">Blackout</div>
        </div>
        <div className="bg-warning/10 rounded p-1 text-center">
          <div className="text-[10px] font-bold text-warning">{mockNightPowerRegions.filter(r => r.status === 'partial').length}</div>
          <div className="text-[7px] text-muted-foreground">Partial</div>
        </div>
        <div className="bg-success/10 rounded p-1 text-center">
          <div className="text-[10px] font-bold text-success">{mockNightPowerRegions.filter(r => r.status === 'normal').length}</div>
          <div className="text-[7px] text-muted-foreground">Normal</div>
        </div>
      </div>

      <div className="p-2 flex items-center gap-1.5 text-[9px] border-b border-border">
        <Users className="h-3 w-3 text-destructive" />
        <span className="text-muted-foreground">~{(blackoutPop / 1000).toFixed(0)}k / {(totalPop / 1000).toFixed(0)}k people in blackout zones</span>
      </div>

      <div className="p-2 space-y-1.5">
        {mockNightPowerRegions.map(region => (
          <div key={region.id} className={cn('border rounded p-2', statusBg[region.status])}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">{region.region}</span>
              <span className={cn('text-[8px] font-bold uppercase', statusColor[region.status])}>{region.status}</span>
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              {/* Light index bar */}
              <div className="flex-1">
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full', region.light_index > 60 ? 'bg-success' : region.light_index > 25 ? 'bg-warning' : 'bg-destructive')}
                    style={{ width: `${region.light_index}%` }}
                  />
                </div>
              </div>
              <span className="text-[9px] font-mono font-bold w-7 text-right">{region.light_index}%</span>
              <span className={cn('text-[8px] flex items-center gap-0.5', region.change_24h < 0 ? 'text-destructive' : region.change_24h > 0 ? 'text-success' : 'text-muted-foreground')}>
                {region.change_24h < 0 ? <TrendingDown className="h-2.5 w-2.5" /> : region.change_24h > 0 ? <TrendingUp className="h-2.5 w-2.5" /> : <Minus className="h-2.5 w-2.5" />}
                {region.change_24h > 0 ? '+' : ''}{region.change_24h}%
              </span>
            </div>
            <div className="text-[8px] text-muted-foreground mt-0.5">~{(region.estimated_population / 1000).toFixed(0)}k population</div>
          </div>
        ))}
      </div>
    </div>
  );
}
