import { mockConnectivityPoints } from '@/data/newFeaturesMockData';
import { Wifi, MessageSquare, Globe, Signal, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import type { ConnectivityType } from '@/data/newFeaturesMockData';

const typeConfig: Record<ConnectivityType, { icon: React.ReactNode; color: string; label: string }> = {
  wifi_hotspot: { icon: <Wifi className="h-3 w-3" />, color: 'text-primary', label: 'WiFi' },
  community_wifi: { icon: <Signal className="h-3 w-3" />, color: 'text-success', label: 'Community WiFi' },
  sms_hub: { icon: <MessageSquare className="h-3 w-3" />, color: 'text-warning', label: 'SMS Hub' },
  internet_cafe: { icon: <Globe className="h-3 w-3" />, color: 'text-info', label: 'Internet Café' },
};

export function ConnectivityPanel() {
  const { t } = useTranslation();
  const active = mockConnectivityPoints.filter(c => c.active);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="p-2 border-b border-border bg-card">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-info flex items-center gap-1.5">
          <Wifi className="h-3 w-3" /> {t('connectivity.title')}
        </h3>
        <p className="text-[8px] text-muted-foreground mt-0.5">{t('connectivity.subtitle')}</p>
      </div>

      <div className="p-2 grid grid-cols-2 gap-1">
        <div className="bg-muted/30 rounded p-1 text-center">
          <div className="text-[10px] font-bold">{mockConnectivityPoints.length}</div>
          <div className="text-[7px] text-muted-foreground">{t('connectivity.points')}</div>
        </div>
        <div className="bg-success/10 rounded p-1 text-center">
          <div className="text-[10px] font-bold text-success">{active.length}</div>
          <div className="text-[7px] text-muted-foreground">{t('connectivity.active')}</div>
        </div>
      </div>

      <div className="p-2 space-y-1.5">
        {mockConnectivityPoints.map(cp => {
          const cfg = typeConfig[cp.type];
          return (
            <div key={cp.id} className={cn('border rounded p-2 space-y-0.5', cp.active ? 'border-border' : 'border-danger/30 bg-danger/5')}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium flex items-center gap-1">
                  <span className={cfg.color}>{cfg.icon}</span> {cp.name}
                </span>
                <span className={cn('text-[7px] px-1 py-0.5 rounded font-bold', cp.active ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger')}>
                  {cp.active ? 'ONLINE' : 'DOWN'}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 text-[8px] text-muted-foreground">
                <span className={cn('font-bold', cfg.color)}>{cfg.label}</span>
                <span>{cp.city}</span>
                <span>📶 {cp.speed}</span>
                {cp.free && <span className="text-success font-bold">{t('connectivity.free')}</span>}
              </div>
              <p className="text-[8px] text-muted-foreground">{cp.notes}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
