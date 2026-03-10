import { useState } from 'react';
import { mockEconomicListings, type JobType } from '@/data/extendedMockData';
import { Briefcase, Search, Filter, MapPin, DollarSign, ArrowRightLeft, Clock, Monitor } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

const typeIcons: Record<JobType, React.ReactNode> = {
  temporary: <Briefcase className="h-3 w-3" />,
  remote: <Monitor className="h-3 w-3" />,
  service_exchange: <Clock className="h-3 w-3" />,
  barter: <ArrowRightLeft className="h-3 w-3" />,
};

const typeColors: Record<JobType, string> = {
  temporary: 'text-primary',
  remote: 'text-info',
  service_exchange: 'text-warning',
  barter: 'text-success',
};

const typeLabels: Record<JobType, string> = {
  temporary: 'Temporary',
  remote: 'Remote',
  service_exchange: 'Exchange',
  barter: 'Barter',
};

export function EconomicToolsPanel() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<JobType | 'all'>('all');
  const types: JobType[] = ['temporary', 'remote', 'service_exchange', 'barter'];

  const filtered = mockEconomicListings.filter(l => {
    if (typeFilter !== 'all' && l.type !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q) || l.location.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="p-2 border-b border-border bg-card">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
          <DollarSign className="h-3 w-3" /> {t('economic.survivalTools')}
        </h3>
        <p className="text-[8px] text-muted-foreground mt-0.5">{t('economic.subtitle')}</p>
      </div>

      {/* Type summary */}
      <div className="p-2 grid grid-cols-4 gap-1">
        {types.map(tp => {
          const count = mockEconomicListings.filter(l => l.type === tp).length;
          return (
            <div key={tp} className="bg-muted/30 rounded p-1 text-center">
              <div className={cn('flex justify-center mb-0.5', typeColors[tp])}>{typeIcons[tp]}</div>
              <div className="text-[10px] font-bold">{count}</div>
              <div className="text-[7px] text-muted-foreground">{typeLabels[tp]}</div>
            </div>
          );
        })}
      </div>

      {/* Search & filter */}
      <div className="px-2 pb-1 space-y-1">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input placeholder={t('economic.searchPlaceholder')} value={search} onChange={e => setSearch(e.target.value)}
            className="h-7 text-xs pl-7" />
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          <Filter className="h-3 w-3 text-muted-foreground" />
          <button onClick={() => setTypeFilter('all')}
            className={cn('px-1.5 py-0.5 text-[9px] rounded border transition-colors',
              typeFilter === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted/50')}>{t('common.all')}</button>
          {types.map(tp => (
            <button key={tp} onClick={() => setTypeFilter(tp)}
              className={cn('px-1.5 py-0.5 text-[9px] rounded border transition-colors flex items-center gap-0.5',
                typeFilter === tp ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted/50')}>
              {typeIcons[tp]} {typeLabels[tp]}
            </button>
          ))}
        </div>
      </div>

      {/* Listings */}
      <div className="p-2 space-y-1.5">
        {filtered.map(listing => (
          <div key={listing.id} className="border border-border rounded p-2 space-y-1">
            <div className="flex items-start justify-between gap-1">
              <div className="flex items-center gap-1">
                <span className={typeColors[listing.type]}>{typeIcons[listing.type]}</span>
                <span className="text-xs font-medium">{listing.title}</span>
              </div>
              {listing.compensation && (
                <span className="text-[9px] text-success font-bold whitespace-nowrap">{listing.compensation}</span>
              )}
            </div>

            <p className="text-[9px] text-muted-foreground">{listing.description}</p>

            <div className="flex items-center justify-between text-[8px]">
              <span className="flex items-center gap-0.5 text-muted-foreground">
                <MapPin className="h-2.5 w-2.5" /> {listing.location}
              </span>
              <span className="text-muted-foreground">{listing.category}</span>
            </div>

            {listing.urgent && (
              <span className="text-[7px] px-1 py-0 bg-danger/20 text-danger rounded font-bold">URGENT</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
