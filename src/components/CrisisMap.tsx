import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { lebanonHospitals, type Shelter, type HousingListing } from '@/data/mockData';
import { useNewsFeedContext } from '@/contexts/NewsFeedContext';
import { supabase } from '@/integrations/supabase/client';
import { Layers, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
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

const newsIcon = new L.DivIcon({
  html: `<div style="background:#f59e0b;width:8px;height:8px;border-radius:2px;border:1px solid #0a0a0a;box-shadow:0 0 6px #f59e0b80;"></div>`,
  className: '',
  iconSize: [8, 8],
  iconAnchor: [4, 4],
});

const hospitalIcon = new L.DivIcon({
  html: `<div style="background:#ffffff;width:14px;height:14px;border-radius:3px;border:2px solid #ef4444;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:bold;color:#ef4444;line-height:1;box-shadow:0 0 6px #ef444480;">+</div>`,
  className: '',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

// Client-side fallback: extract coords from title/summary for articles missing lat/lng
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  'beirut': { lat: 33.8938, lng: 35.5018 }, 'tripoli': { lat: 34.4333, lng: 35.8333 },
  'sidon': { lat: 33.5594, lng: 35.3717 }, 'tyre': { lat: 33.2721, lng: 35.2033 },
  'baalbek': { lat: 34.0047, lng: 36.2110 }, 'nabatieh': { lat: 33.3633, lng: 35.4717 },
  'dahiyeh': { lat: 33.8547, lng: 35.4900 }, 'jounieh': { lat: 33.9806, lng: 35.6178 },
  'zahle': { lat: 33.8463, lng: 35.9020 }, 'bekaa': { lat: 33.8463, lng: 35.9020 },
  'tel aviv': { lat: 32.0853, lng: 34.7818 }, 'jerusalem': { lat: 31.7683, lng: 35.2137 },
  'gaza': { lat: 31.5017, lng: 34.4668 }, 'haifa': { lat: 32.7940, lng: 34.9896 },
  'west bank': { lat: 31.9522, lng: 35.2332 }, 'rafah': { lat: 31.2969, lng: 34.2455 },
  'khan younis': { lat: 31.3462, lng: 34.3065 }, 'nablus': { lat: 32.2211, lng: 35.2544 },
  'damascus': { lat: 33.5138, lng: 36.2765 }, 'aleppo': { lat: 36.2021, lng: 37.1343 },
  'homs': { lat: 34.7324, lng: 36.7137 }, 'idlib': { lat: 35.9306, lng: 36.6339 },
  'tehran': { lat: 35.6892, lng: 51.3890 }, 'isfahan': { lat: 32.6546, lng: 51.6680 },
  'tabriz': { lat: 38.0800, lng: 46.2919 }, 'shiraz': { lat: 29.5918, lng: 52.5837 },
  'sanaa': { lat: 15.3694, lng: 44.1910 }, 'aden': { lat: 12.7855, lng: 45.0187 },
  'hodeidah': { lat: 14.7980, lng: 42.9511 },
  'baghdad': { lat: 33.3152, lng: 44.3661 }, 'basra': { lat: 30.5085, lng: 47.7804 },
  'mosul': { lat: 36.3566, lng: 43.1593 }, 'erbil': { lat: 36.1912, lng: 44.0119 },
  // Country-level fallbacks
  'lebanon': { lat: 33.8547, lng: 35.8623 }, 'israel': { lat: 31.0461, lng: 34.8516 },
  'palestine': { lat: 31.9522, lng: 35.2332 }, 'iran': { lat: 32.4279, lng: 53.6880 },
  'syria': { lat: 34.8021, lng: 38.9968 }, 'yemen': { lat: 15.5527, lng: 48.5164 },
  'iraq': { lat: 33.2232, lng: 43.6793 },
  'hezbollah': { lat: 33.8547, lng: 35.8623 }, 'hamas': { lat: 31.5017, lng: 34.4668 },
  'houthi': { lat: 15.3694, lng: 44.1910 }, 'irgc': { lat: 35.6892, lng: 51.3890 },
  'idf': { lat: 31.0461, lng: 34.8516 },
};

function inferCoords(text: string): { lat: number; lng: number } | null {
  const lower = text.toLowerCase();
  for (const [place, coords] of Object.entries(CITY_COORDS)) {
    if (lower.includes(place)) return coords;
  }
  return null;
}

interface LayerToggle {
  airstrikes: boolean;
  shelters: boolean;
  housing: boolean;
  news: boolean;
  hospitals: boolean;
}

function MapController() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 100);
  }, [map]);
  return null;
}

