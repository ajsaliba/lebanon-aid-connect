import { useState, useEffect } from 'react';
import { useGeocode } from '@/hooks/useGeocode';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MapPin, Loader2, Crosshair } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

interface LocationPickerProps {
  defaultAddress?: string;
  defaultLat?: number;
  defaultLng?: number;
  onSelect: (address: string, lat: number, lng: number) => void;
}

export function LocationPicker({ defaultAddress, defaultLat, defaultLng, onSelect }: LocationPickerProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState(defaultAddress || '');
  const [selectedAddress, setSelectedAddress] = useState(defaultAddress || '');
  const [selectedLat, setSelectedLat] = useState(defaultLat || 0);
  const [selectedLng, setSelectedLng] = useState(defaultLng || 0);
  const [showResults, setShowResults] = useState(false);
  const { results, loading, search, clear } = useGeocode();
  const { position, loading: geoLoading, refresh: refreshGeo } = useGeolocation();

  useEffect(() => {
    if (defaultAddress) setQuery(defaultAddress);
  }, [defaultAddress]);

  const handleInputChange = (val: string) => {
    setQuery(val);
    search(val);
    setShowResults(true);
  };

  const handleSelect = (result: { display_name: string; lat: number; lng: number }) => {
    // Show a shorter address (first 3 parts)
    const shortAddr = result.display_name.split(',').slice(0, 3).join(',').trim();
    setQuery(shortAddr);
    setSelectedAddress(shortAddr);
    setSelectedLat(result.lat);
    setSelectedLng(result.lng);
    onSelect(shortAddr, result.lat, result.lng);
    setShowResults(false);
    clear();
  };

  const useMyLocation = () => {
    if (position) {
      const addr = `${t('location.myLocation')} (${position.lat.toFixed(4)}, ${position.lng.toFixed(4)})`;
      setQuery(addr);
      setSelectedAddress(addr);
      setSelectedLat(position.lat);
      setSelectedLng(position.lng);
      onSelect(addr, position.lat, position.lng);
    } else {
      refreshGeo();
    }
  };

  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{t('location.label')} *</Label>
      <div className="relative">
        <MapPin className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
        <Input
          value={query}
          onChange={e => handleInputChange(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
          placeholder={t('location.placeholder')}
          className="h-8 text-xs pl-7 pr-8"
          required
        />
        {loading && <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 animate-spin text-muted-foreground" />}
      </div>

      {/* Use my location button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-6 text-[10px] gap-1 w-full border-info/50 text-info hover:bg-info/10"
        onClick={useMyLocation}
        disabled={geoLoading}
      >
        {geoLoading ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <Crosshair className="h-2.5 w-2.5" />}
        {t('location.useCurrent')}
      </Button>

      {/* Search results dropdown */}
      {showResults && results.length > 0 && (
        <div className="border border-border rounded bg-popover shadow-lg max-h-40 overflow-y-auto">
          {results.map((r, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSelect(r)}
              className="w-full text-left px-2 py-1.5 text-[10px] text-foreground hover:bg-muted/50 border-b border-border last:border-0 flex items-start gap-1.5"
            >
              <MapPin className="h-2.5 w-2.5 mt-0.5 text-primary shrink-0" />
              <span className="line-clamp-2">{r.display_name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Resolved coordinates indicator */}
      {selectedLat !== 0 && selectedLng !== 0 && (
        <div className="flex items-center gap-1 text-[9px] text-success bg-success/5 rounded px-1.5 py-0.5 border border-success/20">
          <MapPin className="h-2 w-2" />
          <span>📍 {selectedAddress}</span>
        </div>
      )}
    </div>
  );
}
