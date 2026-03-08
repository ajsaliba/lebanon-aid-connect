import { useState, useMemo } from 'react';
import { type NewsItem } from '@/data/mockData';
import { Bookmark, BookmarkCheck, ListPlus, ListChecks, Share2, Copy, Clock, ExternalLink, Languages, BookOpen, Layers } from 'lucide-react';
import { SourceBadge } from '@/components/SourceBadge';
import { type ThreatClassification, THREAT_CATEGORY_CONFIG, THREAT_LEVEL_CONFIG } from '@/hooks/useThreatClassification';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { sanitizeFeedText } from '@/lib/sanitizeFeedText';
import { estimateReadTime, shareArticle } from '@/hooks/useArticleActions';
import { useToast } from '@/hooks/use-toast';
import { type CardStyle } from '@/hooks/useFeedSettings';
import { findGlossaryTerms } from '@/lib/glossary';
import { fleschKincaidGrade, readingLevelLabel } from '@/lib/readingLevel';

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

// Render text with glossary tooltips
function GlossaryText({ text, query }: { text: string; query: string }) {
  const terms = useMemo(() => findGlossaryTerms(text), [text]);

  if (terms.length === 0) {
    return <HighlightedText text={text} query={query} />;
  }

  const parts: Array<{ text: string; definition?: string }> = [];
  let lastIndex = 0;

  for (const t of terms) {
    if (t.index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, t.index) });
    }
    parts.push({ text: text.slice(t.index, t.index + t.term.length), definition: t.definition });
    lastIndex = t.index + t.term.length;
  }
  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex) });
  }

  return (
    <>
      {parts.map((part, i) =>
        part.definition ? (
          <Tooltip key={i}>
            <TooltipTrigger asChild>
              <span className="border-b-2 border-dashed border-primary/60 cursor-help text-primary font-medium">
                <HighlightedText text={part.text} query={query} />
              </span>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              sideOffset={8}
              className="max-w-[300px] px-3 py-2.5 text-xs leading-relaxed bg-popover border-2 border-primary/30 shadow-lg shadow-primary/10 rounded-lg z-[9999]"
            >
              <p className="font-bold text-primary text-sm mb-1">{part.text}</p>
              <p className="text-popover-foreground">{part.definition}</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <HighlightedText key={i} text={part.text} query={query} />
        )
      )}
    </>
  );
}

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
  isRead: boolean;
  isFocused: boolean;
  cardStyle: CardStyle;
  duplicateOf?: string[];
  threatClassification?: ThreatClassification;
  onToggleBookmark: (id: string) => void;
  onToggleReadingList: (id: string) => void;
  onCategoryClick: (cat: string) => void;
  onArticleOpen: (id: string) => void;
  activeCategory: string | null;
}

