import { useMemo } from 'react';
import { CircleMarker, Popup } from 'react-leaflet';
import {
  INFRA_NODES,
  computeInfraStatus,
  INFRA_TYPE_CONFIG,
  INFRA_STATUS_CONFIG,
  type InfraStatusResult,
} from '@/config/infrastructure';
import { type NewsItem } from '@/data/mockData';

export function InfrastructureLayer({ news, visible }: { news: NewsItem[]; visible: boolean }) {
  const statuses = useMemo(() => computeInfraStatus(INFRA_NODES, news), [news]);

  if (!visible) return null;

  return (
    <>
      {statuses.map((s) => (
        <InfraMarker key={s.node.id} status={s} />
      ))}
    </>
  );
}

function InfraMarker({ status }: { status: InfraStatusResult }) {
  const { node } = status;
  const cfg = INFRA_STATUS_CONFIG[status.status];
  const typeCfg = INFRA_TYPE_CONFIG[node.type];

  return (
    <CircleMarker
      center={[node.lat, node.lng]}
      radius={status.status === 'offline' ? 10 : status.status === 'disrupted' ? 8 : 6}
      pathOptions={{
        color: cfg.color,
        fillColor: cfg.color,
        fillOpacity: status.status === 'operational' ? 0.3 : 0.6,
        weight: 1.5,
        dashArray: status.status === 'degraded' ? '3 3' : undefined,
        className: status.status === 'offline' ? 'animate-pulse' : '',
      }}
    >
      <Popup>
        <div className="text-xs space-y-1.5 min-w-[160px]">
          <div className="font-bold text-foreground text-sm">
            {typeCfg.icon} {node.name}
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: cfg.color }}
            />
            <span className="uppercase text-[10px] font-bold" style={{ color: cfg.color }}>
              {cfg.label}
            </span>
          </div>
          <div className="text-muted-foreground">{node.region}</div>
          <div className="text-muted-foreground text-[10px]">
            Type: {typeCfg.label} • {status.articleCount} disruption mentions
          </div>
          <div className="text-muted-foreground text-[10px]">
            Disruption: {Math.round(status.disruption * 100)}%
          </div>
        </div>
      </Popup>
    </CircleMarker>
  );
}
