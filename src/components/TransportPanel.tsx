import { useState } from 'react';
import { mockCarpoolRides, mockBorderCrossings, mockCheckpoints } from '@/data/newFeaturesMockData';
import { Car, Globe, ShieldAlert, MapPin, Clock, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

type TransportView = 'carpool' | 'borders' | 'checkpoints';

const statusColors: Record<string, string> = {
  open: 'bg-success/20 text-success',
  restricted: 'bg-warning/20 text-warning',
  closed: 'bg-danger/20 text-danger',
  available: 'bg-success/20 text-success',
  full: 'bg-warning/20 text-warning',
  departed: 'bg-muted text-muted-foreground',
  passable: 'bg-success/20 text-success',
  delayed: 'bg-warning/20 text-warning',
  blocked: 'bg-danger/20 text-danger',
};

export function TransportPanel() {
  const { t } = useTranslation();
  const [view, setView] = useState<TransportView>('carpool');

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="p-2 border-b border-border bg-card">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-info flex items-center gap-1.5">
          <Navigation className="h-3 w-3" /> {t('transport.title')}
        </h3>
      </div>

      <div className="flex border-b border-border">
        {([
          { id: 'carpool' as const, label: t('transport.carpool'), icon: Car },
          { id: 'borders' as const, label: t('transport.borders'), icon: Globe },
          { id: 'checkpoints' as const, label: t('transport.checkpoints'), icon: ShieldAlert },
        ]).map(tab => (
          <button key={tab.id} onClick={() => setView(tab.id)}
            className={cn('flex-1 flex items-center justify-center gap-1 py-1.5 text-[8px] uppercase',
              view === tab.id ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground'
            )}>
            <tab.icon className="h-3 w-3" /> {tab.label}
          </button>
        ))}
      </div>

      <div className="p-2 space-y-1.5">
        {view === 'carpool' && mockCarpoolRides.map(ride => (
          <div key={ride.id} className={cn('border rounded p-2 space-y-0.5', ride.status === 'available' ? 'border-border' : 'border-muted bg-muted/10')}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">{ride.driver_name}</span>
              <span className={cn('text-[7px] font-bold px-1 py-0.5 rounded uppercase', statusColors[ride.status])}>{ride.status}</span>
            </div>
            <div className="text-[9px] flex items-center gap-1">
              <MapPin className="h-2.5 w-2.5 text-success" /> {ride.from_location} → {ride.to_location}
            </div>
            <div className="flex gap-2 text-[8px] text-muted-foreground">
              <span>🚗 {ride.vehicle_type}</span>
              <span>💺 {ride.seats_available} seats</span>
              <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{new Date(ride.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            {ride.status === 'available' && <div className="text-[8px] text-primary">{ride.phone}</div>}
          </div>
        ))}

        {view === 'borders' && mockBorderCrossings.map(bc => (
          <div key={bc.id} className="border border-border rounded p-2 space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">{bc.name}</span>
              <span className={cn('text-[7px] font-bold px-1 py-0.5 rounded uppercase', statusColors[bc.status])}>{bc.status}</span>
            </div>
            <div className="flex gap-2 text-[8px] text-muted-foreground">
              <span>🌍 {bc.country}</span>
              {bc.wait_time_minutes > 0 && <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{bc.wait_time_minutes}min</span>}
            </div>
            <p className="text-[8px] text-muted-foreground">{bc.notes}</p>
          </div>
        ))}

        {view === 'checkpoints' && mockCheckpoints.map(ck => (
          <div key={ck.id} className={cn('border rounded p-2 space-y-0.5',
            ck.severity === 'blocked' ? 'border-danger/30 bg-danger/5' : ck.severity === 'delayed' ? 'border-warning/30 bg-warning/5' : 'border-border'
          )}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">{ck.location}</span>
              <span className={cn('text-[7px] font-bold px-1 py-0.5 rounded uppercase', statusColors[ck.severity])}>{ck.severity}</span>
            </div>
            <div className="text-[8px] text-muted-foreground flex items-center gap-1">
              <span className={cn('uppercase font-bold', ck.type === 'military' ? 'text-danger' : ck.type === 'blocked_road' ? 'text-warning' : 'text-info')}>{ck.type.replace('_', ' ')}</span>
            </div>
            <p className="text-[8px] text-muted-foreground">{ck.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
