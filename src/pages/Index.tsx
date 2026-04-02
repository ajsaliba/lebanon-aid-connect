import { useEffect } from 'react';
import { TopBar } from '@/components/TopBar';
import { AlertTicker } from '@/components/AlertTicker';
import { LeftSidebar } from '@/components/LeftSidebar';
import { CrisisMap } from '@/components/CrisisMap';
import { RightPanel } from '@/components/RightPanel';
import { StatusBar } from '@/components/StatusBar';
import { useNotifications } from '@/hooks/useNotifications';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useIsMobile } from '@/hooks/use-mobile';
import { Newspaper, Map, Brain, Heart, Wrench, AlertTriangle, CircleDot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import { usePersistedState } from '@/hooks/usePersistedState';
import { isFeatureEnabled } from '@/config/featureFlags';
import { OperationsShell } from '@/features/operations/OperationsShell';
import { useNewsFeedContext } from '@/contexts/NewsFeedContext';

type MobileTab = 'map' | 'feed' | 'intel' | 'aid' | 'tools';

function useMediaQuery(query: string) {
  const [matches, setMatches] = usePersistedState<boolean>(`mq_${query}`, false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia(query);
    const onChange = () => setMatches(media.matches);
    media.addEventListener('change', onChange);
    onChange();
    return () => media.removeEventListener('change', onChange);
  }, [query, setMatches]);
  return matches;
}

function LegacyShell() {
  const isMobile = useIsMobile();
  const isMediumScreen = useMediaQuery('(min-width: 1024px) and (max-width: 1279px)');
  const [sidebarOpen, setSidebarOpen] = usePersistedState('cedarsalert_sidebar', !isMobile);
  const [rightOpen, setRightOpen] = usePersistedState('cedarsalert_rightpanel', !isMobile);
  const [activeRegion, setActiveRegion] = usePersistedState('cedarsalert_region', 'lebanon');
  const [mobileTab, setMobileTab] = usePersistedState<MobileTab>('cedarsalert_mobiletab', 'map');
  const { t } = useTranslation();
  const { isLive, connectivityState, error } = useNewsFeedContext();

  // On medium screens (1024-1280px), enforce mutually exclusive sidebars
  const handleToggleSidebar = () => {
    const next = !sidebarOpen;
    setSidebarOpen(next);
    if (isMediumScreen && next && rightOpen) {
      setRightOpen(false);
    }
  };

  const handleToggleRight = () => {
    const next = !rightOpen;
    setRightOpen(next);
    if (isMediumScreen && next && sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  if (isMobile) {
    return (
      <div className="h-screen w-screen flex flex-col overflow-hidden grid-bg">
        <div className="scanline-overlay" />
        <TopBar
          onToggleSidebar={() => {}}
          activeRegion={activeRegion}
          onRegionChange={setActiveRegion}
        />
        <AlertTicker />
        {/* DEMO MODE banner */}
        {!isLive && (
          <div
            className={cn(
              'h-7 px-3 border-b flex items-center justify-between text-[10px] uppercase tracking-wider font-bold shrink-0',
              connectivityState === 'cached'
                ? 'border-warning/30 bg-warning/10 text-warning'
                : 'border-danger/30 bg-danger/10 text-danger'
            )}
          >
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="h-3 w-3" />
              {connectivityState === 'cached' ? 'Cached data — showing stale payload' : 'DEMO MODE — showing sample data'}
            </span>
          </div>
        )}
        <div className="flex-1 overflow-hidden relative">
          {mobileTab === 'map' && <CrisisMap />}
          {mobileTab === 'feed' && (
            <div className="h-full">
              <LeftSidebar isOpen mobileForceTab="feed" />
            </div>
          )}
          {mobileTab === 'intel' && (
            <div className="h-full">
              <LeftSidebar isOpen mobileForceTab="intel" />
            </div>
          )}
          {mobileTab === 'aid' && (
            <div className="h-full">
              <RightPanel isOpen onToggle={() => {}} fullWidth />
            </div>
          )}
          {mobileTab === 'tools' && (
            <div className="h-full">
              <LeftSidebar isOpen mobileForceTab="resources" />
            </div>
          )}
        </div>
        {/* Mobile bottom nav — fixed height for safe-area consistency */}
        <nav className="shrink-0 h-14 border-t border-border bg-card flex items-stretch" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
          {([
            { id: 'map' as const, label: t('nav.map'), icon: Map },
            { id: 'feed' as const, label: t('nav.feed'), icon: Newspaper },
            { id: 'intel' as const, label: t('nav.intel'), icon: Brain },
            { id: 'aid' as const, label: t('nav.aid'), icon: Heart },
            { id: 'tools' as const, label: t('nav.tools'), icon: Wrench },
          ]).map(navTab => (
            <button
              key={navTab.id}
              onClick={() => setMobileTab(navTab.id)}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] uppercase tracking-wider transition-colors',
                mobileTab === navTab.id
                  ? 'text-primary bg-primary/5'
                  : 'text-muted-foreground'
              )}
            >
              <navTab.icon className="h-4 w-4" />
              {navTab.label}
            </button>
          ))}
        </nav>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden grid-bg">
      <div className="scanline-overlay" />
      <TopBar
        onToggleSidebar={handleToggleSidebar}
        activeRegion={activeRegion}
        onRegionChange={setActiveRegion}
      />
      <AlertTicker />
      {/* DEMO MODE / degraded connectivity banner */}
      {!isLive && (
        <div
          className={cn(
            'h-7 px-3 border-b flex items-center justify-between text-[10px] uppercase tracking-wider font-bold shrink-0',
            connectivityState === 'cached'
              ? 'border-warning/30 bg-warning/10 text-warning'
              : 'border-danger/30 bg-danger/10 text-danger'
          )}
        >
          <span className="flex items-center gap-1.5">
            <AlertTriangle className="h-3 w-3" />
            {connectivityState === 'cached' ? 'Using cached payload' : 'DEMO MODE — showing sample data'}
          </span>
          <span>{typeof navigator !== 'undefined' && navigator.onLine ? 'online degraded' : 'offline'}</span>
        </div>
      )}
      {!!error && !isLive && (
        <div className="h-7 px-3 border-b border-border bg-muted/40 text-[10px] text-muted-foreground flex items-center gap-1.5 shrink-0">
          <CircleDot className="h-3 w-3" />
          {error}
        </div>
      )}
      <div className="flex-1 flex overflow-hidden">
        <LeftSidebar isOpen={sidebarOpen} />
        <main className="flex-1 relative">
          <CrisisMap />
        </main>
        <RightPanel isOpen={rightOpen} onToggle={handleToggleRight} />
      </div>
      <StatusBar />
    </div>
  );
}

const Index = () => {
  const { position } = useGeolocation();
  useNotifications(position);
  const operationsShellEnabled = isFeatureEnabled('operationsShell');

  const forceLegacy = (() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem('cedarsalert_shell_mode') === 'legacy';
    } catch {
      return false;
    }
  })();

  if (!forceLegacy && operationsShellEnabled) {
    return <OperationsShell />;
  }

  return <LegacyShell />;
};

export default Index;

