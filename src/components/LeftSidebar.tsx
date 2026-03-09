import { useState, useEffect } from 'react';
import { NewsFeed } from './NewsFeed';
import { LiveStreams } from './LiveStreams';
import { WorldBriefPanel } from './WorldBriefPanel';
import { CIIPanel } from './CIIPanel';
import { TrendingPanel } from './TrendingPanel';
import { StrategicRiskPanel } from './StrategicRiskPanel';
import { FocalPointsPanel } from './FocalPointsPanel';
import { InfrastructureCascadePanel } from './InfrastructureCascadePanel';
import { SentimentVelocityPanel } from './SentimentVelocityPanel';
import { StrategicPosturePanel } from './StrategicPosturePanel';
import { GDELTIntelPanel } from './GDELTIntelPanel';
import { useNewsFeedContext } from '@/contexts/NewsFeedContext';
import { useTrendingKeywords } from '@/hooks/useTrendingKeywords';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Newspaper, Brain, Video } from 'lucide-react';

type SidebarTab = 'feed' | 'intel' | 'streams';

interface LeftSidebarProps {
  isOpen: boolean;
  /** On mobile, force a specific tab (no tab bar shown) */
  mobileForceTab?: 'feed' | 'intel';
}

export function LeftSidebar({ isOpen, mobileForceTab }: LeftSidebarProps) {
  const [tab, setTab] = useState<SidebarTab>('feed');
  const { news } = useNewsFeedContext();
  const trendingKeywords = useTrendingKeywords(news);

  // Sync forced tab from mobile parent
  useEffect(() => {
    if (mobileForceTab) setTab(mobileForceTab);
  }, [mobileForceTab]);

  const isMobileMode = !!mobileForceTab;

  return (
    <aside className={cn(
      'h-full bg-card flex flex-col overflow-hidden transition-all duration-300',
      isMobileMode ? 'w-full border-0' : 'border-r border-border',
      !isMobileMode && (isOpen ? 'w-[480px]' : 'w-0')
    )}>
      {isOpen && (
        <>
          {/* Tab bar — hidden on mobile (tabs are in bottom nav) */}
          {!isMobileMode && (
            <div className="flex border-b border-border shrink-0">
              {([
                { id: 'feed' as const, label: 'Feed', icon: Newspaper },
                { id: 'intel' as const, label: 'Intel', icon: Brain },
                { id: 'streams' as const, label: 'Live', icon: Video },
              ]).map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] uppercase tracking-wider transition-colors',
                    tab === t.id
                      ? 'text-primary border-b-2 border-primary bg-primary/5'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  <t.icon className="h-3 w-3" />
                  {t.label}
                </button>
              ))}
            </div>
          )}

          {tab === 'feed' && (
            <div className="flex-1 overflow-hidden flex flex-col">
              <NewsFeed />
            </div>
          )}

          {tab === 'intel' && (
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-3">
                <WorldBriefPanel />
                <FocalPointsPanel />
                <SentimentVelocityPanel />
                <StrategicPosturePanel />
                <GDELTIntelPanel />
                <StrategicRiskPanel />
                <CIIPanel />
                <InfrastructureCascadePanel />
                <TrendingPanel keywords={trendingKeywords} />
              </div>
            </ScrollArea>
          )}

          {tab === 'streams' && <LiveStreams />}
        </>
      )}
    </aside>
  );
}
