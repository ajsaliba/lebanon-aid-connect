import { useState, useMemo } from 'react';
import { useBridgedLogistics } from '@/services/mockBridge';
import type { LogisticsItem, LogisticsType } from '@/data/extendedMockData';
import { useGeolocation, distanceKm } from '@/hooks/useGeolocation';
import {
  Warehouse, Truck, Package, MapPin, Clock, CheckCircle2,
  AlertTriangle, Search, Navigation
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getDirectionsUrl } from '@/hooks/useGeolocation';
import { useTranslation } from '@/lib/i18n';

const typeIcons: Record<LogisticsType, typeof Warehouse> = {
  warehouse: Warehouse,
  shipment: Truck,
  distribution_center: Package,
};

const statusKeys: Record<string, string> = {
  active: 'logistics.active',
  preparing: 'logistics.preparing',
  in_transit: 'logistics.inTransit',
  delivered: 'logistics.delivered',
  delayed: 'logistics.delayed',
};

const statusConfig: Record<string, { color: string; icon: typeof CheckCircle2 }> = {
  active: { color: 'text-success', icon: CheckCircle2 },
  preparing: { color: 'text-info', icon: Clock },
  in_transit: { color: 'text-warning', icon: Truck },
  delivered: { color: 'text-success', icon: CheckCircle2 },
  delayed: { color: 'text-danger', icon: AlertTriangle },
};

export function LogisticsPanel() {
  const { t } = useTranslation();
  const { data: mockLogistics = [], isLoading } = useBridgedLogistics();
  const { position } = useGeolocation();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<LogisticsType | 'all'>('all');

  const items = useMemo(() => {
    let filtered = mockLogistics;
    if (typeFilter !== 'all') filtered = filtered.filter(l => l.type === typeFilter);
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(l =>
        l.name.toLowerCase().includes(q) ||
        l.location.toLowerCase().includes(q) ||
        l.items?.some(i => i.toLowerCase().includes(q))
      );
    }
    if (position) {
      filtered = [...filtered].sort((a, b) =>
        distanceKm(position.lat, position.lng, a.lat, a.lng) -
        distanceKm(position.lat, position.lng, b.lat, b.lng)
      );
    }
    return filtered;
  }, [mockLogistics, search, typeFilter, position]);

  const counts = useMemo(() => ({
    warehouses: mockLogistics.filter(l => l.type === 'warehouse').length,
    shipments: mockLogistics.filter(l => l.type === 'shipment').length,
    centers: mockLogistics.filter(l => l.type === 'distribution_center').length,
  }), [mockLogistics]);

  if (isLoading) return <div className="border border-border rounded-lg p-4 text-center text-[9px] text-muted-foreground">Loading...</div>;

  return (
    <div className="p-3 space-y-3">
      <h2 className="text-xs font-sans font-bold uppercase tracking-wider text-primary flex items-center gap-2">
        <Truck className="h-3 w-3" /> {t('logistics.title')}
      </h2>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-1.5">
        <button
          onClick={() => setTypeFilter(typeFilter === 'warehouse' ? 'all' : 'warehouse')}
          className={cn('rounded p-1.5 text-center border transition-colors',
            typeFilter === 'warehouse' ? 'border-primary/30 bg-primary/10' : 'border-border'
          )}
        >
          <Warehouse className="h-3 w-3 mx-auto text-primary mb-0.5" />
          <div className="text-sm font-bold">{counts.warehouses}</div>
          <div className="text-[8px] text-muted-foreground">{t('logistics.warehouses')}</div>
        </button>
        <button
          onClick={() => setTypeFilter(typeFilter === 'shipment' ? 'all' : 'shipment')}
          className={cn('rounded p-1.5 text-center border transition-colors',
            typeFilter === 'shipment' ? 'border-primary/30 bg-primary/10' : 'border-border'
          )}
        >
          <Truck className="h-3 w-3 mx-auto text-warning mb-0.5" />
          <div className="text-sm font-bold">{counts.shipments}</div>
          <div className="text-[8px] text-muted-foreground">{t('logistics.inTransit')}</div>
        </button>
        <button
          onClick={() => setTypeFilter(typeFilter === 'distribution_center' ? 'all' : 'distribution_center')}
          className={cn('rounded p-1.5 text-center border transition-colors',
            typeFilter === 'distribution_center' ? 'border-primary/30 bg-primary/10' : 'border-border'
          )}
        >
          <Package className="h-3 w-3 mx-auto text-success mb-0.5" />
          <div className="text-sm font-bold">{counts.centers}</div>
          <div className="text-[8px] text-muted-foreground">{t('logistics.centers')}</div>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
        <Input
          placeholder={t('logistics.searchPlaceholder')}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-7 h-7 text-xs"
        />
      </div>

      {/* Items */}
      <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
        {items.map(item => {
          const Icon = typeIcons[item.type];
          const config = statusConfig[item.status] || statusConfig.active;
          const StatusIcon = config.icon;
          const dist = position ? distanceKm(position.lat, position.lng, item.lat, item.lng).toFixed(1) : null;

          return (
            <div key={item.id} className="border border-border rounded p-2 space-y-1">
              <div className="flex items-start justify-between gap-1">
                <div className="flex items-center gap-1.5">
                  <Icon className="h-3 w-3 text-primary" />
                  <span className="text-xs font-medium">{item.name}</span>
                </div>
                <Badge variant="outline" className={cn('text-[8px] px-1 py-0 flex items-center gap-0.5', config.color)}>
                  <StatusIcon className="h-2 w-2" /> {t(statusKeys[item.status] || item.status)}
                </Badge>
              </div>

              <div className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                <MapPin className="h-2.5 w-2.5" /> {item.location}
                {dist && <span className="text-primary">({dist} km)</span>}
              </div>

              {item.capacity && (
                <div className="text-[9px] text-muted-foreground">
                  {t('logistics.capacity')}: {item.capacity}
                </div>
              )}

              {item.items && item.items.length > 0 && (
                <div className="flex gap-0.5 flex-wrap">
                  {item.items.map(i => (
                    <span key={i} className="text-[8px] px-1 py-0 bg-muted rounded">{i}</span>
                  ))}
                </div>
              )}

              {item.eta && (
                <div className="text-[9px] flex items-center gap-0.5">
                  <Clock className="h-2.5 w-2.5 text-warning" />
                  <span className="text-muted-foreground">{t('logistics.eta')}: {new Date(item.eta).toLocaleString()}</span>
                </div>
              )}

              <a
                href={getDirectionsUrl(item.lat, item.lng)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-[9px] text-primary hover:underline"
              >
                <Navigation className="h-2.5 w-2.5" /> {t('logistics.navigate')}
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
