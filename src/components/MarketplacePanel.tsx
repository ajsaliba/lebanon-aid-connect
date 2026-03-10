import { mockMarketplaceListings } from '@/data/newFeaturesMockData';
import { ShoppingBag, DollarSign, HandCoins, Briefcase, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import type { ListingType } from '@/data/newFeaturesMockData';

const typeConfig: Record<ListingType, { icon: React.ReactNode; color: string; label: string }> = {
  micro_grant: { icon: <HandCoins className="h-3 w-3" />, color: 'text-success', label: 'Grant' },
  marketplace: { icon: <ShoppingBag className="h-3 w-3" />, color: 'text-primary', label: 'For Sale' },
  work_for_aid: { icon: <Briefcase className="h-3 w-3" />, color: 'text-info', label: 'Work-for-Aid' },
};

export function MarketplacePanel() {
  const { t } = useTranslation();

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="p-2 border-b border-border bg-card">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
          <ShoppingBag className="h-3 w-3" /> {t('marketplace.title')}
        </h3>
        <p className="text-[8px] text-muted-foreground mt-0.5">{t('marketplace.subtitle')}</p>
      </div>

      <div className="p-2 grid grid-cols-3 gap-1">
        {(['micro_grant', 'marketplace', 'work_for_aid'] as ListingType[]).map(type => {
          const cfg = typeConfig[type];
          const count = mockMarketplaceListings.filter(l => l.type === type).length;
          return (
            <div key={type} className="bg-muted/30 rounded p-1 text-center">
              <div className={cn('text-[10px] font-bold', cfg.color)}>{count}</div>
              <div className="text-[7px] text-muted-foreground">{cfg.label}</div>
            </div>
          );
        })}
      </div>

      <div className="p-2 space-y-1.5">
        {mockMarketplaceListings.map(listing => {
          const cfg = typeConfig[listing.type];
          return (
            <div key={listing.id} className="border border-border rounded p-2 space-y-0.5 hover:bg-muted/20 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium flex items-center gap-1">
                  <span className={cfg.color}>{cfg.icon}</span> {listing.title}
                </span>
                {listing.amount && (
                  <span className="text-[9px] font-bold text-success flex items-center gap-0.5">
                    <DollarSign className="h-2.5 w-2.5" />{listing.amount}
                  </span>
                )}
              </div>
              <p className="text-[8px] text-muted-foreground">{listing.description}</p>
              <div className="flex items-center justify-between text-[8px] text-muted-foreground">
                <span>📍 {listing.location}</span>
                <span className="text-primary flex items-center gap-0.5"><Phone className="h-2.5 w-2.5" />{listing.contact}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
