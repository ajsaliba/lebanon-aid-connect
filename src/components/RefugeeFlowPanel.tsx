import { mockDisplacementFlows } from '@/data/extendedMockData';
import { Users, TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useTranslation } from '@/lib/i18n';

const trendConfig = {
  increasing: { icon: TrendingUp, color: 'text-danger', key: 'refugee.increasing' },
  stable: { icon: Minus, color: 'text-warning', key: 'refugee.stable' },
  decreasing: { icon: TrendingDown, color: 'text-success', key: 'refugee.decreasing' },
};

function formatPeople(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
  return n.toString();
}

export function RefugeeFlowPanel() {
  const { t } = useTranslation();
  const totalDisplaced = mockDisplacementFlows.reduce((sum, f) => sum + f.people_count, 0);

  const chartData = mockDisplacementFlows.map(f => ({
    name: `${f.from_location.slice(0, 4)}→${f.to_location.slice(0, 4)}`,
    people: f.people_count / 1000,
  }));

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="p-2 border-b border-border bg-card">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
          <Users className="h-3 w-3" /> {t('refugee.title')}
        </h3>
      </div>

      <div className="p-2 space-y-2">
        {/* Total */}
        <div className="bg-danger/10 rounded p-2 text-center">
          <div className="text-lg font-bold text-danger">{formatPeople(totalDisplaced)}</div>
          <div className="text-[9px] text-muted-foreground">{t('refugee.totalDisplacedTracked')}</div>
        </div>

        {/* Chart */}
        <div className="h-28">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 7, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  fontSize: '10px',
                  borderRadius: '4px',
                }}
                formatter={(value: number) => [`${value}K ${t('refugee.people')}`, t('refugee.displaced')]}
              />
              <Bar dataKey="people" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Flow List */}
        <div className="space-y-1">
          {mockDisplacementFlows.map(flow => {
            const trend = trendConfig[flow.trend];
            const TrendIcon = trend.icon;
            return (
              <div key={flow.id} className="flex items-center gap-1.5 text-[9px] border border-border rounded p-1.5">
                <div className="flex items-center gap-0.5 min-w-0 flex-1">
                  <span className="font-medium truncate">{flow.from_location}</span>
                  <ArrowRight className="h-2.5 w-2.5 shrink-0 text-muted-foreground" />
                  <span className="font-medium truncate">{flow.to_location}</span>
                </div>
                <span className="font-bold whitespace-nowrap">{formatPeople(flow.people_count)}</span>
                <TrendIcon className={cn('h-2.5 w-2.5 shrink-0', trend.color)} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
