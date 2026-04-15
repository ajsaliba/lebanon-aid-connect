import { useAirportStatuses } from '@/services/infrastructureService';
import { FeedHealthBadge } from '@/components/FeedHealthBadge';
import type { AirportStatus } from '@/services/types';
import { Plane, Navigation, Clock, CheckCircle2, AlertTriangle, XCircle, PauseCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

type OpStatus = AirportStatus['operationalStatus'];

const statusColors: Record<OpStatus, string> = {
  normal: 'bg-success/20 text-success',
  delays: 'bg-warning/20 text-warning',
  ground_stop: 'bg-danger/20 text-danger',
  closed: 'bg-danger/20 text-danger',
};

const statusIcons: Record<OpStatus, React.ReactNode> = {
  normal: <CheckCircle2 className="h-2.5 w-2.5" />,
  delays: <AlertTriangle className="h-2.5 w-2.5" />,
  ground_stop: <PauseCircle className="h-2.5 w-2.5" />,
  closed: <XCircle className="h-2.5 w-2.5" />,
};

const statusLabel: Record<OpStatus, string> = {
  normal: 'NORMAL',
  delays: 'DELAYS',
  ground_stop: 'GROUND STOP',
  closed: 'CLOSED',
};

export function TransportPanel() {
  const { t } = useTranslation();
  const { data: airports = [], isLoading } = useAirportStatuses();

  if (isLoading) return <div className="border border-border rounded-lg p-4 text-center text-[9px] text-muted-foreground">Loading...</div>;

  const normal = airports.filter(a => a.operationalStatus === 'normal').length;
  const delayed = airports.filter(a => a.operationalStatus === 'delays').length;
  const disrupted = airports.filter(a => a.operationalStatus === 'ground_stop' || a.operationalStatus === 'closed').length;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="p-2 border-b border-border bg-card">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-info flex items-center gap-1.5">
          <Navigation className="h-3 w-3" /> {t('transport.title')}
          <FeedHealthBadge feedName="aviation" />
        </h3>
      </div>

      {/* Summary */}
      <div className="p-2 grid grid-cols-3 gap-1">
        <div className="bg-success/10 rounded p-1 text-center">
          <div className="text-[10px] font-bold text-success">{normal}</div>
          <div className="text-[7px] text-muted-foreground">Normal</div>
        </div>
        <div className="bg-warning/10 rounded p-1 text-center">
          <div className="text-[10px] font-bold text-warning">{delayed}</div>
          <div className="text-[7px] text-muted-foreground">Delays</div>
        </div>
        <div className="bg-danger/10 rounded p-1 text-center">
          <div className="text-[10px] font-bold text-danger">{disrupted}</div>
          <div className="text-[7px] text-muted-foreground">Disrupted</div>
        </div>
      </div>

      <div className="p-2 space-y-1.5">
        {airports.map(airport => (
          <div key={airport.icao} className={cn(
            'border rounded p-2 space-y-0.5',
            airport.operationalStatus === 'closed' || airport.operationalStatus === 'ground_stop'
              ? 'border-danger/30 bg-danger/5'
              : airport.operationalStatus === 'delays'
                ? 'border-warning/30 bg-warning/5'
                : 'border-border'
          )}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium flex items-center gap-1">
                <Plane className="h-3 w-3 text-primary" />
                {airport.name}
              </span>
              <span className={cn('text-[7px] font-bold px-1 py-0.5 rounded uppercase flex items-center gap-0.5', statusColors[airport.operationalStatus])}>
                {statusIcons[airport.operationalStatus]}
                {statusLabel[airport.operationalStatus]}
              </span>
            </div>
            <div className="flex gap-2 text-[8px] text-muted-foreground">
              <span className="font-bold text-info">{airport.iata}/{airport.icao}</span>
              <span>{airport.country}</span>
              {airport.avgDelayMinutes > 0 && (
                <span className="flex items-center gap-0.5 text-warning">
                  <Clock className="h-2.5 w-2.5" /> {airport.avgDelayMinutes}min avg delay
                </span>
              )}
            </div>
            {airport.closureReason && (
              <p className="text-[8px] text-danger">{airport.closureReason}</p>
            )}
            <div className="text-[8px] text-muted-foreground">
              📡 {airport.source} · Updated {new Date(airport.updatedAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
