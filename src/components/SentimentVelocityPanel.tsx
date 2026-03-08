/**
 * AI Sentiment & Velocity Panel — news tone analysis + fast-moving story detection.
 * Client-side heuristic for velocity; calls AI for sentiment on demand.
 */

import { useState, useMemo } from 'react';
import { useNewsFeedContext } from '@/contexts/NewsFeedContext';
import { cn } from '@/lib/utils';
import { Activity, TrendingUp, BarChart3, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { sanitizeFeedText } from '@/lib/sanitizeFeedText';
import { supabase } from '@/integrations/supabase/client';

interface VelocityStory {
  keyword: string;
  count: number;
  sources: number;
  rate: string; // e.g. "+8/hr"
}

interface SentimentResult {
  overall: 'negative' | 'neutral' | 'mixed' | 'positive';
  score: number; // -1 to 1
  breakdown: string;
}

const SENTIMENT_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  negative: { label: 'Negative', color: 'text-danger', icon: '🔴' },
  mixed: { label: 'Mixed', color: 'text-warning', icon: '🟡' },
  neutral: { label: 'Neutral', color: 'text-muted-foreground', icon: '⚪' },
  positive: { label: 'Positive', color: 'text-success', icon: '🟢' },
};

export function SentimentVelocityPanel() {
  const { news } = useNewsFeedContext();
  const [sentiment, setSentiment] = useState<SentimentResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Velocity detection — find fast-moving stories
  const velocityStories = useMemo<VelocityStory[]>(() => {
    const oneHour = 3600000;
    const recent = news.filter(n => Date.now() - new Date(n.publishedAt).getTime() < oneHour * 2);
    
    const keywordMap = new Map<string, { count: number; sources: Set<string> }>();
    const stopWords = new Set(['the','a','an','and','or','in','on','at','to','for','of','is','are','was','with','by','from','as','that','this','new','says']);

    for (const article of recent) {
      const words = sanitizeFeedText(article.title).toLowerCase().split(/\W+/).filter(w => w.length > 3 && !stopWords.has(w));
      const seen = new Set<string>();
      for (const w of words) {
        if (seen.has(w)) continue;
        seen.add(w);
        const existing = keywordMap.get(w) || { count: 0, sources: new Set() };
        existing.count++;
        existing.sources.add(article.source);
        keywordMap.set(w, existing);
      }
    }

    return [...keywordMap.entries()]
      .filter(([, v]) => v.count >= 4 && v.sources.size >= 2)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 8)
      .map(([keyword, data]) => ({
        keyword,
        count: data.count,
        sources: data.sources.size,
        rate: `+${data.count}/hr`,
      }));
  }, [news]);

  // Client-side sentiment heuristic
  const quickSentiment = useMemo(() => {
    const negWords = ['kill', 'dead', 'attack', 'bomb', 'strike', 'destroy', 'war', 'casualt', 'death', 'wound', 'explos', 'missile', 'fire', 'threat', 'danger', 'crisis', 'devastat'];
    const posWords = ['peace', 'ceasefire', 'negotiat', 'agree', 'rescue', 'humanitarian', 'aid', 'relief', 'safe', 'rebuild', 'hope', 'diploma'];
    let neg = 0, pos = 0;
    for (const n of news.slice(0, 50)) {
      const text = `${n.title} ${n.summary}`.toLowerCase();
      for (const w of negWords) if (text.includes(w)) neg++;
      for (const w of posWords) if (text.includes(w)) pos++;
    }
    const total = neg + pos || 1;
    return { neg: Math.round(neg / total * 100), pos: Math.round(pos / total * 100), neutral: Math.round(Math.max(0, 100 - neg / total * 100 - pos / total * 100)) };
  }, [news]);

  const handleAnalyzeSentiment = async () => {
    setIsAnalyzing(true);
    try {
      const headlines = news.slice(0, 30).map(n => sanitizeFeedText(n.title)).join('\n');
      const { data, error } = await supabase.functions.invoke('sentiment-velocity', {
        body: { headlines, mode: 'sentiment' },
      });
      if (error) throw error;
      if (data?.sentiment) setSentiment(data.sentiment);
    } catch (e) {
      // Fallback to client-side
      const score = (quickSentiment.pos - quickSentiment.neg) / 100;
      setSentiment({
        overall: score > 0.1 ? 'positive' : score < -0.3 ? 'negative' : 'mixed',
        score,
        breakdown: `${quickSentiment.neg}% negative, ${quickSentiment.pos}% positive tone detected`,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const sentimentCfg = sentiment ? SENTIMENT_CONFIG[sentiment.overall] : null;

  return (
    <div className="rounded-lg border border-border bg-card/50 p-3 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4 text-primary" />
        <h3 className="text-xs font-bold uppercase tracking-wider">AI Insights</h3>
      </div>

      {/* Sentiment section */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">📊 Sentiment</span>
          <Button variant="ghost" size="sm" className="h-5 text-[9px] px-2" onClick={handleAnalyzeSentiment} disabled={isAnalyzing}>
            {isAnalyzing ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Analyze'}
          </Button>
        </div>
        {sentiment ? (
          <div className="rounded bg-muted/30 p-2 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm">{sentimentCfg?.icon}</span>
              <span className={cn('text-xs font-bold', sentimentCfg?.color)}>{sentimentCfg?.label}</span>
              <span className="text-[9px] text-muted-foreground">({(sentiment.score * 100).toFixed(0)}%)</span>
            </div>
            <p className="text-[10px] text-muted-foreground">{sentiment.breakdown}</p>
          </div>
        ) : (
          <div className="flex gap-2 text-[10px]">
            <div className="flex-1 rounded bg-danger/10 p-1.5 text-center">
              <div className="font-bold text-danger">{quickSentiment.neg}%</div>
              <div className="text-[8px] text-muted-foreground">Negative</div>
            </div>
            <div className="flex-1 rounded bg-muted/30 p-1.5 text-center">
              <div className="font-bold text-muted-foreground">{quickSentiment.neutral}%</div>
              <div className="text-[8px] text-muted-foreground">Neutral</div>
            </div>
            <div className="flex-1 rounded bg-success/10 p-1.5 text-center">
              <div className="font-bold text-success">{quickSentiment.pos}%</div>
              <div className="text-[8px] text-muted-foreground">Positive</div>
            </div>
          </div>
        )}
      </div>

      {/* Velocity section */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3 text-warning" />
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">⚡ Fast-Moving Stories</span>
          <span className="text-[9px] text-warning font-bold ml-auto">{velocityStories.length}</span>
        </div>
        {velocityStories.length > 0 ? (
          <div className="space-y-1">
            {velocityStories.map(story => (
              <div key={story.keyword} className="flex items-center justify-between text-[10px] rounded bg-muted/30 px-2 py-1">
                <span className="font-medium text-foreground">{story.keyword}</span>
                <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
                  <span>{story.sources} sources</span>
                  <span className="text-warning font-bold">{story.rate}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-[10px] text-muted-foreground text-center py-2">No velocity spikes detected</div>
        )}
      </div>
    </div>
  );
}
