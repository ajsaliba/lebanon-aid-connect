import { useState } from 'react';
import { mockWeatherAlerts, type WeatherSeverity, type WeatherType } from '@/data/worldMonitorMockData';
import { Cloud, Thermometer, Droplets, Wind, Flame, AlertTriangle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const severityConfig: Record<WeatherSeverity, { color: string; bg: string; label: string }> = {
  advisory: { color: 'text-info', bg: 'bg-info/20', label: 'ADVISORY' },
  watch: { color: 'text-warning', bg: 'bg-warning/20', label: 'WATCH' },
  warning: { color: 'text-orange-400', bg: 'bg-orange-400/20', label: 'WARNING' },
  extreme: { color: 'text-danger', bg: 'bg-danger/20', label: 'EXTREME' },
};

const typeIcons: Record<WeatherType, React.ReactNode> = {
  storm: <Cloud className="h-3 w-3" />,
  flood: <Droplets className="h-3 w-3" />,
  heat: <Thermometer className="h-3 w-3" />,
  cold: <Thermometer className="h-3 w-3" />,
  wind: <Wind className="h-3 w-3" />,
  earthquake: <Zap className="h-3 w-3" />,
  tsunami: <Droplets className="h-3 w-3" />,
  wildfire: <Flame className="h-3 w-3" />,
};

const typeEmoji: Record<WeatherType, string> = {
  storm: '⛈️', flood: '🌊', heat: '🌡️', cold: '❄️',
  wind: '💨', earthquake: '🌍', tsunami: '🌊', wildfire: '🔥',
};

export function WeatherAlertsPanel() {
  const [showExpired, setShowExpired] = useState(false);

  const alerts = showExpired
    ? mockWeatherAlerts
    : mockWeatherAlerts.filter(a => a.active);

  const warningCount = mockWeatherAlerts.filter(a => a.active && (a.severity === 'warning' || a.severity === 'extreme')).length;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="p-2 border-b border-border bg-card">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
          <Cloud className="h-3 w-3" /> Weather & Climate Alerts
        </h3>
        <p className="text-[8px] text-muted-foreground mt-0.5">WMO / EMSC real-time weather monitoring</p>
      </div>

      {/* Stats */}
      <div className="p-2 grid grid-cols-3 gap-1">
        <div className="bg-muted/30 rounded p-1 text-center">
          <div className="text-[10px] font-bold">{mockWeatherAlerts.length}</div>
          <div className="text-[7px] text-muted-foreground">Total</div>
        </div>
        <div className="bg-danger/10 rounded p-1 text-center">
          <div className="text-[10px] font-bold text-danger">{warningCount}</div>
          <div className="text-[7px] text-muted-foreground">Warnings</div>
        </div>
        <div className="bg-success/10 rounded p-1 text-center">
          <div className="text-[10px] font-bold text-success">{alerts.length}</div>
          <div className="text-[7px] text-muted-foreground">Active</div>
        </div>
      </div>

      <div className="px-2 pb-1">
        <button
          onClick={() => setShowExpired(!showExpired)}
          className="text-[8px] text-muted-foreground hover:text-foreground transition-colors"
        >
          {showExpired ? 'Hide expired' : 'Show all alerts'}
        </button>
      </div>

      {/* Alerts */}
      <div className="p-2 space-y-1.5 max-h-[400px] overflow-y-auto">
        {alerts.map(alert => {
          const cfg = severityConfig[alert.severity];
          return (
            <div key={alert.id} className={cn('border border-border rounded p-2 space-y-1', !alert.active && 'opacity-50')}>
              <div className="flex items-start justify-between gap-1">
                <div className="flex items-center gap-1">
                  <span>{typeEmoji[alert.type]}</span>
                  <span className="text-xs font-medium">{alert.title}</span>
                </div>
                <span className={cn('text-[8px] px-1 py-0 rounded font-bold whitespace-nowrap', cfg.bg, cfg.color)}>
                  {cfg.label}
                </span>
              </div>

              <p className="text-[9px] text-muted-foreground">{alert.description}</p>

              <div className="flex items-center justify-between text-[8px] text-muted-foreground">
                <span>{alert.region}</span>
                <span>{alert.source}</span>
              </div>

              <div className="flex items-center justify-between text-[8px] text-muted-foreground">
                <span>Issued: {new Date(alert.issued_at).toLocaleString()}</span>
                <span>Expires: {new Date(alert.expires_at).toLocaleString()}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
