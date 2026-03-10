import { useState } from 'react';
import { ShelterPanel } from './ShelterPanel';
import { HousingPanel } from './HousingPanel';
import { DonationsPanel } from './DonationsPanel';
import { SOSPanel } from './SOSPanel';
import { AidMatchPanel } from './AidMatchPanel';
import { MedicalResourcePanel } from './MedicalResourcePanel';
import { VolunteerPanel } from './VolunteerPanel';
import { FamilyLocatorPanel } from './FamilyLocatorPanel';
import { EconomicToolsPanel } from './EconomicToolsPanel';
import { SafeBuildingPanel } from './SafeBuildingPanel';
import { PharmacyBloodPanel } from './PharmacyBloodPanel';
import { TelemedicinePanel } from './TelemedicinePanel';
import { VulnerableGroupsPanel } from './VulnerableGroupsPanel';
import { DisplacementPanel } from './DisplacementPanel';
import { MarketplacePanel } from './MarketplacePanel';
import { DigitalVaultPanel } from './DigitalVaultPanel';
import { DiasporaSupportPanel } from './DiasporaSupportPanel';
import { cn } from '@/lib/utils';
import { MapPin, Home, Heart, AlertTriangle, ChevronLeft, ChevronRight, HeartHandshake, Stethoscope, Users, UserSearch, DollarSign } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from '@/lib/i18n';

const tabs = [
  { id: 'sos', label: 'tab.sos', icon: AlertTriangle },
  { id: 'shelters', label: 'tab.shelters', icon: MapPin },
  { id: 'housing', label: 'tab.housing', icon: Home },
  { id: 'donate', label: 'tab.donate', icon: Heart },
  { id: 'aid', label: 'tab.aidMatch', icon: HeartHandshake },
  { id: 'medical', label: 'tab.medical', icon: Stethoscope },
  { id: 'volunteer', label: 'tab.volunteer', icon: Users },
  { id: 'family', label: 'tab.family', icon: UserSearch },
  { id: 'jobs', label: 'tab.jobs', icon: DollarSign },
] as const;

type TabId = typeof tabs[number]['id'];

interface RightPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  /** On mobile, take full width */
  fullWidth?: boolean;
}

export function RightPanel({ isOpen, onToggle, fullWidth }: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>('sos');
  const { t } = useTranslation();

  return (
    <div className={cn('relative flex', fullWidth && 'w-full h-full')}>
      {/* Toggle handle — hidden on mobile */}
      {!fullWidth && (
        <button
          onClick={onToggle}
          className="absolute -left-6 top-1/2 -translate-y-1/2 z-10 h-12 w-6 bg-card border border-border border-r-0 rounded-l flex items-center justify-center hover:bg-muted"
        >
          {isOpen ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      )}

      <aside className={cn(
        'h-full bg-card flex flex-col overflow-hidden transition-all duration-300',
        fullWidth ? 'w-full border-0' : 'border-l border-border',
        !fullWidth && (isOpen ? 'w-[420px]' : 'w-0')
      )}>
        {isOpen && (
          <>
            <div className="grid grid-cols-5 border-b border-border">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex flex-col items-center gap-0.5 py-1.5 px-1 text-[8px] uppercase tracking-wider transition-colors',
                    activeTab === tab.id
                      ? tab.id === 'sos'
                        ? 'text-danger border-b-2 border-danger bg-danger/5'
                        : 'text-primary border-b-2 border-primary bg-primary/5'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  <tab.icon className={cn('h-3.5 w-3.5', activeTab === tab.id && tab.id === 'sos' && 'animate-pulse')} />
                  {t(tab.label)}
                </button>
              ))}
            </div>
            <ScrollArea className="flex-1">
              {activeTab === 'sos' && <div className="space-y-3"><SOSPanel /><SafeBuildingPanel /></div>}
              {activeTab === 'shelters' && <ShelterPanel />}
              {activeTab === 'housing' && <div className="space-y-3"><HousingPanel /><DisplacementPanel /></div>}
              {activeTab === 'donate' && <div className="space-y-3"><DonationsPanel /><MarketplacePanel /><DiasporaSupportPanel /></div>}
              {activeTab === 'aid' && <AidMatchPanel />}
              {activeTab === 'medical' && <div className="space-y-3"><MedicalResourcePanel /><PharmacyBloodPanel /><TelemedicinePanel /></div>}
              {activeTab === 'volunteer' && <VolunteerPanel />}
              {activeTab === 'family' && <div className="space-y-3"><FamilyLocatorPanel /><VulnerableGroupsPanel /><DigitalVaultPanel /></div>}
              {activeTab === 'jobs' && <EconomicToolsPanel />}
            </ScrollArea>
          </>
        )}
      </aside>
    </div>
  );
}
