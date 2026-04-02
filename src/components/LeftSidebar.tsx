import { useState, useEffect, lazy, Suspense } from 'react';
import { NewsFeed } from './NewsFeed';
import { LiveStreams } from './LiveStreams';
import { PanelSkeleton } from './PanelSkeleton';
import { useNewsFeedContext } from '@/contexts/NewsFeedContext';
import { useTrendingKeywords } from '@/hooks/useTrendingKeywords';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Newspaper, Brain, Video, Wrench } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

// Lazy-load heavy panel components so they only mount when their tab is active
const WorldBriefPanel = lazy(() => import('./WorldBriefPanel').then(m => ({ default: m.WorldBriefPanel })));
const FocalPointsPanel = lazy(() => import('./FocalPointsPanel').then(m => ({ default: m.FocalPointsPanel })));
const WarImpactPanel = lazy(() => import('./WarImpactPanel').then(m => ({ default: m.WarImpactPanel })));
const RefugeeFlowPanel = lazy(() => import('./RefugeeFlowPanel').then(m => ({ default: m.RefugeeFlowPanel })));
const SentimentVelocityPanel = lazy(() => import('./SentimentVelocityPanel').then(m => ({ default: m.SentimentVelocityPanel })));
const StrategicPosturePanel = lazy(() => import('./StrategicPosturePanel').then(m => ({ default: m.StrategicPosturePanel })));
const GDELTIntelPanel = lazy(() => import('./GDELTIntelPanel').then(m => ({ default: m.GDELTIntelPanel })));
const PredictiveRiskPanel = lazy(() => import('./PredictiveRiskPanel').then(m => ({ default: m.PredictiveRiskPanel })));
const SatellitePanel = lazy(() => import('./SatellitePanel').then(m => ({ default: m.SatellitePanel })));
const StrategicRiskPanel = lazy(() => import('./StrategicRiskPanel').then(m => ({ default: m.StrategicRiskPanel })));
const CIIPanel = lazy(() => import('./CIIPanel').then(m => ({ default: m.CIIPanel })));
const InfrastructureCascadePanel = lazy(() => import('./InfrastructureCascadePanel').then(m => ({ default: m.InfrastructureCascadePanel })));
const ConflictTimelinePanel = lazy(() => import('./ConflictTimelinePanel').then(m => ({ default: m.ConflictTimelinePanel })));
const CommunityRiskPanel = lazy(() => import('./CommunityRiskPanel').then(m => ({ default: m.CommunityRiskPanel })));
const RumorVerifyPanel = lazy(() => import('./RumorVerifyPanel').then(m => ({ default: m.RumorVerifyPanel })));
const CrisisAssistantPanel = lazy(() => import('./CrisisAssistantPanel').then(m => ({ default: m.CrisisAssistantPanel })));
const EarlyWarningPanel = lazy(() => import('./EarlyWarningPanel').then(m => ({ default: m.EarlyWarningPanel })));
const NightPowerPanel = lazy(() => import('./NightPowerPanel').then(m => ({ default: m.NightPowerPanel })));
const ResourceForecastPanel = lazy(() => import('./ResourceForecastPanel').then(m => ({ default: m.ResourceForecastPanel })));
const AidAccountabilityPanel = lazy(() => import('./AidAccountabilityPanel').then(m => ({ default: m.AidAccountabilityPanel })));
const GPSJammingPanel = lazy(() => import('./GPSJammingPanel').then(m => ({ default: m.GPSJammingPanel })));
const ProtestsPanel = lazy(() => import('./ProtestsPanel').then(m => ({ default: m.ProtestsPanel })));
const WeatherAlertsPanel = lazy(() => import('./WeatherAlertsPanel').then(m => ({ default: m.WeatherAlertsPanel })));
const TrendingPanel = lazy(() => import('./TrendingPanel').then(m => ({ default: m.TrendingPanel })));

// Resources tab panels
const SafeRoutePanel = lazy(() => import('./SafeRoutePanel').then(m => ({ default: m.SafeRoutePanel })));
const InfraStatusPanel = lazy(() => import('./InfraStatusPanel').then(m => ({ default: m.InfraStatusPanel })));
const LogisticsPanel = lazy(() => import('./LogisticsPanel').then(m => ({ default: m.LogisticsPanel })));
const DamageReportPanel = lazy(() => import('./DamageReportPanel').then(m => ({ default: m.DamageReportPanel })));
const CrisisKnowledgePanel = lazy(() => import('./CrisisKnowledgePanel').then(m => ({ default: m.CrisisKnowledgePanel })));
const CommunityPanel = lazy(() => import('./CommunityPanel').then(m => ({ default: m.CommunityPanel })));
const SecurityPrivacyPanel = lazy(() => import('./SecurityPrivacyPanel').then(m => ({ default: m.SecurityPrivacyPanel })));
const FuelStationPanel = lazy(() => import('./FuelStationPanel').then(m => ({ default: m.FuelStationPanel })));
const TransportPanel = lazy(() => import('./TransportPanel').then(m => ({ default: m.TransportPanel })));
const FoodWaterPanel = lazy(() => import('./FoodWaterPanel').then(m => ({ default: m.FoodWaterPanel })));
const EnergyPanel = lazy(() => import('./EnergyPanel').then(m => ({ default: m.EnergyPanel })));
const ConnectivityPanel = lazy(() => import('./ConnectivityPanel').then(m => ({ default: m.ConnectivityPanel })));
const DIYToolsPanel = lazy(() => import('./DIYToolsPanel').then(m => ({ default: m.DIYToolsPanel })));
const NGOMissionPanel = lazy(() => import('./NGOMissionPanel').then(m => ({ default: m.NGOMissionPanel })));
const EmergencyPlanPanel = lazy(() => import('./EmergencyPlanPanel').then(m => ({ default: m.EmergencyPlanPanel })));
const EmergencyKitPanel = lazy(() => import('./EmergencyKitPanel').then(m => ({ default: m.EmergencyKitPanel })));
const SupplyChainPanel = lazy(() => import('./SupplyChainPanel').then(m => ({ default: m.SupplyChainPanel })));
const ReconstructionPanel = lazy(() => import('./ReconstructionPanel').then(m => ({ default: m.ReconstructionPanel })));
const MeshNetworkPanel = lazy(() => import('./MeshNetworkPanel').then(m => ({ default: m.MeshNetworkPanel })));
const NeighborhoodLeadersPanel = lazy(() => import('./NeighborhoodLeadersPanel').then(m => ({ default: m.NeighborhoodLeadersPanel })));
const FieldHospitalPanel = lazy(() => import('./FieldHospitalPanel').then(m => ({ default: m.FieldHospitalPanel })));
const AgriculturePanel = lazy(() => import('./AgriculturePanel').then(m => ({ default: m.AgriculturePanel })));

