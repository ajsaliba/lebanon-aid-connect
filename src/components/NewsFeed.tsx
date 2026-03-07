import { useState } from 'react';
import { mockNews } from '@/data/mockData';
import { ExternalLink, Clock, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

const timeFilters = ['1h', '6h', '24h', '48h', '7d'] as const;

export function NewsFeed() {
  const [search, setSearch] = useState('');
  const [activeTime, setActiveTime] = useState<string>('24h');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = mockNews.filter(n => {
    if (search && !n.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeCategory && n.category !== activeCategory) return false;
    return true;
  });

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
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-sans font-bold uppercase tracking-wider text-primary">Live Feed</h2>
          <span className="h-1.5 w-1.5 rounded-full bg-danger animate-pulse-danger" />
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
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {filtered.map((news) => (
          <article
            key={news.id}
            className={cn(
              'p-2 rounded border text-[11px] cursor-pointer hover:bg-muted/50 transition-colors',
              severityStyles[news.severity]
            )}
          >
            <div className="flex items-start justify-between gap-1">
              <h3 className="font-sans font-semibold text-foreground text-xs leading-tight">{news.title}</h3>
              <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mt-1 leading-relaxed">{news.summary}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={cn('uppercase font-bold text-[9px]', categoryStyles[news.category])}>
                {news.category}
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">{news.source}</span>
              <span className="text-muted-foreground">•</span>
              <span className="flex items-center gap-0.5 text-muted-foreground">
                <Clock className="h-2.5 w-2.5" />
                {timeAgo(news.publishedAt)}
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
