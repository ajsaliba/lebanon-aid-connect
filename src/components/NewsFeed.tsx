import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useNewsFeedContext } from '@/contexts/NewsFeedContext';
import { format } from 'date-fns';
import { Search, Wifi, WifiOff, RefreshCw, TrendingUp, X, CalendarIcon, History, BookmarkCheck, ListChecks, Settings, Keyboard } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { sanitizeFeedText } from '@/lib/sanitizeFeedText';
import { ArticleCard } from '@/components/ArticleCard';
import { FeedSettingsPanel } from '@/components/FeedSettingsPanel';
import { useBookmarks, useReadingList } from '@/hooks/useArticleActions';
import { useFeedSettings, type CardStyle } from '@/hooks/useFeedSettings';
import { useToast } from '@/hooks/use-toast';

const categoryStyles = {
  conflict: 'text-danger',
  humanitarian: 'text-success',
  political: 'text-warning',
  infrastructure: 'text-info',
};

const timeFilters = ['1h', '6h', '24h', '48h', '7d', 'All'] as const;

function getTimeFilterMs(filter: string): number {
  const map: Record<string, number> = {
    '1h': 3600000, '6h': 21600000, '24h': 86400000,
    '48h': 172800000, '7d': 604800000, 'All': Infinity,
  };
  return map[filter] || Infinity;
}

const STOP_WORDS = new Set([
  'the','a','an','and','or','but','in','on','at','to','for','of','with','by','from','is','are','was','were',
  'be','been','being','have','has','had','do','does','did','will','would','could','should','may','might',
  'shall','can','it','its','this','that','these','those','i','you','he','she','we','they','me','him','her',
  'us','them','my','your','his','our','their','what','which','who','whom','how','when','where','why','not',
  'no','nor','so','if','then','than','too','very','just','about','up','out','into','over','after','before',
  'new','says','said','also','more','as','all','any','each','most','other','some','such','news','update',
  'report','reports','according','amid',
]);

function extractTrendingKeywords(news: Array<{ title: string; publishedAt: string }>, max = 15): string[] {
  const oneHourAgo = Date.now() - 3600000;
  const recentNews = news.filter(n => new Date(n.publishedAt).getTime() > oneHourAgo);
  const source = recentNews.length >= 3 ? recentNews : news;
  const freq: Record<string, number> = {};
  for (const item of source) {
    const text = sanitizeFeedText(item.title).toLowerCase();
    const words = text.split(/[^a-z'-]+/).filter(w => w.length > 2 && !STOP_WORDS.has(w));
    const seen = new Set<string>();
    for (const w of words) {
      if (!seen.has(w)) { seen.add(w); freq[w] = (freq[w] || 0) + 1; }
    }
  }
  return Object.entries(freq)
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([word]) => word);
}

function getSearchSuggestions(news: Array<{ title: string; summary: string }>, query: string, max = 8): string[] {
  if (!query || query.length < 2) return [];
  const lower = query.toLowerCase();
  const freq: Record<string, number> = {};
  for (const item of news) {
    const text = `${sanitizeFeedText(item.title)} ${sanitizeFeedText(item.summary)}`.toLowerCase();
    const words = text.split(/[^a-z'-]+/).filter(w => w.length > 2 && !STOP_WORDS.has(w));
    for (const w of words) {
      if (w.startsWith(lower) && w !== lower) freq[w] = (freq[w] || 0) + 1;
    }
  }
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, max).map(([word]) => word);
}

const SEARCH_HISTORY_KEY = 'cedarsalert_search_history';
const MAX_HISTORY = 8;
function getSearchHistory(): string[] {
  try { return JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]'); } catch { return []; }
}
function addToSearchHistory(term: string) {
  if (!term || term.length < 2) return;
  const history = getSearchHistory().filter(h => h !== term);
  history.unshift(term);
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
}
function clearSearchHistory() { localStorage.removeItem(SEARCH_HISTORY_KEY); }

function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query || query.length < 2) return <>{text}</>;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return <>{parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i} className="bg-primary/30 text-foreground rounded-sm px-0.5">{part}</mark>
      : part
  )}</>;
}

