import { useEffect, useState, useMemo } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useNewsFeedContext } from '@/contexts/NewsFeedContext';
import { HOTSPOTS } from '@/config/hotspots';
import { INFRA_NODES } from '@/config/infrastructure';
import { MONITORED_COUNTRIES } from '@/config/countryInstability';
import { Search, Newspaper, MapPin, Radio, Globe, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sanitizeFeedText } from '@/lib/sanitizeFeedText';

interface CommandResult {
  id: string;
  label: string;
  sublabel?: string;
  icon: React.ReactNode;
  category: string;
  action: () => void;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { news } = useNewsFeedContext();

  // Cmd+K / Ctrl+K to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
        setQuery('');
        setSelectedIndex(0);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const results = useMemo<CommandResult[]>(() => {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    const items: CommandResult[] = [];

    // Search news
    const matchingNews = news
      .filter(n => sanitizeFeedText(n.title).toLowerCase().includes(q) || n.source.toLowerCase().includes(q))
      .slice(0, 8);
    for (const n of matchingNews) {
      items.push({
        id: `news-${n.id}`,
        label: sanitizeFeedText(n.title).slice(0, 80),
        sublabel: `${n.source} • ${n.category}`,
        icon: <Newspaper className="h-3.5 w-3.5 text-primary" />,
        category: 'News',
        action: () => { if (n.url && n.url !== '#') window.open(n.url, '_blank'); setOpen(false); },
      });
    }

    // Search hotspots
    for (const hs of HOTSPOTS) {
      if (hs.name.toLowerCase().includes(q) || hs.keywords.some(k => k.includes(q))) {
        items.push({
          id: `hotspot-${hs.id}`,
          label: hs.name,
          sublabel: `Hotspot zone`,
          icon: <MapPin className="h-3.5 w-3.5 text-danger" />,
          category: 'Hotspots',
          action: () => setOpen(false),
        });
      }
    }

    // Search infrastructure
    for (const node of INFRA_NODES) {
      if (node.name.toLowerCase().includes(q) || node.region.toLowerCase().includes(q)) {
        items.push({
          id: `infra-${node.id}`,
          label: node.name,
          sublabel: `${node.type} • ${node.region}`,
          icon: <Zap className="h-3.5 w-3.5 text-info" />,
          category: 'Infrastructure',
          action: () => setOpen(false),
        });
      }
    }

    // Search countries
    for (const c of MONITORED_COUNTRIES) {
      if (c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)) {
        items.push({
          id: `country-${c.id}`,
          label: c.name,
          sublabel: `CII Country • ${c.code}`,
          icon: <Globe className="h-3.5 w-3.5 text-warning" />,
          category: 'Countries',
          action: () => setOpen(false),
        });
      }
    }

    return items.slice(0, 20);
  }, [query, news]);

  // Keyboard nav
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, results.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)); }
      if (e.key === 'Enter' && results[selectedIndex]) { results[selectedIndex].action(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, results, selectedIndex]);

  useEffect(() => setSelectedIndex(0), [query]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[520px] p-0 gap-0 overflow-hidden" aria-describedby={undefined}>
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search news, hotspots, infrastructure, countries..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <kbd className="hidden sm:inline text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">ESC</kbd>
        </div>

        <div className="max-h-[360px] overflow-y-auto">
          {results.length === 0 && query.length >= 2 && (
            <div className="p-6 text-center text-sm text-muted-foreground">No results found</div>
          )}
          {results.length === 0 && query.length < 2 && (
            <div className="p-6 text-center text-xs text-muted-foreground">
              Type to search across news, hotspots, infrastructure, and countries
            </div>
          )}
          {results.length > 0 && (
            <div className="py-1">
              {results.map((result, i) => (
                <button
                  key={result.id}
                  onClick={result.action}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 text-left text-xs hover:bg-muted/50 transition-colors',
                    i === selectedIndex && 'bg-muted'
                  )}
                >
                  {result.icon}
                  <div className="flex-1 min-w-0">
                    <div className="text-foreground font-medium truncate">{result.label}</div>
                    {result.sublabel && <div className="text-[10px] text-muted-foreground truncate">{result.sublabel}</div>}
                  </div>
                  <span className="text-[9px] text-muted-foreground shrink-0">{result.category}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 px-3 py-1.5 border-t border-border text-[9px] text-muted-foreground">
          <span><kbd className="px-1 py-0.5 rounded bg-muted border border-border">↑↓</kbd> Navigate</span>
          <span><kbd className="px-1 py-0.5 rounded bg-muted border border-border">↵</kbd> Open</span>
          <span><kbd className="px-1 py-0.5 rounded bg-muted border border-border">esc</kbd> Close</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
