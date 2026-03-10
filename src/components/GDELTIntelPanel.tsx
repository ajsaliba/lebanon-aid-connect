import { useState, useMemo } from 'react';
import { useNewsFeedContext } from '@/contexts/NewsFeedContext';
import { type NewsItem } from '@/data/mockData';
import { Radio, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { sanitizeFeedText } from '@/lib/sanitizeFeedText';
import { useTranslation, t as translate } from '@/lib/i18n';

type IntelCategory = 'military' | 'cyber' | 'nuclear' | 'sanctions' | 'intelligence' | 'maritime';

interface IntelCategoryConfig {
  labelKey: string;
  icon: string;
  keywords: string[];
  color: string;
}

const INTEL_CATEGORIES: Record<IntelCategory, IntelCategoryConfig> = {
  military: {
    labelKey: 'intel.military',
    icon: '⚔️',
    keywords: ['military', 'airstrike', 'strike', 'bombing', 'troops', 'deploy', 'fighter', 'missile', 'artillery', 'offensive', 'idf', 'armed forces', 'soldiers', 'battalion', 'operation', 'raid', 'war', 'combat'],
    color: 'text-danger',
  },
  cyber: {
    labelKey: 'intel.cyber',
    icon: '🔓',
    keywords: ['cyber', 'hack', 'ransomware', 'malware', 'data breach', 'phishing', 'ddos', 'cybersecurity', 'zero-day', 'vulnerability', 'exploit'],
    color: 'text-[hsl(var(--primary))]',
  },
  nuclear: {
    labelKey: 'intel.nuclear',
    icon: '☢️',
    keywords: ['nuclear', 'uranium', 'enrichment', 'iaea', 'warhead', 'atomic', 'centrifuge', 'plutonium', 'nonproliferation', 'reactor'],
    color: 'text-danger',
  },
  sanctions: {
    labelKey: 'intel.sanctions',
    icon: '🚫',
    keywords: ['sanction', 'embargo', 'tariff', 'trade war', 'export controls', 'blacklist', 'treasury department', 'ofac', 'asset freeze'],
    color: 'text-warning',
  },
  intelligence: {
    labelKey: 'intel.intelligence',
    icon: '🕵️',
    keywords: ['intelligence', 'espionage', 'spy', 'cia', 'mossad', 'mi6', 'covert', 'surveillance', 'reconnaissance', 'osint', 'sigint', 'classified'],
    color: 'text-muted-foreground',
  },
  maritime: {
    labelKey: 'intel.maritime',
    icon: '🚢',
    keywords: ['naval', 'navy', 'carrier', 'destroyer', 'submarine', 'strait', 'maritime', 'piracy', 'shipping lane', 'blockade', 'port', 'vessel', 'fleet'],
    color: 'text-info',
  },
};

function categorizeArticle(article: NewsItem): IntelCategory | null {
  const text = `${article.title} ${article.summary}`.toLowerCase();
  for (const [cat, cfg] of Object.entries(INTEL_CATEGORIES)) {
    if (cfg.keywords.some(kw => text.includes(kw))) {
      return cat as IntelCategory;
    }
  }
  return null;
}

export function GDELTIntelPanel() {
  const { t } = useTranslation();
  const { news } = useNewsFeedContext();
  const [activeCategory, setActiveCategory] = useState<IntelCategory>('military');

  const categorized = useMemo(() => {
    const result: Record<IntelCategory, NewsItem[]> = {
      military: [], cyber: [], nuclear: [], sanctions: [], intelligence: [], maritime: [],
    };
    for (const article of news) {
      const cat = categorizeArticle(article);
      if (cat) result[cat].push(article);
    }
    return result;
  }, [news]);

  const totalCount = useMemo(() =>
    Object.values(categorized).reduce((sum, arr) => sum + arr.length, 0)
  , [categorized]);

  const activeArticles = categorized[activeCategory].slice(0, 10);
  const activeCfg = INTEL_CATEGORIES[activeCategory];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <Radio className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-sans font-bold uppercase tracking-wider text-primary">{t('intel.title')}</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-[9px] text-muted-foreground cursor-help ml-auto">?</span>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-[220px] text-[10px] space-y-1">
            <p className="font-bold">{t('intel.gdeltTitle')}</p>
            <p>{t('intel.gdeltDesc')}</p>
            <p>• {t('intel.gdeltTopics')}</p>
            <p>• {t('intel.gdeltLanguages')}</p>
            <p>• {t('intel.gdeltUpdates')}</p>
          </TooltipContent>
        </Tooltip>
        <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 rounded">{totalCount}</span>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-1 px-1">
        {(Object.entries(INTEL_CATEGORIES) as [IntelCategory, IntelCategoryConfig][]).map(([id, cfg]) => (
          <button
            key={id}
            onClick={() => setActiveCategory(id)}
            className={cn(
              'text-[9px] px-1.5 py-0.5 rounded font-bold transition-colors',
              activeCategory === id
                ? `${cfg.color} bg-muted`
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
          >
            {cfg.icon}{t(cfg.labelKey)}
          </button>
        ))}
      </div>

      {/* Articles */}
      <div className="space-y-0.5 px-1">
        {activeArticles.length === 0 && (
          <p className="text-[10px] text-muted-foreground italic py-2">{t('intel.noArticles')}</p>
        )}
        {activeArticles.map(article => (
          <a
            key={article.id}
            href={article.url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="block px-1.5 py-1 rounded hover:bg-muted/50 text-[10px] group"
          >
            <div className="flex items-start gap-1.5">
              <span className={cn('shrink-0 mt-0.5', activeCfg.color)}>●</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-2">
                  {sanitizeFeedText(article.title)}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5 text-[9px] text-muted-foreground">
                  <span>{article.source}</span>
                  <span>•</span>
                  <span>{timeAgo(article.publishedAt)}</span>
                  {article.severity === 'high' && (
                    <>
                      <span>•</span>
                      <span className="text-danger font-bold">{t('alert.label')}</span>
                    </>
                  )}
                </div>
              </div>
              <ExternalLink className="h-2.5 w-2.5 text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0 mt-1" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return translate('time.justNow');
  if (hours < 24) return `${hours}${translate('time.hAgo')}`;
  return `${Math.floor(hours / 24)}${translate('time.dAgo')}`;
}
