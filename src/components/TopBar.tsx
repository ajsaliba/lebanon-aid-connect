import { useState, useEffect, useCallback, useRef } from 'react';
import { Radio, Shield, AlertTriangle, MapPin, Menu, Bell, Search, Volume2, VolumeX, Download, Globe, Link2, Maximize, Minimize, Brain, Activity, Heart } from 'lucide-react';
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
import { useTranslation } from '@/lib/i18n';
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
import type { AppVariant } from '@/lib/variantSystem';

interface VariantOption {
  id: AppVariant;
  label: string;
}

interface TopBarProps {
  onToggleSidebar: () => void;
  activeRegion: string;
  onRegionChange: (region: string) => void;
  variant?: AppVariant;
  variantOptions?: VariantOption[];
  onVariantChange?: (variant: AppVariant) => void;
}

const regions = [
  { id: 'lebanon', labelKey: 'topbar.regionLebanon', icon: MapPin },
  { id: 'middle-east', labelKey: 'topbar.regionMiddleEast', icon: Shield },
  { id: 'global', labelKey: 'topbar.regionGlobal', icon: Radio },
];

const typeLabelKeys: Record<string, string> = {
  conflict: 'topbar.typeConflict',
  news: 'topbar.typeNews',
  humanitarian: 'topbar.typeHumanitarian',
  infrastructure: 'topbar.typeInfra',
  shelter: 'topbar.typeShelter',
  housing: 'topbar.typeHousing',
};

const SOUND_PREF_KEY = 'cedarsalert_sound_alerts';

