import { useMarketQuotes, usePolicyRates, useTradeRestrictions } from '@/services/financialService';
import { FeedHealthBadge } from '@/components/FeedHealthBadge';
import { DollarSign, TrendingUp, TrendingDown, Minus, Globe, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

const directionIcons: Record<string, React.ReactNode> = {
  hiking: <TrendingUp className="h-2.5 w-2.5 text-danger" />,
  cutting: <TrendingDown className="h-2.5 w-2.5 text-success" />,
  holding: <Minus className="h-2.5 w-2.5 text-muted-foreground" />,
};

export function EconomicToolsPanel() {
  const { t } = useTranslation();
  const { data: quotes = [], isLoading: quotesLoading } = useMarketQuotes();
  const { data: rates = [], isLoading: ratesLoading } = usePolicyRates();
  const { data: restrictions = [], isLoading: restrictionsLoading } = useTradeRestrictions();

  const isLoading = quotesLoading && ratesLoading && restrictionsLoading;

  if (isLoading) return <div className="border border-border rounded-lg p-4 text-center text-[9px] text-muted-foreground">Loading...</div>;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-2 border-b border-border bg-card">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
          <DollarSign className="h-3 w-3" /> {t('economic.survivalTools')}
          <FeedHealthBadge feedName="market_quotes" />
        </h3>
        <p className="text-[8px] text-muted-foreground mt-0.5">{t('economic.subtitle')}</p>
      </div>

      {/* Market Quotes */}
      {quotes.length > 0 && (
        <div className="p-2 space-y-1">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> Market Quotes
            <FeedHealthBadge feedName="market_quotes" />
          </h4>
          <div className="grid grid-cols-2 gap-1">
            {quotes.map(q => (
              <div key={q.symbol} className="border border-border rounded p-1.5 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold">{q.symbol}</span>
                  <span className="text-[9px] font-medium">${q.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={cn('text-[8px] font-medium', q.change >= 0 ? 'text-success' : 'text-danger')}>
                    {q.change >= 0 ? '+' : ''}{q.change.toFixed(2)}
                  </span>
                  <span className={cn('text-[8px] font-medium', q.changePct >= 0 ? 'text-success' : 'text-danger')}>
                    {q.changePct >= 0 ? '+' : ''}{q.changePct.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Policy Rates */}
      {rates.length > 0 && (
        <div className="p-2 space-y-1">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Globe className="h-3 w-3" /> Policy Rates
            <FeedHealthBadge feedName="policy_rates" />
          </h4>
          <div className="border border-border rounded overflow-hidden">
            <table className="w-full text-[9px]">
              <thead>
                <tr className="bg-muted/30">
                  <th className="text-left p-1 font-medium text-muted-foreground">Country</th>
                  <th className="text-right p-1 font-medium text-muted-foreground">Rate</th>
                  <th className="text-center p-1 font-medium text-muted-foreground">Dir</th>
                </tr>
              </thead>
              <tbody>
                {rates.map(r => (
                  <tr key={r.country} className="border-t border-border">
                    <td className="p-1">{r.country}</td>
                    <td className="p-1 text-right font-medium">{r.currentRate.toFixed(2)}%</td>
                    <td className="p-1 text-center">{directionIcons[r.direction] ?? r.direction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Trade Restrictions */}
      {restrictions.length > 0 && (
        <div className="p-2 space-y-1">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Shield className="h-3 w-3" /> Trade Restrictions
            <FeedHealthBadge feedName="trade_restrictions" />
          </h4>
          <div className="space-y-1">
            {restrictions.map(r => (
              <div key={r.id} className="border border-border rounded p-1.5 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold">{r.imposingCountry} → {r.targetCountry}</span>
                  <span className="text-[8px] px-1 py-0 bg-danger/20 text-danger rounded font-bold uppercase">{r.restrictionType}</span>
                </div>
                <p className="text-[8px] text-muted-foreground">{r.description}</p>
                <div className="flex items-center justify-between text-[8px] text-muted-foreground">
                  <span>{r.sector}</span>
                  <span>{r.effectiveDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
