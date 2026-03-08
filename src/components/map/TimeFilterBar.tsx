import { useMap } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Clock, Globe } from 'lucide-react';

const TIME_RANGES = [
  { id: '1h', label: '1H' },
  { id: '6h', label: '6H' },
  { id: '24h', label: '24H' },
  { id: '48h', label: '48H' },
  { id: '7d', label: '7D' },
  { id: 'all', label: 'ALL' },
] as const;

const REGION_PRESETS = [
  { id: 'global', label: 'Global', center: [30, 45] as [number, number], zoom: 3 },
  { id: 'americas', label: 'Americas', center: [20, -80] as [number, number], zoom: 3 },
  { id: 'mena', label: 'MENA', center: [30, 42] as [number, number], zoom: 5 },
  { id: 'europe', label: 'Europe', center: [50, 15] as [number, number], zoom: 4 },
  { id: 'asia', label: 'Asia', center: [35, 100] as [number, number], zoom: 3 },
  { id: 'latam', label: 'Latin America', center: [-10, -60] as [number, number], zoom: 3 },
  { id: 'africa', label: 'Africa', center: [5, 20] as [number, number], zoom: 3 },
  { id: 'oceania', label: 'Oceania', center: [-25, 140] as [number, number], zoom: 4 },
] as const;

interface TimeFilterBarProps {
  activeTime: string;
  onTimeChange: (time: string) => void;
}

export function TimeFilterBar({ activeTime, onTimeChange }: TimeFilterBarProps) {
  const map = useMap();

  return (
    <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-1">
      {/* Time filters */}
      <div className="bg-card/90 border border-border backdrop-blur-sm rounded-md px-1 py-0.5 flex items-center gap-0">
        <Clock className="h-3 w-3 text-muted-foreground mx-1" />
        {TIME_RANGES.map(t => (
          <button
            key={t.id}
            onClick={() => onTimeChange(t.id)}
            className={cn(
              'px-1.5 py-0.5 rounded text-[9px] font-bold uppercase transition-colors',
              activeTime === t.id
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Region presets */}
      <div className="bg-card/90 border border-border backdrop-blur-sm rounded-md px-1 py-0.5 flex items-center gap-0">
        <Globe className="h-3 w-3 text-muted-foreground mx-1" />
        {REGION_PRESETS.map(r => (
          <button
            key={r.id}
            onClick={() => map.flyTo(r.center, r.zoom, { duration: 1.5 })}
            className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function getTimeFilterMs(filter: string): number {
  const map: Record<string, number> = {
    '1h': 3600000, '6h': 21600000, '24h': 86400000,
    '48h': 172800000, '7d': 604800000, 'all': Infinity,
  };
  return map[filter] || Infinity;
}
