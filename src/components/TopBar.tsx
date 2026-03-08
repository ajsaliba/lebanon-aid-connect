import { useState, useEffect, useCallback, useRef } from 'react';
import { Radio, Shield, AlertTriangle, MapPin, Menu, Bell, Search, Volume2, VolumeX, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AuthDialog } from '@/components/AuthDialog';
import { ThemeToggle } from '@/components/ThemeToggle';
import { IntelSignalsBadge } from '@/components/IntelSignalsBadge';
import { SourceFilterModal, useSourceFilters } from '@/components/SourceFilterModal';
import { useIntelSignals } from '@/hooks/useIntelSignals';
import { useNewsFeedContext } from '@/contexts/NewsFeedContext';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { exportNewsAsCSV, exportNewsAsJSON } from '@/lib/dataExport';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

const SOUND_PREF_KEY = 'cedarsalert_sound_alerts';

export function TopBar({ onToggleSidebar, activeRegion, onRegionChange }: TopBarProps) {
  const [time, setTime] = useState(new Date());
  const { notifications, unreadCount, markAllAsRead } = useNotificationCenter();
  const { news } = useNewsFeedContext();
  const signals = useIntelSignals(news);
  const sourceFilters = useSourceFilters();
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try { return localStorage.getItem(SOUND_PREF_KEY) !== 'false'; } catch { return true; }
  });
  const prevNewsCountRef = useRef(news.length);
  const audioRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Sound alert on new high-severity news
  useEffect(() => {
    if (!soundEnabled) return;
    if (news.length > prevNewsCountRef.current) {
      const newArticles = news.slice(0, news.length - prevNewsCountRef.current);
      const hasHighSeverity = newArticles.some(n => n.severity === 'high');
      if (hasHighSeverity) {
        playAlertSound();
      }
    }
    prevNewsCountRef.current = news.length;
  }, [news, soundEnabled]);

  const playAlertSound = useCallback(() => {
    try {
      if (!audioRef.current) audioRef.current = new AudioContext();
      const ctx = audioRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(660, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } catch {}
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    try { localStorage.setItem(SOUND_PREF_KEY, String(next)); } catch {}
  };

  const utcTime = time.toUTCString().split(' ').slice(4).join(' ').replace(' GMT', '');
  const utcDate = time.toISOString().split('T')[0];

  return (
    <header className="h-12 border-b border-border bg-card flex items-center justify-between px-2 sm:px-3 shrink-0">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 hidden md:flex" onClick={onToggleSidebar}>
          <Menu className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <AlertTriangle className="h-4 w-4 text-primary shrink-0" />
          <h1 className="font-sans font-bold text-xs sm:text-sm tracking-wider uppercase text-primary truncate">
            <span className="sm:hidden">Cedars Alert</span>
            <span className="hidden sm:inline">Lebanon Crisis Monitor</span>
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

      <div className="flex items-center gap-1 sm:gap-2">
        <div className="text-[11px] text-muted-foreground font-mono hidden sm:flex items-center gap-3">
          <span>{utcDate}</span>
          <span className="text-primary font-medium">{utcTime} UTC</span>
        </div>

        {/* Cmd+K hint — desktop only */}
        <button
          onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
          className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded border border-border text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Search className="h-3 w-3" />
          <kbd className="text-[9px]">⌘K</kbd>
        </button>

        {/* Source Filter — hidden on small mobile */}
        <span className="hidden sm:inline-flex">
          <SourceFilterModal
            disabledSources={sourceFilters.disabledSources}
            toggleSource={sourceFilters.toggleSource}
            enableAll={sourceFilters.enableAll}
            disableAll={sourceFilters.disableAll}
          />
        </span>

        {/* Data Export — hidden on small mobile */}
        <span className="hidden sm:inline-flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Download className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => exportNewsAsCSV(news)} className="text-xs">
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportNewsAsJSON(news)} className="text-xs">
                Export as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </span>

        {/* Intel Signals Badge */}
        <IntelSignalsBadge signals={signals} />

        {/* Sound toggle — hidden on small mobile */}
        <span className="hidden sm:inline-flex">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleSound}>
                {soundEnabled ? <Volume2 className="h-4 w-4 text-success" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-[10px]">
              Sound alerts: {soundEnabled ? 'ON' : 'OFF'}
            </TooltipContent>
          </Tooltip>
        </span>

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

        <ThemeToggle />
        <AuthDialog />
      </div>
    </header>
  );
}
