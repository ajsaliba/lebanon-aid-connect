import { useMarketplace, type MarketplaceListing } from '@/hooks/useDataHooks';
import { FeedHealthBadge } from '@/components/FeedHealthBadge';
import { ShoppingBag, DollarSign, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

const statusColors: Record<string, string> = {
  available: 'text-success',
  sold: 'text-muted-foreground',
  reserved: 'text-warning',
};

export function MarketplacePanel() {
  const { t } = useTranslation();
  const { data: listings = [], isLoading, error } = useMarketplace();

  if (isLoading) return <div className="border border-border rounded-lg p-4 text-center text-[9px] text-muted-foreground">Loading...</div>;

  if (error) return (
    <div className="border border-border rounded-lg p-4 text-center text-[9px] text-danger">
      Failed to load marketplace data.
    </div>
  );

  const byStatus = (s: MarketplaceListing['status']) => listings.filter(l => l.status === s).length;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="p-2 border-b border-border bg-card">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
          <ShoppingBag className="h-3 w-3" /> {t('marketplace.title')}
          <FeedHealthBadge feedName="marketplace" />
        </h3>
        <p className="text-[8px] text-muted-foreground mt-0.5">{t('marketplace.subtitle')}</p>
      </div>

      <div className="p-2 grid grid-cols-3 gap-1">
        {(['available', 'reserved', 'sold'] as const).map(status => (
          <div key={status} className="bg-muted/30 rounded p-1 text-center">
            <div className={cn('text-[10px] font-bold', statusColors[status])}>{byStatus(status)}</div>
            <div className="text-[7px] text-muted-foreground capitalize">{status}</div>
          </div>
        ))}
      </div>

      <div className="p-2 space-y-1.5">
        {listings.map(listing => (
          <div key={listing.id} className="border border-border rounded p-2 space-y-0.5 hover:bg-muted/20 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium flex items-center gap-1">
                <span className="text-primary"><ShoppingBag className="h-3 w-3" /></span> {listing.title}
              </span>
              {listing.is_free ? (
                <span className="text-[9px] font-bold text-success">FREE</span>
              ) : (
                <span className="text-[9px] font-bold text-success flex items-center gap-0.5">
                  <DollarSign className="h-2.5 w-2.5" />{listing.price} {listing.currency}
                </span>
              )}
            </div>
            <p className="text-[8px] text-muted-foreground">{listing.description}</p>
            <div className="flex items-center justify-between text-[8px] text-muted-foreground">
              <span>{listing.location && `📍 ${listing.location}`}</span>
              {listing.contact && (
                <span className="text-primary flex items-center gap-0.5"><Phone className="h-2.5 w-2.5" />{listing.contact}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