type SidebarTab = 'feed' | 'intel' | 'streams' | 'resources';

interface LeftSidebarProps {
  isOpen: boolean;
  /** On mobile, force a specific tab (no tab bar shown) */
  mobileForceTab?: 'feed' | 'intel' | 'resources';
}

/** Suspense wrapper for lazy-loaded panels — shows skeleton during load */
function LazyPanel({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<PanelSkeleton />}>
      {children}
    </Suspense>
  );
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
      !isMobileMode && (isOpen ? 'w-[380px]' : 'w-0')
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
                <LazyPanel><WorldBriefPanel /></LazyPanel>
                <LazyPanel><FocalPointsPanel /></LazyPanel>
                <LazyPanel><WarImpactPanel /></LazyPanel>
                <LazyPanel><RefugeeFlowPanel /></LazyPanel>
                <LazyPanel><SentimentVelocityPanel /></LazyPanel>
                <LazyPanel><StrategicPosturePanel /></LazyPanel>
                <LazyPanel><GDELTIntelPanel /></LazyPanel>
                <LazyPanel><PredictiveRiskPanel /></LazyPanel>
                <LazyPanel><SatellitePanel /></LazyPanel>
                <LazyPanel><StrategicRiskPanel /></LazyPanel>
                <LazyPanel><CIIPanel /></LazyPanel>
                <LazyPanel><InfrastructureCascadePanel /></LazyPanel>
                <LazyPanel><ConflictTimelinePanel /></LazyPanel>
                <LazyPanel><CommunityRiskPanel /></LazyPanel>
                <LazyPanel><RumorVerifyPanel /></LazyPanel>
                <LazyPanel><CrisisAssistantPanel /></LazyPanel>
                <LazyPanel><EarlyWarningPanel /></LazyPanel>
                <LazyPanel><NightPowerPanel /></LazyPanel>
                <LazyPanel><ResourceForecastPanel /></LazyPanel>
                <LazyPanel><AidAccountabilityPanel /></LazyPanel>
                <LazyPanel><GPSJammingPanel /></LazyPanel>
                <LazyPanel><ProtestsPanel /></LazyPanel>
                <LazyPanel><WeatherAlertsPanel /></LazyPanel>
                <LazyPanel><TrendingPanel keywords={trendingKeywords} /></LazyPanel>
              </div>
            </ScrollArea>
          )}

          {tab === 'resources' && (
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-3">
                <LazyPanel><SafeRoutePanel /></LazyPanel>
                <LazyPanel><InfraStatusPanel /></LazyPanel>
                <LazyPanel><LogisticsPanel /></LazyPanel>
                <LazyPanel><DamageReportPanel /></LazyPanel>
                <LazyPanel><CrisisKnowledgePanel /></LazyPanel>
                <LazyPanel><CommunityPanel /></LazyPanel>
                <LazyPanel><SecurityPrivacyPanel /></LazyPanel>
                <LazyPanel><FuelStationPanel /></LazyPanel>
                <LazyPanel><TransportPanel /></LazyPanel>
                <LazyPanel><FoodWaterPanel /></LazyPanel>
                <LazyPanel><EnergyPanel /></LazyPanel>
                <LazyPanel><ConnectivityPanel /></LazyPanel>
                <LazyPanel><DIYToolsPanel /></LazyPanel>
                <LazyPanel><NGOMissionPanel /></LazyPanel>
                <LazyPanel><EmergencyPlanPanel /></LazyPanel>
                <LazyPanel><EmergencyKitPanel /></LazyPanel>
                <LazyPanel><SupplyChainPanel /></LazyPanel>
                <LazyPanel><ReconstructionPanel /></LazyPanel>
                <LazyPanel><MeshNetworkPanel /></LazyPanel>
                <LazyPanel><NeighborhoodLeadersPanel /></LazyPanel>
                <LazyPanel><FieldHospitalPanel /></LazyPanel>
                <LazyPanel><AgriculturePanel /></LazyPanel>
              </div>
            </ScrollArea>
          )}

          {tab === 'streams' && <LiveStreams />}
        </>
      )}
    </aside>
  );
}
