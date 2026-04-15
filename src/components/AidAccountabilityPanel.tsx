import { useAidDeliveries } from '@/services/humanitarianService';
import { FeedHealthBadge } from '@/components/FeedHealthBadge';
import { Eye, Package, CheckCircle2, Clock, Truck, XCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  requested: { color: 'text-muted-foreground', bg: 'bg-muted', label: 'Requested' },
  matched: { color: 'text-info', bg: 'bg-info/20', label: 'Matched' },
  dispatched: { color: 'text-primary', bg: 'bg-primary/20', label: 'Dispatched' },
  in_transit: { color: 'text-warning', bg: 'bg-warning/20', label: 'In Transit' },
  delivered: { color: 'text-success', bg: 'bg-success/20', label: 'Delivered' },
  failed: { color: 'text-destructive', bg: 'bg-destructive/20', label: 'Failed' },
  disputed: { color: 'text-orange-400', bg: 'bg-orange-400/20', label: 'Disputed' },
  partial: { color: 'text-yellow-500', bg: 'bg-yellow-500/20', label: 'Partial' },
};

export function AidAccountabilityPanel() {
  const { t } = useTranslation();
  const { data: deliveries = [], isLoading } = useAidDeliveries();

  if (isLoading) {
    return (
      <div className="border border-border rounded-lg p-4 text-center text-[9px] text-muted-foreground">
        Loading...
      </div>
    );
  }

  const totalCount = deliveries.length;
  const deliveredCount = deliveries.filter(d => d.status === 'delivered').length;
  const inTransitCount = deliveries.filter(d => d.status === 'in_transit' || d.status === 'dispatched').length;
  const failedCount = deliveries.filter(d => d.status === 'failed').length;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="p-2 border-b border-border bg-card">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
          <Eye className="h-3 w-3" /> {t('aidAccountability.title')}
          <FeedHealthBadge feedName="aid_deliveries" className="ml-auto" />
        </h3>
        <p className="text-[8px] text-muted-foreground mt-0.5">{t('aidAccountability.subtitle')}</p>
      </div>

      {/* Summary */}
      <div className="p-2 grid grid-cols-4 gap-1 border-b border-border">
        <div className="bg-muted/30 rounded p-1 text-center">
          <div className="text-[10px] font-bold text-primary">{totalCount}</div>
          <div className="text-[7px] text-muted-foreground">Total</div>
        </div>
        <div className="bg-muted/30 rounded p-1 text-center">
          <div className="text-[10px] font-bold text-success">{deliveredCount}</div>
          <div className="text-[7px] text-muted-foreground">Delivered</div>
        </div>
        <div className="bg-muted/30 rounded p-1 text-center">
          <div className="text-[10px] font-bold text-warning">{inTransitCount}</div>
          <div className="text-[7px] text-muted-foreground">In Transit</div>
        </div>
        <div className="bg-muted/30 rounded p-1 text-center">
          <div className="text-[10px] font-bold text-destructive">{failedCount}</div>
          <div className="text-[7px] text-muted-foreground">Failed</div>
        </div>
      </div>

      <div className="p-2 space-y-1.5">
        {deliveries.map(delivery => {
          const cfg = statusConfig[delivery.status] ?? statusConfig.requested;
          return (
            <div key={delivery.id} className="border border-border rounded p-2 space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium flex items-center gap-1">
                  <Package className="h-3 w-3 text-muted-foreground" />
                  {delivery.category}
                  {delivery.quantity > 0 && <span className="text-[8px] text-muted-foreground">x{delivery.quantity}</span>}
                </span>
                <span className={cn('text-[7px] font-bold uppercase rounded px-1.5 py-0.5', cfg.bg, cfg.color)}>
                  {cfg.label}
                </span>
              </div>
              <div className="flex items-center justify-between text-[8px] text-muted-foreground">
                {delivery.donorName && (
                  <span className="flex items-center gap-0.5">
                    Donor: <span className="font-medium text-foreground">{delivery.donorName}</span>
                  </span>
                )}
                <span>{delivery.recipientLocation}</span>
              </div>
              <div className="flex items-center gap-2 text-[8px] text-muted-foreground">
                {delivery.dispatchedAt && (
                  <span className="flex items-center gap-0.5">
                    <Truck className="h-2.5 w-2.5" />
                    {new Date(delivery.dispatchedAt).toLocaleDateString()}
                  </span>
                )}
                {delivery.deliveredAt && (
                  <span className="flex items-center gap-0.5">
                    <CheckCircle2 className="h-2.5 w-2.5 text-success" />
                    {new Date(delivery.deliveredAt).toLocaleDateString()}
                  </span>
                )}
                {!delivery.dispatchedAt && !delivery.deliveredAt && (
                  <span className="flex items-center gap-0.5">
                    <Clock className="h-2.5 w-2.5" />
                    Created {new Date(delivery.createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              {delivery.reviewerNotes && (
                <p className="text-[8px] text-muted-foreground italic mt-0.5">{delivery.reviewerNotes}</p>
              )}
            </div>
          );
        })}
        {deliveries.length === 0 && (
          <p className="text-[8px] text-muted-foreground italic text-center py-2">
            No aid delivery records available yet.
          </p>
        )}
      </div>
    </div>
  );
}