export function ArticleCard({
  item, search, isBookmarked, isInReadingList, isRead, isFocused, cardStyle, duplicateOf,
  onToggleBookmark, onToggleReadingList, onCategoryClick, onArticleOpen, activeCategory,
}: ArticleCardProps) {
  const { toast } = useToast();
  const [translatedTitle, setTranslatedTitle] = useState<string | null>(null);
  const [translatedSummary, setTranslatedSummary] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [currentLang, setCurrentLang] = useState<string | null>(null);

  const cleanTitle = translatedTitle || sanitizeFeedText(item.title);
  const cleanSummary = translatedSummary || sanitizeFeedText(item.summary);
  const readTime = estimateReadTime(`${cleanTitle} ${cleanSummary}`);

  // Reading level
  const readingLevel = useMemo(() => {
    const grade = fleschKincaidGrade(`${cleanTitle}. ${cleanSummary}`);
    return { grade, ...readingLevelLabel(grade) };
  }, [cleanTitle, cleanSummary]);

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const handleClick = () => {
    onArticleOpen(item.id);
    if (item.url && item.url !== '#') window.open(item.url, '_blank');
  };

  const handleTranslate = async (targetLang: string) => {
    if (currentLang === targetLang) {
      setTranslatedTitle(null);
      setTranslatedSummary(null);
      setCurrentLang(null);
      return;
    }
    setIsTranslating(true);
    try {
      const originalTitle = sanitizeFeedText(item.title);
      const originalSummary = sanitizeFeedText(item.summary);
      const translateText = async (text: string, target: string) => {
        if (!text) return '';
        const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/translate`;
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text: text.slice(0, 500), targetLang: target }),
        });
        const data = await res.json();
        return data.translatedText || text;
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
    if (platform === 'copy') toast({ title: 'Link copied to clipboard' });
  };

  const ActionButtons = () => (
    <div className="flex items-center gap-0.5 shrink-0">
      <button className="p-0.5 rounded hover:bg-muted" onClick={(e) => { e.stopPropagation(); onToggleBookmark(item.id); }}
        title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}>
        {isBookmarked
          ? <BookmarkCheck className="h-3 w-3 text-primary" />
          : <Bookmark className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />}
      </button>
      <button className="p-0.5 rounded hover:bg-muted" onClick={(e) => { e.stopPropagation(); onToggleReadingList(item.id); }}
        title={isInReadingList ? 'Remove from reading list' : 'Read later'}>
        {isInReadingList
          ? <ListChecks className="h-3 w-3 text-success" />
          : <ListPlus className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />}
      </button>
      <Popover>
        <PopoverTrigger asChild>
          <button className="p-0.5 rounded hover:bg-muted" onClick={(e) => e.stopPropagation()} title="Share">
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
      <Popover>
        <PopoverTrigger asChild>
          <button className={cn('p-0.5 rounded hover:bg-muted', isTranslating && 'animate-pulse')}
            onClick={(e) => e.stopPropagation()} title="Translate">
            <Languages className={cn('h-3 w-3', currentLang ? 'text-primary' : 'text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity')} />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-28 p-1" align="end" onClick={(e) => e.stopPropagation()}>
          {TRANSLATE_LANGS.map(lang => (
            <button key={lang.code}
              className={cn('w-full text-left px-2 py-1 text-[10px] rounded hover:bg-muted',
                currentLang === lang.code && 'bg-primary/10 text-primary font-bold')}
              onClick={() => handleTranslate(lang.code)} disabled={isTranslating}>
              {lang.label}
            </button>
          ))}
          {currentLang && (
            <button className="w-full text-left px-2 py-1 text-[10px] rounded hover:bg-muted text-muted-foreground"
              onClick={() => { setTranslatedTitle(null); setTranslatedSummary(null); setCurrentLang(null); }}>
              ↩ Original
            </button>
          )}
        </PopoverContent>
      </Popover>
      <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
    </div>
  );

  const MetaInfo = () => (
    <div className="flex items-center gap-2 flex-wrap">
      <span className={cn('uppercase font-bold text-[10px] cursor-pointer hover:underline', categoryStyles[item.category])}
        onClick={(e) => { e.stopPropagation(); onCategoryClick(item.category); }}>
        {item.category}
      </span>
      <span className="text-muted-foreground">•</span>
      <span className="text-muted-foreground">{item.source}</span>
      <span className="text-muted-foreground">•</span>
      <span className="flex items-center gap-0.5 text-muted-foreground">
        <Clock className="h-2.5 w-2.5" />{timeAgo(item.publishedAt)}
      </span>
      <span className="text-muted-foreground">•</span>
      <span className="text-muted-foreground">{readTime} min read</span>
      <span className="text-muted-foreground">•</span>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn('flex items-center gap-0.5 cursor-help', readingLevel.color)}>
            <BookOpen className="h-2.5 w-2.5" />{readingLevel.label}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-[10px]">
          Flesch-Kincaid Grade: {readingLevel.grade}
        </TooltipContent>
      </Tooltip>
      {duplicateOf && duplicateOf.length > 0 && (
        <>
          <span className="text-muted-foreground">•</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex items-center gap-0.5 text-warning cursor-help">
                <Layers className="h-2.5 w-2.5" />{duplicateOf.length + 1} sources
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-[10px]">
              This story is also covered by {duplicateOf.length} other source{duplicateOf.length > 1 ? 's' : ''}
            </TooltipContent>
          </Tooltip>
        </>
      )}
      {currentLang && (
        <>
          <span className="text-muted-foreground">•</span>
          <span className="text-primary text-[9px] font-bold">{TRANSLATE_LANGS.find(l => l.code === currentLang)?.label}</span>
        </>
      )}
    </div>
  );

  // Headlines-only card
  if (cardStyle === 'headlines') {
    return (
      <article
        className={cn(
          'px-2 py-1 rounded text-[11px] cursor-pointer hover:bg-muted/50 transition-colors group flex items-center gap-2',
          isFocused && 'ring-1 ring-primary',
          isRead && 'opacity-50'
        )}
        onClick={handleClick}
      >
        <span className={cn('w-1 h-1 rounded-full shrink-0', {
          'bg-danger': item.category === 'conflict',
          'bg-success': item.category === 'humanitarian',
          'bg-warning': item.category === 'political',
          'bg-info': item.category === 'infrastructure',
        })} />
        <span className="font-semibold text-foreground text-sm flex-1 truncate">
          <GlossaryText text={cleanTitle} query={search} />
        </span>
        {duplicateOf && duplicateOf.length > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-warning shrink-0"><Layers className="h-2.5 w-2.5" /></span>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-[10px]">{duplicateOf.length + 1} sources</TooltipContent>
          </Tooltip>
        )}
        <span className="text-[9px] text-muted-foreground shrink-0">{timeAgo(item.publishedAt)}</span>
        <ActionButtons />
      </article>
    );
  }

  // List card
  if (cardStyle === 'list') {
    return (
      <article
        className={cn(
          'px-2 py-1.5 rounded border text-[11px] cursor-pointer hover:bg-muted/50 transition-colors group',
          severityStyles[item.severity],
          isFocused && 'ring-1 ring-primary',
          isRead && 'opacity-50'
        )}
        onClick={handleClick}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm leading-tight truncate">
              <GlossaryText text={cleanTitle} query={search} />
            </h3>
            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
              <span className={cn('uppercase font-bold', categoryStyles[item.category])}>{item.category}</span>
              <span>{item.source}</span>
              <span>{timeAgo(item.publishedAt)}</span>
              <span>{readTime}m</span>
              <span className={readingLevel.color}>{readingLevel.label}</span>
              {duplicateOf && duplicateOf.length > 0 && (
                <span className="text-warning flex items-center gap-0.5"><Layers className="h-2 w-2" />{duplicateOf.length + 1}</span>
              )}
            </div>
          </div>
          <ActionButtons />
        </div>
      </article>
    );
  }

  // Standard card (default)
  return (
    <article
      className={cn(
        'p-2 rounded border border-l-[3px] text-[11px] cursor-pointer hover:bg-muted/50 transition-colors group',
        severityStyles[item.severity],
        categoryBorderStyles[item.category],
        isFocused && 'ring-1 ring-primary',
        isRead && 'opacity-50'
      )}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between gap-1">
      <h3 className="font-sans font-semibold text-foreground text-sm leading-tight flex-1">
          <GlossaryText text={cleanTitle} query={search} />
        </h3>
        <ActionButtons />
      </div>

      {search && cleanSummary && cleanSummary.toLowerCase().includes(search.toLowerCase()) && (
        <p className="text-muted-foreground text-[10px] mt-0.5 line-clamp-2">
          <GlossaryText text={cleanSummary.slice(0, 150)} query={search} />
        </p>
      )}

      <div className="mt-1.5">
        <MetaInfo />
      </div>
    </article>
  );
}
