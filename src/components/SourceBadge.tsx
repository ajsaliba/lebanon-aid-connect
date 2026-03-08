import { getSourceProfile, TIER_CONFIG, TYPE_LABELS, type ReliabilityTier } from '@/config/sourceReliability';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface SourceBadgeProps {
  source: string;
  compact?: boolean;
}

export function SourceBadge({ source, compact = true }: SourceBadgeProps) {
  const profile = getSourceProfile(source);
  const tierCfg = TIER_CONFIG[profile.tier];
  const typeLabel = TYPE_LABELS[profile.type];

  if (compact) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn('text-[9px] font-bold cursor-help', tierCfg.color)}>
            {tierCfg.icon}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-[10px] space-y-0.5 max-w-[200px]">
          <div className="font-bold">{source}</div>
          <div className={cn('font-bold', tierCfg.color)}>
            {tierCfg.icon} {tierCfg.label} ({profile.score}/100)
          </div>
          <div className="text-muted-foreground">{typeLabel}</div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <span className={cn('inline-flex items-center gap-0.5 text-[9px] font-bold', tierCfg.color)}>
      {tierCfg.icon} {tierCfg.label}
    </span>
  );
}
