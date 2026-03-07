import { Wifi, Database, Clock, MapPin } from 'lucide-react';

export function StatusBar() {
  return (
    <footer className="h-6 border-t border-border bg-card flex items-center justify-between px-3 text-[9px] text-muted-foreground shrink-0">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          <Wifi className="h-2.5 w-2.5" />
          Connected
        </span>
        <span className="flex items-center gap-1">
          <Database className="h-2.5 w-2.5" />
          Data: Mock
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-2.5 w-2.5" />
          Last update: just now
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1">
          <MapPin className="h-2.5 w-2.5" />
          Focus: Lebanon
        </span>
        <span>v0.1.0</span>
      </div>
    </footer>
  );
}
