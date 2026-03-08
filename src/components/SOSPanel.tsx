import { useState } from 'react';
import { mockEmergencyContacts } from '@/data/mockData';
import { useGeolocation, getDirectionsUrl } from '@/hooks/useGeolocation';
import { Phone, Building2, Heart, Stethoscope, Shield, MapPin, Share2, Loader2, Navigation, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const catIcons = { emergency: Shield, embassy: Building2, ngo: Heart, medical: Stethoscope };
const catColors = { emergency: 'text-danger', embassy: 'text-info', ngo: 'text-success', medical: 'text-warning' };
const catFilters = ['all', 'emergency', 'medical', 'ngo', 'embassy'] as const;

export function SOSPanel() {
  const { position, loading: geoLoading, refresh: refreshGeo } = useGeolocation();
  const { toast } = useToast();
  const [filter, setFilter] = useState<string>('all');
  const [sharing, setSharing] = useState(false);

  const filtered = filter === 'all' ? mockEmergencyContacts : mockEmergencyContacts.filter(c => c.category === filter);

  const shareLocation = async () => {
    if (!position) {
      refreshGeo();
      toast({ title: 'Getting your location...', description: 'Please allow location access.' });
      return;
    }
    setSharing(true);
    const text = `🆘 EMERGENCY — I need help!\n📍 My location: https://www.google.com/maps?q=${position.lat},${position.lng}\n⏰ ${new Date().toLocaleString()}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'SOS – Emergency', text });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(text);
      toast({ title: 'Location copied!', description: 'Paste it in WhatsApp or SMS to share.' });
    }
    setSharing(false);
  };

  const callNumber = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  return (
    <div className="space-y-3 p-3">
      {/* SOS Button */}
      <div className="flex flex-col items-center gap-2 py-3">
        <button
          onClick={() => callNumber('140')}
          className="relative w-20 h-20 rounded-full bg-danger text-danger-foreground flex items-center justify-center shadow-lg shadow-danger/30 hover:scale-105 active:scale-95 transition-transform animate-pulse"
          aria-label="Call Lebanese Red Cross Emergency"
        >
          <Phone className="h-8 w-8" />
          <span className="absolute -bottom-1 text-[8px] font-bold uppercase tracking-widest text-danger">SOS</span>
        </button>
        <span className="text-[10px] text-muted-foreground text-center">Tap to call Lebanese Red Cross (140)</span>
      </div>

      {/* Share Location */}
      <Button
        onClick={shareLocation}
        disabled={sharing || geoLoading}
        className="w-full h-8 text-xs gap-1.5 bg-danger/90 hover:bg-danger text-danger-foreground"
      >
        {geoLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Share2 className="h-3 w-3" />}
        Share My Location (SOS)
      </Button>

      {position && (
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground bg-muted/50 rounded p-1.5">
          <MapPin className="h-3 w-3 text-danger shrink-0" />
          <span>{position.lat.toFixed(4)}, {position.lng.toFixed(4)}</span>
          <span className="text-muted-foreground/60">±{Math.round(position.accuracy)}m</span>
        </div>
      )}

      {/* Safety Tips */}
      <div className="p-2 rounded border border-warning/30 bg-warning/5 text-[10px] space-y-1">
        <div className="flex items-center gap-1 text-warning font-bold text-xs">
          <AlertTriangle className="h-3 w-3" /> Safety Tips
        </div>
        <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
          <li>Stay away from windows during shelling</li>
          <li>Keep phone charged — carry a power bank</li>
          <li>Know your nearest shelter (see Shelters tab)</li>
          <li>Keep important documents in a waterproof bag</li>
        </ul>
      </div>

      {/* Category Filter */}
      <div className="flex gap-1 flex-wrap">
        {catFilters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-2 py-0.5 rounded text-[9px] uppercase tracking-wider transition-colors border',
              filter === f
                ? 'bg-primary/10 border-primary/50 text-primary'
                : 'border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Emergency Contacts */}
      <h2 className="text-xs font-sans font-bold uppercase tracking-wider text-danger flex items-center gap-2">
        <Phone className="h-3 w-3" /> Emergency Contacts
      </h2>
      {filtered.map((contact) => {
        const Icon = catIcons[contact.category];
        return (
          <div key={contact.id} className="p-2 rounded border border-border bg-card/50 text-[11px] space-y-1.5">
            <div className="flex items-center gap-2">
              <Icon className={`h-4 w-4 shrink-0 ${catColors[contact.category]}`} />
              <div className="flex-1 min-w-0">
                <div className="font-sans font-semibold text-foreground text-xs">{contact.name}</div>
                <div className="text-muted-foreground text-[10px]">{contact.description}</div>
              </div>
            </div>
            <div className="flex gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-6 text-[10px] gap-1 flex-1 border-danger/50 text-danger hover:bg-danger/10"
                onClick={() => callNumber(contact.phone)}
              >
                <Phone className="h-2.5 w-2.5" /> {contact.phone}
              </Button>
              {position && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[10px] gap-1 text-info"
                  onClick={() => window.open(getDirectionsUrl(33.89, 35.50), '_blank')}
                  title="Directions"
                >
                  <Navigation className="h-2.5 w-2.5" />
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
