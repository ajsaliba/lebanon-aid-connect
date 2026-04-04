import { useState, useEffect, useRef, useMemo } from 'react';
import { mockTimelineEvents } from '@/data/newFeaturesMockData';
import { useEscalationEvents, type EscalationEvent } from '@/hooks/useDataHooks';
import { Clock, Crosshair, Swords, Handshake, HeartPulse, Users, Wrench, Play, Pause, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import type { TimelineEventType } from '@/data/newFeaturesMockData';

const typeConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  airstrike: { icon: <Crosshair className="h-3 w-3" />, color: 'text-danger' },
  ground_operation: { icon: <Swords className="h-3 w-3" />, color: 'text-warning' },
  ceasefire_talk: { icon: <Handshake className="h-3 w-3" />, color: 'text-success' },
  humanitarian: { icon: <HeartPulse className="h-3 w-3" />, color: 'text-primary' },
  displacement: { icon: <Users className="h-3 w-3" />, color: 'text-info' },
  infrastructure: { icon: <Wrench className="h-3 w-3" />, color: 'text-yellow-500' },
  conflict: { icon: <Crosshair className="h-3 w-3" />, color: 'text-danger' },
};

const severityColors: Record<string, string> = {
  critical: 'border-l-danger bg-danger/5',
  high: 'border-l-warning bg-warning/5',
  elevated: 'border-l-warning bg-warning/5',
  medium: 'border-l-info bg-info/5',
  monitoring: 'border-l-muted-foreground',
  low: 'border-l-muted-foreground',
};

const SPEED_OPTIONS = [1, 5, 10] as const;
type Speed = typeof SPEED_OPTIONS[number];

// Normalise both mock and DB events into a unified shape
interface UnifiedEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  severity: string;
  type: string;
  occurred_at: string;
  source?: string;
}

function fromMock(e: typeof mockTimelineEvents[0]): UnifiedEvent {
  return { id: e.id, title: e.title, description: e.description, location: e.location, severity: e.severity, type: e.type, occurred_at: e.timestamp, source: e.source };
}
function fromDB(e: EscalationEvent): UnifiedEvent {
  return { id: e.id, title: e.title, description: e.description ?? '', location: e.location ?? '', severity: e.severity, type: e.event_type, occurred_at: e.occurred_at, source: e.source_url ?? undefined };
}

export function ConflictTimelinePanel() {
  const { t } = useTranslation();
  const { data: dbEvents = [] } = useEscalationEvents();

  // Merge DB events with mock fallback
  const events: UnifiedEvent[] = useMemo(() => {
    const db = dbEvents.map(fromDB);
    const mock = mockTimelineEvents.map(fromMock);
    const all = db.length > 0 ? [...db, ...mock] : mock;
    return all.sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime());
  }, [dbEvents]);

  // ── Replay state (Feature 11) ──────────────────────────────────────────────
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<Speed>(1);
  const [playhead, setPlayhead] = useState(0); // index into sorted events
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sort events chronologically for playback
  const chronological = useMemo(
    () => [...events].sort((a, b) => new Date(a.occurred_at).getTime() - new Date(b.occurred_at).getTime()),
    [events],
  );

  const maxPlayhead = Math.max(0, chronological.length - 1);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!playing) return;
    const ms = Math.max(200, 1000 / speed);
    intervalRef.current = setInterval(() => {
      setPlayhead(prev => {
        if (prev >= maxPlayhead) {
          setPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, ms);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, speed, maxPlayhead]);

  const activeEventId = playing || playhead > 0 ? chronological[playhead]?.id : null;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="p-2 border-b border-border bg-card">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-danger flex items-center gap-1.5">
          <Clock className="h-3 w-3" /> {t('timeline.title')}
        </h3>
        <p className="text-[8px] text-muted-foreground mt-0.5">{t('timeline.subtitle')}</p>
      </div>

      {/* ── Replay controls (Feature 11) ── */}
      {chronological.length > 0 && (
        <div className="px-2 py-1.5 border-b border-border bg-muted/20 space-y-1.5">
          {/* Scrubber */}
          <input
            type="range"
            min={0}
            max={maxPlayhead}
            value={playhead}
            onChange={e => { setPlayhead(Number(e.target.value)); setPlaying(false); }}
            className="w-full h-1 accent-cyan-400"
          />
          <div className="flex items-center gap-1.5">
            {/* Play/Pause */}
            <button
              onClick={() => setPlaying(p => !p)}
              className="h-5 w-5 rounded bg-muted flex items-center justify-center text-foreground hover:bg-muted/80"
            >
              {playing ? <Pause className="h-2.5 w-2.5" /> : <Play className="h-2.5 w-2.5" />}
            </button>
            {/* Speed */}
            <div className="flex items-center gap-0.5">
              <ChevronsRight className="h-2.5 w-2.5 text-muted-foreground" />
              {SPEED_OPTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={cn(
                    'px-1 py-0 text-[8px] rounded font-mono transition-colors',
                    speed === s ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {s}×
                </button>
              ))}
            </div>
            <span className="ml-auto text-[8px] text-muted-foreground font-mono">
              {playhead + 1}/{chronological.length}
            </span>
          </div>
          {activeEventId && (
            <p className="text-[8px] text-cyan-400 font-mono truncate">
              ▶ {chronological[playhead]?.title}
            </p>
          )}
        </div>
      )}

      <div className="p-2 space-y-1">
        {events.map(ev => {
          const cfg = typeConfig[ev.type] ?? typeConfig.conflict;
          const time = new Date(ev.occurred_at);
          const isActive = activeEventId === ev.id;
          const isInactive = activeEventId !== null && !isActive;
          return (
            <div
              key={ev.id}
              className={cn(
                'border-l-2 rounded-r p-2 space-y-0.5 transition-opacity duration-200',
                severityColors[ev.severity] ?? severityColors.low,
                isInactive && 'opacity-40',
                isActive && 'border-l-cyan-400 ring-1 ring-cyan-400/20',
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium flex items-center gap-1">
                  <span className={cfg.color}>{cfg.icon}</span> {ev.title}
                </span>
                <span className="text-[7px] text-muted-foreground font-mono">
                  {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-[8px] text-muted-foreground">{ev.description}</p>
              <div className="flex items-center gap-2 text-[7px] text-muted-foreground">
                {ev.location && <span>📍 {ev.location}</span>}
                {ev.source && <span>📡 {ev.source}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