export function CrisisMap() {
  const { news, lastUpdated, isLive } = useNewsFeedContext();
  const [layers, setLayers] = useState<LayerToggle>({
    airstrikes: true,
    shelters: true,
    housing: true,
    news: true,
    hospitals: true,
  });
  const [showPanel, setShowPanel] = useState(true);
  const [dbShelters, setDbShelters] = useState<Shelter[]>([]);
  const [dbHousing, setDbHousing] = useState<HousingListing[]>([]);

  useEffect(() => {
    supabase.from('shelters').select('*').then(({ data }) => {
      if (data) setDbShelters(data.map(s => ({
        id: s.id, name: s.name, lat: s.lat, lng: s.lng,
        capacity: s.capacity, currentOccupancy: s.current_occupancy,
        address: s.address, contact: s.contact,
        status: s.status as 'open' | 'full' | 'closed',
        amenities: s.amenities || [],
      })));
    });
    supabase.from('housing_listings').select('*').then(({ data }) => {
      if (data) setDbHousing(data.map(h => ({
        id: h.id, title: h.title, lat: h.lat, lng: h.lng,
        price: h.price, currency: h.currency, bedrooms: h.bedrooms,
        address: h.address, contact: h.contact,
        available: h.available, description: h.description || '',
      })));
    });
  }, []);

  const toggleLayer = (key: keyof LayerToggle) => {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Enrich all news with inferred coordinates if missing
  const enrichedNews = news.map(n => {
    if (n.lat && n.lng) return n;
    const inferred = inferCoords(`${n.title} ${n.summary}`);
    if (inferred) return { ...n, lat: inferred.lat, lng: inferred.lng };
    return n;
  });

  const geoNews = enrichedNews.filter(n => n.lat && n.lng);
  const conflictEvents = geoNews.filter(n => n.category === 'conflict' || n.severity === 'high');
  const otherNews = geoNews.filter(n => n.category !== 'conflict' && n.severity !== 'high');

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[30, 45]}
        zoom={5}
        className="w-full h-full z-0"
        zoomControl={true}
      >
        <MapController />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />

        {layers.airstrikes && conflictEvents.map((event) => (
          <CircleMarker
            key={event.id}
            center={[event.lat!, event.lng!]}
            radius={event.severity === 'high' ? 12 : 8}
            pathOptions={{
              color: event.severity === 'high' ? '#ef4444' : '#f59e0b',
              fillColor: event.severity === 'high' ? '#ef4444' : '#f59e0b',
              fillOpacity: 0.4,
              weight: 2,
            }}
          >
            <Popup>
              <div className="text-xs space-y-1">
                <div className="font-bold text-foreground">{event.title}</div>
                <div className="text-muted-foreground">Source: {event.source}</div>
                <div className="text-muted-foreground">{new Date(event.publishedAt).toLocaleString()}</div>
                <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                  event.severity === 'high' ? 'bg-danger/20 text-danger' : 'bg-warning/20 text-warning'
                }`}>
                  {event.severity}
                </span>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {layers.shelters && dbShelters.map((shelter) => (
          <Marker key={shelter.id} position={[shelter.lat, shelter.lng]} icon={shelterIcon}>
            <Popup>
              <div className="text-xs space-y-1">
                <div className="font-bold text-foreground">{shelter.name}</div>
                <div className="text-muted-foreground">{shelter.address}</div>
                <div>Capacity: {shelter.currentOccupancy}/{shelter.capacity}</div>
                <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                  shelter.status === 'open' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'
                }`}>
                  {shelter.status}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}

        {layers.housing && dbHousing.map((house) => (
          <Marker key={house.id} position={[house.lat, house.lng]} icon={housingIcon}>
            <Popup>
              <div className="text-xs space-y-1">
                <div className="font-bold text-foreground">{house.title}</div>
                <div className="text-muted-foreground">{house.address}</div>
                <div>${house.price}/month • {house.bedrooms}BR</div>
                <div className="text-muted-foreground">{house.contact}</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {layers.news && otherNews.map((item) => (
          <Marker key={item.id} position={[item.lat!, item.lng!]} icon={newsIcon}>
            <Popup>
              <div className="text-xs space-y-1">
                <div className="font-bold text-foreground">{item.title}</div>
                <div className="text-muted-foreground">{item.source}</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {layers.hospitals && lebanonHospitals.map((hospital) => (
          <Marker key={hospital.id} position={[hospital.lat, hospital.lng]} icon={hospitalIcon}>
            <Popup>
              <div className="text-xs space-y-1">
                <div className="font-bold text-foreground">{hospital.name}</div>
                <div className="text-muted-foreground">{hospital.city}</div>
                <div className="text-muted-foreground">{hospital.phone}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Live indicator */}
      {isLive && (
        <div className="absolute bottom-3 right-3 z-[1000] bg-card/90 border border-border backdrop-blur-sm rounded-md px-2 py-1 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-danger animate-pulse" />
          <span className="text-[10px] font-bold text-danger uppercase">Live</span>
          {lastUpdated && (
            <span className="text-[9px] text-muted-foreground ml-1">
              {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      )}

      {/* Layer Control Panel */}
      <div className="absolute top-3 left-3 z-[1000]">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 bg-card/90 border border-border backdrop-blur-sm"
          onClick={() => setShowPanel(!showPanel)}
        >
          <Layers className="h-4 w-4" />
        </Button>
        {showPanel && (
          <div className="mt-1 bg-card/95 border border-border backdrop-blur-sm rounded-md p-2 space-y-1 min-w-[140px]">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold px-1">Layers</span>
            {([
              { key: 'airstrikes' as const, label: 'Conflicts', color: 'text-danger' },
              { key: 'shelters' as const, label: 'Shelters', color: 'text-success' },
              { key: 'housing' as const, label: 'Housing', color: 'text-info' },
              { key: 'news' as const, label: 'News', color: 'text-warning' },
              { key: 'hospitals' as const, label: 'Hospitals', color: 'text-[#ef4444]' },
            ]).map(layer => (
              <button
                key={layer.key}
                onClick={() => toggleLayer(layer.key)}
                className="flex items-center gap-2 w-full px-1 py-0.5 rounded hover:bg-muted text-[11px]"
              >
                {layers[layer.key] ? <Eye className={`h-3 w-3 ${layer.color}`} /> : <EyeOff className="h-3 w-3 text-muted-foreground" />}
                <span className={layers[layer.key] ? layer.color : 'text-muted-foreground'}>{layer.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-card/90 border border-border backdrop-blur-sm rounded-md p-2 text-[10px] space-y-1">
        <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-danger" />Conflict / Airstrike</div>
        <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-success" />Shelter</div>
        <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-info" />Housing</div>
        <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-warning" />News Event</div>
        <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-white border-2 border-danger text-danger text-[8px] font-bold flex items-center justify-center leading-none">+</span>Hospital</div>
      </div>
    </div>
  );
}