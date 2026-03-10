import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { type Shelter } from '@/data/mockData';
import { useGeolocation, distanceKm, getDirectionsUrl } from '@/hooks/useGeolocation';
import { LocationPicker } from '@/components/LocationPicker';
import { MapPin, Users, Phone, CheckCircle, XCircle, Plus, RefreshCw, Pencil, Trash2, Navigation, Search, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/lib/i18n';

interface DbShelter extends Shelter {
  user_id: string;
  heading_count: number;
}

export function ShelterPanel() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const { position } = useGeolocation();
  const [dbShelters, setDbShelters] = useState<DbShelter[]>([]);
  const [open, setOpen] = useState(false);
  const [editShelter, setEditShelter] = useState<DbShelter | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'full' | 'closed'>('all');
  const [headingTo, setHeadingTo] = useState<string | null>(null);
  const [formLat, setFormLat] = useState(0);
  const [formLng, setFormLng] = useState(0);
  const [formAddress, setFormAddress] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchShelters = useCallback(async () => {
    const { data } = await supabase.from('shelters').select('*').order('created_at', { ascending: false });
    if (data) {
      setDbShelters(data.map(s => ({
        id: s.id, name: s.name, lat: s.lat, lng: s.lng,
        capacity: s.capacity, currentOccupancy: s.current_occupancy,
        address: s.address, contact: s.contact,
        status: s.status as 'open' | 'full' | 'closed',
        amenities: s.amenities || [],
        user_id: s.user_id,
        heading_count: (s as any).heading_count || 0,
      })));
    }
  }, []);

  useEffect(() => {
    fetchShelters();
    intervalRef.current = setInterval(fetchShelters, 30000);
    const channel = supabase
      .channel('shelters-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shelters' }, () => fetchShelters())
      .subscribe();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      supabase.removeChannel(channel);
    };
  }, [fetchShelters]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchShelters().finally(() => setTimeout(() => setIsRefreshing(false), 800));
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('shelters').delete().eq('id', id);
    if (error) toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    else { toast({ title: t('shelter.deleted') }); fetchShelters(); }
  };

  // "I'm heading here" — increments heading_count and opens directions
  const handleHeadingHere = async (shelter: DbShelter) => {
    setHeadingTo(shelter.id);
    // Use security definer function so any authenticated user can increment
    await supabase.rpc('increment_heading_count', { shelter_id: shelter.id });
    window.open(getDirectionsUrl(shelter.lat, shelter.lng), '_blank');
    toast({ title: `${t('shelter.navigatingTo')} ${shelter.name}`, description: t('shelter.followDirections') });
    fetchShelters();
  };

  // Shelter manager: update occupancy quickly
  const handleUpdateOccupancy = async (shelter: DbShelter, delta: number) => {
    const newOcc = Math.max(0, Math.min(shelter.capacity, shelter.currentOccupancy + delta));
    const newStatus = newOcc >= shelter.capacity ? 'full' : 'open';
    await supabase.from('shelters').update({
      current_occupancy: newOcc,
      status: newStatus,
    }).eq('id', shelter.id);
    fetchShelters();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    if (formLat === 0 && formLng === 0 && !editShelter) {
      toast({ title: t('shelter.selectLocation'), variant: 'destructive' });
      setLoading(false);
      return;
    }
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const payload = {
      name: form.get('name') as string,
      address: formAddress || (editShelter?.address || ''),
      lat: formLat || (editShelter?.lat || 0),
      lng: formLng || (editShelter?.lng || 0),
      capacity: parseInt(form.get('capacity') as string),
      current_occupancy: parseInt(form.get('occupancy') as string) || 0,
      contact: form.get('contact') as string,
      status: (form.get('status') as string) || 'open',
      amenities: (form.get('amenities') as string).split(',').map(a => a.trim()).filter(Boolean),
    };
    let error;
    if (editShelter) {
      ({ error } = await supabase.from('shelters').update(payload).eq('id', editShelter.id));
    } else {
      ({ error } = await supabase.from('shelters').insert({ ...payload, user_id: user.id }));
    }
    setLoading(false);
    if (error) toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    else { toast({ title: editShelter ? t('shelter.updated') : t('shelter.added') }); setOpen(false); setEditShelter(null); fetchShelters(); }
  };

  const shelters = useMemo(() => {
    let list = dbShelters;
    if (statusFilter !== 'all') list = list.filter(s => s.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s => s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q) || s.amenities.some(a => a.toLowerCase().includes(q)));
    }
    if (position) {
      list = [...list].sort((a, b) =>
        distanceKm(position.lat, position.lng, a.lat, a.lng) - distanceKm(position.lat, position.lng, b.lat, b.lng)
      );
    }
    return list;
  }, [dbShelters, statusFilter, search, position]);

  const openCount = dbShelters.filter(s => s.status === 'open').length;
  const totalCapacity = dbShelters.reduce((sum, s) => sum + s.capacity, 0);
  const totalOccupancy = dbShelters.reduce((sum, s) => sum + s.currentOccupancy, 0);

  return (
    <div className="space-y-2 p-3">
      {/* Summary bar */}
      <div className="flex items-center gap-2 text-[9px] bg-muted/50 rounded p-1.5">
        <span className="text-success font-bold">{openCount} {t('shelter.open')}</span>
        <span className="text-muted-foreground">•</span>
        <span className="text-muted-foreground">{totalOccupancy}/{totalCapacity} {t('shelter.capacity')}</span>
        <span className="text-muted-foreground">•</span>
        <span className="text-muted-foreground">{dbShelters.length} {t('shelter.total')}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-sans font-bold uppercase tracking-wider text-success flex items-center gap-2">
          <MapPin className="h-3 w-3" /> {t('tab.shelters')}
        </h2>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={cn('h-2.5 w-2.5 text-muted-foreground', isRefreshing && 'animate-spin')} />
          </Button>
          {user && (
            <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditShelter(null); setFormLat(0); setFormLng(0); setFormAddress(''); } }}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-5 px-1.5 text-[9px] gap-0.5 text-success"><Plus className="h-2.5 w-2.5" /> {t('common.add')}</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[400px]">
                <DialogHeader><DialogTitle className="text-sm">{editShelter ? t('shelter.editShelter') : t('shelter.addShelter')}</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-2.5">
                  <div className="space-y-1"><Label className="text-xs">{t('shelter.shelterName')}</Label><Input name="name" required className="h-7 text-xs" placeholder={t('shelter.namePlaceholder')} defaultValue={editShelter?.name || ''} /></div>
                  <LocationPicker
                    defaultAddress={editShelter?.address}
                    defaultLat={editShelter?.lat}
                    defaultLng={editShelter?.lng}
                    onSelect={(addr, lat, lng) => { setFormAddress(addr); setFormLat(lat); setFormLng(lng); }}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1"><Label className="text-xs">{t('shelter.capacityLabel')}</Label><Input name="capacity" type="number" required className="h-7 text-xs" defaultValue={editShelter?.capacity || ''} /></div>
                    <div className="space-y-1"><Label className="text-xs">{t('shelter.occupancy')}</Label><Input name="occupancy" type="number" className="h-7 text-xs" defaultValue={editShelter?.currentOccupancy || ''} /></div>
                  </div>
                  <div className="space-y-1"><Label className="text-xs">{t('shelter.contactLabel')}</Label><Input name="contact" required className="h-7 text-xs" defaultValue={editShelter?.contact || ''} /></div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t('common.status')}</Label>
                    <Select name="status" defaultValue={editShelter?.status || 'open'}>
                      <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">{t('shelter.statusOpen')}</SelectItem>
                        <SelectItem value="full">{t('shelter.statusFull')}</SelectItem>
                        <SelectItem value="closed">{t('shelter.statusClosed')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1"><Label className="text-xs">{t('shelter.amenities')}</Label><Input name="amenities" className="h-7 text-xs" defaultValue={editShelter?.amenities.join(', ') || ''} /></div>
                  <Button type="submit" className="w-full h-7 text-xs" disabled={loading}>{loading ? t('common.saving') : (editShelter ? t('common.update') : t('shelter.addShelter'))}</Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-1.5">
        <div className="relative flex-1">
          <Search className="absolute left-1.5 top-1/2 -translate-y-1/2 h-2.5 w-2.5 text-muted-foreground" />
          <Input placeholder={t('shelter.searchPlaceholder')} value={search} onChange={e => setSearch(e.target.value)} className="h-6 text-[10px] pl-5" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
          <SelectTrigger className="h-6 text-[10px] w-20"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all')}</SelectItem>
            <SelectItem value="open">{t('shelter.statusOpen')}</SelectItem>
            <SelectItem value="full">{t('shelter.statusFull')}</SelectItem>
            <SelectItem value="closed">{t('shelter.statusClosed')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {shelters.length === 0 && (
        <p className="text-[10px] text-muted-foreground text-center py-4">{t('shelter.noShelters')}</p>
      )}

      {/* Shelter Cards */}
      {shelters.map((shelter) => {
        const occupancyPct = shelter.capacity > 0 ? Math.round((shelter.currentOccupancy / shelter.capacity) * 100) : 0;
        const isOwner = user?.id === shelter.user_id;
        const dist = position ? distanceKm(position.lat, position.lng, shelter.lat, shelter.lng) : null;
        const isHeadingHere = headingTo === shelter.id;
        const spotsLeft = shelter.capacity - shelter.currentOccupancy;

        return (
          <div key={shelter.id} className={cn(
            'p-2 rounded border bg-card/50 text-[11px] space-y-1.5',
            shelter.status === 'open' ? 'border-success/20' : 'border-border',
            isHeadingHere && 'ring-1 ring-info/50'
          )}>
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <span className="font-sans font-semibold text-foreground text-xs">{shelter.name}</span>
                {dist !== null && (
                  <span className="ml-1.5 text-[9px] text-info font-medium">
                    {dist < 1 ? `${Math.round(dist * 1000)}m` : `${dist.toFixed(1)}km`}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {isOwner && (
                  <>
                    <Button variant="ghost" size="sm" className="h-4 w-4 p-0" onClick={() => { setEditShelter(shelter); setOpen(true); }}><Pencil className="h-2.5 w-2.5 text-muted-foreground" /></Button>
                    <Button variant="ghost" size="sm" className="h-4 w-4 p-0" onClick={() => handleDelete(shelter.id)}><Trash2 className="h-2.5 w-2.5 text-danger" /></Button>
                  </>
                )}
                <Badge variant="outline" className={cn('text-[9px] h-4',
                  shelter.status === 'open' ? 'border-success/50 text-success' :
                  shelter.status === 'full' ? 'border-warning/50 text-warning' : 'border-danger/50 text-danger'
                )}>
                  {shelter.status === 'open' ? <CheckCircle className="h-2 w-2 mr-0.5" /> : <XCircle className="h-2 w-2 mr-0.5" />}
                  {shelter.status}
                </Badge>
              </div>
            </div>

            <div className="text-muted-foreground">{shelter.address}</div>

            {/* Occupancy bar */}
            <div className="flex items-center gap-2">
              <Users className="h-2.5 w-2.5 text-muted-foreground" />
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className={cn('h-full rounded-full transition-all',
                  occupancyPct > 90 ? 'bg-danger' : occupancyPct > 70 ? 'bg-warning' : 'bg-success'
                )} style={{ width: `${occupancyPct}%` }} />
              </div>
              <span className="text-[9px] font-medium">
                <span className={spotsLeft <= 5 ? 'text-danger' : 'text-success'}>{spotsLeft}</span>
                <span className="text-muted-foreground"> {t('shelter.spotsLeft')}</span>
              </span>
            </div>

            {/* Owner quick occupancy controls */}
            {isOwner && (
              <div className="flex items-center gap-1 text-[9px]">
                <span className="text-muted-foreground">{t('shelter.updateCount')}:</span>
                <Button variant="outline" size="sm" className="h-4 w-6 p-0 text-[9px]" onClick={() => handleUpdateOccupancy(shelter, -5)}>-5</Button>
                <Button variant="outline" size="sm" className="h-4 w-6 p-0 text-[9px]" onClick={() => handleUpdateOccupancy(shelter, -1)}>-1</Button>
                <span className="font-semibold text-foreground">{shelter.currentOccupancy}</span>
                <Button variant="outline" size="sm" className="h-4 w-6 p-0 text-[9px]" onClick={() => handleUpdateOccupancy(shelter, 1)}>+1</Button>
                <Button variant="outline" size="sm" className="h-4 w-6 p-0 text-[9px]" onClick={() => handleUpdateOccupancy(shelter, 5)}>+5</Button>
              </div>
            )}

            {/* Heading count */}
            {shelter.heading_count > 0 && (
              <div className="text-[9px] text-info flex items-center gap-1">
                <ArrowRight className="h-2 w-2" /> {shelter.heading_count} {t('shelter.peopleHeading')}
              </div>
            )}

            {/* Amenities */}
            {shelter.amenities.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {shelter.amenities.map(a => (<span key={a} className="px-1 py-0.5 rounded bg-success/10 text-success text-[9px]">{a}</span>))}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-1.5">
              <Button
                variant="outline" size="sm"
                className="h-6 text-[10px] gap-1 flex-1 border-success/50 text-success hover:bg-success/10"
                onClick={() => window.location.href = `tel:${shelter.contact}`}
              >
                <Phone className="h-2.5 w-2.5" /> {t('sos.call')}
              </Button>
              {shelter.status === 'open' && (
                <Button
                  size="sm"
                  className={cn(
                    'h-6 text-[10px] gap-1 flex-1',
                    isHeadingHere ? 'bg-info text-info-foreground' : 'bg-success/90 hover:bg-success text-success-foreground'
                  )}
                  onClick={() => handleHeadingHere(shelter)}
                >
                  <Navigation className="h-2.5 w-2.5" />
                  {isHeadingHere ? t('shelter.navigating') : t('shelter.headingHere')}
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
