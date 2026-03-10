import { useState } from 'react';
import { mockProtestEvents, type ProtestType } from '@/data/worldMonitorMockData';
import { Megaphone, MapPin, Users, Filter, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const typeConfig: Record<ProtestType, { color: string; bg: string; label: string }> = {
  peaceful: { color: 'text-success', bg: 'bg-success/20', label: 'Peaceful' },
  violent: { color: 'text-danger', bg: 'bg-danger/20', label: 'Violent' },
  riot: { color: 'text-danger', bg: 'bg-danger/30', label: 'Riot' },
  strike: { color: 'text-warning', bg: 'bg-warning/20', label: 'Strike' },
};

const scaleLabels = { small: '< 1K', medium: '1-10K', large: '10-50K', mass: '50K+' };

export function ProtestsPanel() {
  const [typeFilter, setTypeFilter] = useState<ProtestType | 'all'>('all');
  const types: ProtestType[] = ['peaceful', 'violent', 'riot', 'strike'];

  const filtered = typeFilter === 'all'
    ? mockProtestEvents
    : mockProtestEvents.filter(p => p.type === typeFilter);

  const ongoingCount = mockProtestEvents.filter(p => p.ongoing).length;
  const totalParticipants = mockProtestEvents.reduce((s, p) => s + p.participants_est, 0);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="p-2 border-b border-border bg-card">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
          <Megaphone className="h-3 w-3" /> Protests & Civil Unrest
        </h3>
        <p className="text-[8px] text-muted-foreground mt-0.5">ACLED-style civil unrest tracking</p>
      </div>

      {/* Stats */}
      <div className="p-2 grid grid-cols-3 gap-1">
        <div className="bg-muted/30 rounded p-1 text-center">
          <div className="text-[10px] font-bold">{mockProtestEvents.length}</div>
          <div className="text-[7px] text-muted-foreground">Events</div>
        </div>
        <div className="bg-success/10 rounded p-1 text-center">
          <div className="text-[10px] font-bold text-success">{ongoingCount}</div>
          <div className="text-[7px] text-muted-foreground">Ongoing</div>
        </div>
        <div className="bg-muted/30 rounded p-1 text-center">
          <div className="text-[10px] font-bold">{(totalParticipants / 1000).toFixed(0)}K</div>
          <div className="text-[7px] text-muted-foreground">Participants</div>
        </div>
      </div>

      {/* Filter */}
      <div className="px-2 pb-1">
        <div className="flex items-center gap-1 flex-wrap">
          <Filter className="h-3 w-3 text-muted-foreground" />
          <button onClick={() => setTypeFilter('all')}
            className={cn('px-1.5 py-0.5 text-[9px] rounded border transition-colors',
              typeFilter === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted/50')}>All</button>
          {types.map(tp => (
            <button key={tp} onClick={() => setTypeFilter(tp)}
              className={cn('px-1.5 py-0.5 text-[9px] rounded border transition-colors',
                typeFilter === tp ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted/50')}>
              {typeConfig[tp].label}
            </button>
          ))}
        </div>
      </div>

      {/* Events */}
      <div className="p-2 space-y-1.5 max-h-[400px] overflow-y-auto">
        {filtered.map(event => {
          const cfg = typeConfig[event.type];
          return (
            <div key={event.id} className="border border-border rounded p-2 space-y-1">
              <div className="flex items-start justify-between gap-1">
                <div className="flex items-center gap-1">
                  {event.ongoing && <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />}
                  <span className="text-xs font-medium">{event.title}</span>
                </div>
                <span className={cn('text-[8px] px-1 py-0 rounded font-bold', cfg.bg, cfg.color)}>
                  {cfg.label}
                </span>
              </div>

              <div className="text-[9px] text-muted-foreground">{event.cause}</div>

              <div className="flex items-center justify-between text-[8px]">
                <span className="flex items-center gap-0.5 text-muted-foreground">
                  <MapPin className="h-2.5 w-2.5" /> {event.location}
                </span>
                <span className="flex items-center gap-0.5 text-muted-foreground">
                  <Users className="h-2.5 w-2.5" /> ~{(event.participants_est / 1000).toFixed(0)}K
                </span>
              </div>

              <div className="flex items-center justify-between text-[8px] text-muted-foreground">
                <span>{event.country} · {event.source}</span>
                {event.fatalities > 0 && (
                  <span className="flex items-center gap-0.5 text-danger">
                    <AlertTriangle className="h-2.5 w-2.5" /> {event.fatalities} fatalities
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
