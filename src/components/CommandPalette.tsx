import { useEffect, useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useNewsFeedContext } from '@/contexts/NewsFeedContext';
import { supabase } from '@/integrations/supabase/client';
import { HOTSPOTS } from '@/config/hotspots';
import { INFRA_NODES } from '@/config/infrastructure';
import { MONITORED_COUNTRIES } from '@/config/countryInstability';
import { Search, Newspaper, MapPin, Globe, Zap, Clock, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sanitizeFeedText } from '@/lib/sanitizeFeedText';
import { useTranslation } from '@/lib/i18n';

const HISTORY_KEY = 'worldmonitor_search_history';
const MAX_HISTORY = 10;

function loadHistory(): string[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]') as string[];
  } catch {
    return [];
  }
}

function persistHistory(terms: string[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(terms.slice(0, MAX_HISTORY)));
}

interface FTSArticle {
  id: string;
  title: string | null;
  source_name: string | null;
  url: string | null;
  category: string | null;
}

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
  const [history, setHistory] = useState<string[]>(loadHistory);
  const { news } = useNewsFeedContext();
  const { t } = useTranslation();

  // FTS search against articles table
  const { data: ftsArticles = [] } = useQuery<FTSArticle[]>({
    queryKey: ['cmd-fts', query],
    enabled: open && query.length >= 2,
    queryFn: async () => {
      const { data } = await supabase
        .from('articles')
        .select('id, title, source_name, url, category')
        .textSearch('fts', query, { type: 'websearch' })
        .limit(6);
      return (data ?? []) as FTSArticle[];
    },
    staleTime: 30_000,
  });

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

  const addToHistory = useCallback((term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setHistory(prev => {
      const next = [trimmed, ...prev.filter(h => h !== trimmed)].slice(0, MAX_HISTORY);
      persistHistory(next);
      return next;
    });
  }, []);

  const removeFromHistory = useCallback((term: string) => {
    setHistory(prev => {
      const next = prev.filter(h => h !== term);
      persistHistory(next);
      return next;
    });
  }, []);

  const results = useMemo<CommandResult[]>(() => {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    const items: CommandResult[] = [];

    // DB FTS articles (purple badge)
    const ftsIds = new Set<string>();
    for (const a of ftsArticles) {
      ftsIds.add(a.id);
      items.push({
        id: `fts-${a.id}`,
        label: (a.title ?? '').slice(0, 80),
        sublabel: [a.source_name, a.category].filter(Boolean).join(' • '),
        icon: <Newspaper className="h-3.5 w-3.5 text-purple-400" />,
        category: 'Articles',
        action: () => { if (a.url) window.open(a.url, '_blank'); setOpen(false); addToHistory(query); },
      });
    }

    // In-memory news (deduped against fts results)
    const matchingNews = news
      .filter(n => !ftsIds.has(n.id) && (
        sanitizeFeedText(n.title).toLowerCase().includes(q) || n.source.toLowerCase().includes(q)
      ))
      .slice(0, 5);
    for (const n of matchingNews) {
      items.push({
        id: `news-${n.id}`,
        label: sanitizeFeedText(n.title).slice(0, 80),
        sublabel: `${n.source} • ${n.category}`,
        icon: <Newspaper className="h-3.5 w-3.5 text-primary" />,
        category: 'Articles',
        action: () => { if (n.url && n.url !== '#') window.open(n.url, '_blank'); setOpen(false); addToHistory(query); },
      });
    }

    // Hotspots
    for (const hs of HOTSPOTS) {
      if (hs.name.toLowerCase().includes(q) || hs.keywords.some(k => k.includes(q))) {
        items.push({
          id: `hotspot-${hs.id}`,
          label: hs.name,
          sublabel: t('cmd.hotspotZone'),
          icon: <MapPin className="h-3.5 w-3.5 text-danger" />,
          category: t('cmd.hotspots'),
          action: () => { setOpen(false); addToHistory(query); },
        });
      }
    }

    // Infrastructure
    for (const node of INFRA_NODES) {
      if (node.name.toLowerCase().includes(q) || node.region.toLowerCase().includes(q)) {
        items.push({
          id: `infra-${node.id}`,
          label: node.name,
          sublabel: `${node.type} • ${node.region}`,
          icon: <Zap className="h-3.5 w-3.5 text-info" />,
          category: t('cmd.infrastructure'),
          action: () => { setOpen(false); addToHistory(query); },
        });
      }
    }

    // Countries
    for (const c of MONITORED_COUNTRIES) {
      if (c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)) {
        items.push({
          id: `country-${c.id}`,
          label: c.name,
          sublabel: `${t('cmd.ciiCountry')} • ${c.code}`,
          icon: <Globe className="h-3.5 w-3.5 text-warning" />,
          category: t('cmd.countries'),
          action: () => { setOpen(false); addToHistory(query); },
        });
      }
    }

    return items.slice(0, 20);
  }, [query, news, ftsArticles, t, addToHistory]);

  // Group results by category (preserves insertion order)
  const grouped = useMemo(() => {
    const groups: Record<string, CommandResult[]> = {};
    for (const r of results) {
      if (!groups[r.category]) groups[r.category] = [];
      groups[r.category].push(r);
    }
    return groups;
  }, [results]);

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

  // flatIndex tracks keyboard-highlight alignment across grouped render
  let flatIndex = 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[520px] p-0 gap-0 overflow-hidden" aria-describedby={undefined}>
        <DialogTitle className="sr-only">Global Command Palette</DialogTitle>
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t('cmd.searchPlaceholder')}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <kbd className="hidden sm:inline text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">ESC</kbd>
        </div>

        <div className="max-h-[360px] overflow-y-auto">
          {/* Recent search history — shown when idle */}
          {query.length < 2 && history.length > 0 && (
            <div className="px-3 py-2.5 space-y-2">
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-mono flex items-center gap-1">
                <Clock className="h-2.5 w-2.5" /> Recent
              </p>
              <div className="flex flex-wrap gap-1">
                {history.map(term => (
                  <div
                    key={term}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-muted border border-border text-[10px] text-foreground"
                  >
                    <button
                      onClick={() => setQuery(term)}
                      className="hover:text-primary transition-colors"
                    >
                      {term}
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); removeFromHistory(term); }}
                      className="text-muted-foreground hover:text-foreground transition-colors ml-0.5"
                      aria-label="Remove"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {query.length < 2 && history.length === 0 && (
            <div className="p-6 text-center text-xs text-muted-foreground">{t('cmd.typeToSearch')}</div>
          )}

          {results.length === 0 && query.length >= 2 && (
            <div className="p-6 text-center text-sm text-muted-foreground">{t('cmd.noResults')}</div>
          )}

          {/* Grouped results */}
          {results.length > 0 && (
            <div className="py-1">
              {Object.entries(grouped).map(([category, items]) => (
                <div key={category}>
                  <div className="px-3 pt-2 pb-1 text-[9px] uppercase tracking-wider text-muted-foreground font-mono border-b border-border/50 bg-muted/20">
                    {category}
                  </div>
                  {items.map(result => {
                    const idx = flatIndex++;
                    return (
                      <button
                        key={result.id}
                        onClick={result.action}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2 text-left text-xs hover:bg-muted/50 transition-colors',
                          idx === selectedIndex && 'bg-muted'
                        )}
                      >
                        {result.icon}
                        <div className="flex-1 min-w-0">
                          <div className="text-foreground font-medium truncate">{result.label}</div>
                          {result.sublabel && <div className="text-[10px] text-muted-foreground truncate">{result.sublabel}</div>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 px-3 py-1.5 border-t border-border text-[9px] text-muted-foreground">
          <span><kbd className="px-1 py-0.5 rounded bg-muted border border-border">↑↓</kbd> {t('feed.navigate')}</span>
          <span><kbd className="px-1 py-0.5 rounded bg-muted border border-border">↵</kbd> {t('cmd.open')}</span>
          <span><kbd className="px-1 py-0.5 rounded bg-muted border border-border">esc</kbd> {t('cmd.close')}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
