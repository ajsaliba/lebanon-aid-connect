import { useState, useCallback } from 'react';
import { Brain, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNewsFeedContext } from '@/contexts/NewsFeedContext';
import { sanitizeFeedText } from '@/lib/sanitizeFeedText';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/lib/i18n';

export function WorldBriefPanel() {
  const { t } = useTranslation();
  const { news } = useNewsFeedContext();
  const [brief, setBrief] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generateBrief = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setBrief('');

    try {
      // Get top 20 headlines for context
      const headlines = news.slice(0, 20).map(n =>
        `[${n.severity.toUpperCase()}] [${n.category}] ${sanitizeFeedText(n.title)} (${n.source})`
      ).join('\n');

      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/world-brief`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ headlines }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || `Request failed (${resp.status})`);
      }

      // Stream SSE
      const reader = resp.body?.getReader();
      if (!reader) throw new Error('No stream available');

      const decoder = new TextDecoder();
      let buffer = '';
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIdx);
          buffer = buffer.slice(newlineIdx + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              setBrief(fullText);
            }
          } catch { /* partial JSON */ }
        }
      }

      if (!fullText) setBrief(t('brief.noGenerated'));
    } catch (err: any) {
      setError(err.message || t('brief.generateFailed'));
    } finally {
      setIsLoading(false);
    }
  }, [news]);

  return (
    <div className="border border-border rounded-md bg-card">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Brain className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-sans font-bold uppercase tracking-wider text-primary">{t('brief.title')}</span>
        </div>
        {expanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full h-7 text-[11px] gap-1.5"
            onClick={generateBrief}
            disabled={isLoading || news.length === 0}
          >
            <RefreshCw className={cn('h-3 w-3', isLoading && 'animate-spin')} />
            {isLoading ? t('brief.analyzing') : brief ? t('brief.regenerate') : t('brief.generate')}
          </Button>

          {error && <p className="text-[10px] text-danger">{error}</p>}

          {brief && (
            <div className="text-[11px] text-foreground leading-relaxed whitespace-pre-wrap bg-muted/30 rounded p-2 max-h-[300px] overflow-y-auto">
              {brief}
            </div>
          )}

          {!brief && !isLoading && !error && (
            <p className="text-[10px] text-muted-foreground text-center">
              {t('brief.description')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
