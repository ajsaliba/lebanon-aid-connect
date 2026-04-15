/**
 * Task 28 – Global intelligence-gap summary widget.
 * Shows an overview of feed health across all domains.
 */
import { useHealthGapSummary } from '@/services/healthService';
import { type DomainKey } from '@/services/types';
import { useTranslation } from '@/lib/i18n';

const DOMAIN_LABELS: Record<DomainKey, string> = {
  humanitarian: 'Humanitarian',
  financial: 'Financial',
  infrastructure: 'Infrastructure',
  intelligence: 'Intelligence',
};

export function HealthGapSummaryWidget() {
  const { t } = useTranslation();
  const summary = useHealthGapSummary();

  if (summary.total === 0) {
    return (
      <div className="rounded border bg-muted/30 p-2 text-[9px] text-muted-foreground">
        No feed health data available yet.
      </div>
    );
  }

  return (
    <div className="space-y-1.5 rounded border p-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase">Feed Health</span>
        <span className="text-[8px] text-muted-foreground">
          {summary.healthy}/{summary.total} healthy
        </span>
      </div>

      <div className="grid grid-cols-4 gap-1">
        {[
          { label: 'Healthy', count: summary.healthy, color: 'text-green-600' },
          { label: 'Degraded', count: summary.degraded, color: 'text-yellow-600' },
          { label: 'Stale', count: summary.stale, color: 'text-orange-600' },
          { label: 'Down', count: summary.down, color: 'text-red-600' },
        ].map(({ label, count, color }) => (
          <div key={label} className="rounded bg-muted/30 p-1 text-center">
            <div className={`text-[11px] font-bold ${color}`}>{count}</div>
            <div className="text-[7px] text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-0.5">
        {(Object.entries(summary.byDomain) as [DomainKey, { healthy: number; total: number }][]).map(
          ([domain, { healthy, total }]) => (
            <div key={domain} className="flex items-center justify-between text-[8px]">
              <span>{DOMAIN_LABELS[domain]}</span>
              <span className={total > 0 && healthy < total ? 'text-orange-600' : 'text-muted-foreground'}>
                {healthy}/{total}
              </span>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
