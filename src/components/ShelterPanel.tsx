import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { type Shelter } from '@/data/mockData';
import { MapPin, Users, Phone, CheckCircle, XCircle, Plus, RefreshCw, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface DbShelter extends Shelter {
  user_id: string;
}

export function ShelterPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dbShelters, setDbShelters] = useState<DbShelter[]>([]);
  const [open, setOpen] = useState(false);
  const [editShelter, setEditShelter] = useState<DbShelter | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchShelters = async () => {
    const { data } = await supabase.from('shelters').select('*').order('created_at', { ascending: false });
    if (data) {
      setDbShelters(data.map(s => ({
        id: s.id, name: s.name, lat: s.lat, lng: s.lng,
        capacity: s.capacity, currentOccupancy: s.current_occupancy,
        address: s.address, contact: s.contact,
        status: s.status as 'open' | 'full' | 'closed',
        amenities: s.amenities || [],
        user_id: s.user_id,
      })));
    }
  };

  useEffect(() => {
    fetchShelters();
    intervalRef.current = setInterval(fetchShelters, 60000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchShelters().finally(() => setTimeout(() => setIsRefreshing(false), 1000));
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('shelters').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Shelter deleted' });
      fetchShelters();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const payload = {
      name: form.get('name') as string,
      address: form.get('address') as string,
      lat: parseFloat(form.get('lat') as string),
      lng: parseFloat(form.get('lng') as string),
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
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: editShelter ? 'Shelter updated' : 'Shelter added successfully' });
      setOpen(false);
      setEditShelter(null);
      fetchShelters();
    }
  };

  const openEdit = (shelter: DbShelter) => {
    setEditShelter(shelter);
    setOpen(true);
  };

  return (
    <div className="space-y-2 p-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-sans font-bold uppercase tracking-wider text-success flex items-center gap-2">
          <MapPin className="h-3 w-3" /> Shelters
        </h2>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={handleRefresh} disabled={isRefreshing} title="Refresh">
            <RefreshCw className={cn('h-2.5 w-2.5 text-muted-foreground', isRefreshing && 'animate-spin')} />
          </Button>
          {user && (
            <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditShelter(null); }}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-5 px-1.5 text-[9px] gap-0.5 text-success">
                  <Plus className="h-2.5 w-2.5" /> Add
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                  <DialogTitle className="text-sm">{editShelter ? 'Edit Shelter' : 'Add Shelter'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-2.5">
                  <div className="space-y-1">
                    <Label className="text-xs">Name *</Label>
                    <Input name="name" required className="h-7 text-xs" placeholder="Shelter name" defaultValue={editShelter?.name || ''} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Address *</Label>
                    <Input name="address" required className="h-7 text-xs" placeholder="Full address" defaultValue={editShelter?.address || ''} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Latitude *</Label>
                      <Input name="lat" type="number" step="any" required className="h-7 text-xs" placeholder="33.89" defaultValue={editShelter?.lat || ''} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Longitude *</Label>
                      <Input name="lng" type="number" step="any" required className="h-7 text-xs" placeholder="35.50" defaultValue={editShelter?.lng || ''} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Capacity *</Label>
                      <Input name="capacity" type="number" required className="h-7 text-xs" placeholder="100" defaultValue={editShelter?.capacity || ''} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Current Occupancy</Label>
                      <Input name="occupancy" type="number" className="h-7 text-xs" placeholder="0" defaultValue={editShelter?.currentOccupancy || ''} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Contact *</Label>
                    <Input name="contact" required className="h-7 text-xs" placeholder="+961 1 234 567" defaultValue={editShelter?.contact || ''} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Status</Label>
                    <Select name="status" defaultValue={editShelter?.status || 'open'}>
                      <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="full">Full</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Amenities (comma-separated)</Label>
                    <Input name="amenities" className="h-7 text-xs" placeholder="Water, Food, Medical, WiFi" defaultValue={editShelter?.amenities.join(', ') || ''} />
                  </div>
                  <Button type="submit" className="w-full h-7 text-xs" disabled={loading}>
                    {loading ? (editShelter ? 'Updating...' : 'Adding...') : (editShelter ? 'Update Shelter' : 'Add Shelter')}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
      {dbShelters.map((shelter) => {
        const occupancyPct = Math.round((shelter.currentOccupancy / shelter.capacity) * 100);
        const isOwner = user?.id === shelter.user_id;
        return (
          <div key={shelter.id} className="p-2 rounded border border-border bg-card/50 text-[11px] space-y-1.5">
            <div className="flex items-start justify-between">
              <span className="font-sans font-semibold text-foreground text-xs">{shelter.name}</span>
              <div className="flex items-center gap-1">
                {isOwner && (
                  <>
                    <Button variant="ghost" size="sm" className="h-4 w-4 p-0" onClick={() => openEdit(shelter)} title="Edit">
                      <Pencil className="h-2.5 w-2.5 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-4 w-4 p-0" onClick={() => handleDelete(shelter.id)} title="Delete">
                      <Trash2 className="h-2.5 w-2.5 text-danger" />
                    </Button>
                  </>
                )}
                <Badge variant="outline" className={cn('text-[9px] h-4', shelter.status === 'open' ? 'border-success/50 text-success' : 'border-danger/50 text-danger')}>
                  {shelter.status === 'open' ? <CheckCircle className="h-2 w-2 mr-0.5" /> : <XCircle className="h-2 w-2 mr-0.5" />}
                  {shelter.status}
                </Badge>
              </div>
            </div>
            <div className="text-muted-foreground">{shelter.address}</div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1"><Users className="h-2.5 w-2.5" />{shelter.currentOccupancy}/{shelter.capacity}</span>
              <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                <div className={cn('h-full rounded-full transition-all', occupancyPct > 90 ? 'bg-danger' : occupancyPct > 70 ? 'bg-warning' : 'bg-success')} style={{ width: `${occupancyPct}%` }} />
              </div>
              <span className="text-muted-foreground">{occupancyPct}%</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground"><Phone className="h-2.5 w-2.5" /> {shelter.contact}</div>
            <div className="flex gap-1 flex-wrap">
              {shelter.amenities.map(a => (<span key={a} className="px-1 py-0.5 rounded bg-success/10 text-success text-[9px]">{a}</span>))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
