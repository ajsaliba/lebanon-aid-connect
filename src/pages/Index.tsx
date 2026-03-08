import { useState } from 'react';
import { TopBar } from '@/components/TopBar';
import { AlertTicker } from '@/components/AlertTicker';
import { LeftSidebar } from '@/components/LeftSidebar';
import { CrisisMap } from '@/components/CrisisMap';
import { RightPanel } from '@/components/RightPanel';
import { StatusBar } from '@/components/StatusBar';
import { useNotifications } from '@/hooks/useNotifications';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useIsMobile } from '@/hooks/use-mobile';
import { Newspaper, Map, Brain, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

type MobileTab = 'map' | 'feed' | 'intel' | 'aid';

const Index = () => {
  const { position } = useGeolocation();
  useNotifications(position);
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [rightOpen, setRightOpen] = useState(!isMobile);
  const [activeRegion, setActiveRegion] = useState('lebanon');
  const [mobileTab, setMobileTab] = useState<MobileTab>('map');

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
        </div>
        {/* Mobile bottom nav */}
        <nav className="shrink-0 border-t border-border bg-card flex items-stretch safe-bottom">
          {([
            { id: 'map' as const, label: 'Map', icon: Map },
            { id: 'feed' as const, label: 'Feed', icon: Newspaper },
            { id: 'intel' as const, label: 'Intel', icon: Brain },
            { id: 'aid' as const, label: 'Aid', icon: Heart },
          ]).map(t => (
            <button
              key={t.id}
              onClick={() => setMobileTab(t.id)}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] uppercase tracking-wider transition-colors',
                mobileTab === t.id
                  ? 'text-primary bg-primary/5'
                  : 'text-muted-foreground'
              )}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
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
};

export default Index;
