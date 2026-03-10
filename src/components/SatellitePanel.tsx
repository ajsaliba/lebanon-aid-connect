import { useState } from 'react';
import { mockSatelliteEvents, type SatelliteEventType } from '@/data/extendedMockData';
import { Satellite, Flame, Wind, Zap, Building, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

const typeIcons: Record<SatelliteEventType, React.ReactNode> = {
  fire: <Flame className="h-3 w-3" />,
  smoke_plume: <Wind className="h-3 w-3" />,
  infrastructure_damage: <Building className="h-3 w-3" />,
  power_outage: <Zap className="h-3 w-3" />,
};

const typeColors: Record<SatelliteEventType, string> = {
  fire: 'text-danger',
  smoke_plume: 'text-muted-foreground',
  infrastructure_damage: 'text-warning',
  power_outage: 'text-info',
};

const typeKeys: Record<SatelliteEventType, string> = {
  fire: 'satellite.fireHeat',
  smoke_plume: 'satellite.smokePlume',
  infrastructure_damage: 'satellite.damage',
  power_outage: 'satellite.powerOut',
};

const confidenceColor = (c: number) => c >= 85 ? 'text-success' : c >= 70 ? 'text-warning' : 'text-muted-foreground';

export function SatellitePanel() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<SatelliteEventType | 'all'>('all');
  const types = Object.keys(typeKeys) as SatelliteEventType[];

  const filtered = filter === 'all' ? mockSatelliteEvents : mockSatelliteEvents.filter(e => e.type === filter);

  const formatTime = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const hrs = Math.floor(diff / 3600000);
    return hrs < 1 ? t('time.justNow') : hrs < 24 ? `${hrs}${t('time.hAgo')}` : `${Math.floor(hrs / 24)}${t('time.dAgo')}`;
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="p-2 border-b border-border bg-card">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
          <Satellite className="h-3 w-3" /> {t('satellite.remoteSensing')}
        </h3>
        <p className="text-[8px] text-muted-foreground mt-0.5">{t('satellite.subtitle')}</p>
      </div>

      {/* Type filter */}
      <div className="p-2 border-b border-border flex items-center gap-1 overflow-x-auto">
        <Filter className="h-3 w-3 text-muted-foreground shrink-0" />
        <button
          onClick={() => setFilter('all')}
          className={cn('px-1.5 py-0.5 text-[9px] rounded border transition-colors whitespace-nowrap',
            filter === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted/50')}
        >{t('common.all')}</button>
        {types.map(tp => (
          <button key={tp} onClick={() => setFilter(tp)}
            className={cn('px-1.5 py-0.5 text-[9px] rounded border transition-colors whitespace-nowrap flex items-center gap-0.5',
              filter === tp ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted/50')}
          >
            {typeIcons[tp]} {t(typeKeys[tp])}
          </button>
        ))}
      </div>

      {/* Summary */}
      <div className="p-2 grid grid-cols-4 gap-1">
        {types.map(tp => {
          const count = mockSatelliteEvents.filter(e => e.type === tp).length;
          return (
            <div key={tp} className="bg-muted/30 rounded p-1 text-center">
              <div className={cn('flex justify-center', typeColors[tp])}>{typeIcons[tp]}</div>
              <div className="text-[10px] font-bold">{count}</div>
            </div>
          );
        })}
      </div>

      {/* Events */}
      <div className="p-2 space-y-1.5 max-h-[300px] overflow-y-auto">
        {filtered.map(event => (
          <div key={event.id} className="border border-border rounded p-2 space-y-1">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-1">
                <span className={typeColors[event.type]}>{typeIcons[event.type]}</span>
                <span className="text-xs font-medium">{event.location}</span>
              </div>
              <span className="text-[8px] text-muted-foreground">{formatTime(event.detected_at)}</span>
            </div>

            <p className="text-[9px] text-muted-foreground">{event.description}</p>

            <div className="flex items-center gap-2 text-[8px]">
              <span className="text-muted-foreground">{t('satellite.source')}: {event.source}</span>
              <span className={confidenceColor(event.confidence)}>
                {t('satellite.confidence')}: {event.confidence}%
              </span>
            </div>

            <div className="text-[8px] text-muted-foreground">
              {event.lat.toFixed(4)}°N, {event.lng.toFixed(4)}°E
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
