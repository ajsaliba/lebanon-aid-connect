import { useState, useMemo } from 'react';
import { useNewsFeedContext } from '@/contexts/NewsFeedContext';
import { ExternalLink, Clock, Search, Wifi, WifiOff, RefreshCw, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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

const timeFilters = ['1h', '6h', '24h', '48h', '7d'] as const;

function getTimeFilterMs(filter: string): number {
  const map: Record<string, number> = {
    '1h': 3600000,
    '6h': 21600000,
    '24h': 86400000,
    '48h': 172800000,
    '7d': 604800000,
  };
  return map[filter] || 86400000;
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

function extractTrendingKeywords(news: Array<{ title: string; summary: string }>, max = 12): string[] {
  const freq: Record<string, number> = {};
  for (const item of news) {
    const text = sanitizeFeedText(item.title).toLowerCase();
    const words = text.split(/[^a-z'-]+/).filter(w => w.length > 2 && !STOP_WORDS.has(w));
    const seen = new Set<string>();
    for (const w of words) {
      if (!seen.has(w)) {
        seen.add(w);
        freq[w] = (freq[w] || 0) + 1;
      }
    }
  }
  return Object.entries(freq)
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([word]) => word);
}


export function NewsFeed() {
  const { news, isLoading, isLive, refetch } = useNewsFeedContext();
  const [search, setSearch] = useState('');
  const [activeTime, setActiveTime] = useState<string>('7d');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const trending = useMemo(() => extractTrendingKeywords(news), [news]);

  const filtered = news.filter(n => {
    if (search && !sanitizeFeedText(n.title).toLowerCase().includes(search.toLowerCase())) return false;
    if (activeCategory && n.category !== activeCategory) return false;
    const age = Date.now() - new Date(n.publishedAt).getTime();
    if (age > getTimeFilterMs(activeTime)) return false;
    return true;
  });

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
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Refresh feeds"
          >
            <RefreshCw className={cn('h-3 w-3 text-muted-foreground', isRefreshing && 'animate-spin')} />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input
            placeholder="Search news..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-7 pl-7 text-[11px] bg-muted border-border"
          />
        </div>
        <div className="flex gap-1">
          {timeFilters.map(t => (
            <Button
              key={t}
              variant={activeTime === t ? 'default' : 'ghost'}
              size="sm"
              className="h-5 px-1.5 text-[9px] uppercase"
              onClick={() => setActiveTime(t)}
            >
              {t}
            </Button>
          ))}
        </div>
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

        {trending.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-2.5 w-2.5 text-primary" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-primary">Trending</span>
            </div>
            <div className="flex gap-1 flex-wrap">
              {trending.map(keyword => (
                <button
                  key={keyword}
                  className={cn(
                    'px-1.5 py-0.5 rounded text-[9px] border transition-colors',
                    search.toLowerCase() === keyword
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:text-foreground'
                  )}
                  onClick={() => setSearch(search.toLowerCase() === keyword ? '' : keyword)}
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
              <h3 className="font-sans font-semibold text-foreground text-xs leading-tight">{sanitizeFeedText(item.title)}</h3>
                <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
              </div>
              
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
