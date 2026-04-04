import { Skeleton } from '@/components/ui/skeleton';

/**
 * Animated skeleton placeholder for lazy-loaded panels.
 * Shows a card-shaped placeholder with pulsing content bars.
 */
export function PanelSkeleton() {
  return (
    <div className="rounded-md border border-border bg-card p-3 space-y-3 animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-3 w-24" />
      </div>
      {/* Content rows */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-4/6" />
      </div>
      {/* Bottom stat row */}
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-6 w-16 rounded" />
        <Skeleton className="h-6 w-16 rounded" />
        <Skeleton className="h-6 w-16 rounded" />
      </div>
    </div>
  );
}
