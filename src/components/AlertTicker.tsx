import { AlertTriangle } from 'lucide-react';
import { mockNews } from '@/data/mockData';

export function AlertTicker() {
  const highAlerts = mockNews.filter(n => n.severity === 'high');

  return (
    <div className="h-7 bg-danger/10 border-b border-danger/30 flex items-center overflow-hidden shrink-0">
      <div className="flex items-center gap-1 px-2 bg-danger/20 h-full shrink-0 border-r border-danger/30">
        <AlertTriangle className="h-3 w-3 text-danger" />
        <span className="text-[10px] font-bold text-danger uppercase tracking-wider">Alert</span>
      </div>
      <div className="overflow-hidden flex-1">
        <div className="animate-ticker whitespace-nowrap flex items-center gap-8">
          {highAlerts.map((alert) => (
            <span key={alert.id} className="text-[11px] text-danger/90">
              ◆ {alert.title} — {alert.source}
            </span>
          ))}
          {highAlerts.map((alert) => (
            <span key={`dup-${alert.id}`} className="text-[11px] text-danger/90">
              ◆ {alert.title} — {alert.source}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
