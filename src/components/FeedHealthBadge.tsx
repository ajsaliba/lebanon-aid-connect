/**
 * Task 28 – Reusable feed-health badge for any panel.
 * Shows a colored dot + label reflecting the data freshness status.
 */
import { type FreshnessStatus } from '@/services/types';
import { useFeedFreshness } from '@/services/healthService';

const STATUS_CONFIG: Record<FreshnessStatus, { color: string; label: string }> = {
  live: { color: 'bg-green-500', label: 'Live' },
  cached: { color: 'bg-yellow-500', label: 'Cached' },
  stale: { color: 'bg-orange-500', label: 'Stale' },
  unavailable: { color: 'bg-red-500', label: 'Offline' },
};

interface FeedHealthBadgeProps {
  feedName: string;
  className?: string;
}

export function FeedHealthBadge({ feedName, className = '' }: FeedHealthBadgeProps) {
  const freshness = useFeedFreshness(feedName);
  const { color, label } = STATUS_CONFIG[freshness];

  return (
    <span className={`inline-flex items-center gap-1 text-[7px] text-muted-foreground ${className}`}>
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${color}`} />
      {label}
    </span>
  );
}
