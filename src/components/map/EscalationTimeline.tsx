import { useMemo } from 'react';
import { type HotspotScore } from '@/config/hotspots';

/**
 * Mini sparkline SVG for hotspot escalation history.
 * Renders inline in the hotspot popup or panel.
 */
export function EscalationSparkline({
  history,
  width = 100,
  height = 28,
}: {
  history: number[];
  width?: number;
  height?: number;
}) {
  const points = useMemo(() => {
    if (history.length < 2) return '';
    const maxVal = Math.max(...history, 0.01);
    const step = width / (history.length - 1);
    return history
      .map((v, i) => `${i * step},${height - (v / maxVal) * (height - 4)}`)
      .join(' ');
  }, [history, width, height]);

  if (history.length < 2) {
    return <span className="text-[9px] text-muted-foreground">Collecting data…</span>;
  }

  const current = history[history.length - 1];
  const prev = history[history.length - 2];
  const trend = current > prev + 0.05 ? '↑' : current < prev - 0.05 ? '↓' : '→';
  const trendColor =
    trend === '↑' ? '#ef4444' :
    trend === '↓' ? '#22c55e' :
    '#6b7280';

  return (
    <div className="flex items-center gap-1.5">
      <svg width={width} height={height} className="shrink-0">
        <polyline
          points={points}
          fill="none"
          stroke="hsl(38, 100%, 50%)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Current value dot */}
        <circle
          cx={width}
          cy={height - (current / Math.max(...history, 0.01)) * (height - 4)}
          r="2"
          fill="hsl(38, 100%, 50%)"
        />
      </svg>
      <span className="text-[10px] font-bold" style={{ color: trendColor }}>
        {trend}
      </span>
    </div>
  );
}

/**
 * Escalation panel showing all hotspots ranked by score with sparklines.
 */
export function EscalationPanel({
  scores,
  historyMap,
}: {
  scores: HotspotScore[];
  historyMap: Map<string, number[]>;
}) {
  const sorted = useMemo(
    () => [...scores].sort((a, b) => b.score - a.score),
    [scores]
  );

  return (
    <div className="space-y-1">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold px-1 mb-1">
        Escalation Monitor
      </div>
      {sorted.map((hs) => {
        const color =
          hs.level === 'critical' ? 'text-danger' :
          hs.level === 'elevated' ? 'text-warning' :
          'text-success';
        const history = historyMap.get(hs.hotspot.id) || [];
        return (
          <div
            key={hs.hotspot.id}
            className="flex items-center gap-2 px-1 py-1 rounded hover:bg-muted/50 text-[11px]"
          >
            <span className={`font-bold w-16 truncate ${color}`}>{hs.hotspot.name}</span>
            <div className="flex-1">
              <EscalationSparkline history={history} width={80} height={20} />
            </div>
            <span className="text-muted-foreground text-[9px] w-8 text-right">
              {Math.round(hs.score * 100)}%
            </span>
            <span className={`uppercase text-[8px] font-bold w-12 text-right ${color}`}>
              {hs.level}
            </span>
          </div>
        );
      })}
    </div>
  );
}
