import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useNewsFeedContext } from '@/contexts/NewsFeedContext';
import { format } from 'date-fns';
import { ExternalLink, Clock, Search, Wifi, WifiOff, RefreshCw, TrendingUp, X, CalendarIcon, History } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { sanitizeFeedText } from '@/lib/sanitizeFeedText';

const severityStyles = {
  high: 'bg-danger/15 text-danger border-danger/30',
  elevated: 'bg-warning/15 text-warning border-warning/30',
  monitoring: 'bg-info/15 text-info border-info/30',
};

const categoryStyles = {
  conflict: 'text-danger',
  humanitarian: 'text-success',
  political: 'text-warning',
  infrastructure: 'text-info',
};

const categoryBorderStyles = {
  conflict: 'border-l-danger',
  humanitarian: 'border-l-success',
  political: 'border-l-warning',
  infrastructure: 'border-l-info',
};

const timeFilters = ['1h', '6h', '24h', '48h', '7d', 'All'] as const;

function getTimeFilterMs(filter: string): number {
  const map: Record<string, number> = {
    '1h': 3600000,
    '6h': 21600000,
    '24h': 86400000,
    '48h': 172800000,
    '7d': 604800000,
    'All': Infinity,
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

// Extract trending from last hour's articles only
function extractTrendingKeywords(news: Array<{ title: string; publishedAt: string }>, max = 15): string[] {
  const oneHourAgo = Date.now() - 3600000;
  const recentNews = news.filter(n => new Date(n.publishedAt).getTime() > oneHourAgo);
  // Fall back to all news if nothing in last hour
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
      if (w.startsWith(lower) && w !== lower) {
        freq[w] = (freq[w] || 0) + 1;
      }
    }
  }
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([word]) => word);
}

// Search history helpers
const SEARCH_HISTORY_KEY = 'cedarsalert_search_history';
const MAX_HISTORY = 8;

function getSearchHistory(): string[] {
  try {
    return JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]');
  } catch { return []; }
}

function addToSearchHistory(term: string) {
  if (!term || term.length < 2) return;
  const history = getSearchHistory().filter(h => h !== term);
  history.unshift(term);
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
}

function clearSearchHistory() {
  localStorage.removeItem(SEARCH_HISTORY_KEY);
}

// Highlight matching text
function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query || query.length < 2) return <>{text}</>;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase()
          ? <mark key={i} className="bg-primary/30 text-foreground rounded-sm px-0.5">{part}</mark>
          : part
      )}
    </>
  );
}

