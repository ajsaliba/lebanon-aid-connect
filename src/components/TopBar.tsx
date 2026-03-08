import { useState, useEffect } from 'react';
import { Radio, Shield, AlertTriangle, MapPin, Menu, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AuthDialog } from '@/components/AuthDialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useNotificationCenter } from '@/contexts/NotificationCenterContext';

interface TopBarProps {
  onToggleSidebar: () => void;
  activeRegion: string;
  onRegionChange: (region: string) => void;
}

const regions = [
  { id: 'lebanon', label: 'Lebanon', icon: MapPin },
  { id: 'middle-east', label: 'Middle East', icon: Shield },
  { id: 'global', label: 'Global', icon: Radio },
];

const typeLabel: Record<string, string> = {
  conflict: 'Airstrike / Conflict',
  news: 'War Update',
  humanitarian: 'Humanitarian',
  infrastructure: 'Infrastructure',
  shelter: 'New Shelter',
  housing: 'New Housing',
};

export function TopBar({ onToggleSidebar, activeRegion, onRegionChange }: TopBarProps) {
  const [time, setTime] = useState(new Date());
  const { notifications, unreadCount, markAllAsRead } = useNotificationCenter();

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const utcTime = time.toUTCString().split(' ').slice(4).join(' ').replace(' GMT', '');
  const utcDate = time.toISOString().split('T')[0];

  return (
    <header className="h-12 border-b border-border bg-card flex items-center justify-between px-3 shrink-0">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onToggleSidebar}>
          <Menu className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-primary" />
          <h1 className="font-sans font-bold text-sm tracking-wider uppercase text-primary">
            Lebanon Crisis Monitor
          </h1>
        </div>
        <div className="hidden md:flex items-center gap-1 ml-4">
          <span className="h-2 w-2 rounded-full bg-danger animate-pulse-danger" />
          <span className="text-[10px] text-danger font-medium uppercase tracking-wider">Live</span>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-1">
        {regions.map((r) => (
          <Button
            key={r.id}
            variant={activeRegion === r.id ? 'default' : 'ghost'}
            size="sm"
            className={cn(
              'h-7 text-[11px] uppercase tracking-wider gap-1',
              activeRegion === r.id && 'bg-primary text-primary-foreground'
            )}
            onClick={() => onRegionChange(r.id)}
          >
            <r.icon className="h-3 w-3" />
            {r.label}
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="text-[11px] text-muted-foreground font-mono hidden sm:flex items-center gap-3">
          <span>{utcDate}</span>
          <span className="text-primary font-medium">{utcTime} UTC</span>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 relative" aria-label="Open notifications">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-danger text-danger-foreground text-[9px] leading-4 text-center font-bold">
                  {Math.min(unreadCount, 99)}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[360px] sm:max-w-[420px] p-4">
            <SheetHeader>
              <SheetTitle className="text-base">War Notifications</SheetTitle>
              <SheetDescription>Middle East war-related alerts and updates.</SheetDescription>
            </SheetHeader>
            <div className="mt-4 flex justify-end">
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={markAllAsRead}>
                Mark all as read
              </Button>
            </div>
            <div className="mt-3 space-y-2 max-h-[75vh] overflow-y-auto pr-1">
              {notifications.length === 0 ? (
                <p className="text-xs text-muted-foreground">No notifications yet.</p>
              ) : (
                notifications.map((n) => (
                  <article key={n.id} className={cn('rounded-md border border-border p-2 text-xs', !n.read && 'bg-muted/40')}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-foreground">{typeLabel[n.type] ?? n.type}</span>
                      <span className="text-[10px] text-muted-foreground">{new Date(n.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="mt-1 text-foreground">{n.title}</p>
                    {n.source && <p className="mt-1 text-[11px] text-muted-foreground">Source: {n.source}</p>}
                  </article>
                ))
              )}
            </div>
          </SheetContent>
        </Sheet>

        <AuthDialog />
      </div>
    </header>
  );
}
