import { useState } from 'react';
import { ShelterPanel } from './ShelterPanel';
import { HousingPanel } from './HousingPanel';
import { DonationsPanel } from './DonationsPanel';
import { SOSPanel } from './SOSPanel';
import { cn } from '@/lib/utils';
import { MapPin, Home, Heart, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const tabs = [
  { id: 'sos', label: 'SOS', icon: AlertTriangle },
  { id: 'shelters', label: 'Shelters', icon: MapPin },
  { id: 'housing', label: 'Housing', icon: Home },
  { id: 'donate', label: 'Donate', icon: Heart },
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
        !fullWidth && (isOpen ? 'w-80' : 'w-0')
      )}>
        {isOpen && (
          <>
            <div className="flex border-b border-border">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex-1 flex flex-col items-center gap-0.5 py-2 text-[9px] uppercase tracking-wider transition-colors',
                    activeTab === tab.id
                      ? tab.id === 'sos'
                        ? 'text-danger border-b-2 border-danger bg-danger/5'
                        : 'text-primary border-b-2 border-primary bg-primary/5'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  <tab.icon className={cn('h-3.5 w-3.5', activeTab === tab.id && tab.id === 'sos' && 'animate-pulse')} />
                  {tab.label}
                </button>
              ))}
            </div>
            <ScrollArea className="flex-1">
              {activeTab === 'sos' && <SOSPanel />}
              {activeTab === 'shelters' && <ShelterPanel />}
              {activeTab === 'housing' && <HousingPanel />}
              {activeTab === 'donate' && <DonationsPanel />}
            </ScrollArea>
          </>
        )}
      </aside>
    </div>
  );
}
