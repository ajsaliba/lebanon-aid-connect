import { useBridgedVulnerableCases } from '@/services/mockBridge';
import { Heart, Baby, Accessibility, Dog, AlertTriangle, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import type { VulnerableType } from '@/data/newFeaturesMockData';

const typeConfig: Record<VulnerableType, { icon: React.ReactNode; color: string; label: string }> = {
  elderly: { icon: <Heart className="h-3 w-3" />, color: 'text-warning', label: 'Elderly' },
  disabled: { icon: <Accessibility className="h-3 w-3" />, color: 'text-info', label: 'Disabled' },
  child: { icon: <Baby className="h-3 w-3" />, color: 'text-primary', label: 'Child' },
  pet: { icon: <Dog className="h-3 w-3" />, color: 'text-success', label: 'Pet' },
};

const statusColors: Record<string, string> = {
  needs_help: 'bg-danger/20 text-danger',
  assigned: 'bg-warning/20 text-warning',
  resolved: 'bg-success/20 text-success',
};

export function VulnerableGroupsPanel() {
  const { t } = useTranslation();
  const { data: mockVulnerableCases = [], isLoading } = useBridgedVulnerableCases();
  const needsHelp = mockVulnerableCases.filter(c => c.status === 'needs_help').length;

  if (isLoading) return <div className="border border-border rounded-lg p-4 text-center text-[9px] text-muted-foreground">Loading...</div>;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="p-2 border-b border-border bg-card">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-warning flex items-center gap-1.5">
          <Heart className="h-3 w-3" /> {t('vulnerable.title')}
        </h3>
        <p className="text-[8px] text-muted-foreground mt-0.5">{t('vulnerable.subtitle')}</p>
      </div>

      <div className="p-2 grid grid-cols-4 gap-1">
        {(['elderly', 'disabled', 'child', 'pet'] as VulnerableType[]).map(type => {
          const cfg = typeConfig[type];
          const count = mockVulnerableCases.filter(c => c.type === type).length;
          return (
            <div key={type} className="bg-muted/30 rounded p-1 text-center">
              <div className={cn('text-[10px] font-bold', cfg.color)}>{count}</div>
              <div className="text-[7px] text-muted-foreground">{cfg.label}</div>
            </div>
          );
        })}
      </div>

      <div className="p-2 space-y-1.5">
        {mockVulnerableCases.map(vc => {
          const cfg = typeConfig[vc.type];
          return (
            <div key={vc.id} className={cn('border rounded p-2 space-y-0.5',
              vc.status === 'needs_help' ? 'border-danger/30 bg-danger/5' : 'border-border')}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium flex items-center gap-1">
                  <span className={cfg.color}>{cfg.icon}</span> {vc.name}
                </span>
                <span className={cn('text-[7px] font-bold px-1 py-0.5 rounded uppercase', statusColors[vc.status])}>
                  {vc.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-[8px] text-muted-foreground">{vc.description}</p>
              <div className="flex flex-wrap gap-1.5 text-[8px]">
                <span className="text-muted-foreground">📍 {vc.location}</span>
                {vc.needs.map(n => (
                  <span key={n} className="bg-muted/50 px-1 py-0.5 rounded text-[7px]">{n}</span>
                ))}
              </div>
              <div className="text-[8px] text-primary flex items-center gap-1">
                <Phone className="h-2.5 w-2.5" /> {vc.contact}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
