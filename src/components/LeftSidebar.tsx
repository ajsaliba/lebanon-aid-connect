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
import { WarImpactPanel } from './WarImpactPanel';
import { RefugeeFlowPanel } from './RefugeeFlowPanel';
import { PredictiveRiskPanel } from './PredictiveRiskPanel';
import { SatellitePanel } from './SatellitePanel';
import { SafeRoutePanel } from './SafeRoutePanel';
import { InfraStatusPanel } from './InfraStatusPanel';
import { LogisticsPanel } from './LogisticsPanel';
import { DamageReportPanel } from './DamageReportPanel';
import { CrisisKnowledgePanel } from './CrisisKnowledgePanel';
import { CommunityPanel } from './CommunityPanel';
import { SecurityPrivacyPanel } from './SecurityPrivacyPanel';
import { ConflictTimelinePanel } from './ConflictTimelinePanel';
import { CommunityRiskPanel } from './CommunityRiskPanel';
import { RumorVerifyPanel } from './RumorVerifyPanel';
import { CrisisAssistantPanel } from './CrisisAssistantPanel';
import { FuelStationPanel } from './FuelStationPanel';
import { TransportPanel } from './TransportPanel';
import { FoodWaterPanel } from './FoodWaterPanel';
import { EnergyPanel } from './EnergyPanel';
import { ConnectivityPanel } from './ConnectivityPanel';
import { DIYToolsPanel } from './DIYToolsPanel';
import { NGOMissionPanel } from './NGOMissionPanel';
import { EmergencyPlanPanel } from './EmergencyPlanPanel';
import { EmergencyKitPanel } from './EmergencyKitPanel';
import { EarlyWarningPanel } from './EarlyWarningPanel';
import { NightPowerPanel } from './NightPowerPanel';
import { SupplyChainPanel } from './SupplyChainPanel';
import { ReconstructionPanel } from './ReconstructionPanel';
import { MeshNetworkPanel } from './MeshNetworkPanel';
import { ResourceForecastPanel } from './ResourceForecastPanel';
import { NeighborhoodLeadersPanel } from './NeighborhoodLeadersPanel';
import { FieldHospitalPanel } from './FieldHospitalPanel';
import { AidAccountabilityPanel } from './AidAccountabilityPanel';
import { AgriculturePanel } from './AgriculturePanel';
import { GPSJammingPanel } from './GPSJammingPanel';
import { ProtestsPanel } from './ProtestsPanel';
import { WeatherAlertsPanel } from './WeatherAlertsPanel';
import { useNewsFeedContext } from '@/contexts/NewsFeedContext';
import { useTrendingKeywords } from '@/hooks/useTrendingKeywords';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Newspaper, Brain, Video, Wrench } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

type SidebarTab = 'feed' | 'intel' | 'streams' | 'resources';

interface LeftSidebarProps {
  isOpen: boolean;
  /** On mobile, force a specific tab (no tab bar shown) */
  mobileForceTab?: 'feed' | 'intel' | 'resources';
}

export function LeftSidebar({ isOpen, mobileForceTab }: LeftSidebarProps) {
  const [tab, setTab] = useState<SidebarTab>('feed');
  const { news } = useNewsFeedContext();
  const trendingKeywords = useTrendingKeywords(news);
  const { t } = useTranslation();

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
                { id: 'feed' as const, label: t('nav.feed'), icon: Newspaper },
                { id: 'intel' as const, label: t('nav.intel'), icon: Brain },
                { id: 'resources' as const, label: t('nav.tools'), icon: Wrench },
                { id: 'streams' as const, label: t('nav.live'), icon: Video },
              ]).map(t_tab => (
                <button
                  key={t_tab.id}
                  onClick={() => setTab(t_tab.id)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] uppercase tracking-wider transition-colors',
                    tab === t_tab.id
                      ? 'text-primary border-b-2 border-primary bg-primary/5'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  <t_tab.icon className="h-3 w-3" />
                  {t_tab.label}
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
                <WarImpactPanel />
                <RefugeeFlowPanel />
                <SentimentVelocityPanel />
                <StrategicPosturePanel />
                <GDELTIntelPanel />
                <PredictiveRiskPanel />
                <SatellitePanel />
                <StrategicRiskPanel />
                <CIIPanel />
                <InfrastructureCascadePanel />
                <ConflictTimelinePanel />
                <CommunityRiskPanel />
                <RumorVerifyPanel />
                <CrisisAssistantPanel />
                <EarlyWarningPanel />
                <NightPowerPanel />
                <ResourceForecastPanel />
                <AidAccountabilityPanel />
                <GPSJammingPanel />
                <ProtestsPanel />
                <WeatherAlertsPanel />
                <TrendingPanel keywords={trendingKeywords} />
              </div>
            </ScrollArea>
          )}

          {tab === 'resources' && (
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-3">
                <SafeRoutePanel />
                <InfraStatusPanel />
                <LogisticsPanel />
                <DamageReportPanel />
                <CrisisKnowledgePanel />
                <CommunityPanel />
                <SecurityPrivacyPanel />
                <FuelStationPanel />
                <TransportPanel />
                <FoodWaterPanel />
                <EnergyPanel />
                <ConnectivityPanel />
                <DIYToolsPanel />
                <NGOMissionPanel />
                <EmergencyPlanPanel />
                <EmergencyKitPanel />
                <SupplyChainPanel />
                <ReconstructionPanel />
                <MeshNetworkPanel />
                <NeighborhoodLeadersPanel />
                <FieldHospitalPanel />
                <AgriculturePanel />
              </div>
            </ScrollArea>
          )}

          {tab === 'streams' && <LiveStreams />}
        </>
      )}
    </aside>
  );
}
