import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { mockAirstrikes, mockShelters, mockHousing, mockNews } from '@/data/mockData';
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

interface LayerToggle {
  airstrikes: boolean;
  shelters: boolean;
  housing: boolean;
  news: boolean;
}

function MapController() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 100);
  }, [map]);
  return null;
}

export function CrisisMap() {
  const [layers, setLayers] = useState<LayerToggle>({
    airstrikes: true,
    shelters: true,
    housing: true,
    news: true,
  });
  const [showPanel, setShowPanel] = useState(true);

  const toggleLayer = (key: keyof LayerToggle) => {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const geoNews = mockNews.filter(n => n.lat && n.lng);

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[33.8547, 35.8623]}
        zoom={8}
        className="w-full h-full z-0"
        zoomControl={true}
      >
        <MapController />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />

        {layers.airstrikes && mockAirstrikes.map((strike) => (
          <CircleMarker
            key={strike.id}
            center={[strike.lat, strike.lng]}
            radius={strike.severity === 'high' ? 12 : 8}
            pathOptions={{
              color: strike.severity === 'high' ? '#ef4444' : '#f59e0b',
              fillColor: strike.severity === 'high' ? '#ef4444' : '#f59e0b',
              fillOpacity: 0.4,
              weight: 2,
            }}
          >
            <Popup>
              <div className="text-xs space-y-1">
                <div className="font-bold text-foreground">{strike.description}</div>
                <div className="text-muted-foreground">Source: {strike.source}</div>
                <div className="text-muted-foreground">{new Date(strike.date).toLocaleString()}</div>
                <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                  strike.severity === 'high' ? 'bg-danger/20 text-danger' : 'bg-warning/20 text-warning'
                }`}>
                  {strike.severity}
                </span>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {layers.shelters && mockShelters.map((shelter) => (
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

        {layers.housing && mockHousing.map((house) => (
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

        {layers.news && geoNews.map((news) => (
          <Marker key={news.id} position={[news.lat!, news.lng!]} icon={newsIcon}>
            <Popup>
              <div className="text-xs space-y-1">
                <div className="font-bold text-foreground">{news.title}</div>
                <div className="text-muted-foreground">{news.source}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Layer Control Panel */}
      <div className="absolute top-3 right-3 z-[1000]">
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
              { key: 'airstrikes' as const, label: 'Airstrikes', color: 'text-danger' },
              { key: 'shelters' as const, label: 'Shelters', color: 'text-success' },
              { key: 'housing' as const, label: 'Housing', color: 'text-info' },
              { key: 'news' as const, label: 'News', color: 'text-warning' },
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
        <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-danger" />Airstrike</div>
        <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-success" />Shelter</div>
        <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-info" />Housing</div>
        <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-warning" />News Event</div>
      </div>
    </div>
  );
}
