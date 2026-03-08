/**
 * 3-Stage Threat Classification Pipeline (World Monitor pattern):
 * Stage 1: Instant keyword classifier (client-side, 0 latency)
 * Stage 2: Async AI classification (edge function, batched)
 * 
 * Keyword results are returned immediately; AI results override when available.
 */

import { useState, useEffect, useRef } from 'react';
import { type NewsItem } from '@/data/mockData';
import { classifyByKeywords } from '@/lib/keywordClassifier';

export interface ThreatClassification {
  index: number;
  primary_category: 'military' | 'humanitarian' | 'political' | 'economic' | 'cyber' | 'nuclear' | 'terrorism';
  confidence: number;
  threat_level: 'critical' | 'high' | 'medium' | 'low' | 'info';
  tags: string[];
  stage?: 'keyword' | 'ai'; // track which stage produced this
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
  const aiProcessedRef = useRef<Set<string>>(new Set());
  const backoffRef = useRef(30000);
  const lastCallRef = useRef(0);
  const rateLimitedUntilRef = useRef(0);

  // Stage 1: Instant keyword classification for all new articles
  useEffect(() => {
    const newItems = news.filter(n => !processedRef.current.has(n.id));
    if (newItems.length === 0) return;

    const keywordResults: ClassificationCache = {};
    for (const article of newItems) {
      processedRef.current.add(article.id);
      const result = classifyByKeywords(article.title, article.summary);
      if (result) {
        keywordResults[article.id] = { ...result, stage: 'keyword' };
      }
    }

    if (Object.keys(keywordResults).length > 0) {
      setClassifications(prev => ({ ...prev, ...keywordResults }));
    }
  }, [news]);

  // Stage 2: Async AI classification (batched, with rate limiting)
  useEffect(() => {
    const now = Date.now();
    if (now < rateLimitedUntilRef.current) return;

    // Only send articles that haven't been AI-classified yet
    const needsAI = news.filter(n => !aiProcessedRef.current.has(n.id)).slice(0, 5);
    if (needsAI.length === 0) return;

    const timeSinceLast = now - lastCallRef.current;
    const delay = Math.max(backoffRef.current, 30000 - timeSinceLast);

    const classify = async () => {
      setIsClassifying(true);
      lastCallRef.current = Date.now();
      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/classify-threat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
          },
          body: JSON.stringify({
            articles: needsAI.map(a => ({ id: a.id, title: a.title, summary: a.summary })),
          }),
        });

        if (res.status === 429) {
          console.warn('Classification rate limited, backing off 5min');
          backoffRef.current = Math.min(backoffRef.current * 3, 300000);
          rateLimitedUntilRef.current = Date.now() + backoffRef.current;
          needsAI.forEach(a => aiProcessedRef.current.add(a.id));
          return;
        }

        if (!res.ok) {
          console.warn('Classification failed:', res.status);
          needsAI.forEach(a => aiProcessedRef.current.add(a.id));
          return;
        }

        backoffRef.current = 30000;

        const data = await res.json();
        if (data.classifications) {
          const aiResults: ClassificationCache = {};
          for (const c of data.classifications) {
            const article = needsAI[c.index];
            if (article) {
              aiResults[article.id] = { ...c, stage: 'ai' };
              aiProcessedRef.current.add(article.id);
            }
          }
          // AI results override keyword results (higher confidence)
          setClassifications(prev => ({ ...prev, ...aiResults }));
        }
      } catch (err) {
        console.warn('Classification error:', err);
        needsAI.forEach(a => aiProcessedRef.current.add(a.id));
      } finally {
        setIsClassifying(false);
      }
    };

    const timer = setTimeout(classify, delay);
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
