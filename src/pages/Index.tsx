import { useState } from 'react';
import { TopBar } from '@/components/TopBar';
import { AlertTicker } from '@/components/AlertTicker';
import { LeftSidebar } from '@/components/LeftSidebar';
import { CrisisMap } from '@/components/CrisisMap';
import { RightPanel } from '@/components/RightPanel';
import { StatusBar } from '@/components/StatusBar';
import { useNotifications } from '@/hooks/useNotifications';
import { useGeolocation } from '@/hooks/useGeolocation';

const Index = () => {
  const { position } = useGeolocation();
  useNotifications(position);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [activeRegion, setActiveRegion] = useState('lebanon');

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
