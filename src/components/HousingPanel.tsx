import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { type HousingListing } from '@/data/mockData';
import { Home, DollarSign, Phone, BedDouble, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

export function HousingPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dbHousing, setDbHousing] = useState<HousingListing[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchHousing = async () => {
    const { data } = await supabase.from('housing_listings').select('*').order('created_at', { ascending: false });
    if (data) {
      setDbHousing(data.map(h => ({
        id: h.id, title: h.title, lat: h.lat, lng: h.lng,
        price: h.price, currency: h.currency, bedrooms: h.bedrooms,
        address: h.address, contact: h.contact,
        available: h.available, description: h.description || '',
      })));
    }
  };

  useEffect(() => { fetchHousing(); }, []);

  const allHousing = [...dbHousing, ...mockHousing];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const { error } = await supabase.from('housing_listings').insert({
      user_id: user.id,
      title: form.get('title') as string,
      address: form.get('address') as string,
      lat: parseFloat(form.get('lat') as string),
      lng: parseFloat(form.get('lng') as string),
      price: parseInt(form.get('price') as string),
      currency: 'USD',
      bedrooms: parseInt(form.get('bedrooms') as string),
      contact: form.get('contact') as string,
      description: form.get('description') as string,
    });
    setLoading(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Housing listing added' });
      setOpen(false);
      fetchHousing();
    }
  };

  return (
    <div className="space-y-2 p-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-sans font-bold uppercase tracking-wider text-info flex items-center gap-2">
          <Home className="h-3 w-3" /> Housing Available
        </h2>
        {user && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-5 px-1.5 text-[9px] gap-0.5 text-info">
                <Plus className="h-2.5 w-2.5" /> Add
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle className="text-sm">Add Housing Listing</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-2.5">
                <div className="space-y-1">
                  <Label className="text-xs">Title *</Label>
                  <Input name="title" required className="h-7 text-xs" placeholder="2BR Apartment - Safe Zone" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Address *</Label>
                  <Input name="address" required className="h-7 text-xs" placeholder="Full address" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Latitude *</Label>
                    <Input name="lat" type="number" step="any" required className="h-7 text-xs" placeholder="33.89" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Longitude *</Label>
                    <Input name="lng" type="number" step="any" required className="h-7 text-xs" placeholder="35.50" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Price ($/mo) *</Label>
                    <Input name="price" type="number" required className="h-7 text-xs" placeholder="300" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Bedrooms *</Label>
                    <Input name="bedrooms" type="number" required className="h-7 text-xs" placeholder="2" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Contact *</Label>
                  <Input name="contact" required className="h-7 text-xs" placeholder="+961 70 123 456" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Description</Label>
                  <Textarea name="description" className="text-xs min-h-[60px]" placeholder="Brief description..." />
                </div>
                <Button type="submit" className="w-full h-7 text-xs" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Listing'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
      {allHousing.map((house) => (
        <div key={house.id} className="p-2 rounded border border-border bg-card/50 text-[11px] space-y-1.5">
          <div className="flex items-start justify-between">
            <span className="font-sans font-semibold text-foreground text-xs">{house.title}</span>
            <Badge variant="outline" className="text-[9px] h-4 border-info/50 text-info">
              {house.available ? 'Available' : 'Taken'}
            </Badge>
          </div>
          <div className="text-muted-foreground">{house.address}</div>
          <p className="text-muted-foreground">{house.description}</p>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-info"><DollarSign className="h-2.5 w-2.5" />{house.price}/mo</span>
            <span className="flex items-center gap-1"><BedDouble className="h-2.5 w-2.5" />{house.bedrooms} BR</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground"><Phone className="h-2.5 w-2.5" /> {house.contact}</div>
        </div>
      ))}
    </div>
  );
}
