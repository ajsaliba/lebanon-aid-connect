import { useBridgedCommNodes } from '@/services/mockBridge';
import type { CommType } from '@/data/newFeaturesMockData2';
import { Wifi, Radio, HardDrive, Users, Signal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

const typeConfig: Record<CommType, { icon: React.ReactNode; color: string; label: string }> = {
  mesh_node: { icon: <Wifi className="h-3 w-3" />, color: 'text-cyan-400', label: 'Mesh Node' },
  radio_tower: { icon: <Radio className="h-3 w-3" />, color: 'text-violet-400', label: 'Radio Tower' },
  offline_hub: { icon: <HardDrive className="h-3 w-3" />, color: 'text-amber-400', label: 'Offline Hub' },
};

export function MeshNetworkPanel() {
  const { data: mockCommNodes = [], isLoading } = useBridgedCommNodes();
  const { t } = useTranslation();
  const activeCount = mockCommNodes.filter(n => n.active).length;
  const totalUsers = mockCommNodes.reduce((s, n) => s + n.users_connected, 0);

  if (isLoading) return <div className="border border-border rounded-lg p-4 text-center text-[9px] text-muted-foreground">Loading...</div>;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="p-2 border-b border-border bg-card">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
          <Signal className="h-3 w-3" /> {t('meshNetwork.title')}
        </h3>
        <p className="text-[8px] text-muted-foreground mt-0.5">{t('meshNetwork.subtitle')}</p>
      </div>

      {/* Stats */}
      <div className="p-2 grid grid-cols-3 gap-1 border-b border-border">
        {(['mesh_node', 'radio_tower', 'offline_hub'] as CommType[]).map(type => {
          const cfg = typeConfig[type];
          const active = mockCommNodes.filter(n => n.type === type && n.active).length;
          const total = mockCommNodes.filter(n => n.type === type).length;
          return (
            <div key={type} className="bg-muted/30 rounded p-1 text-center">
              <div className={cn('text-[10px] font-bold', cfg.color)}>{active}/{total}</div>
              <div className="text-[7px] text-muted-foreground">{cfg.label}</div>
            </div>
          );
        })}
      </div>

      <div className="p-2 flex items-center gap-1.5 text-[9px] border-b border-border">
        <Users className="h-3 w-3 text-primary" />
        <span className="text-muted-foreground">{totalUsers} users connected · {activeCount}/{mockCommNodes.length} nodes active</span>
      </div>

      <div className="p-2 space-y-1.5">
        {mockCommNodes.map(node => {
          const cfg = typeConfig[node.type];
          return (
            <div key={node.id} className={cn('border rounded p-2 space-y-0.5', node.active ? 'border-border' : 'border-muted bg-muted/10')}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium flex items-center gap-1">
                  <span className={cfg.color}>{cfg.icon}</span> {node.name}
                </span>
                <span className={cn('h-2 w-2 rounded-full', node.active ? 'bg-success' : 'bg-destructive')} />
              </div>
              <div className="flex flex-wrap gap-2 text-[8px] text-muted-foreground">
                <span>{node.city}</span>
                <span>{node.range_km} km range</span>
                {node.users_connected > 0 && <span>{node.users_connected} users</span>}
                {node.frequency && <span className="text-violet-400 font-mono">{node.frequency}</span>}
              </div>
              <p className="text-[8px] text-muted-foreground">{node.notes}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
