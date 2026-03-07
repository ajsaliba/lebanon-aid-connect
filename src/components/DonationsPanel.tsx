import { mockDonations } from '@/data/mockData';
import { Heart, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const catColors = {
  general: 'border-primary/30',
  medical: 'border-danger/30',
  food: 'border-warning/30',
  shelter: 'border-success/30',
};

export function DonationsPanel() {
  return (
    <div className="space-y-2 p-3">
      <h2 className="text-xs font-sans font-bold uppercase tracking-wider text-primary flex items-center gap-2">
        <Heart className="h-3 w-3" /> Donate
      </h2>
      <p className="text-[10px] text-muted-foreground">
        Support verified organizations providing relief to displaced families in Lebanon.
      </p>
      {mockDonations.map((org) => (
        <div key={org.id} className={cn('p-2 rounded border bg-card/50 text-[11px] space-y-1.5', catColors[org.category])}>
          <div className="font-sans font-semibold text-foreground text-xs">{org.name}</div>
          <p className="text-muted-foreground leading-relaxed">{org.description}</p>
          <Button
            variant="outline"
            size="sm"
            className="h-6 text-[10px] gap-1 border-primary/50 text-primary hover:bg-primary/10"
            onClick={() => window.open(org.url, '_blank')}
          >
            <ExternalLink className="h-2.5 w-2.5" />
            Donate Now
          </Button>
        </div>
      ))}
    </div>
  );
}
