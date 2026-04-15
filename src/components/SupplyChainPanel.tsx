import { useBridgedSupplyChain, useBridgedLastMileDelivery } from '@/services/mockBridge';
import type { SupplyCategory } from '@/data/newFeaturesMockData2';
import { PackageOpen, Truck, Circle, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

const categoryColor: Record<SupplyCategory, string> = {
  food: 'text-green-400',
  medical: 'text-red-400',
  fuel: 'text-orange-400',
  water: 'text-blue-400',
  equipment: 'text-purple-400',
};

const categoryLabel: Record<SupplyCategory, string> = {
  food: '🍞 Food',
  medical: '💊 Medical',
  fuel: '⛽ Fuel',
  water: '💧 Water',
  equipment: '🔧 Equipment',
};

const deliveryStatusIcon: Record<string, React.ReactNode> = {
  pending: <Clock className="h-3 w-3 text-muted-foreground" />,
  in_transit: <Truck className="h-3 w-3 text-primary" />,
  delivered: <CheckCircle2 className="h-3 w-3 text-success" />,
  blocked: <XCircle className="h-3 w-3 text-destructive" />,
};

const urgencyColor: Record<string, string> = {
  critical: 'text-destructive',
  high: 'text-warning',
  normal: 'text-muted-foreground',
};

export function SupplyChainPanel() {
  const { t } = useTranslation();
  const { data: mockCommunitySupplies = [], isLoading: isLoadingSupplies } = useBridgedSupplyChain();
  const { data: mockLastMileDeliveries = [], isLoading: isLoadingDeliveries } = useBridgedLastMileDelivery();
  const available = mockCommunitySupplies.filter(s => s.available).length;

  if (isLoadingSupplies || isLoadingDeliveries) return <div className="border border-border rounded-lg p-4 text-center text-[9px] text-muted-foreground">Loading...</div>;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="p-2 border-b border-border bg-card">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-green-400 flex items-center gap-1.5">
          <PackageOpen className="h-3 w-3" /> {t('supplyChain.title')}
        </h3>
        <p className="text-[8px] text-muted-foreground mt-0.5">{t('supplyChain.subtitle')}</p>
      </div>

      {/* Community supplies */}
      <div className="p-2 border-b border-border">
        <p className="text-[9px] font-semibold text-muted-foreground uppercase mb-1">
          Shared Supplies — {available}/{mockCommunitySupplies.length} available
        </p>
        <div className="space-y-1">
          {mockCommunitySupplies.map(s => (
            <div key={s.id} className={cn('border rounded p-1.5 flex items-center justify-between', s.available ? 'border-border' : 'border-muted bg-muted/10')}>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className={cn('text-[10px] font-medium', categoryColor[s.category])}>{categoryLabel[s.category]}</span>
                  {!s.available && <span className="text-[7px] text-destructive font-bold">TAKEN</span>}
                </div>
                <p className="text-[10px] font-medium truncate">{s.item}</p>
                <div className="text-[8px] text-muted-foreground">{s.neighborhood}, {s.city} · {s.shared_by}</div>
              </div>
              <div className="flex items-center gap-0.5">
                <Circle className={cn('h-2 w-2', s.available ? 'text-success fill-success' : 'text-muted-foreground fill-muted-foreground')} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Last mile deliveries */}
      <div className="p-2">
        <p className="text-[9px] font-semibold text-muted-foreground uppercase mb-1 flex items-center gap-1">
          <Truck className="h-2.5 w-2.5" /> Last-Mile Deliveries
        </p>
        <div className="space-y-1">
          {mockLastMileDeliveries.map(d => (
            <div key={d.id} className="border border-border rounded p-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium flex items-center gap-1">
                  {deliveryStatusIcon[d.status]}
                  {d.from} → {d.to}
                </span>
                <span className={cn('text-[7px] font-bold uppercase', urgencyColor[d.urgency])}>{d.urgency}</span>
              </div>
              <div className="text-[8px] text-muted-foreground">
                {d.items} · {d.driver} {d.eta_minutes > 0 ? `· ETA ${d.eta_minutes}m` : ''}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
