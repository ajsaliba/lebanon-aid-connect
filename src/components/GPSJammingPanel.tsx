import { useState } from 'react';
import { mockGPSJammingZones } from '@/data/worldMonitorMockData';
import { Radio, AlertTriangle, Wifi, Signal } from 'lucide-react';
import { cn } from '@/lib/utils';

const intensityConfig = {
  low: { color: 'text-warning', bg: 'bg-warning/20', label: 'LOW' },
  moderate: { color: 'text-orange-400', bg: 'bg-orange-400/20', label: 'MODERATE' },
  severe: { color: 'text-danger', bg: 'bg-danger/20', label: 'SEVERE' },
};

export function GPSJammingPanel() {
  const [showInactive, setShowInactive] = useState(false);

  const zones = showInactive
    ? mockGPSJammingZones
    : mockGPSJammingZones.filter(z => z.active);

  const activeCount = mockGPSJammingZones.filter(z => z.active).length;
  const severeCount = mockGPSJammingZones.filter(z => z.active && z.intensity === 'severe').length;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="p-2 border-b border-border bg-card">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
          <Radio className="h-3 w-3" /> GPS Jamming Detection
        </h3>
        <p className="text-[8px] text-muted-foreground mt-0.5">Real-time GNSS interference monitoring</p>
      </div>

      {/* Stats */}
      <div className="p-2 grid grid-cols-3 gap-1">
        <div className="bg-muted/30 rounded p-1 text-center">
          <div className="text-[10px] font-bold">{mockGPSJammingZones.length}</div>
          <div className="text-[7px] text-muted-foreground">Zones</div>
        </div>
        <div className="bg-danger/10 rounded p-1 text-center">
          <div className="text-[10px] font-bold text-danger">{activeCount}</div>
          <div className="text-[7px] text-muted-foreground">Active</div>
        </div>
        <div className="bg-danger/20 rounded p-1 text-center">
          <div className="text-[10px] font-bold text-danger">{severeCount}</div>
          <div className="text-[7px] text-muted-foreground">Severe</div>
        </div>
      </div>

      <div className="px-2 pb-1">
        <button
          onClick={() => setShowInactive(!showInactive)}
          className="text-[8px] text-muted-foreground hover:text-foreground transition-colors"
        >
          {showInactive ? 'Hide inactive' : 'Show inactive zones'}
        </button>
      </div>

      {/* Zones */}
      <div className="p-2 space-y-1.5 max-h-[350px] overflow-y-auto">
        {zones.map(zone => {
          const cfg = intensityConfig[zone.intensity];
          return (
            <div key={zone.id} className={cn('border border-border rounded p-2 space-y-1', !zone.active && 'opacity-50')}>
              <div className="flex items-start justify-between gap-1">
                <div className="flex items-center gap-1">
                  <Signal className={cn('h-3 w-3', cfg.color)} />
                  <span className="text-xs font-medium">{zone.region}</span>
                  {zone.active && <span className="h-1.5 w-1.5 rounded-full bg-danger animate-pulse" />}
                </div>
                <span className={cn('text-[8px] px-1 py-0 rounded font-bold', cfg.bg, cfg.color)}>
                  {cfg.label}
                </span>
              </div>

              <div className="text-[9px] text-muted-foreground">{zone.source}</div>

              <div className="flex flex-wrap gap-0.5">
                {zone.affected_systems.map(sys => (
                  <span key={sys} className="text-[7px] px-1 py-0 bg-muted rounded">{sys}</span>
                ))}
              </div>

              <div className="flex items-center justify-between text-[8px] text-muted-foreground">
                <span className="flex items-center gap-0.5">
                  <Wifi className="h-2.5 w-2.5" /> {zone.radius_km}km radius
                </span>
                <span>{new Date(zone.last_detected).toLocaleDateString()}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
