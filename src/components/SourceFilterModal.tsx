/**
 * Global source management modal.
 * Follows World Monitor's source filtering pattern: search, per-source toggle,
 * bulk select/deselect, counter display, persisted to localStorage.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Search, Radio, Check, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { getSourceProfile } from '@/config/sourceReliability';
import { useNewsFeedContext } from '@/contexts/NewsFeedContext';

const STORAGE_KEY = 'cedarsalert_source_filters';

// Extract unique sources from news
function useUniqueSources() {
  const { news } = useNewsFeedContext();
  return useMemo(() => {
    const set = new Set<string>();
    for (const n of news) set.add(n.source);
    return [...set].sort();
  }, [news]);
}

function loadSavedFilters(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch {}
  return new Set(); // empty = nothing disabled
}

function saveFilters(disabled: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...disabled]));
  } catch {}
}

export function useSourceFilters() {
  const [disabledSources, setDisabledSources] = useState<Set<string>>(() => loadSavedFilters());

  const toggleSource = useCallback((source: string) => {
    setDisabledSources(prev => {
      const next = new Set(prev);
      if (next.has(source)) next.delete(source);
      else next.add(source);
      saveFilters(next);
      return next;
    });
  }, []);

  const enableAll = useCallback(() => {
    setDisabledSources(new Set());
    saveFilters(new Set());
  }, []);

  const disableAll = useCallback((sources: string[]) => {
    const all = new Set(sources);
    setDisabledSources(all);
    saveFilters(all);
  }, []);

  const isEnabled = useCallback((source: string) => !disabledSources.has(source), [disabledSources]);

  return { disabledSources, toggleSource, enableAll, disableAll, isEnabled };
}

interface SourceFilterModalProps {
  disabledSources: Set<string>;
  toggleSource: (source: string) => void;
  enableAll: () => void;
  disableAll: (sources: string[]) => void;
}

export function SourceFilterModal({ disabledSources, toggleSource, enableAll, disableAll }: SourceFilterModalProps) {
  const sources = useUniqueSources();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!search) return sources;
    const lower = search.toLowerCase();
    return sources.filter(s => s.toLowerCase().includes(lower));
  }, [sources, search]);

  const enabledCount = sources.filter(s => !disabledSources.has(s)).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] gap-1 uppercase tracking-wider">
          <Radio className="h-3 w-3" />
          Sources
          <span className="text-muted-foreground">{enabledCount}/{sources.length}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="text-sm uppercase tracking-wider flex items-center gap-2">
            <Radio className="h-4 w-4 text-primary" />
            Source Management
            <span className="text-xs font-normal text-muted-foreground ml-auto">{enabledCount}/{sources.length} enabled</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Filter sources…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>

          {/* Bulk actions */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-7 text-[10px] flex-1" onClick={enableAll}>
              <Check className="h-3 w-3 mr-1" /> Select All
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-[10px] flex-1" onClick={() => disableAll(sources)}>
              <X className="h-3 w-3 mr-1" /> Select None
            </Button>
          </div>

          {/* Source list */}
          <ScrollArea className="h-[360px]">
            <div className="space-y-0.5 pr-3">
              {filtered.map(source => {
                const profile = getSourceProfile(source);
                const enabled = !disabledSources.has(source);
                return (
                  <button
                    key={source}
                    onClick={() => toggleSource(source)}
                    className={cn(
                      'flex items-center gap-2 w-full px-2 py-1.5 rounded text-xs transition-colors',
                      enabled ? 'hover:bg-muted' : 'opacity-50 hover:opacity-75'
                    )}
                  >
                    <div className={cn(
                      'h-3.5 w-3.5 rounded border flex items-center justify-center shrink-0 transition-colors',
                      enabled ? 'bg-primary border-primary' : 'border-muted-foreground'
                    )}>
                      {enabled && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                    </div>
                    <span className="flex-1 text-left truncate">{source}</span>
                    <span className="text-[9px] text-muted-foreground capitalize">{profile.type.replace('_', ' ')}</span>
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No sources matching "{search}"</p>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
