import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { mockDonations } from '@/data/mockData';
import { Heart, ExternalLink, Plus, MessageCircle, Share2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const catColors: Record<string, string> = {
  general: 'border-primary/30', medical: 'border-danger/30', food: 'border-warning/30', shelter: 'border-success/30',
};

const platformIcons: Record<string, string> = { whatsapp: '📱', gofundme: '💰', paypal: '💳', other: '🔗' };
const catFilters = ['all', 'general', 'medical', 'food', 'shelter'] as const;

interface DonationLink {
  id: string; name: string; description: string | null; platform: string; link: string; category: string; user_id: string;
}

export function DonationsPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dbDonations, setDbDonations] = useState<DonationLink[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [platform, setPlatform] = useState('whatsapp');
  const [category, setCategory] = useState('general');
  const [filter, setFilter] = useState<string>('all');

  const fetchDonations = async () => {
    const { data } = await supabase.from('donation_links').select('*').order('created_at', { ascending: false });
    if (data) setDbDonations(data);
  };

  useEffect(() => { fetchDonations(); }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const form = new FormData(e.currentTarget);
    let link = form.get('link') as string;
    if (platform === 'whatsapp') {
      const phone = link.replace(/[^0-9+]/g, '');
      link = `https://wa.me/${phone.replace('+', '')}`;
    }
    const { error } = await supabase.from('donation_links').insert({
      user_id: user.id, name: form.get('name') as string,
      description: form.get('description') as string || null, platform, link, category,
    });
    setLoading(false);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Donation link added' }); setOpen(false); fetchDonations(); }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('donation_links').delete().eq('id', id);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Link removed' }); fetchDonations(); }
  };

  const shareLink = async (name: string, url: string) => {
    const text = `🤝 Support: ${name}\n🔗 ${url}`;
    if (navigator.share) {
      try { await navigator.share({ title: name, text, url }); return; } catch { /* cancelled or failed */ }
    }
    // Fallback: try clipboard, then WhatsApp
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: 'Link copied to clipboard!' });
    } catch {
      // Final fallback: share via WhatsApp
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
      toast({ title: 'Opening WhatsApp to share' });
    }
  };

  const filteredMock = filter === 'all' ? mockDonations : mockDonations.filter(d => d.category === filter);
  const filteredDb = filter === 'all' ? dbDonations : dbDonations.filter(d => d.category === filter);

  return (
    <div className="space-y-2 p-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-sans font-bold uppercase tracking-wider text-primary flex items-center gap-2">
          <Heart className="h-3 w-3" /> Donate & Help
        </h2>
        {user && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-5 px-1.5 text-[9px] gap-0.5 text-primary"><Plus className="h-2.5 w-2.5" /> Add</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader><DialogTitle className="text-sm">Add Donation / Help Link</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-2.5">
                <div className="space-y-1"><Label className="text-xs">Name *</Label><Input name="name" required className="h-7 text-xs" placeholder="e.g. Aid for Beirut families" /></div>
                <div className="space-y-1">
                  <Label className="text-xs">Platform *</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="gofundme">GoFundMe</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{platform === 'whatsapp' ? 'Phone Number *' : 'Link / URL *'}</Label>
                  <Input name="link" required className="h-7 text-xs" placeholder={platform === 'whatsapp' ? '+961 70 123 456' : 'https://...'} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="medical">Medical</SelectItem>
                      <SelectItem value="food">Food</SelectItem>
                      <SelectItem value="shelter">Shelter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label className="text-xs">Description</Label><Textarea name="description" className="text-xs min-h-[50px]" /></div>
                <Button type="submit" className="w-full h-7 text-xs" disabled={loading}>{loading ? 'Adding...' : 'Add Link'}</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <p className="text-[10px] text-muted-foreground">Support verified organizations and community members providing relief.</p>

      {/* Category Filter */}
      <div className="flex gap-1 flex-wrap">
        {catFilters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-2 py-0.5 rounded text-[9px] uppercase tracking-wider transition-colors border',
              filter === f ? 'bg-primary/10 border-primary/50 text-primary' : 'border-border text-muted-foreground hover:text-foreground'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Trusted orgs */}
      {filteredMock.map((org) => (
        <div key={org.id} className={cn('p-2 rounded border bg-card/50 text-[11px] space-y-1.5', catColors[org.category])}>
          <div className="font-sans font-semibold text-foreground text-xs">{org.name}</div>
          <p className="text-muted-foreground leading-relaxed">{org.description}</p>
          <div className="flex gap-1.5">
            <Button variant="outline" size="sm" className="h-6 text-[10px] gap-1 flex-1 border-primary/50 text-primary hover:bg-primary/10" onClick={() => window.open(org.url, '_blank')}>
              <ExternalLink className="h-2.5 w-2.5" /> Donate
            </Button>
            <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1 text-muted-foreground" onClick={() => shareLink(org.name, org.url)}>
              <Share2 className="h-2.5 w-2.5" />
            </Button>
          </div>
        </div>
      ))}

      {/* Community links */}
      {filteredDb.length > 0 && (
        <div className="pt-1 border-t border-border">
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Community Links</span>
        </div>
      )}
      {filteredDb.map((d) => {
        const isOwner = user?.id === d.user_id;
        return (
          <div key={d.id} className={cn('p-2 rounded border bg-card/50 text-[11px] space-y-1.5', catColors[d.category] || catColors.general)}>
            <div className="flex items-center gap-1">
              <span>{platformIcons[d.platform] || '🔗'}</span>
              <span className="font-sans font-semibold text-foreground text-xs flex-1">{d.name}</span>
              {isOwner && (
                <Button variant="ghost" size="sm" className="h-4 w-4 p-0" onClick={() => handleDelete(d.id)}>
                  <Trash2 className="h-2.5 w-2.5 text-danger" />
                </Button>
              )}
            </div>
            {d.description && <p className="text-muted-foreground leading-relaxed">{d.description}</p>}
            <div className="flex gap-1.5">
              <Button variant="outline" size="sm" className="h-6 text-[10px] gap-1 flex-1 border-primary/50 text-primary hover:bg-primary/10" onClick={() => window.open(d.link, '_blank')}>
                {d.platform === 'whatsapp' ? <MessageCircle className="h-2.5 w-2.5" /> : <ExternalLink className="h-2.5 w-2.5" />}
                {d.platform === 'whatsapp' ? 'WhatsApp' : 'Open'}
              </Button>
              <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1 text-muted-foreground" onClick={() => shareLink(d.name, d.link)}>
                <Share2 className="h-2.5 w-2.5" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}