export function NewsFeed() {
  const { news, isLoading, isLive, refetch } = useNewsFeedContext();
  const [search, setSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeTime, setActiveTime] = useState<string>('All');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [searchHistory, setSearchHistory] = useState<string[]>(getSearchHistory());
  const trendingRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => getSearchSuggestions(news, search), [news, search]);
  const trending = useMemo(() => extractTrendingKeywords(news), [news]);

  const commitSearch = useCallback((term: string) => {
    setSearch(term);
    setShowSuggestions(false);
    if (term.length >= 2) {
      addToSearchHistory(term);
      setSearchHistory(getSearchHistory());
    }
  }, []);

  const handleClearHistory = () => {
    clearSearchHistory();
    setSearchHistory([]);
  };

  const filtered = useMemo(() => {
    return news.filter(n => {
      // Full-text search across title and summary
      if (search) {
        const q = search.toLowerCase();
        const title = sanitizeFeedText(n.title).toLowerCase();
        const summary = sanitizeFeedText(n.summary).toLowerCase();
        if (!title.includes(q) && !summary.includes(q)) return false;
      }
      if (activeCategory && n.category !== activeCategory) return false;

      // Date range filter
      if (dateRange.from || dateRange.to) {
        const pubDate = new Date(n.publishedAt);
        if (dateRange.from) {
          const start = new Date(dateRange.from);
          start.setHours(0, 0, 0, 0);
          if (pubDate < start) return false;
        }
        if (dateRange.to) {
          const end = new Date(dateRange.to);
          end.setHours(23, 59, 59, 999);
          if (pubDate > end) return false;
        }
      } else {
        // Only apply time filter when no date range is set
        const age = Date.now() - new Date(n.publishedAt).getTime();
        if (age > getTimeFilterMs(activeTime)) return false;
      }
      return true;
    });
  }, [news, search, activeCategory, activeTime, dateRange]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    refetch();
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const hasDateFilter = dateRange.from || dateRange.to;

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
          <Button
            variant="ghost" size="sm" className="h-6 w-6 p-0"
            onClick={handleRefresh} disabled={isRefreshing} title="Refresh feeds"
          >
            <RefreshCw className={cn('h-3 w-3 text-muted-foreground', isRefreshing && 'animate-spin')} />
          </Button>
        </div>

        {/* Search with suggestions + history */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input
            placeholder="Search titles & snippets..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            onKeyDown={(e) => { if (e.key === 'Enter') commitSearch(search); }}
            className="h-7 pl-7 pr-7 text-[11px] bg-muted border-border"
          />
          {search && (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onMouseDown={(e) => { e.preventDefault(); setSearch(''); }}
            >
              <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
            </button>
          )}
          {showSuggestions && (suggestions.length > 0 || (!search && searchHistory.length > 0)) && (
            <div className="absolute z-50 top-full left-0 right-0 mt-0.5 bg-popover border border-border rounded shadow-lg max-h-40 overflow-y-auto">
              {/* Show history when input is empty */}
              {!search && searchHistory.length > 0 && (
                <>
                  <div className="flex items-center justify-between px-2 py-1 border-b border-border">
                    <span className="text-[9px] uppercase text-muted-foreground font-bold flex items-center gap-1">
                      <History className="h-2.5 w-2.5" /> Recent
                    </span>
                    <button
                      className="text-[9px] text-muted-foreground hover:text-foreground"
                      onMouseDown={(e) => { e.preventDefault(); handleClearHistory(); }}
                    >
                      Clear
                    </button>
                  </div>
                  {searchHistory.map(h => (
                    <button
                      key={h}
                      className="w-full text-left px-2 py-1 text-[11px] text-foreground hover:bg-muted transition-colors flex items-center gap-1.5"
                      onMouseDown={(e) => { e.preventDefault(); commitSearch(h); }}
                    >
                      <History className="h-2.5 w-2.5 text-muted-foreground shrink-0" />
                      {h}
                    </button>
                  ))}
                </>
              )}
              {/* Show suggestions when typing */}
              {search && suggestions.map(s => (
                <button
                  key={s}
                  className="w-full text-left px-2 py-1 text-[11px] text-foreground hover:bg-muted transition-colors"
                  onMouseDown={(e) => { e.preventDefault(); commitSearch(s); }}
                >
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
              <button
                key={h}
                className="px-1.5 py-0.5 rounded text-[9px] border border-border bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                onClick={() => commitSearch(h)}
              >
                {h}
              </button>
            ))}
          </div>
        )}

        {/* Time + Date filters */}
        <div className="flex gap-1 items-center">
          {timeFilters.map(t => (
            <Button
              key={t}
              variant={!hasDateFilter && activeTime === t ? 'default' : 'ghost'}
              size="sm"
              className="h-5 px-1.5 text-[9px] uppercase"
              onClick={() => { setActiveTime(t); setDateRange({}); }}
            >
              {t}
            </Button>
          ))}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={hasDateFilter ? 'default' : 'ghost'}
                size="sm"
                className="h-5 px-1.5 text-[9px] gap-0.5"
              >
                <CalendarIcon className="h-2.5 w-2.5" />
                {hasDateFilter
                  ? dateRange.from && dateRange.to
                    ? `${format(dateRange.from, 'MMM d')} – ${format(dateRange.to, 'MMM d')}`
                    : dateRange.from
                      ? format(dateRange.from, 'MMM d')
                      : ''
                  : 'Date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-2 space-y-2">
                <Calendar
                  mode="range"
                  selected={dateRange.from ? { from: dateRange.from, to: dateRange.to } : undefined}
                  onSelect={(range) => {
                    setDateRange({ from: range?.from, to: range?.to });
                  }}
                  className="p-3 pointer-events-auto"
                  disabled={(date) => date > new Date()}
                />
                {hasDateFilter && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full h-6 text-[10px]"
                    onClick={() => setDateRange({})}
                  >
                    Clear date filter
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Category filters */}
        <div className="flex gap-1 flex-wrap">
          {(['conflict', 'humanitarian', 'political', 'infrastructure'] as const).map(cat => (
            <Button
              key={cat}
              variant={activeCategory === cat ? 'default' : 'ghost'}
              size="sm"
              className={cn(
                'h-5 px-1.5 text-[9px] uppercase',
                activeCategory !== cat && categoryStyles[cat]
              )}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Trending keywords bar — horizontal scroller */}
        {trending.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-2.5 w-2.5 text-primary" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-primary">Trending Now</span>
            </div>
            <div
              ref={trendingRef}
              className="flex gap-1 overflow-x-auto scrollbar-hide pb-0.5"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {trending.map(keyword => (
                <button
                  key={keyword}
                  className={cn(
                    'px-1.5 py-0.5 rounded text-[9px] border transition-colors whitespace-nowrap shrink-0',
                    search.toLowerCase() === keyword
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:text-foreground'
                  )}
                  onClick={() => commitSearch(search.toLowerCase() === keyword ? '' : keyword)}
                >
                  {keyword}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-2 rounded border border-border space-y-1.5">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-2 w-1/2" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="text-center text-muted-foreground text-xs py-8">
            No news found for the selected filters
          </div>
        ) : (
          filtered.map((item) => (
            <article
              key={item.id}
              className={cn(
                'p-2 rounded border border-l-[3px] text-[11px] cursor-pointer hover:bg-muted/50 transition-colors',
                severityStyles[item.severity],
                categoryBorderStyles[item.category]
              )}
              onClick={() => item.url && item.url !== '#' && window.open(item.url, '_blank')}
            >
              <div className="flex items-start justify-between gap-1">
                <h3 className="font-sans font-semibold text-foreground text-xs leading-tight">
                  <HighlightedText text={sanitizeFeedText(item.title)} query={search} />
                </h3>
                <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
              </div>

              {/* Show snippet with highlighting when searching */}
              {search && item.summary && sanitizeFeedText(item.summary).toLowerCase().includes(search.toLowerCase()) && (
                <p className="text-muted-foreground text-[10px] mt-0.5 line-clamp-2">
                  <HighlightedText text={sanitizeFeedText(item.summary).slice(0, 150)} query={search} />
                </p>
              )}
              
              <div className="flex items-center gap-2 mt-1.5">
                <span
                  className={cn('uppercase font-bold text-[9px] cursor-pointer hover:underline', categoryStyles[item.category])}
                  onClick={(e) => { e.stopPropagation(); setActiveCategory(activeCategory === item.category ? null : item.category); }}
                >
                  {item.category}
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{item.source}</span>
                <span className="text-muted-foreground">•</span>
                <span className="flex items-center gap-0.5 text-muted-foreground">
                  <Clock className="h-2.5 w-2.5" />
                  {timeAgo(item.publishedAt)}
                </span>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
