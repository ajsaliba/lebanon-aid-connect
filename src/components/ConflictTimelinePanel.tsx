import { mockTimelineEvents } from '@/data/newFeaturesMockData';
import { Clock, Crosshair, Swords, Handshake, HeartPulse, Users, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import type { TimelineEventType } from '@/data/newFeaturesMockData';

const typeConfig: Record<TimelineEventType, { icon: React.ReactNode; color: string }> = {
  airstrike: { icon: <Crosshair className="h-3 w-3" />, color: 'text-danger' },
  ground_operation: { icon: <Swords className="h-3 w-3" />, color: 'text-warning' },
  ceasefire_talk: { icon: <Handshake className="h-3 w-3" />, color: 'text-success' },
  humanitarian: { icon: <HeartPulse className="h-3 w-3" />, color: 'text-primary' },
  displacement: { icon: <Users className="h-3 w-3" />, color: 'text-info' },
  infrastructure: { icon: <Wrench className="h-3 w-3" />, color: 'text-yellow-500' },
};

const severityColors: Record<string, string> = {
  critical: 'border-l-danger bg-danger/5',
  high: 'border-l-warning bg-warning/5',
  medium: 'border-l-info bg-info/5',
  low: 'border-l-muted-foreground',
};

export function ConflictTimelinePanel() {
  const { t } = useTranslation();
  const sorted = [...mockTimelineEvents].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="p-2 border-b border-border bg-card">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-danger flex items-center gap-1.5">
          <Clock className="h-3 w-3" /> {t('timeline.title')}
        </h3>
        <p className="text-[8px] text-muted-foreground mt-0.5">{t('timeline.subtitle')}</p>
      </div>

      <div className="p-2 space-y-1">
        {sorted.map(ev => {
          const cfg = typeConfig[ev.type];
          const time = new Date(ev.timestamp);
          return (
            <div key={ev.id} className={cn('border-l-2 rounded-r p-2 space-y-0.5', severityColors[ev.severity])}>
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
                <span>📍 {ev.location}</span>
                <span>📡 {ev.source}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
