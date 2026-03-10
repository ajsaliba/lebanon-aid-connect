import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Trash2, Rss, ToggleLeft, ToggleRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/lib/i18n';

interface CustomFeed {
  id: string;
  name: string;
  url: string;
  source_label: string;
  enabled: boolean;
}

export function CustomFeedsPanel({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [feeds, setFeeds] = useState<CustomFeed[]>([]);
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const loadFeeds = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('custom_feeds')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (data) setFeeds(data.map(f => ({
      id: f.id, name: f.name, url: f.url,
      source_label: f.source_label, enabled: f.enabled,
    })));
  }, [user]);

  useEffect(() => { loadFeeds(); }, [loadFeeds]);

  const addFeed = async () => {
    if (!user || !newUrl.trim() || !newName.trim()) return;
    setLoading(true);
    const { error } = await supabase.from('custom_feeds').insert({
      user_id: user.id,
      name: newName.trim(),
      url: newUrl.trim(),
      source_label: newName.trim(),
    });
    if (error) {
      toast({ title: t('customFeed.addFailed'), description: error.message, variant: 'destructive' });
    } else {
      toast({ title: t('customFeed.added') });
      setNewName(''); setNewUrl('');
      loadFeeds();
    }
    setLoading(false);
  };

  const toggleFeed = async (id: string, enabled: boolean) => {
    await supabase.from('custom_feeds').update({ enabled: !enabled }).eq('id', id);
    loadFeeds();
  };

  const deleteFeed = async (id: string) => {
    await supabase.from('custom_feeds').delete().eq('id', id);
    loadFeeds();
  };

  if (!isOpen) return null;

  return (
    <div className="border-b border-border bg-card/50 p-3 space-y-3 text-[11px]">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1">
          <Rss className="h-3 w-3" /> {t('customFeed.title')}
        </span>
        <button onClick={onToggle}><X className="h-3 w-3 text-muted-foreground" /></button>
      </div>

      {!user ? (
        <p className="text-[10px] text-muted-foreground">{t('customFeed.signIn')}</p>
      ) : (
        <>
          <div className="space-y-1">
            <Input value={newName} onChange={e => setNewName(e.target.value)}
              placeholder={t('customFeed.namePlaceholder')} className="h-7 text-[11px]" />
            <div className="flex gap-1">
              <Input value={newUrl} onChange={e => setNewUrl(e.target.value)}
                placeholder={t('customFeed.urlPlaceholder')} className="h-7 text-[11px] flex-1"
                onKeyDown={e => { if (e.key === 'Enter') addFeed(); }} />
              <Button size="sm" className="h-7 px-2 text-[10px]" onClick={addFeed} disabled={loading || !newUrl.trim() || !newName.trim()}>
                <Plus className="h-3 w-3 mr-1" /> {t('customFeed.add')}
              </Button>
            </div>
          </div>

          {feeds.length > 0 && (
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {feeds.map(feed => (
                <div key={feed.id} className="flex items-center gap-2 px-2 py-1 rounded bg-muted/30 group">
                  <button onClick={() => toggleFeed(feed.id, feed.enabled)} className="shrink-0">
                    {feed.enabled
                      ? <ToggleRight className="h-4 w-4 text-success" />
                      : <ToggleLeft className="h-4 w-4 text-muted-foreground" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground truncate">{feed.name}</div>
                    <div className="text-[9px] text-muted-foreground truncate">{feed.url}</div>
                  </div>
                  <button onClick={() => deleteFeed(feed.id)}
                    className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {feeds.length === 0 && (
            <p className="text-[10px] text-muted-foreground">{t('customFeed.empty')}</p>
          )}
        </>
      )}
    </div>
  );
}
