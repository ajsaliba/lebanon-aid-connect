import { Bot, Loader2, SearchCheck, Sparkles } from 'lucide-react';
import { useMemo } from 'react';
import { useNewsFeedContext } from '@/contexts/NewsFeedContext';
import { useMlIntel } from '@/hooks/useMlIntel';

export function MlIntelPanel() {
  const { news } = useNewsFeedContext();
  const ml = useMlIntel(news);

  const sentimentClass = useMemo(() => {
    if (ml.sentimentLabel === 'positive') return 'text-success bg-success/15';
    if (ml.sentimentLabel === 'negative') return 'text-danger bg-danger/15';
    return 'text-warning bg-warning/15';
  }, [ml.sentimentLabel]);

  return (
    <section className="border border-border rounded-md bg-card h-full min-h-0 flex flex-col">
      <header className="flex items-center justify-between px-3 py-2 border-b border-border">
        <h3 className="text-[11px] uppercase tracking-wider font-bold text-primary flex items-center gap-1.5">
          <Bot className="h-3.5 w-3.5" />
          ML Intel Worker
        </h3>
        {ml.loading ? <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" /> : <Sparkles className="h-3.5 w-3.5 text-primary" />}
      </header>

      <div className="p-2 space-y-2 overflow-auto">
        <div className="rounded border border-border p-2 bg-muted/20">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Summary</div>
          <pre className="text-[11px] whitespace-pre-wrap leading-relaxed text-foreground font-sans">{ml.summary}</pre>
        </div>

        <div className="flex items-center justify-between rounded border border-border p-2 bg-muted/20">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Sentiment</div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${sentimentClass}`}>
            {ml.sentimentLabel} ({ml.sentimentScore.toFixed(2)})
          </span>
        </div>

        <div className="rounded border border-border p-2 bg-muted/20">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-1">
            <SearchCheck className="h-3 w-3" />
            Semantic Matches
          </div>
          {ml.semanticMatches.length === 0 ? (
            <p className="text-[10px] text-muted-foreground">No semantic matches yet.</p>
          ) : (
            <div className="space-y-1">
              {ml.semanticMatches.map(match => (
                <div key={match.id} className="flex items-center justify-between text-[10px]">
                  <span className="truncate text-foreground">{match.id}</span>
                  <span className="text-muted-foreground">{(match.score * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
