import { useState, useMemo } from 'react';
import { mockAidRequests, mockAidOffers, type AidRequest, type AidOffer, type AidPriority, type AidStatus } from '@/data/extendedMockData';
import { useGeolocation, distanceKm } from '@/hooks/useGeolocation';
import {
  HandHeart, Package, Truck, ArrowRightLeft, Filter, Plus,
  AlertTriangle, CheckCircle2, Clock, MapPin, Users, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

const priorityColors: Record<AidPriority, string> = {
  critical: 'bg-danger/20 text-danger border-danger/30',
  high: 'bg-warning/20 text-warning border-warning/30',
  medium: 'bg-info/20 text-info border-info/30',
  low: 'bg-muted text-muted-foreground border-border',
};

const statusIcons: Record<AidStatus, typeof CheckCircle2> = {
  open: Clock,
  matched: ArrowRightLeft,
  in_transit: Truck,
  delivered: CheckCircle2,
};

const categoryIcons: Record<string, string> = {
  food: '🍞', water: '💧', medicine: '💊',
  baby_supplies: '👶', blankets: '🛏️', generators: '⚡',
  fuel: '⛽', hygiene_kits: '🧴', donated_goods: '📦',
  transportation: '🚛', storage_space: '🏪', volunteer_help: '🙋',
};

const categoryKeys: Record<string, string> = {
  food: 'aid.food', water: 'aid.water', medicine: 'aid.medicine',
  baby_supplies: 'aid.babySupplies', blankets: 'aid.blankets', generators: 'aid.generators',
  fuel: 'aid.fuel', hygiene_kits: 'aid.hygieneKits', donated_goods: 'aid.donatedGoods',
  transportation: 'aid.transportation', storage_space: 'aid.storageSpace', volunteer_help: 'aid.volunteerHelp',
};

type ViewMode = 'requests' | 'offers' | 'matched';

export function AidMatchPanel() {
  const { position } = useGeolocation();
  const [view, setView] = useState<ViewMode>('requests');
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<AidPriority | 'all'>('all');
  const { t } = useTranslation();

  const filteredRequests = useMemo(() => {
    let items = view === 'matched'
      ? mockAidRequests.filter(r => r.status === 'matched')
      : mockAidRequests;
    if (priorityFilter !== 'all') items = items.filter(r => r.priority === priorityFilter);
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(r => r.description.toLowerCase().includes(q) || r.location.toLowerCase().includes(q));
    }
    if (position) {
      items = [...items].sort((a, b) => distanceKm(position.lat, position.lng, a.lat, a.lng) - distanceKm(position.lat, position.lng, b.lat, b.lng));
    }
    return items;
  }, [view, search, priorityFilter, position]);

  const filteredOffers = useMemo(() => {
    let items = view === 'matched'
      ? mockAidOffers.filter(o => o.status === 'matched')
      : mockAidOffers;
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(o => o.description.toLowerCase().includes(q) || o.location.toLowerCase().includes(q));
    }
    if (position) {
      items = [...items].sort((a, b) => distanceKm(position.lat, position.lng, a.lat, a.lng) - distanceKm(position.lat, position.lng, b.lat, b.lng));
    }
    return items;
  }, [view, search, position]);

  const openRequestCount = mockAidRequests.filter(r => r.status === 'open').length;
  const openOfferCount = mockAidOffers.filter(o => o.status === 'open').length;
  const matchedCount = mockAidRequests.filter(r => r.status === 'matched').length;

  return (
    <div className="space-y-2 p-3">
      <h2 className="text-xs font-sans font-bold uppercase tracking-wider text-primary flex items-center gap-2">
        <HandHeart className="h-3 w-3" /> {t('aid.title')}
      </h2>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-1.5">
        <div className="bg-danger/10 rounded p-1.5 text-center">
          <div className="text-sm font-bold text-danger">{openRequestCount}</div>
          <div className="text-[9px] text-muted-foreground">{t('aid.requests')}</div>
        </div>
        <div className="bg-success/10 rounded p-1.5 text-center">
          <div className="text-sm font-bold text-success">{openOfferCount}</div>
          <div className="text-[9px] text-muted-foreground">{t('aid.offers')}</div>
        </div>
        <div className="bg-info/10 rounded p-1.5 text-center">
          <div className="text-sm font-bold text-info">{matchedCount}</div>
          <div className="text-[9px] text-muted-foreground">{t('aid.matched')}</div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex gap-1">
        {(['requests', 'offers', 'matched'] as const).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={cn(
              'flex-1 py-1 text-[9px] uppercase tracking-wider rounded transition-colors',
              view === v ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-muted/50'
            )}
          >
            {t(`aid.${v}`)}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
        <Input
          placeholder={t('aid.searchPlaceholder')}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-7 h-7 text-xs"
        />
      </div>

      {/* Priority Filter (for requests) */}
      {view === 'requests' && (
        <div className="flex gap-1 flex-wrap">
          {(['all', 'critical', 'high', 'medium', 'low'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={cn(
                'px-1.5 py-0.5 text-[9px] rounded border transition-colors',
                priorityFilter === p
                  ? p === 'all' ? 'bg-primary/20 text-primary border-primary/30' : priorityColors[p]
                  : 'text-muted-foreground border-border hover:bg-muted/50'
              )}
            >
              {p === 'all' ? t('common.all') : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Items */}
      <div className="space-y-1.5">
        {(view === 'offers' ? filteredOffers : filteredRequests).map(item => {
          const isRequest = item.type === 'request';
          const req = item as AidRequest;
          const offer = item as AidOffer;
          const StatusIcon = statusIcons[item.status];
          const dist = position ? distanceKm(position.lat, position.lng, item.lat, item.lng).toFixed(1) : null;

          return (
            <div key={item.id} className={cn('border rounded p-2 space-y-1 text-xs', isRequest ? 'border-danger/20' : 'border-success/20')}>
              <div className="flex items-start justify-between gap-1">
                <div className="flex items-center gap-1">
                  <span className="text-[10px]">{categoryIcons[item.category]} {t(categoryKeys[item.category] || item.category)}</span>
                  {isRequest && (
                    <Badge variant="outline" className={cn('text-[8px] px-1 py-0', priorityColors[req.priority])}>
                      {req.priority}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
                  <StatusIcon className="h-2.5 w-2.5" />
                  {item.status}
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground leading-tight">{item.description}</p>
              <div className="flex items-center justify-between text-[9px] text-muted-foreground">
                <span className="flex items-center gap-0.5">
                  <MapPin className="h-2.5 w-2.5" /> {item.location}
                  {dist && <span className="text-primary">({dist} km)</span>}
                </span>
                {isRequest && (
                  <span className="flex items-center gap-0.5">
                    <Users className="h-2.5 w-2.5" /> {req.people_count}
                  </span>
                )}
              </div>
              <div className="text-[9px] text-muted-foreground">
                {t('aid.qty')}: {item.quantity} {item.unit}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
