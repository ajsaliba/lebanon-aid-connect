import { useState, useEffect, useRef } from 'react';
import { type NewsItem } from '@/data/mockData';

export interface ThreatClassification {
  index: number;
  primary_category: 'military' | 'humanitarian' | 'political' | 'economic' | 'cyber' | 'nuclear' | 'terrorism';
  confidence: number;
  threat_level: 'critical' | 'high' | 'medium' | 'low' | 'info';
  tags: string[];
}

interface ClassificationCache {
  [articleId: string]: ThreatClassification;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export function useThreatClassification(news: NewsItem[]) {
  const [classifications, setClassifications] = useState<ClassificationCache>({});
  const [isClassifying, setIsClassifying] = useState(false);
  const processedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Find unclassified articles
    const unclassified = news.filter(n => !processedRef.current.has(n.id)).slice(0, 20);
    if (unclassified.length === 0) return;

    const classify = async () => {
      setIsClassifying(true);
      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/classify-threat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
          },
          body: JSON.stringify({
            articles: unclassified.map(a => ({ id: a.id, title: a.title, summary: a.summary })),
          }),
        });

        if (!res.ok) {
          console.warn('Classification failed:', res.status);
          // Mark as processed to avoid retrying
          unclassified.forEach(a => processedRef.current.add(a.id));
          return;
        }

        const data = await res.json();
        if (data.classifications) {
          const newClassifications: ClassificationCache = {};
          for (const c of data.classifications) {
            const article = unclassified[c.index];
            if (article) {
              newClassifications[article.id] = c;
              processedRef.current.add(article.id);
            }
          }
          setClassifications(prev => ({ ...prev, ...newClassifications }));
        }
      } catch (err) {
        console.warn('Classification error:', err);
        unclassified.forEach(a => processedRef.current.add(a.id));
      } finally {
        setIsClassifying(false);
      }
    };

    // Debounce: wait 3s after news changes before classifying
    const timer = setTimeout(classify, 3000);
    return () => clearTimeout(timer);
  }, [news]);

  return { classifications, isClassifying };
}

export const THREAT_CATEGORY_CONFIG: Record<ThreatClassification['primary_category'], { color: string; icon: string }> = {
  military:      { color: 'text-danger',            icon: '⚔' },
  humanitarian:  { color: 'text-success',           icon: '🏥' },
  political:     { color: 'text-warning',           icon: '🏛' },
  economic:      { color: 'text-info',              icon: '📊' },
  cyber:         { color: 'text-[#a855f7]',         icon: '🔒' },
  nuclear:       { color: 'text-[#ef4444]',         icon: '☢' },
  terrorism:     { color: 'text-danger',            icon: '⚠' },
};

export const THREAT_LEVEL_CONFIG: Record<ThreatClassification['threat_level'], { color: string }> = {
  critical: { color: 'text-danger' },
  high:     { color: 'text-[#ef4444]' },
  medium:   { color: 'text-warning' },
  low:      { color: 'text-info' },
  info:     { color: 'text-muted-foreground' },
};
