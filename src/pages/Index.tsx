import { TopBar } from '@/components/TopBar';
import { AlertTicker } from '@/components/AlertTicker';
import { LeftSidebar } from '@/components/LeftSidebar';
import { CrisisMap } from '@/components/CrisisMap';
import { RightPanel } from '@/components/RightPanel';
import { StatusBar } from '@/components/StatusBar';
import { useNotifications } from '@/hooks/useNotifications';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useIsMobile } from '@/hooks/use-mobile';
import { Newspaper, Map, Brain, Heart, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import { usePersistedState } from '@/hooks/usePersistedState';
import { isFeatureEnabled } from '@/config/featureFlags';
import { OperationsShell } from '@/features/operations/OperationsShell';

type MobileTab = 'map' | 'feed' | 'intel' | 'aid' | 'tools';

function LegacyShell() {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = usePersistedState('cedarsalert_sidebar', !isMobile);
  const [rightOpen, setRightOpen] = usePersistedState('cedarsalert_rightpanel', !isMobile);
  const [activeRegion, setActiveRegion] = usePersistedState('cedarsalert_region', 'lebanon');
  const [mobileTab, setMobileTab] = usePersistedState<MobileTab>('cedarsalert_mobiletab', 'map');
  const { t } = useTranslation();

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
        {/* Mobile bottom nav */}
        <nav className="shrink-0 border-t border-border bg-card flex items-stretch safe-bottom">
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
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        activeRegion={activeRegion}
        onRegionChange={setActiveRegion}
      />
      <AlertTicker />
      <div className="flex-1 flex overflow-hidden">
        <LeftSidebar isOpen={sidebarOpen} />
        <main className="flex-1 relative">
          <CrisisMap />
        </main>
        <RightPanel isOpen={rightOpen} onToggle={() => setRightOpen(!rightOpen)} />
      </div>
      <StatusBar />
    </div>
  );
}

const Index = () => {
  const { position } = useGeolocation();
  useNotifications(position);
  const operationsShellEnabled = isFeatureEnabled('operationsShell');

  return operationsShellEnabled ? <OperationsShell /> : <LegacyShell />;
};

export default Index;
