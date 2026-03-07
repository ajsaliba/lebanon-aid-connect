import { mockHousing } from '@/data/mockData';
import { Home, DollarSign, Phone, BedDouble } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function HousingPanel() {
  return (
    <div className="space-y-2 p-3">
      <h2 className="text-xs font-sans font-bold uppercase tracking-wider text-info flex items-center gap-2">
        <Home className="h-3 w-3" /> Housing Available
      </h2>
      {mockHousing.map((house) => (
        <div key={house.id} className="p-2 rounded border border-border bg-card/50 text-[11px] space-y-1.5">
          <div className="flex items-start justify-between">
            <span className="font-sans font-semibold text-foreground text-xs">{house.title}</span>
            <Badge variant="outline" className="text-[9px] h-4 border-info/50 text-info">
              {house.available ? 'Available' : 'Taken'}
            </Badge>
          </div>
          <div className="text-muted-foreground">{house.address}</div>
          <p className="text-muted-foreground">{house.description}</p>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-info">
              <DollarSign className="h-2.5 w-2.5" />
              {house.price}/mo
            </span>
            <span className="flex items-center gap-1">
              <BedDouble className="h-2.5 w-2.5" />
              {house.bedrooms} BR
            </span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Phone className="h-2.5 w-2.5" /> {house.contact}
          </div>
        </div>
      ))}
    </div>
  );
}
