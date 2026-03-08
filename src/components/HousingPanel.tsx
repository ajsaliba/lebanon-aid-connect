import { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { type HousingListing } from '@/data/mockData';
import { useGeolocation, distanceKm, getDirectionsUrl } from '@/hooks/useGeolocation';
import { Home, DollarSign, Phone, BedDouble, Plus, RefreshCw, Pencil, Trash2, Navigation, Search, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface DbHousing extends HousingListing { user_id: string; }

export function HousingPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { position } = useGeolocation();
  const [dbHousing, setDbHousing] = useState<DbHousing[]>([]);
  const [open, setOpen] = useState(false);
  const [editHousing, setEditHousing] = useState<DbHousing | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minBeds, setMinBeds] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchHousing = async () => {
    const { data } = await supabase.from('housing_listings').select('*').order('created_at', { ascending: false });
    if (data) {
      setDbHousing(data.map(h => ({
        id: h.id, title: h.title, lat: h.lat, lng: h.lng,
        price: h.price, currency: h.currency, bedrooms: h.bedrooms,
        address: h.address, contact: h.contact,
        available: h.available, description: h.description || '',
        user_id: h.user_id,
      })));
    }
  };

  useEffect(() => {
    fetchHousing();
    intervalRef.current = setInterval(fetchHousing, 60000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchHousing().finally(() => setTimeout(() => setIsRefreshing(false), 1000));
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('housing_listings').delete().eq('id', id);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Listing deleted' }); fetchHousing(); }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const payload = {
      title: form.get('title') as string,
      address: form.get('address') as string,
      lat: parseFloat(form.get('lat') as string),
      lng: parseFloat(form.get('lng') as string),
      price: parseInt(form.get('price') as string),
      currency: 'USD',
      bedrooms: parseInt(form.get('bedrooms') as string),
      contact: form.get('contact') as string,
      description: form.get('description') as string,
    };
    let error;
    if (editHousing) {
      ({ error } = await supabase.from('housing_listings').update(payload).eq('id', editHousing.id));
    } else {
      ({ error } = await supabase.from('housing_listings').insert({ ...payload, user_id: user.id }));
    }
    setLoading(false);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: editHousing ? 'Updated' : 'Added' }); setOpen(false); setEditHousing(null); fetchHousing(); }
  };

  const openWhatsApp = (contact: string) => {
    const phone = contact.replace(/[^0-9+]/g, '').replace('+', '');
    window.open(`https://wa.me/${phone}`, '_blank');
  };

  const listings = useMemo(() => {
    let list = dbHousing;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(h => h.title.toLowerCase().includes(q) || h.address.toLowerCase().includes(q));
    }
    if (maxPrice) list = list.filter(h => h.price <= parseInt(maxPrice));
    if (minBeds) list = list.filter(h => h.bedrooms >= parseInt(minBeds));
    if (position) {
      list = [...list].sort((a, b) =>
        distanceKm(position.lat, position.lng, a.lat, a.lng) - distanceKm(position.lat, position.lng, b.lat, b.lng)
      );
    }
    return list;
  }, [dbHousing, search, maxPrice, minBeds, position]);

  return (
    <div className="space-y-2 p-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-sans font-bold uppercase tracking-wider text-info flex items-center gap-2">
          <Home className="h-3 w-3" /> Housing
          <Badge variant="outline" className="text-[8px] h-4 border-info/30 text-info">{listings.length}</Badge>
        </h2>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={cn('h-2.5 w-2.5 text-muted-foreground', isRefreshing && 'animate-spin')} />
          </Button>
          {user && (
            <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditHousing(null); }}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-5 px-1.5 text-[9px] gap-0.5 text-info"><Plus className="h-2.5 w-2.5" /> Add</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[400px]">
                <DialogHeader><DialogTitle className="text-sm">{editHousing ? 'Edit' : 'Add Housing'}</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-2.5">
                  <div className="space-y-1"><Label className="text-xs">Title *</Label><Input name="title" required className="h-7 text-xs" defaultValue={editHousing?.title || ''} /></div>
                  <div className="space-y-1"><Label className="text-xs">Address *</Label><Input name="address" required className="h-7 text-xs" defaultValue={editHousing?.address || ''} /></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1"><Label className="text-xs">Lat *</Label><Input name="lat" type="number" step="any" required className="h-7 text-xs" defaultValue={editHousing?.lat || ''} /></div>
                    <div className="space-y-1"><Label className="text-xs">Lng *</Label><Input name="lng" type="number" step="any" required className="h-7 text-xs" defaultValue={editHousing?.lng || ''} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1"><Label className="text-xs">Price ($/mo) *</Label><Input name="price" type="number" required className="h-7 text-xs" defaultValue={editHousing?.price || ''} /></div>
                    <div className="space-y-1"><Label className="text-xs">Bedrooms *</Label><Input name="bedrooms" type="number" required className="h-7 text-xs" defaultValue={editHousing?.bedrooms || ''} /></div>
                  </div>
                  <div className="space-y-1"><Label className="text-xs">Contact (Phone) *</Label><Input name="contact" required className="h-7 text-xs" defaultValue={editHousing?.contact || ''} /></div>
                  <div className="space-y-1"><Label className="text-xs">Description</Label><Textarea name="description" className="text-xs min-h-[50px]" defaultValue={editHousing?.description || ''} /></div>
                  <Button type="submit" className="w-full h-7 text-xs" disabled={loading}>{loading ? 'Saving...' : (editHousing ? 'Update' : 'Add Listing')}</Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5">
        <div className="relative flex-1">
          <Search className="absolute left-1.5 top-1/2 -translate-y-1/2 h-2.5 w-2.5 text-muted-foreground" />
          <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="h-6 text-[10px] pl-5" />
        </div>
        <Input type="number" placeholder="Max $" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="h-6 text-[10px] w-16" />
        <Input type="number" placeholder="Min BR" value={minBeds} onChange={e => setMinBeds(e.target.value)} className="h-6 text-[10px] w-16" />
      </div>

      {listings.length === 0 && (
        <p className="text-[10px] text-muted-foreground text-center py-4">No housing found. Add a listing to help others!</p>
      )}

      {listings.map((house) => {
        const isOwner = user?.id === house.user_id;
        const dist = position ? distanceKm(position.lat, position.lng, house.lat, house.lng) : null;
        return (
          <div key={house.id} className="p-2 rounded border border-border bg-card/50 text-[11px] space-y-1.5">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <span className="font-sans font-semibold text-foreground text-xs">{house.title}</span>
                {dist !== null && <span className="ml-1.5 text-[9px] text-info">{dist < 1 ? `${Math.round(dist * 1000)}m` : `${dist.toFixed(1)}km`}</span>}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {isOwner && (
                  <>
                    <Button variant="ghost" size="sm" className="h-4 w-4 p-0" onClick={() => { setEditHousing(house); setOpen(true); }}><Pencil className="h-2.5 w-2.5 text-muted-foreground" /></Button>
                    <Button variant="ghost" size="sm" className="h-4 w-4 p-0" onClick={() => handleDelete(house.id)}><Trash2 className="h-2.5 w-2.5 text-danger" /></Button>
                  </>
                )}
                <Badge variant="outline" className="text-[9px] h-4 border-info/50 text-info">{house.available ? 'Available' : 'Taken'}</Badge>
              </div>
            </div>
            <div className="text-muted-foreground">{house.address}</div>
            {house.description && <p className="text-muted-foreground">{house.description}</p>}
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-info font-semibold"><DollarSign className="h-2.5 w-2.5" />{house.price}/mo</span>
              <span className="flex items-center gap-1"><BedDouble className="h-2.5 w-2.5" />{house.bedrooms} BR</span>
            </div>
            <div className="flex gap-1.5">
              <Button variant="outline" size="sm" className="h-6 text-[10px] gap-1 flex-1 border-info/50 text-info hover:bg-info/10" onClick={() => window.location.href = `tel:${house.contact}`}>
                <Phone className="h-2.5 w-2.5" /> Call
              </Button>
              <Button variant="outline" size="sm" className="h-6 text-[10px] gap-1 border-success/50 text-success hover:bg-success/10" onClick={() => openWhatsApp(house.contact)}>
                <MessageCircle className="h-2.5 w-2.5" /> WhatsApp
              </Button>
              <Button variant="outline" size="sm" className="h-6 text-[10px] gap-1 border-muted-foreground/50 text-muted-foreground hover:bg-muted/50" onClick={() => window.open(getDirectionsUrl(house.lat, house.lng), '_blank')}>
                <Navigation className="h-2.5 w-2.5" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
