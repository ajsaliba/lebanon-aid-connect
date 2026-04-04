import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNewsFeedContext } from '@/contexts/NewsFeedContext';
import { type NewsItem } from '@/data/mockData';
import { Radio, ExternalLink, RefreshCw, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { sanitizeFeedText } from '@/lib/sanitizeFeedText';
import { useTranslation, t as translate } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';

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

// ── GDELT presets (Feature 4) ──
const GDELT_PRESETS = [
  { label: 'Lebanon', query: 'Lebanon' },
  { label: 'Beirut', query: 'Beirut' },
  { label: 'Hezbollah', query: 'Hezbollah' },
  { label: 'UNIFIL', query: 'UNIFIL' },
  { label: 'IDF', query: 'IDF' },
] as const;

const GDELT_TIMESPANS = [
  { label: '1h', value: '1h' },
  { label: '6h', value: '6h' },
  { label: '24h', value: '24h' },
  { label: '7d', value: '7d' },
] as const;

interface GDELTArticle {
  title: string;
  url: string;
  source: string;
  seendate: string;
  socialimage: string | null;
  language: string;
  domain: string;
}

async function fetchGDELT(query: string, timespan: string): Promise<GDELTArticle[]> {
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
  const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

  const res = await fetch(`${SUPABASE_URL}/functions/v1/gdelt-fetch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
    body: JSON.stringify({ query, timespan }),
  });

  if (!res.ok) throw new Error('GDELT fetch failed');
  const data = await res.json() as GDELTArticle[];
  return data;
}

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
  const [gdeltQuery, setGdeltQuery] = useState('Lebanon');
  const [gdeltTimespan, setGdeltTimespan] = useState('24h');
  const [showGDELT, setShowGDELT] = useState(false);

  // GDELT query (Feature 4)
  const { data: gdeltArticles, isLoading: gdeltLoading, refetch: refetchGDELT, error: gdeltError } = useQuery({
    queryKey: ['gdelt', gdeltQuery, gdeltTimespan],
    queryFn: () => fetchGDELT(gdeltQuery, gdeltTimespan),
    enabled: showGDELT,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

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

      {/* ── GDELT Filter Bar (Feature 4) ── */}
      <div className="px-1 space-y-1.5">
        <div className="flex items-center gap-1">
          <Filter className="h-3 w-3 text-muted-foreground shrink-0" />
          <div className="flex flex-wrap gap-1">
            {GDELT_PRESETS.map(preset => (
              <button
                key={preset.label}
                onClick={() => { setGdeltQuery(preset.query); setShowGDELT(true); }}
                className={cn(
                  'px-1.5 py-0.5 rounded text-[9px] font-mono border transition-colors',
                  gdeltQuery === preset.query && showGDELT
                    ? 'bg-purple-500/20 text-purple-400 border-purple-500/40'
                    : 'border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="ml-auto flex gap-1">
            {GDELT_TIMESPANS.map(ts => (
              <button
                key={ts.value}
                onClick={() => setGdeltTimespan(ts.value)}
                className={cn(
                  'px-1 py-0.5 text-[9px] rounded font-mono transition-colors',
                  gdeltTimespan === ts.value ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {ts.label}
              </button>
            ))}
          </div>
        </div>

        {/* GDELT results panel */}
        {showGDELT && (
          <div className="border border-purple-500/20 rounded bg-purple-500/5 p-1.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-purple-400 uppercase tracking-wider">
                GDELT · {gdeltQuery} · {gdeltTimespan}
              </span>
              <div className="flex items-center gap-1">
                {gdeltLoading && <RefreshCw className="h-2.5 w-2.5 text-purple-400 animate-spin" />}
                <button
                  onClick={() => refetchGDELT()}
                  className="text-[9px] text-purple-400 hover:text-purple-300"
                >
                  ↻
                </button>
                <button
                  onClick={() => setShowGDELT(false)}
                  className="text-[9px] text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>
            </div>

            {gdeltError && (
              <p className="text-red-400 text-[9px] font-mono">Failed to load GDELT data</p>
            )}

            {gdeltArticles && gdeltArticles.length === 0 && !gdeltLoading && (
              <p className="text-[9px] text-muted-foreground italic">No results</p>
            )}

            {gdeltArticles?.slice(0, 8).map((art, i) => (
              <a
                key={i}
                href={art.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-1 py-0.5 rounded hover:bg-purple-500/10 text-[9px] group"
              >
                <p className="text-foreground leading-tight group-hover:text-purple-400 transition-colors line-clamp-2">
                  {art.title}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5 text-[8px] text-muted-foreground">
                  <span>{art.source}</span>
                  <span>·</span>
                  <span className="px-1 py-0 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30 font-mono">
                    GDELT
                  </span>
                  <span>·</span>
                  <span>{art.language?.toUpperCase()}</span>
                </div>
              </a>
            ))}
          </div>
        )}
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
