import { mockShelters } from '@/data/mockData';
import { MapPin, Users, Phone, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export function ShelterPanel() {
  return (
    <div className="space-y-2 p-3">
      <h2 className="text-xs font-sans font-bold uppercase tracking-wider text-success flex items-center gap-2">
        <MapPin className="h-3 w-3" /> Shelters
      </h2>
      {mockShelters.map((shelter) => {
        const occupancyPct = Math.round((shelter.currentOccupancy / shelter.capacity) * 100);
        return (
          <div key={shelter.id} className="p-2 rounded border border-border bg-card/50 text-[11px] space-y-1.5">
            <div className="flex items-start justify-between">
              <span className="font-sans font-semibold text-foreground text-xs">{shelter.name}</span>
              <Badge
                variant="outline"
                className={cn(
                  'text-[9px] h-4',
                  shelter.status === 'open' ? 'border-success/50 text-success' : 'border-danger/50 text-danger'
                )}
              >
                {shelter.status === 'open' ? <CheckCircle className="h-2 w-2 mr-0.5" /> : <XCircle className="h-2 w-2 mr-0.5" />}
                {shelter.status}
              </Badge>
            </div>
            <div className="text-muted-foreground">{shelter.address}</div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Users className="h-2.5 w-2.5" />
                {shelter.currentOccupancy}/{shelter.capacity}
              </span>
              <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    occupancyPct > 90 ? 'bg-danger' : occupancyPct > 70 ? 'bg-warning' : 'bg-success'
                  )}
                  style={{ width: `${occupancyPct}%` }}
                />
              </div>
              <span className="text-muted-foreground">{occupancyPct}%</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Phone className="h-2.5 w-2.5" /> {shelter.contact}
            </div>
            <div className="flex gap-1 flex-wrap">
              {shelter.amenities.map(a => (
                <span key={a} className="px-1 py-0.5 rounded bg-success/10 text-success text-[9px]">{a}</span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
