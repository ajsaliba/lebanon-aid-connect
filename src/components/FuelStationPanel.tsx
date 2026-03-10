import { mockFuelStations, mockSafeParking } from '@/data/newFeaturesMockData';
import { Fuel, ParkingCircle, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

export function FuelStationPanel() {
  const { t } = useTranslation();
  const available = mockFuelStations.filter(f => f.available);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="p-2 border-b border-border bg-card">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-warning flex items-center gap-1.5">
          <Fuel className="h-3 w-3" /> {t('fuel.title')}
        </h3>
        <p className="text-[8px] text-muted-foreground mt-0.5">{t('fuel.subtitle')}</p>
      </div>

      <div className="p-2 grid grid-cols-3 gap-1">
        <div className="bg-muted/30 rounded p-1 text-center">
          <div className="text-[10px] font-bold">{mockFuelStations.length}</div>
          <div className="text-[7px] text-muted-foreground">{t('fuel.stations')}</div>
        </div>
        <div className="bg-success/10 rounded p-1 text-center">
          <div className="text-[10px] font-bold text-success">{available.length}</div>
          <div className="text-[7px] text-muted-foreground">{t('fuel.available')}</div>
        </div>
        <div className="bg-danger/10 rounded p-1 text-center">
          <div className="text-[10px] font-bold text-danger">{mockFuelStations.length - available.length}</div>
          <div className="text-[7px] text-muted-foreground">{t('fuel.closed')}</div>
        </div>
      </div>

      <div className="p-2 space-y-1.5">
        {mockFuelStations.map(s => (
          <div key={s.id} className={cn('border rounded p-2 space-y-0.5 text-[9px]', s.available ? 'border-border' : 'border-danger/30 bg-danger/5')}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium flex items-center gap-1">
                <Fuel className="h-3 w-3 text-warning" /> {s.name}
              </span>
              <span className={cn('text-[8px] font-bold px-1 py-0.5 rounded', s.available ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger')}>
                {s.available ? t('fuel.open') : t('fuel.closedLabel')}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 text-muted-foreground text-[8px]">
              <span>{s.city}</span>
              <span className="uppercase">{s.fuel_type === 'both' ? '⛽ Gas+Diesel' : s.fuel_type}</span>
              {s.available && <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{s.queue_length}min wait</span>}
              {s.available && <span>${s.price_usd}/L</span>}
            </div>
            <div className="text-[7px] text-muted-foreground">{s.operating_hours}</div>
          </div>
        ))}
      </div>

      {/* Safe Parking Section */}
      <div className="p-2 border-t border-border">
        <h4 className="text-[9px] font-bold uppercase tracking-wider text-info flex items-center gap-1 mb-1.5">
          <ParkingCircle className="h-3 w-3" /> {t('fuel.safeParking')}
        </h4>
        <div className="space-y-1">
          {mockSafeParking.map(p => (
            <div key={p.id} className="border border-border rounded p-1.5 text-[8px] flex items-center justify-between">
              <div>
                <span className="font-medium text-[9px]">{p.name}</span>
                <span className="text-muted-foreground ml-1">{p.city}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-success font-bold">{p.available_spots}/{p.capacity}</span>
                {p.covered && <span>🏠</span>}
                {p.guarded && <span>🛡️</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
