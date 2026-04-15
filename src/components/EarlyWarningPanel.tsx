import { useEarlyWarnings } from '@/services/humanitarianService';
import type { EarlyWarningEvent } from '@/services/types';
import { FeedHealthBadge } from '@/components/FeedHealthBadge';
import { AlertTriangle, Crosshair, Volume2, Radio, Plane, Rocket, FlaskConical, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

const typeConfig: Record<EarlyWarningEvent['detectionType'], { icon: React.ReactNode; color: string; label: string }> = {
  explosion: { icon: <AlertTriangle className="h-3 w-3" />, color: 'text-destructive', label: 'Explosion' },
  drone: { icon: <Crosshair className="h-3 w-3" />, color: 'text-warning', label: 'Drone' },
  gunfire: { icon: <Volume2 className="h-3 w-3" />, color: 'text-orange-400', label: 'Gunfire' },
  siren: { icon: <Radio className="h-3 w-3" />, color: 'text-yellow-400', label: 'Siren' },
  aircraft: { icon: <Plane className="h-3 w-3" />, color: 'text-red-400', label: 'Aircraft' },
  missile: { icon: <Rocket className="h-3 w-3" />, color: 'text-destructive', label: 'Missile' },
  chemical: { icon: <FlaskConical className="h-3 w-3" />, color: 'text-purple-400', label: 'Chemical' },
  seismic: { icon: <Activity className="h-3 w-3" />, color: 'text-amber-400', label: 'Seismic' },
};

const intensityBg: Record<string, string> = {
  high: 'border-destructive/50 bg-destructive/5',
  medium: 'border-warning/50 bg-warning/5',
  low: 'border-muted',
};

const confidenceTierColors: Record<string, string> = {
  confirmed: 'text-success',
  corroborated: 'text-info',
  unconfirmed: 'text-warning',
  resolved: 'text-muted-foreground',
};

export function EarlyWarningPanel() {
  const { t } = useTranslation();
  const { data: events = [], isLoading } = useEarlyWarnings();

  if (isLoading) {
    return (
      <div className="border border-border rounded-lg p-4 text-center text-[9px] text-muted-foreground">
        Loading...
      </div>
    );
  }

  const highCount = events.filter(e => e.intensity === 'high').length;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="p-2 border-b border-border bg-card">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-destructive flex items-center gap-1.5">
          <AlertTriangle className="h-3 w-3" /> {t('earlyWarning.title')}
          <FeedHealthBadge feedName="early_warnings" className="ml-auto" />
        </h3>
        <p className="text-[8px] text-muted-foreground mt-0.5">{t('earlyWarning.subtitle')}</p>
      </div>

      {/* Summary */}
      <div className="p-2 grid grid-cols-4 gap-1 border-b border-border">
        <div className="bg-muted/30 rounded p-1 text-center">
          <div className="text-[10px] font-bold text-destructive">{events.length}</div>
          <div className="text-[7px] text-muted-foreground">Active</div>
        </div>
        <div className="bg-muted/30 rounded p-1 text-center">
          <div className="text-[10px] font-bold text-destructive">{highCount}</div>
          <div className="text-[7px] text-muted-foreground">High</div>
        </div>
        <div className="bg-muted/30 rounded p-1 text-center">
          <div className="text-[10px] font-bold text-success">{events.filter(e => e.confirmed).length}</div>
          <div className="text-[7px] text-muted-foreground">Confirmed</div>
        </div>
        <div className="bg-muted/30 rounded p-1 text-center">
          <div className="text-[10px] font-bold text-warning">{events.filter(e => !e.confirmed).length}</div>
          <div className="text-[7px] text-muted-foreground">Unconfirmed</div>
        </div>
      </div>

      <div className="p-2 space-y-1.5">
        {events.map(ev => {
          const cfg = typeConfig[ev.detectionType];
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
              <div className="flex items-center gap-2 text-[8px] text-muted-foreground">
                <span>{ev.source}</span>
                <span>{ev.confirmed ? '\u2713 Confirmed' : '? Unconfirmed'}</span>
                <span className={cn('font-medium', confidenceTierColors[ev.confidenceTier] ?? 'text-muted-foreground')}>
                  {ev.confidenceTier}
                </span>
                <span>{new Date(ev.detectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