export function TopBar({ onToggleSidebar, activeRegion, onRegionChange, variant, variantOptions, onVariantChange }: TopBarProps) {
  const [time, setTime] = useState(new Date());
  const { notifications, unreadCount, markAllAsRead } = useNotificationCenter();
  const { news } = useNewsFeedContext();
  const signals = useIntelSignals(news);
  const sourceFilters = useSourceFilters();
  const { t, lang, changeLanguage, supportedLanguages } = useTranslation();
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try { return localStorage.getItem(SOUND_PREF_KEY) !== 'false'; } catch { return true; }
  });
  const prevNewsCountRef = useRef(news.length);
  const audioRef = useRef<AudioContext | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

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
    } catch {
      return;
    }
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
  }, [news, playAlertSound, soundEnabled]);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    try {
      localStorage.setItem(SOUND_PREF_KEY, String(next));
    } catch {
      // Ignore storage exceptions.
    }
    if (next) playAlertSound();
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
            <span className="sm:hidden">{t('app.shortTitle')}</span>
            <span className="hidden sm:inline">{t('app.title')}</span>
          </h1>
        </div>
        <div className="hidden md:flex items-center gap-1 ml-4">
          <span className="h-2 w-2 rounded-full bg-danger animate-pulse-danger" />
          <span className="text-[10px] text-danger font-medium uppercase tracking-wider">{t('app.live')}</span>
        </div>
      </div>


      <div className="flex items-center gap-1 sm:gap-2">
        {/* Mobile controls menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 sm:hidden" aria-label="Open controls menu">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[320px] p-4">
            <SheetHeader>
              <SheetTitle className="text-sm">Operations Controls</SheetTitle>
              <SheetDescription className="text-xs">
                Quick access to filters, exports, language, and variant mode.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-4 space-y-3">
              <div className="space-y-1.5">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Filters</p>
                <SourceFilterModal
                  disabledSources={sourceFilters.disabledSources}
                  toggleSource={sourceFilters.toggleSource}
                  enableAll={sourceFilters.enableAll}
                  disableAll={sourceFilters.disableAll}
                />
              </div>

              <div className="space-y-1.5">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Export</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => exportNewsAsCSV(news)}>
                    {t('topbar.exportCSV')}
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => exportNewsAsJSON(news)}>
                    {t('topbar.exportJSON')}
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Language</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {supportedLanguages.slice(0, 9).map(option => (
                    <Button
                      key={option.code}
                      variant={lang === option.code ? 'default' : 'outline'}
                      size="sm"
                      className="h-8 text-[11px]"
                      onClick={() => changeLanguage(option.code)}
                    >
                      {option.code.toUpperCase()}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Region</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {regions.map(region => (
                    <Button
                      key={region.id}
                      variant={activeRegion === region.id ? 'default' : 'outline'}
                      size="sm"
                      className="h-8 text-[11px]"
                      onClick={() => onRegionChange(region.id)}
                    >
                      {t(region.labelKey)}
                    </Button>
                  ))}
                </div>
              </div>

              {variant && variantOptions?.length && onVariantChange && (
                <div className="space-y-1.5">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Variant</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {variantOptions.map(option => (
                      <Button
                        key={option.id}
                        variant={variant === option.id ? 'default' : 'outline'}
                        size="sm"
                        className="h-8 text-[11px]"
                        onClick={() => onVariantChange(option.id)}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>

        <div className="text-[11px] text-muted-foreground font-mono hidden sm:flex items-center gap-3">
          <span>{utcDate}</span>
          <span className="text-primary font-medium">{utcTime} UTC</span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-2 hidden md:inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider">
              <MapPin className="h-3.5 w-3.5" />
              {t(regions.find(region => region.id === activeRegion)?.labelKey ?? 'topbar.regionGlobal')}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {regions.map(region => (
              <DropdownMenuItem
                key={region.id}
                onClick={() => onRegionChange(region.id)}
                className={cn('text-xs', activeRegion === region.id && 'font-bold text-primary')}
              >
                <region.icon className="h-3.5 w-3.5 mr-1.5" />
                {t(region.labelKey)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

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
                {t('topbar.exportCSV')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportNewsAsJSON(news)} className="text-xs">
                {t('topbar.exportJSON')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </span>

        {/* Intel Signals Badge */}
        <IntelSignalsBadge signals={signals} />

        {/* Copy link */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
              navigator.clipboard.writeText(window.location.href).catch(() => {});
            }}>
              <Link2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-[10px]">
            {t('topbar.copyLink')}
          </TooltipContent>
        </Tooltip>

        {/* Fullscreen toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
              if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => {});
              } else {
                document.documentElement.requestFullscreen().catch(() => {});
              }
            }}>
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-[10px]">
            {isFullscreen ? t('topbar.exitFullscreen') : t('topbar.fullscreen')}
          </TooltipContent>
        </Tooltip>

        {/* Sound toggle — hidden on small mobile */}
        <span className="hidden sm:inline-flex">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleSound}>
                {soundEnabled ? <Volume2 className="h-4 w-4 text-success" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-[10px]">
              {soundEnabled ? t('topbar.soundOn') : t('topbar.soundOff')}
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
              <SheetTitle className="text-base">{t('topbar.notifications')}</SheetTitle>
              <SheetDescription>{t('topbar.notificationsDesc')}</SheetDescription>
            </SheetHeader>
            <div className="mt-4 flex justify-end">
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={markAllAsRead}>
                {t('topbar.markAllRead')}
              </Button>
            </div>
            <div className="mt-3 space-y-2 max-h-[75vh] overflow-y-auto pr-1">
              {notifications.length === 0 ? (
                <p className="text-xs text-muted-foreground">{t('topbar.noNotifications')}</p>
              ) : (
                notifications.map((n) => (
                  <article key={n.id} className={cn('rounded-md border border-border p-2 text-xs', !n.read && 'bg-muted/40')}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-foreground">{typeLabelKeys[n.type] ? t(typeLabelKeys[n.type]) : n.type}</span>
                      <span className="text-[10px] text-muted-foreground">{new Date(n.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="mt-1 text-foreground">{n.title}</p>
                    {n.source && <p className="mt-1 text-[11px] text-muted-foreground">{t('topbar.source')}: {n.source}</p>}
                  </article>
                ))
              )}
            </div>
          </SheetContent>
        </Sheet>

        <ThemeToggle />

        {/* Icon-based variant switcher */}
        {variant && variantOptions?.length && onVariantChange && (
          <div className="hidden sm:flex items-center gap-0.5 rounded border border-border p-0.5 bg-card">
            {variantOptions.map(option => {
              const variantIcons: Record<string, typeof Shield> = {
                humanitarian: Heart,
                intel: Brain,
                operations: Activity,
                recovery: Shield,
              };
              const Icon = variantIcons[option.id] ?? Shield;
              const isActive = variant === option.id;
              return (
                <Tooltip key={option.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onVariantChange(option.id)}
                      aria-label={option.label}
                      className={cn(
                        'h-6 w-6 rounded flex items-center justify-center transition-colors',
                        isActive
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-[10px]">
                    {option.label}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        )}

        {/* Language Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Globe className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {supportedLanguages.map(option => (
              <DropdownMenuItem
                key={option.code}
                onClick={() => changeLanguage(option.code)}
                className={cn('text-xs', lang === option.code && 'font-bold text-primary')}
              >
                {option.nativeLabel} ({option.code.toUpperCase()})
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <AuthDialog />
      </div>
    </header>
  );
}
