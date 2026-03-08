import { useMemo } from 'react';
import { CircleMarker, Popup } from 'react-leaflet';
import { computeHotspotScores, type HotspotScore } from '@/config/hotspots';
import { type NewsItem } from '@/data/mockData';

/**
 * Renders pulsing hotspot markers on the map.
 * Marker size and opacity scale with escalation score.
 */
export function HotspotLayer({ news, visible }: { news: NewsItem[]; visible: boolean }) {
  const scores = useMemo(() => computeHotspotScores(news), [news]);

  if (!visible) return null;

  return (
    <>
      {scores.map((hs) => {
        if (hs.score < 0.05) return null; // skip quiet zones
        return <HotspotMarker key={hs.hotspot.id} hs={hs} />;
      })}
    </>
  );
}

function HotspotMarker({ hs }: { hs: HotspotScore }) {
  const color =
    hs.level === 'critical' ? '#ef4444' :
    hs.level === 'elevated' ? '#f59e0b' :
    '#22c55e';

  // Radius scales 15-45 based on score
  const radius = 15 + hs.score * 30;
  const fillOpacity = 0.12 + hs.score * 0.25;

  return (
    <>
      {/* Outer pulse ring */}
      <CircleMarker
        center={[hs.hotspot.lat, hs.hotspot.lng]}
        radius={radius * 1.5}
        pathOptions={{
          color,
          fillColor: color,
          fillOpacity: fillOpacity * 0.3,
          weight: 0,
          className: hs.level === 'critical' ? 'animate-pulse' : '',
        }}
      />
      {/* Inner core */}
      <CircleMarker
        center={[hs.hotspot.lat, hs.hotspot.lng]}
        radius={radius}
        pathOptions={{
          color,
          fillColor: color,
          fillOpacity,
          weight: 1.5,
          dashArray: hs.level === 'elevated' ? '4 4' : undefined,
        }}
      >
        <Popup>
          <div className="text-xs space-y-1.5 min-w-[140px]">
            <div className="font-bold text-foreground text-sm">{hs.hotspot.name}</div>
            <div className="flex items-center gap-1.5">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: color }}
              />
              <span className="uppercase text-[10px] font-bold" style={{ color }}>
                {hs.level}
              </span>
            </div>
            <div className="text-muted-foreground">
              {hs.articleCount} articles • {hs.highCount} high severity
            </div>
            <div className="text-muted-foreground text-[10px]">
              Escalation: {Math.round(hs.score * 100)}%
            </div>
          </div>
        </Popup>
      </CircleMarker>
    </>
  );
}
