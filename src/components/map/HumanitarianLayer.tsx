import { useEffect, useState } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { getDirectionsUrl } from '@/hooks/useGeolocation';
import { type Shelter, type HousingListing } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface SosSignal {
  id: string;
  lat: number;
  lng: number;
  message: string | null;
  needs: string[] | null;
  people_count: number;
  contact_phone: string | null;
  status: string;
  created_at: string;
}

const sosIcon = new L.DivIcon({
  html: `<div style="background:#ef4444;width:18px;height:18px;border-radius:50%;border:2px solid #0a0a0a;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;color:#fff;box-shadow:0 0 12px #ef4444cc;animation:pulse 1.5s infinite;">!</div>`,
  className: '',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const shelterIcon = new L.DivIcon({
  html: `<div style="background:#16a34a;width:12px;height:12px;border-radius:50%;border:2px solid #0a0a0a;box-shadow:0 0 8px #16a34a80;"></div>`,
  className: '',
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

const housingIcon = new L.DivIcon({
  html: `<div style="background:#0ea5e9;width:10px;height:10px;border-radius:50%;border:2px solid #0a0a0a;box-shadow:0 0 8px #0ea5e980;"></div>`,
  className: '',
  iconSize: [10, 10],
  iconAnchor: [5, 5],
});

interface HumanitarianLayerProps {
  showSos: boolean;
  showShelters: boolean;
  showHousing: boolean;
}

export function HumanitarianLayer({ showSos, showShelters, showHousing }: HumanitarianLayerProps) {
  const [sosSignals, setSosSignals] = useState<SosSignal[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [housing, setHousing] = useState<HousingListing[]>([]);

  useEffect(() => {
    // Initial fetch
    supabase.from('sos_signals').select('*').eq('status', 'active').then(({ data }) => {
      if (data) setSosSignals(data);
    });
    supabase.from('shelters').select('*').then(({ data }) => {
      if (data) setShelters(data.map(s => ({
        id: s.id, name: s.name, lat: s.lat, lng: s.lng,
        capacity: s.capacity, currentOccupancy: s.current_occupancy,
        address: s.address, contact: s.contact,
        status: s.status as 'open' | 'full' | 'closed',
        amenities: s.amenities || [],
      })));
    });
    supabase.from('housing_listings').select('*').then(({ data }) => {
      if (data) setHousing(data.map(h => ({
        id: h.id, title: h.title, lat: h.lat, lng: h.lng,
        price: h.price, currency: h.currency, bedrooms: h.bedrooms,
        address: h.address, contact: h.contact,
        available: h.available, description: h.description || '',
        isFree: h.is_free, urgency: h.urgency,
      })));
    });

    // Realtime subscription
    const channel = supabase.channel('map-humanitarian')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sos_signals' }, () => {
        supabase.from('sos_signals').select('*').eq('status', 'active').then(({ data }) => {
          if (data) setSosSignals(data);
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shelters' }, () => {
        supabase.from('shelters').select('*').then(({ data }) => {
          if (data) setShelters(data.map(s => ({
            id: s.id, name: s.name, lat: s.lat, lng: s.lng,
            capacity: s.capacity, currentOccupancy: s.current_occupancy,
            address: s.address, contact: s.contact,
            status: s.status as 'open' | 'full' | 'closed',
            amenities: s.amenities || [],
          })));
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'housing_listings' }, () => {
        supabase.from('housing_listings').select('*').then(({ data }) => {
          if (data) setHousing(data.map(h => ({
            id: h.id, title: h.title, lat: h.lat, lng: h.lng,
            price: h.price, currency: h.currency, bedrooms: h.bedrooms,
            address: h.address, contact: h.contact,
            available: h.available, description: h.description || '',
            isFree: h.is_free, urgency: h.urgency,
          })));
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <>
      {showSos && sosSignals.map(sos => (
        <Marker key={sos.id} position={[sos.lat, sos.lng]} icon={sosIcon}>
          <Popup>
            <div className="text-xs space-y-1.5 min-w-[180px]">
              <div className="font-bold text-destructive text-sm">🆘 SOS Signal</div>
              <div className="text-muted-foreground">
                {formatDistanceToNow(new Date(sos.created_at), { addSuffix: true })}
              </div>
              <div>👥 {sos.people_count} {sos.people_count === 1 ? 'person' : 'people'}</div>
              {sos.needs && sos.needs.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {sos.needs.map(n => (
                    <span key={n} className="bg-destructive/20 text-destructive px-1.5 py-0.5 rounded text-[10px] font-bold">{n}</span>
                  ))}
                </div>
              )}
              {sos.message && <div className="text-foreground italic">"{sos.message}"</div>}
              <div className="flex gap-2 pt-1">
                {sos.contact_phone && (
                  <a href={`tel:${sos.contact_phone}`} className="text-primary underline font-bold">📞 Call</a>
                )}
                <a href={getDirectionsUrl(sos.lat, sos.lng)} target="_blank" rel="noopener noreferrer" className="text-primary underline font-bold">🧭 Navigate</a>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}

      {showShelters && shelters.map(shelter => {
        const occupancyPct = shelter.capacity > 0 ? Math.round((shelter.currentOccupancy / shelter.capacity) * 100) : 0;
        return (
          <Marker key={shelter.id} position={[shelter.lat, shelter.lng]} icon={shelterIcon}>
            <Popup>
              <div className="text-xs space-y-1.5 min-w-[180px]">
                <div className="font-bold text-foreground text-sm">🏠 {shelter.name}</div>
                <div className="text-muted-foreground">{shelter.address}</div>
                <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                  shelter.status === 'open' ? 'bg-green-500/20 text-green-400' : shelter.status === 'full' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {shelter.status}
                </span>
                <div>
                  <div className="flex justify-between text-[10px] mb-0.5">
                    <span>Occupancy</span>
                    <span>{shelter.currentOccupancy}/{shelter.capacity}</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{
                      width: `${occupancyPct}%`,
                      background: occupancyPct > 90 ? '#ef4444' : occupancyPct > 70 ? '#f59e0b' : '#16a34a',
                    }} />
                  </div>
                </div>
                {shelter.amenities && shelter.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {shelter.amenities.map(a => (
                      <span key={a} className="bg-muted px-1 py-0.5 rounded text-[9px]">{a}</span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2 pt-1">
                  <a href={`tel:${shelter.contact}`} className="text-primary underline font-bold">📞 Call</a>
                  <a href={getDirectionsUrl(shelter.lat, shelter.lng)} target="_blank" rel="noopener noreferrer" className="text-primary underline font-bold">🧭 Directions</a>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {showHousing && housing.filter(h => h.available).map(house => (
        <Marker key={house.id} position={[house.lat, house.lng]} icon={housingIcon}>
          <Popup>
            <div className="text-xs space-y-1.5 min-w-[180px]">
              <div className="font-bold text-foreground text-sm">🏘️ {house.title}</div>
              <div className="text-muted-foreground">{house.address}</div>
              <div className="flex items-center gap-2">
                {(house as any).isFree ? (
                  <span className="bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded text-[10px] font-bold">FREE</span>
                ) : (
                  <span className="font-bold">{house.currency} {house.price}/mo</span>
                )}
                <span>• {house.bedrooms}BR</span>
                {(house as any).urgency === 'urgent' && (
                  <span className="bg-destructive/20 text-destructive px-1.5 py-0.5 rounded text-[10px] font-bold">URGENT</span>
                )}
              </div>
              <div className="flex gap-2 pt-1">
                <a href={`https://wa.me/${house.contact.replace(/\D/g, '')}?text=Hi, I'm interested in the housing listing: ${house.title}`} target="_blank" rel="noopener noreferrer" className="text-primary underline font-bold">💬 WhatsApp</a>
                <a href={getDirectionsUrl(house.lat, house.lng)} target="_blank" rel="noopener noreferrer" className="text-primary underline font-bold">🧭 Directions</a>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}
