import { useState } from 'react';
import { useBridgedNGOActivities, useBridgedVolunteerMissions } from '@/services/mockBridge';
import { Globe, Users, MapPin, Megaphone, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

type NGOView = 'map' | 'missions';

const sectorColors: Record<string, string> = {
  medical: 'text-danger',
  food: 'text-success',
  shelter: 'text-primary',
  protection: 'text-warning',
  education: 'text-info',
  wash: 'text-blue-400',
  logistics: 'text-purple-400',
};

const urgencyColors: Record<string, string> = {
  critical: 'bg-danger/20 text-danger',
  high: 'bg-warning/20 text-warning',
  normal: 'bg-info/20 text-info',
};

export function NGOMissionPanel() {
  const { data: mockNGOActivities = [], isLoading: isLoadingNGO } = useBridgedNGOActivities();
  const { data: mockVolunteerMissions = [], isLoading: isLoadingMissions } = useBridgedVolunteerMissions();
  const { t } = useTranslation();
  const [view, setView] = useState<NGOView>('map');

  if (isLoadingNGO || isLoadingMissions) return <div className="border border-border rounded-lg p-4 text-center text-[9px] text-muted-foreground">Loading...</div>;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="p-2 border-b border-border bg-card">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
          <Globe className="h-3 w-3" /> {t('ngo.title')}
        </h3>
      </div>

      <div className="flex border-b border-border">
        {([
          { id: 'map' as const, label: t('ngo.activity'), icon: MapPin },
          { id: 'missions' as const, label: t('ngo.missions'), icon: Megaphone },
        ]).map(tab => (
          <button key={tab.id} onClick={() => setView(tab.id)}
            className={cn('flex-1 flex items-center justify-center gap-1 py-1.5 text-[8px] uppercase',
              view === tab.id ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground'
            )}>
            <tab.icon className="h-3 w-3" /> {tab.label}
          </button>
        ))}
      </div>

      <div className="p-2 space-y-1.5">
        {view === 'map' && mockNGOActivities.map(ngo => (
          <div key={ngo.id} className="border border-border rounded p-2 space-y-0.5 hover:bg-muted/20 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">{ngo.organization}</span>
              <span className={cn('text-[7px] font-bold uppercase px-1 py-0.5 rounded', sectorColors[ngo.sector])}>
                {ngo.sector}
              </span>
            </div>
            <p className="text-[8px] text-muted-foreground">{ngo.description}</p>
            <div className="flex items-center justify-between text-[7px] text-muted-foreground">
              <span>📍 {ngo.region}</span>
              <span>{ngo.contact}</span>
            </div>
          </div>
        ))}

        {view === 'missions' && mockVolunteerMissions.map(vm => (
          <div key={vm.id} className={cn('border rounded p-2 space-y-1',
            vm.urgency === 'critical' ? 'border-danger/30 bg-danger/5' : 'border-border'
          )}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">{vm.title}</span>
              <span className={cn('text-[7px] font-bold px-1 py-0.5 rounded uppercase', urgencyColors[vm.urgency])}>
                {vm.urgency}
              </span>
            </div>
            <div className="text-[8px] text-muted-foreground">{vm.organization}</div>
            <p className="text-[8px] text-muted-foreground">{vm.description}</p>
            <div className="flex flex-wrap gap-1">
              {vm.skills_needed.map(s => (
                <span key={s} className="text-[7px] bg-muted/50 px-1 py-0.5 rounded">{s}</span>
              ))}
            </div>
            <div className="flex items-center justify-between text-[8px]">
              <span className="text-muted-foreground">📍 {vm.location}</span>
              <span className="flex items-center gap-1">
                <Users className="h-2.5 w-2.5" />
                <span className={cn(vm.volunteers_signed < vm.volunteers_needed ? 'text-warning' : 'text-success')}>
                  {vm.volunteers_signed}/{vm.volunteers_needed}
                </span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