type ViewMode = 'feed' | 'bookmarks' | 'reading-list';

const CATEGORIES = ['conflict', 'humanitarian', 'political', 'infrastructure'] as const;

export function NewsFeed() {
  const { news, isLoading, isLive, refetch, setPollInterval } = useNewsFeedContext();
  const {
    settings, updateSettings,
    mutedKeywords, addMutedKeyword, removeMutedKeyword,
    readHistory, markAsRead, isRead,
    exportSettings, importSettings,
  } = useFeedSettings();

  const [search, setSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeTime, setActiveTime] = useState<string>(settings.defaultTimeFilter);
  const [activeCategory, setActiveCategory] = useState<string | null>(settings.defaultCategory);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [searchHistory, setSearchHistory] = useState<string[]>(getSearchHistory());
  const [viewMode, setViewMode] = useState<ViewMode>('feed');
  const [showSettings, setShowSettings] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const trendingRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const { bookmarkedIds, toggleBookmark, isBookmarked } = useBookmarks();
  const { readingListIds, toggleReadingList, isInReadingList } = useReadingList();
  const { toast } = useToast();

  // Sync poll interval with settings
  useEffect(() => {
    setPollInterval(settings.pollFrequency * 1000);
  }, [settings.pollFrequency, setPollInterval]);

  const suggestions = useMemo(() => getSearchSuggestions(news, search), [news, search]);
  const trending = useMemo(() => extractTrendingKeywords(news), [news]);

  const commitSearch = useCallback((term: string) => {
    setSearch(term);
    setShowSuggestions(false);
    if (term.length >= 2) { addToSearchHistory(term); setSearchHistory(getSearchHistory()); }
  }, []);

  const handleClearHistory = () => { clearSearchHistory(); setSearchHistory([]); };

  const filtered = useMemo(() => {
    let items = news;

    // Muted keywords filter
    if (mutedKeywords.size > 0) {
      items = items.filter(n => {
        const text = `${sanitizeFeedText(n.title)} ${sanitizeFeedText(n.summary)}`.toLowerCase();
        return ![...mutedKeywords].some(k => text.includes(k));
      });
    }

    if (viewMode === 'bookmarks') {
      items = items.filter(n => bookmarkedIds.has(n.id));
    } else if (viewMode === 'reading-list') {
      items = items.filter(n => readingListIds.has(n.id));
    }

    return items.filter(n => {
      if (search) {
        const q = search.toLowerCase();
        const title = sanitizeFeedText(n.title).toLowerCase();
        const summary = sanitizeFeedText(n.summary).toLowerCase();
        if (!title.includes(q) && !summary.includes(q)) return false;
      }
      if (activeCategory && n.category !== activeCategory) return false;
      if (dateRange.from || dateRange.to) {
        const pubDate = new Date(n.publishedAt);
        if (dateRange.from) { const s = new Date(dateRange.from); s.setHours(0,0,0,0); if (pubDate < s) return false; }
        if (dateRange.to) { const e = new Date(dateRange.to); e.setHours(23,59,59,999); if (pubDate > e) return false; }
      } else {
        const age = Date.now() - new Date(n.publishedAt).getTime();
        if (age > getTimeFilterMs(activeTime)) return false;
      }
      return true;
    });
  }, [news, search, activeCategory, activeTime, dateRange, viewMode, bookmarkedIds, readingListIds, mutedKeywords]);

  const handleRefresh = async () => { setIsRefreshing(true); refetch(); setTimeout(() => setIsRefreshing(false), 2000); };
  const hasDateFilter = dateRange.from || dateRange.to;

  const handleCategoryClick = useCallback((cat: string) => {
    setActiveCategory(prev => prev === cat ? null : cat);
  }, []);

  const handleArticleOpen = useCallback((id: string) => {
    markAsRead(id);
  }, [markAsRead]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      switch (e.key) {
        case '/':
          e.preventDefault();
          searchRef.current?.focus();
          break;
        case 'j':
          e.preventDefault();
          setFocusedIndex(prev => Math.min(prev + 1, filtered.length - 1));
          break;
        case 'k':
          e.preventDefault();
          setFocusedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          if (focusedIndex >= 0 && filtered[focusedIndex]) {
            const item = filtered[focusedIndex];
            markAsRead(item.id);
            if (item.url && item.url !== '#') window.open(item.url, '_blank');
          }
          break;
        case 'b':
          if (focusedIndex >= 0 && filtered[focusedIndex]) {
            toggleBookmark(filtered[focusedIndex].id);
          }
          break;
        case 'l':
          if (focusedIndex >= 0 && filtered[focusedIndex]) {
            toggleReadingList(filtered[focusedIndex].id);
          }
          break;
        case 'r':
          e.preventDefault();
          handleRefresh();
          break;
        case '1': handleCategoryClick('conflict'); break;
        case '2': handleCategoryClick('humanitarian'); break;
        case '3': handleCategoryClick('political'); break;
        case '4': handleCategoryClick('infrastructure'); break;
        case '0':
          setActiveCategory(null);
          break;
        case '?':
          setShowShortcuts(prev => !prev);
          break;
        case 'Escape':
          setFocusedIndex(-1);
          setShowShortcuts(false);
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [filtered, focusedIndex, toggleBookmark, toggleReadingList, handleCategoryClick, markAsRead]);

  // Scroll focused item into view
  useEffect(() => {
    if (focusedIndex >= 0 && listRef.current) {
      const el = listRef.current.children[focusedIndex] as HTMLElement;
      el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [focusedIndex]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-sans font-bold uppercase tracking-wider text-primary">Live Feed</h2>
            {isLive ? (
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                <Wifi className="h-2.5 w-2.5 text-success" />
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-warning" />
                <WifiOff className="h-2.5 w-2.5 text-warning" />
              </span>
            )}
            <span className="text-[9px] text-muted-foreground">{filtered.length} articles</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant={viewMode === 'bookmarks' ? 'default' : 'ghost'}
              size="sm" className="h-5 w-5 p-0"
              onClick={() => setViewMode(viewMode === 'bookmarks' ? 'feed' : 'bookmarks')}
              title={`Bookmarks (${bookmarkedIds.size})`}
            >
              <BookmarkCheck className="h-3 w-3" />
            </Button>
            <Button
              variant={viewMode === 'reading-list' ? 'default' : 'ghost'}
              size="sm" className="h-5 w-5 p-0"
              onClick={() => setViewMode(viewMode === 'reading-list' ? 'feed' : 'reading-list')}
              title={`Reading List (${readingListIds.size})`}
            >
              <ListChecks className="h-3 w-3" />
            </Button>
            <Button variant={showSettings ? 'default' : 'ghost'} size="sm" className="h-5 w-5 p-0"
              onClick={() => setShowSettings(prev => !prev)} title="Settings">
              <Settings className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-5 w-5 p-0"
              onClick={() => setShowShortcuts(prev => !prev)} title="Keyboard shortcuts (?)">
              <Keyboard className="h-3 w-3 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={handleRefresh} disabled={isRefreshing} title="Refresh (r)">
              <RefreshCw className={cn('h-3 w-3 text-muted-foreground', isRefreshing && 'animate-spin')} />
            </Button>
          </div>
        </div>

        {/* View mode label */}
        {viewMode !== 'feed' && (
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
              {viewMode === 'bookmarks' ? '⭐ Saved Bookmarks' : '📖 Reading List'}
            </span>
            <button className="text-[9px] text-muted-foreground hover:text-foreground" onClick={() => setViewMode('feed')}>
              ← Back to feed
            </button>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input
            ref={searchRef}
            placeholder="Search titles & snippets... ( / )"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            onKeyDown={(e) => { if (e.key === 'Enter') commitSearch(search); if (e.key === 'Escape') { setSearch(''); (e.target as HTMLElement).blur(); } }}
            className="h-7 pl-7 pr-7 text-[11px] bg-muted border-border"
          />
          {search && (
            <button className="absolute right-2 top-1/2 -translate-y-1/2" onMouseDown={(e) => { e.preventDefault(); setSearch(''); }}>
              <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
            </button>
          )}
          {showSuggestions && (suggestions.length > 0 || (!search && searchHistory.length > 0)) && (
            <div className="absolute z-50 top-full left-0 right-0 mt-0.5 bg-popover border border-border rounded shadow-lg max-h-40 overflow-y-auto">
              {!search && searchHistory.length > 0 && (
                <>
                  <div className="flex items-center justify-between px-2 py-1 border-b border-border">
                    <span className="text-[9px] uppercase text-muted-foreground font-bold flex items-center gap-1">
                      <History className="h-2.5 w-2.5" /> Recent
                    </span>
                    <button className="text-[9px] text-muted-foreground hover:text-foreground" onMouseDown={(e) => { e.preventDefault(); handleClearHistory(); }}>Clear</button>
                  </div>
                  {searchHistory.map(h => (
                    <button key={h} className="w-full text-left px-2 py-1 text-[11px] text-foreground hover:bg-muted transition-colors flex items-center gap-1.5"
                      onMouseDown={(e) => { e.preventDefault(); commitSearch(h); }}>
                      <History className="h-2.5 w-2.5 text-muted-foreground shrink-0" />{h}
                    </button>
                  ))}
                </>
              )}
              {search && suggestions.map(s => (
                <button key={s} className="w-full text-left px-2 py-1 text-[11px] text-foreground hover:bg-muted transition-colors"
                  onMouseDown={(e) => { e.preventDefault(); commitSearch(s); }}>
                  <HighlightedText text={s} query={search} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search history chips */}
        {searchHistory.length > 0 && !search && (
          <div className="flex gap-1 flex-wrap">
            {searchHistory.slice(0, 5).map(h => (
              <button key={h} className="px-1.5 py-0.5 rounded text-[9px] border border-border bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                onClick={() => commitSearch(h)}>{h}</button>
            ))}
          </div>
        )}

        {/* Time + Date filters */}
        <div className="flex gap-1 items-center flex-wrap">
          {timeFilters.map(t => (
            <Button key={t} variant={!hasDateFilter && activeTime === t ? 'default' : 'ghost'} size="sm"
              className="h-5 px-1.5 text-[9px] uppercase" onClick={() => { setActiveTime(t); setDateRange({}); }}>{t}</Button>
          ))}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant={hasDateFilter ? 'default' : 'ghost'} size="sm" className="h-5 px-1.5 text-[9px] gap-0.5">
                <CalendarIcon className="h-2.5 w-2.5" />
                {hasDateFilter
                  ? dateRange.from && dateRange.to ? `${format(dateRange.from, 'MMM d')} – ${format(dateRange.to, 'MMM d')}` : dateRange.from ? format(dateRange.from, 'MMM d') : ''
                  : 'Date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-2 space-y-2">
                <Calendar mode="range" selected={dateRange.from ? { from: dateRange.from, to: dateRange.to } : undefined}
                  onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                  className="p-3 pointer-events-auto" disabled={(date) => date > new Date()} />
                {hasDateFilter && (
                  <Button variant="ghost" size="sm" className="w-full h-6 text-[10px]" onClick={() => setDateRange({})}>Clear date filter</Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Category filters */}
        <div className="flex gap-1 flex-wrap">
          {CATEGORIES.map((cat, i) => (
            <Button key={cat} variant={activeCategory === cat ? 'default' : 'ghost'} size="sm"
              className={cn('h-5 px-1.5 text-[9px] uppercase', activeCategory !== cat && categoryStyles[cat])}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}>
              <span className="text-[8px] text-muted-foreground mr-0.5">{i+1}</span>{cat}
            </Button>
          ))}
        </div>

        {/* Trending keywords */}
        {viewMode === 'feed' && trending.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-2.5 w-2.5 text-primary" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-primary">Trending Now</span>
            </div>
            <div ref={trendingRef} className="flex gap-1 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {trending.map(keyword => (
                <button key={keyword}
                  className={cn('px-1.5 py-0.5 rounded text-[9px] border transition-colors whitespace-nowrap shrink-0',
                    search.toLowerCase() === keyword
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:text-foreground'
                  )}
                  onClick={() => commitSearch(search.toLowerCase() === keyword ? '' : keyword)}>{keyword}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Settings panel */}
      <FeedSettingsPanel
        settings={settings}
        onUpdateSettings={updateSettings}
        mutedKeywords={mutedKeywords}
        onAddMuted={addMutedKeyword}
        onRemoveMuted={removeMutedKeyword}
        onExport={exportSettings}
        onImport={importSettings}
        articles={filtered}
        isOpen={showSettings}
        onToggle={() => setShowSettings(false)}
      />

      {/* Keyboard shortcuts help */}
      {showShortcuts && (
        <div className="border-b border-border bg-card/50 p-3 text-[10px] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Keyboard Shortcuts</span>
            <button onClick={() => setShowShortcuts(false)}><X className="h-3 w-3 text-muted-foreground" /></button>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-muted-foreground">
            <span><kbd className="px-1 rounded bg-muted text-foreground">/</kbd> Search</span>
            <span><kbd className="px-1 rounded bg-muted text-foreground">j</kbd>/<kbd className="px-1 rounded bg-muted text-foreground">k</kbd> Navigate</span>
            <span><kbd className="px-1 rounded bg-muted text-foreground">Enter</kbd> Open article</span>
            <span><kbd className="px-1 rounded bg-muted text-foreground">b</kbd> Bookmark</span>
            <span><kbd className="px-1 rounded bg-muted text-foreground">l</kbd> Reading list</span>
            <span><kbd className="px-1 rounded bg-muted text-foreground">r</kbd> Refresh</span>
            <span><kbd className="px-1 rounded bg-muted text-foreground">1-4</kbd> Categories</span>
            <span><kbd className="px-1 rounded bg-muted text-foreground">0</kbd> Clear category</span>
            <span><kbd className="px-1 rounded bg-muted text-foreground">?</kbd> This help</span>
            <span><kbd className="px-1 rounded bg-muted text-foreground">Esc</kbd> Deselect</span>
          </div>
        </div>
      )}

      <div ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-2">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-2 rounded border border-border space-y-1.5">
              <Skeleton className="h-3 w-3/4" /><Skeleton className="h-2 w-full" /><Skeleton className="h-2 w-1/2" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="text-center text-muted-foreground text-xs py-8">
            {viewMode === 'bookmarks' ? 'No bookmarked articles yet' : viewMode === 'reading-list' ? 'Reading list is empty' : 'No news found for the selected filters'}
          </div>
        ) : (
          filtered.map((item, index) => (
            <ArticleCard
              key={item.id}
              item={item}
              search={search}
              isBookmarked={isBookmarked(item.id)}
              isInReadingList={isInReadingList(item.id)}
              isRead={isRead(item.id)}
              isFocused={index === focusedIndex}
              cardStyle={settings.cardStyle}
              onToggleBookmark={toggleBookmark}
              onToggleReadingList={toggleReadingList}
              onCategoryClick={handleCategoryClick}
              onArticleOpen={handleArticleOpen}
              activeCategory={activeCategory}
            />
          ))
        )}
      </div>
    </div>
  );
}
