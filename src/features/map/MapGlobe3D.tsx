import { Globe, Layers3 } from 'lucide-react';
import type { MapLayerContract } from '@/features/map/mapLayerContract';

interface MapGlobe3DProps {
  contract: MapLayerContract;
}

export function MapGlobe3D({ contract }: MapGlobe3DProps) {
  const activeLayers = Object.entries(contract.layers)
    .filter(([, enabled]) => enabled)
    .map(([key]) => key);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[radial-gradient(circle_at_30%_20%,#1f4a5e_0%,#0f1a25_45%,#06090d_100%)]">
      <div className="absolute inset-0 opacity-40 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.06)_30%,transparent_65%)] animate-pulse" />

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative h-[62%] aspect-square rounded-full border border-primary/50 bg-[radial-gradient(circle_at_35%_30%,#2f8ecf_0%,#1c5478_38%,#0f2a3b_65%,#08131a_100%)] shadow-[0_0_80px_rgba(34,197,94,0.08)]">
          <div className="absolute inset-0 rounded-full border border-white/10" />
          <div className="absolute inset-0 rounded-full bg-[repeating-linear-gradient(0deg,transparent,transparent_18px,rgba(255,255,255,0.07)_19px)]" />
          <div className="absolute inset-0 rounded-full bg-[repeating-linear-gradient(90deg,transparent,transparent_22px,rgba(255,255,255,0.07)_23px)]" />
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-2 py-1 rounded border border-border bg-card/90 text-[10px] uppercase tracking-wider text-primary flex items-center gap-1">
            <Globe className="h-3 w-3" /> 3D Globe (Preview)
          </div>
        </div>
      </div>

      <div className="absolute bottom-3 left-3 right-3 rounded border border-border bg-card/85 backdrop-blur-sm p-2">
        <div className="text-[10px] text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
          <Layers3 className="h-3 w-3" /> Shared Layer Contract
        </div>
        <div className="flex flex-wrap gap-1.5">
          {activeLayers.map(layer => (
            <span key={layer} className="text-[10px] px-1.5 py-0.5 rounded border border-border bg-muted/40">
              {layer}
            </span>
          ))}
          <span className="text-[10px] px-1.5 py-0.5 rounded border border-border bg-muted/40">
            time: {contract.timeFilter}
          </span>
        </div>
      </div>
    </div>
  );
}
