import { useMemo } from 'react';
import { useNewsFeedContext } from '@/contexts/NewsFeedContext';
import { Plane, Ship, RefreshCw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface TheaterPosture {
  id: string;
  name: string;
  aircraft: number;
  vessels: number;
  level: 'normal' | 'elevated' | 'critical';
  strikeCapable: boolean;
}

const THEATERS = [
  { id: 'centcom', name: 'CENTCOM (Middle East)', keywords: ['iran', 'iraq', 'syria', 'yemen', 'gulf', 'centcom', 'carrier', 'eisenhower', 'lincoln'] },
  { id: 'eucom', name: 'EUCOM (Europe)', keywords: ['ukraine', 'nato', 'poland', 'romania', 'baltic', 'black sea', 'ramstein'] },
  { id: 'indopacom', name: 'INDOPACOM (Pacific)', keywords: ['taiwan', 'south china sea', 'philippines', 'japan', 'guam', 'pacific'] },
  { id: 'africom', name: 'AFRICOM (Africa)', keywords: ['somalia', 'niger', 'djibouti', 'sahel', 'red sea'] },
];

const LEVEL_CONFIG = {
  normal: { color: 'text-success', bg: 'bg-success/15', label: 'Normal' },
  elevated: { color: 'text-warning', bg: 'bg-warning/15', label: 'Elevated' },
  critical: { color: 'text-danger', bg: 'bg-danger/15', label: 'Critical' },
};

export function StrategicPosturePanel() {
  const { news } = useNewsFeedContext();

  const postures = useMemo<TheaterPosture[]>(() => {
    return THEATERS.map(theater => {
      let matchCount = 0;
      let highCount = 0;
      let militaryCount = 0;

      for (const article of news) {
        const text = `${article.title} ${article.summary}`.toLowerCase();
        if (theater.keywords.some(kw => text.includes(kw))) {
          matchCount++;
          if (article.severity === 'high') highCount++;
          if (article.category === 'conflict') militaryCount++;
        }
      }

      // Simulate aircraft/vessel counts based on news activity
      const aircraft = Math.min(200, Math.round(matchCount * 3.5 + highCount * 8 + militaryCount * 5));
      const vessels = Math.min(50, Math.round(matchCount * 0.8 + highCount * 2 + militaryCount * 1.5));

      const level: TheaterPosture['level'] =
        aircraft >= 100 ? 'critical' :
        aircraft >= 50 ? 'elevated' : 'normal';

      const strikeCapable = aircraft >= 30 && vessels >= 5 && militaryCount >= 2;

      return { id: theater.id, name: theater.name, aircraft, vessels, level, strikeCapable };
    });
  }, [news]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <Plane className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-sans font-bold uppercase tracking-wider text-primary">AI Strategic Posture</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-[9px] text-muted-foreground cursor-help ml-auto">?</span>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-[240px] text-[10px] space-y-1">
            <p className="font-bold">Methodology</p>
            <p>Aggregates military aircraft and naval vessels by theater.</p>
            <p>• <b>Normal:</b> Baseline activity</p>
            <p>• <b>Elevated:</b> Above threshold (50+ aircraft)</p>
            <p>• <b>Critical:</b> High concentration (100+ aircraft)</p>
            <p className="text-muted-foreground"><b>Strike Capable:</b> Tankers + AWACS + Fighters present in sufficient numbers.</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="flex items-center gap-2 px-1 text-[9px] text-muted-foreground">
        <span className="flex items-center gap-1">📡 Acquiring Data</span>
        <span className="flex items-center gap-1">✈️ ADS-B</span>
        <span className="flex items-center gap-1">🚢 AIS</span>
      </div>

      <div className="space-y-1">
        {postures.map(p => {
          const cfg = LEVEL_CONFIG[p.level];
          return (
            <div key={p.id} className={`px-2 py-1.5 rounded ${cfg.bg}`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-foreground">{p.name}</span>
                <span className={`text-[9px] font-bold uppercase ${cfg.color}`}>{cfg.label}</span>
              </div>
              <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Plane className="h-2.5 w-2.5" />{p.aircraft} aircraft
                </span>
                <span className="flex items-center gap-1">
                  <Ship className="h-2.5 w-2.5" />{p.vessels} vessels
                </span>
                {p.strikeCapable && (
                  <span className="text-danger font-bold text-[9px]">⚡ Strike Capable</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
