import { useState, useEffect } from 'react';
import { Radio, Shield, AlertTriangle, MapPin, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AuthDialog } from '@/components/AuthDialog';
import { cn } from '@/lib/utils';

interface TopBarProps {
  onToggleSidebar: () => void;
  activeRegion: string;
  onRegionChange: (region: string) => void;
}

const regions = [
  { id: 'lebanon', label: 'Lebanon', icon: MapPin },
  { id: 'middle-east', label: 'Middle East', icon: Shield },
  { id: 'global', label: 'Global', icon: Radio },
];

export function TopBar({ onToggleSidebar, activeRegion, onRegionChange }: TopBarProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const utcTime = time.toUTCString().split(' ').slice(4).join(' ').replace(' GMT', '');
  const utcDate = time.toISOString().split('T')[0];

  return (
    <header className="h-12 border-b border-border bg-card flex items-center justify-between px-3 shrink-0">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onToggleSidebar}>
          <Menu className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-primary" />
          <h1 className="font-sans font-bold text-sm tracking-wider uppercase text-primary">
            Lebanon Crisis Monitor
          </h1>
        </div>
        <div className="hidden md:flex items-center gap-1 ml-4">
          <span className="h-2 w-2 rounded-full bg-danger animate-pulse-danger" />
          <span className="text-[10px] text-danger font-medium uppercase tracking-wider">Live</span>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-1">
        {regions.map((r) => (
          <Button
            key={r.id}
            variant={activeRegion === r.id ? 'default' : 'ghost'}
            size="sm"
            className={cn(
              'h-7 text-[11px] uppercase tracking-wider gap-1',
              activeRegion === r.id && 'bg-primary text-primary-foreground'
            )}
            onClick={() => onRegionChange(r.id)}
          >
            <r.icon className="h-3 w-3" />
            {r.label}
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="text-[11px] text-muted-foreground font-mono hidden sm:flex items-center gap-3">
          <span>{utcDate}</span>
          <span className="text-primary font-medium">{utcTime} UTC</span>
        </div>
        <AuthDialog />
      </div>
    </header>
  );
}
