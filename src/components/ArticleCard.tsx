import { useState } from 'react';
import { type NewsItem } from '@/data/mockData';
import { Bookmark, BookmarkCheck, ListPlus, ListChecks, Share2, Copy, Clock, ExternalLink, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { sanitizeFeedText } from '@/lib/sanitizeFeedText';
import { estimateReadTime, shareArticle } from '@/hooks/useArticleActions';
import { useToast } from '@/hooks/use-toast';

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

const TRANSLATE_LANGS = [
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
  { code: 'fr', label: 'Français' },
];

interface ArticleCardProps {
  item: NewsItem;
  search: string;
  isBookmarked: boolean;
  isInReadingList: boolean;
  onToggleBookmark: (id: string) => void;
  onToggleReadingList: (id: string) => void;
  onCategoryClick: (cat: string) => void;
  activeCategory: string | null;
}

export function ArticleCard({
  item, search, isBookmarked, isInReadingList,
  onToggleBookmark, onToggleReadingList, onCategoryClick, activeCategory,
}: ArticleCardProps) {
  const { toast } = useToast();
  const [translatedTitle, setTranslatedTitle] = useState<string | null>(null);
  const [translatedSummary, setTranslatedSummary] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [currentLang, setCurrentLang] = useState<string | null>(null);

  const cleanTitle = translatedTitle || sanitizeFeedText(item.title);
  const cleanSummary = translatedSummary || sanitizeFeedText(item.summary);
  const readTime = estimateReadTime(`${cleanTitle} ${cleanSummary}`);

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const handleTranslate = async (targetLang: string) => {
    if (currentLang === targetLang) {
      // Reset to original
      setTranslatedTitle(null);
      setTranslatedSummary(null);
      setCurrentLang(null);
      return;
    }

    setIsTranslating(true);
    try {
      const originalTitle = sanitizeFeedText(item.title);
      const originalSummary = sanitizeFeedText(item.summary);

      // Use MyMemory free translation API
      const translateText = async (text: string, target: string) => {
        if (!text) return '';
        const res = await fetch(
          `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 500))}&langpair=auto|${target}`
        );
        const data = await res.json();
        return data.responseData?.translatedText || text;
      };

      const [tTitle, tSummary] = await Promise.all([
        translateText(originalTitle, targetLang),
        originalSummary ? translateText(originalSummary, targetLang) : Promise.resolve(''),
      ]);

      setTranslatedTitle(tTitle);
      setTranslatedSummary(tSummary || null);
      setCurrentLang(targetLang);
    } catch {
      toast({ title: 'Translation failed', variant: 'destructive' });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleShare = (platform: 'copy' | 'twitter' | 'whatsapp' | 'telegram') => {
    shareArticle(item, platform);
    if (platform === 'copy') {
      toast({ title: 'Link copied to clipboard' });
    }
  };

  return (
    <article
      className={cn(
        'p-2 rounded border border-l-[3px] text-[11px] cursor-pointer hover:bg-muted/50 transition-colors group',
        severityStyles[item.severity],
        categoryBorderStyles[item.category]
      )}
      onClick={() => item.url && item.url !== '#' && window.open(item.url, '_blank')}
    >
      <div className="flex items-start justify-between gap-1">
        <h3 className="font-sans font-semibold text-foreground text-xs leading-tight flex-1">
          <HighlightedText text={cleanTitle} query={search} />
        </h3>
        <div className="flex items-center gap-0.5 shrink-0">
          {/* Bookmark */}
          <button
            className="p-0.5 rounded hover:bg-muted"
            onClick={(e) => { e.stopPropagation(); onToggleBookmark(item.id); }}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
          >
            {isBookmarked
              ? <BookmarkCheck className="h-3 w-3 text-primary" />
              : <Bookmark className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            }
          </button>
          {/* Reading list */}
          <button
            className="p-0.5 rounded hover:bg-muted"
            onClick={(e) => { e.stopPropagation(); onToggleReadingList(item.id); }}
            title={isInReadingList ? 'Remove from reading list' : 'Read later'}
          >
            {isInReadingList
              ? <ListChecks className="h-3 w-3 text-success" />
              : <ListPlus className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            }
          </button>
          {/* Share */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="p-0.5 rounded hover:bg-muted"
                onClick={(e) => e.stopPropagation()}
                title="Share"
              >
                <Share2 className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-36 p-1" align="end" onClick={(e) => e.stopPropagation()}>
              <button className="w-full flex items-center gap-2 px-2 py-1 text-[10px] rounded hover:bg-muted" onClick={() => handleShare('copy')}>
                <Copy className="h-3 w-3" /> Copy link
              </button>
              <button className="w-full flex items-center gap-2 px-2 py-1 text-[10px] rounded hover:bg-muted" onClick={() => handleShare('twitter')}>
                𝕏 Twitter / X
              </button>
              <button className="w-full flex items-center gap-2 px-2 py-1 text-[10px] rounded hover:bg-muted" onClick={() => handleShare('whatsapp')}>
                📱 WhatsApp
              </button>
              <button className="w-full flex items-center gap-2 px-2 py-1 text-[10px] rounded hover:bg-muted" onClick={() => handleShare('telegram')}>
                ✈️ Telegram
              </button>
            </PopoverContent>
          </Popover>
          {/* Translate */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                className={cn('p-0.5 rounded hover:bg-muted', isTranslating && 'animate-pulse')}
                onClick={(e) => e.stopPropagation()}
                title="Translate"
              >
                <Languages className={cn('h-3 w-3', currentLang ? 'text-primary' : 'text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity')} />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-28 p-1" align="end" onClick={(e) => e.stopPropagation()}>
              {TRANSLATE_LANGS.map(lang => (
                <button
                  key={lang.code}
                  className={cn(
                    'w-full text-left px-2 py-1 text-[10px] rounded hover:bg-muted',
                    currentLang === lang.code && 'bg-primary/10 text-primary font-bold'
                  )}
                  onClick={() => handleTranslate(lang.code)}
                  disabled={isTranslating}
                >
                  {lang.label}
                </button>
              ))}
              {currentLang && (
                <button
                  className="w-full text-left px-2 py-1 text-[10px] rounded hover:bg-muted text-muted-foreground"
                  onClick={() => { setTranslatedTitle(null); setTranslatedSummary(null); setCurrentLang(null); }}
                >
                  ↩ Original
                </button>
              )}
            </PopoverContent>
          </Popover>
          <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
        </div>
      </div>

      {/* Show snippet with highlighting when searching */}
      {search && cleanSummary && cleanSummary.toLowerCase().includes(search.toLowerCase()) && (
        <p className="text-muted-foreground text-[10px] mt-0.5 line-clamp-2">
          <HighlightedText text={cleanSummary.slice(0, 150)} query={search} />
        </p>
      )}

      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
        <span
          className={cn('uppercase font-bold text-[9px] cursor-pointer hover:underline', categoryStyles[item.category])}
          onClick={(e) => { e.stopPropagation(); onCategoryClick(item.category); }}
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
        <span className="text-muted-foreground">•</span>
        <span className="text-muted-foreground">{readTime} min read</span>
        {currentLang && (
          <>
            <span className="text-muted-foreground">•</span>
            <span className="text-primary text-[9px] font-bold">{TRANSLATE_LANGS.find(l => l.code === currentLang)?.label}</span>
          </>
        )}
      </div>
    </article>
  );
}
