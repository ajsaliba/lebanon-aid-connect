import { useState, useMemo } from 'react';
import { useBridgedAidRequests, useBridgedAidOffers } from '@/services/mockBridge';
import type { AidRequest, AidOffer, AidPriority, AidStatus } from '@/data/extendedMockData';
import { useGeolocation, distanceKm } from '@/hooks/useGeolocation';
import { useAcceptAidMatch } from '@/hooks/useDataHooks';
import {
  HandHeart, Package, Truck, ArrowRightLeft, Filter, Plus,
  AlertTriangle, CheckCircle2, Clock, MapPin, Users, Search,
  Zap, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';

interface MatchResult {
  inventory_id: string;
  item_name: string;
  category: string;
  quantity: number;
  lat: number | null;
  lng: number | null;
  distance_km: number | null;
  score: number;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

async function fetchMatches(requestId: string): Promise<MatchResult[]> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/match-aid`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
    body: JSON.stringify({ requestId }),
  });
  if (!res.ok) throw new Error('Match failed');
  return res.json() as Promise<MatchResult[]>;
}

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
  const { data: mockAidRequests = [], isLoading: isLoadingRequests } = useBridgedAidRequests();
  const { data: mockAidOffers = [], isLoading: isLoadingOffers } = useBridgedAidOffers();
  const [view, setView] = useState<ViewMode>('requests');
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<AidPriority | 'all'>('all');
  const { t } = useTranslation();
  const { toast } = useToast();
  const acceptMatch = useAcceptAidMatch();

  // Per-request match state: { [requestId]: { loading, results } }
  const [matchState, setMatchState] = useState<Record<string, { loading: boolean; results: MatchResult[] | null }>>({});

  const handleFindMatches = async (requestId: string) => {
    setMatchState(prev => ({ ...prev, [requestId]: { loading: true, results: null } }));
    try {
      const results = await fetchMatches(requestId);
      setMatchState(prev => ({ ...prev, [requestId]: { loading: false, results } }));
    } catch {
      setMatchState(prev => ({ ...prev, [requestId]: { loading: false, results: [] } }));
      toast({ title: 'Match failed', description: 'Could not reach matching engine', variant: 'destructive' });
    }
  };

  const handleAccept = async (requestId: string, match: MatchResult) => {
    try {
      await acceptMatch.mutateAsync({ requestId, inventoryId: match.inventory_id, score: match.score });
      toast({ title: 'Match accepted', description: `${match.item_name} assigned to request` });
      setMatchState(prev => ({ ...prev, [requestId]: { loading: false, results: null } }));
    } catch {
      toast({ title: 'Error', description: 'Failed to accept match', variant: 'destructive' });
    }
  };

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
  }, [mockAidRequests, view, search, priorityFilter, position]);

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
  }, [mockAidOffers, view, search, position]);

  const openRequestCount = mockAidRequests.filter(r => r.status === 'open').length;
  const openOfferCount = mockAidOffers.filter(o => o.status === 'open').length;
  const matchedCount = mockAidRequests.filter(r => r.status === 'matched').length;

  if (isLoadingRequests || isLoadingOffers) return <div className="border border-border rounded-lg p-4 text-center text-[9px] text-muted-foreground">Loading...</div>;

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

              {/* Find Matches button — only for open requests (Feature 12) */}
              {isRequest && req.status === 'open' && (
                <div className="pt-0.5">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-5 text-[9px] gap-1 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                    onClick={() => handleFindMatches(item.id)}
                    disabled={matchState[item.id]?.loading}
                  >
                    {matchState[item.id]?.loading
                      ? <Loader2 className="h-2.5 w-2.5 animate-spin" />
                      : <Zap className="h-2.5 w-2.5" />}
                    Find Matches
                  </Button>

                  {/* Match results */}
                  {matchState[item.id]?.results && (
                    <div className="mt-1.5 space-y-1">
                      {matchState[item.id]!.results!.length === 0 && (
                        <p className="text-[9px] text-muted-foreground italic">No matches found</p>
                      )}
                      {matchState[item.id]!.results!.map(match => (
                        <div key={match.inventory_id} className="border border-border rounded p-1.5 space-y-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[9px] font-medium text-foreground">{match.item_name}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-4 text-[8px] px-1.5 text-success border border-success/30 hover:bg-success/10"
                              onClick={() => handleAccept(item.id, match)}
                            >
                              Accept
                            </Button>
                          </div>
                          <div className="flex items-center gap-2 text-[8px] text-muted-foreground">
                            <span>Qty: {match.quantity}</span>
                            {match.distance_km !== null && (
                              <span>{match.distance_km.toFixed(1)} km</span>
                            )}
                          </div>
                          {/* Score bar */}
                          <div className="flex items-center gap-1.5">
                            <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-cyan-500 rounded-full transition-all"
                                style={{ width: `${match.score}%` }}
                              />
                            </div>
                            <span className="text-[8px] font-mono text-cyan-400">{match.score}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Skeleton while loading */}
                  {matchState[item.id]?.loading && (
                    <div className="mt-1.5 animate-pulse space-y-1">
                      {[1,2,3].map(i => <div key={i} className="h-10 bg-muted rounded" />)}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
