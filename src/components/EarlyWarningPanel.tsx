import { mockEarlyWarningEvents } from '@/data/newFeaturesMockData2';
import type { DetectionType } from '@/data/newFeaturesMockData2';
import { AlertTriangle, Crosshair, Volume2, Radio, Plane } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

const typeConfig: Record<DetectionType, { icon: React.ReactNode; color: string; label: string }> = {
  explosion: { icon: <AlertTriangle className="h-3 w-3" />, color: 'text-destructive', label: 'Explosion' },
  drone: { icon: <Crosshair className="h-3 w-3" />, color: 'text-warning', label: 'Drone' },
  gunfire: { icon: <Volume2 className="h-3 w-3" />, color: 'text-orange-400', label: 'Gunfire' },
  siren: { icon: <Radio className="h-3 w-3" />, color: 'text-yellow-400', label: 'Siren' },
  aircraft: { icon: <Plane className="h-3 w-3" />, color: 'text-red-400', label: 'Aircraft' },
};

const intensityBg: Record<string, string> = {
  high: 'border-destructive/50 bg-destructive/5',
  medium: 'border-warning/50 bg-warning/5',
  low: 'border-muted',
};

export function EarlyWarningPanel() {
  const { t } = useTranslation();
  const highCount = mockEarlyWarningEvents.filter(e => e.intensity === 'high').length;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="p-2 border-b border-border bg-card">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-destructive flex items-center gap-1.5">
          <AlertTriangle className="h-3 w-3" /> {t('earlyWarning.title')}
        </h3>
        <p className="text-[8px] text-muted-foreground mt-0.5">{t('earlyWarning.subtitle')}</p>
      </div>

      {/* Summary */}
      <div className="p-2 grid grid-cols-4 gap-1 border-b border-border">
        <div className="bg-muted/30 rounded p-1 text-center">
          <div className="text-[10px] font-bold text-destructive">{mockEarlyWarningEvents.length}</div>
          <div className="text-[7px] text-muted-foreground">Active</div>
        </div>
        <div className="bg-muted/30 rounded p-1 text-center">
          <div className="text-[10px] font-bold text-destructive">{highCount}</div>
          <div className="text-[7px] text-muted-foreground">High</div>
        </div>
        <div className="bg-muted/30 rounded p-1 text-center">
          <div className="text-[10px] font-bold text-success">{mockEarlyWarningEvents.filter(e => e.confirmed).length}</div>
          <div className="text-[7px] text-muted-foreground">Confirmed</div>
        </div>
        <div className="bg-muted/30 rounded p-1 text-center">
          <div className="text-[10px] font-bold text-warning">{mockEarlyWarningEvents.filter(e => !e.confirmed).length}</div>
          <div className="text-[7px] text-muted-foreground">Unconfirmed</div>
        </div>
      </div>

      <div className="p-2 space-y-1.5">
        {mockEarlyWarningEvents.map(ev => {
          const cfg = typeConfig[ev.type];
          return (
            <div key={ev.id} className={cn('border rounded p-2 space-y-0.5', intensityBg[ev.intensity])}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium flex items-center gap-1">
                  <span className={cfg.color}>{cfg.icon}</span>
                  <span className={cfg.color}>{cfg.label}</span>
                  <span className="text-muted-foreground">— {ev.location}</span>
                </span>
                <span className={cn('text-[7px] font-bold uppercase rounded px-1 py-0.5',
                  ev.intensity === 'high' ? 'bg-destructive/20 text-destructive' :
                  ev.intensity === 'medium' ? 'bg-warning/20 text-warning' : 'bg-muted text-muted-foreground'
                )}>
                  {ev.intensity}
                </span>
              </div>
              <p className="text-[9px] text-muted-foreground">{ev.description}</p>
              <div className="flex items-center gap-2 text-[8px] text-muted-foreground">
                <span>{ev.source}</span>
                <span>{ev.confirmed ? '✓ Confirmed' : '? Unconfirmed'}</span>
                <span>{new Date(ev.detected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
