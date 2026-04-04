import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { lebanonHospitals } from '@/data/mockData';
import { useNewsFeedContext } from '@/contexts/NewsFeedContext';
import { Layers, Eye, EyeOff, TrendingUp, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HotspotLayer } from '@/components/map/HotspotLayer';
import { InfrastructureLayer } from '@/components/map/InfrastructureLayer';
import { EscalationPanel } from '@/components/map/EscalationTimeline';
import { TimeFilterBar, getTimeFilterMs } from '@/components/map/TimeFilterBar';
import { HumanitarianLayer } from '@/components/map/HumanitarianLayer';
import { DayNightOverlay } from '@/components/map/DayNightOverlay';
import { MarkerClusterLayer } from '@/components/map/MarkerClusterGroup';
import { HeatmapLayer } from '@/components/map/HeatmapLayer';
import type { HeatPoint } from '@/components/map/HeatmapLayer';
import { useEscalationHistory } from '@/hooks/useEscalationHistory';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from '@/lib/i18n';
import {
  MAP_LAYER_DEFINITIONS,
  DEFAULT_MAP_LAYER_STATE,
  DEFAULT_MAP_VIEWPORT,
  normalizeMapLayerState,
  type MapLayerContract,
  type MapViewportState,
  type MapLayerToggleState,
} from '@/features/map/mapLayerContract';

type LeafletIconPrototype = L.Icon.Default & { _getIconUrl?: string };

// Fix default marker icon
delete (L.Icon.Default.prototype as LeafletIconPrototype)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/images/leaflet/marker-icon-2x.png',
  iconUrl: '/images/leaflet/marker-icon.png',
  shadowUrl: '/images/leaflet/marker-shadow.png',
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

const BORDER_POLYLINE: Array<[number, number]> = [
  [34.67, 35.08],
  [34.58, 35.50],
  [34.55, 36.10],
  [34.50, 36.60],
  [34.31, 36.63],
  [33.72, 36.62],
  [33.10, 35.95],
  [33.08, 35.10],
  [33.40, 35.10],
  [33.90, 35.25],
  [34.38, 35.67],
  [34.67, 35.08],
];

const SUPPLY_ROUTES: Array<Array<[number, number]>> = [
  [[33.9019, 35.5189], [33.8333, 35.9000], [33.8463, 35.9020]],
  [[33.2744, 35.1968], [33.5594, 35.3717], [33.9806, 35.6178]],
  [[34.4333, 35.8333], [34.0047, 36.2110], [33.3633, 35.4717]],
];

const STATIC_TELECOM_NODES: Array<{ id: string; lat: number; lng: number; label: string }> = [
  { id: 'cell-beirut', lat: 33.8938, lng: 35.5018, label: 'Beirut Exchange' },
  { id: 'cell-tripoli', lat: 34.4333, lng: 35.8333, label: 'Tripoli Tower Hub' },
  { id: 'cell-zahle', lat: 33.8463, lng: 35.9020, label: 'Bekaa Relay' },
];

const STATIC_POWER_NODES: Array<{ id: string; lat: number; lng: number; label: string }> = [
  { id: 'power-jiyeh', lat: 33.5905, lng: 35.4302, label: 'Jiyeh Plant' },
  { id: 'power-zouk', lat: 33.9797, lng: 35.6038, label: 'Zouk Plant' },
  { id: 'power-deir', lat: 34.3209, lng: 35.9935, label: 'Deir Ammar' },
];

const STATIC_MARITIME_NODES: Array<{ id: string; lat: number; lng: number; label: string }> = [
  { id: 'sea-beirut', lat: 33.91, lng: 35.45, label: 'Beirut Maritime Lane' },
  { id: 'sea-tripoli', lat: 34.50, lng: 35.65, label: 'Tripoli Maritime Lane' },
  { id: 'sea-tyre', lat: 33.23, lng: 35.12, label: 'Tyre Maritime Lane' },
];

const STATIC_SATELLITE_NODES: Array<{ id: string; lat: number; lng: number; label: string }> = [
  { id: 'sat-1', lat: 34.15, lng: 36.2, label: 'EO Pass Alpha' },
  { id: 'sat-2', lat: 33.55, lng: 35.2, label: 'EO Pass Bravo' },
  { id: 'sat-3', lat: 34.0, lng: 35.8, label: 'EO Pass Charlie' },
];

// Client-side fallback: extract coords from title/summary
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

function hasKeywords(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some(keyword => lower.includes(keyword));
}

type LayerToggle = MapLayerToggleState;

function MapController() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 100);
  }, [map]);
  return null;
}

/** Syncs map position to URL search params (debounced to avoid history spam) */
function URLStateSync({ timeFilter }: { timeFilter: string }) {
  const map = useMap();
  const [, setSearchParams] = useSearchParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handler = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const center = map.getCenter();
        const zoom = map.getZoom();
        setSearchParams(prev => {
          prev.set('lat', center.lat.toFixed(4));
          prev.set('lng', center.lng.toFixed(4));
          prev.set('z', zoom.toString());
          prev.set('t', timeFilter);
          return prev;
        }, { replace: true });
      }, 500);
    };
    map.on('moveend', handler);
    return () => {
      map.off('moveend', handler);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [map, setSearchParams, timeFilter]);

  return null;
}

function ViewportSync({ onViewportChange }: { onViewportChange?: (viewport: MapViewportState) => void }) {
  useMapEvents({
    moveend(event) {
      if (!onViewportChange) return;
      const center = event.target.getCenter();
      onViewportChange({
        lat: center.lat,
        lng: center.lng,
        zoom: event.target.getZoom(),
      });
    },
    zoomend(event) {
      if (!onViewportChange) return;
      const center = event.target.getCenter();
      onViewportChange({
        lat: center.lat,
        lng: center.lng,
        zoom: event.target.getZoom(),
      });
    },
  });

  return null;
}

interface CrisisMapProps {
  initialContract?: MapLayerContract;
  initialViewport?: MapViewportState;
  onContractChange?: (contract: MapLayerContract) => void;
  onViewportChange?: (viewport: MapViewportState) => void;
}

export function CrisisMap({ initialContract, initialViewport, onContractChange, onViewportChange }: CrisisMapProps) {
  const { news, lastUpdated, isLive } = useNewsFeedContext();
  const { scores, historyMap } = useEscalationHistory(news);
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();

  // Restore map state from URL
  const initialCenter: [number, number] = [
    parseFloat(searchParams.get('lat') || String(initialViewport?.lat ?? DEFAULT_MAP_VIEWPORT.lat)),
    parseFloat(searchParams.get('lng') || String(initialViewport?.lng ?? DEFAULT_MAP_VIEWPORT.lng)),
  ];
  const initialZoom = parseInt(searchParams.get('z') || String(initialViewport?.zoom ?? DEFAULT_MAP_VIEWPORT.zoom), 10);
  const initialTime = searchParams.get('t') || 'all';

  const defaultLayers = initialContract?.layers ?? DEFAULT_MAP_LAYER_STATE;
  const defaultTime = searchParams.get('t') || initialContract?.timeFilter || 'all';

  const [layers, setLayers] = useState<LayerToggle>(normalizeMapLayerState(defaultLayers));
  const [showPanel, setShowPanel] = useState(true);
  const [showEscalation, setShowEscalation] = useState(false);
  const [mapTimeFilter, setMapTimeFilter] = useState(defaultTime || initialTime);
  const [showHeatmap, setShowHeatmap] = useState(false);

  const toggleLayer = (key: keyof LayerToggle) => {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    if (!onContractChange) return;
    onContractChange({
      layers,
      timeFilter: mapTimeFilter as MapLayerContract['timeFilter'],
    });
  }, [layers, mapTimeFilter, onContractChange]);

  const timeFilterMs = getTimeFilterMs(mapTimeFilter);
  const timeFilteredNews = news.filter(n => {
    if (timeFilterMs === Infinity) return true;
    return Date.now() - new Date(n.publishedAt).getTime() < timeFilterMs;
  });

  const enrichedNews = timeFilteredNews.map(n => {
    if (n.lat && n.lng) return n;
    const inferred = inferCoords(`${n.title} ${n.summary}`);
    if (inferred) return { ...n, lat: inferred.lat, lng: inferred.lng };
    return n;
  });

  const geoNews = enrichedNews.filter(n => n.lat && n.lng);
  const conflictEvents = geoNews.filter(n => n.category === 'conflict' || n.severity === 'high');
  const otherNews = geoNews.filter(n => n.category !== 'conflict' && n.severity !== 'high');
  const protestEvents = geoNews.filter(item => hasKeywords(`${item.title} ${item.summary}`, ['protest', 'demonstration', 'riot', 'march']));
  const displacementEvents = geoNews.filter(item => hasKeywords(`${item.title} ${item.summary}`, ['displaced', 'refugee', 'evacuation', 'migration']));
  const weatherEvents = geoNews.filter(item => hasKeywords(`${item.title} ${item.summary}`, ['storm', 'flood', 'wind', 'rain', 'heatwave', 'weather']));
  const cyberEvents = geoNews.filter(item => hasKeywords(`${item.title} ${item.summary}`, ['cyber', 'malware', 'phishing', 'ransomware', 'outage', 'ddos']));

  // Heatmap points (Feature 10): derive from geo-tagged news severity
  const heatPoints = useMemo((): HeatPoint[] => {
    const severityWeight: Record<string, number> = { high: 1.0, elevated: 0.6, monitoring: 0.3 };
    return geoNews.map(n => ({
      lat: n.lat!,
      lng: n.lng!,
      intensity: severityWeight[n.severity] ?? 0.3,
    }));
  }, [geoNews]);

  // Prepare clustered markers for news layer
  const newsClusterMarkers = useMemo(() => otherNews.map(item => ({
    id: item.id,
    lat: item.lat!,
    lng: item.lng!,
    popupContent: `<div class="text-xs space-y-1"><div class="font-bold">${item.title}</div><div class="text-gray-500">${item.source}</div></div>`,
    icon: newsIcon,
  })), [otherNews]);

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        className="w-full h-full z-0"
        zoomControl={true}
      >
        <MapController />
        <URLStateSync timeFilter={mapTimeFilter} />
        <ViewportSync onViewportChange={onViewportChange} />
        <TimeFilterBar activeTime={mapTimeFilter} onTimeChange={setMapTimeFilter} />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />

        {/* Day/Night overlay */}
        <DayNightOverlay visible={layers.daynight} />

        {/* Hotspot escalation zones */}
        <HotspotLayer news={news} visible={layers.hotspots} />
        <InfrastructureLayer news={news} visible={layers.infrastructure} />

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
                <div className="text-muted-foreground">{t('topbar.source')}: {event.source}</div>
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

        {layers.protests && protestEvents.map((event) => (
          <CircleMarker
            key={`protest-${event.id}`}
            center={[event.lat!, event.lng!]}
            radius={7}
            pathOptions={{
              color: '#fb7185',
              fillColor: '#fb7185',
              fillOpacity: 0.35,
              weight: 1.5,
            }}
          >
            <Popup>
              <div className="text-xs">
                <div className="font-bold text-foreground">{event.title}</div>
                <div className="text-muted-foreground">Protest/Unrest signal</div>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {layers.displacement && displacementEvents.map((event) => (
          <CircleMarker
            key={`displace-${event.id}`}
            center={[event.lat!, event.lng!]}
            radius={7}
            pathOptions={{
              color: '#84cc16',
              fillColor: '#84cc16',
              fillOpacity: 0.3,
              weight: 1.5,
            }}
          >
            <Popup>
              <div className="text-xs">
                <div className="font-bold text-foreground">{event.title}</div>
                <div className="text-muted-foreground">Displacement pressure signal</div>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {layers.weather && weatherEvents.map((event) => (
          <CircleMarker
            key={`weather-${event.id}`}
            center={[event.lat!, event.lng!]}
            radius={6}
            pathOptions={{
              color: '#93c5fd',
              fillColor: '#93c5fd',
              fillOpacity: 0.35,
              weight: 1.5,
            }}
          />
        ))}

        {layers.cyber && cyberEvents.map((event) => (
          <CircleMarker
            key={`cyber-${event.id}`}
            center={[event.lat!, event.lng!]}
            radius={6}
            pathOptions={{
              color: '#22d3ee',
              fillColor: '#22d3ee',
              fillOpacity: 0.4,
              weight: 1.5,
            }}
          />
        ))}

        <HumanitarianLayer showSos={layers.sos} showShelters={layers.shelters} showHousing={layers.housing} />

        {/* News markers — clustered */}
        <MarkerClusterLayer
          markers={newsClusterMarkers}
          visible={layers.news}
          maxClusterRadius={40}
          clusterColor="#f59e0b"
        />

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

        {layers.telecom && STATIC_TELECOM_NODES.map(node => (
          <CircleMarker
            key={node.id}
            center={[node.lat, node.lng]}
            radius={6}
            pathOptions={{ color: '#38bdf8', fillColor: '#38bdf8', fillOpacity: 0.45, weight: 1.5 }}
          >
            <Popup>
              <div className="text-xs font-semibold">{node.label}</div>
            </Popup>
          </CircleMarker>
        ))}

        {layers.powerGrid && STATIC_POWER_NODES.map(node => (
          <CircleMarker
            key={node.id}
            center={[node.lat, node.lng]}
            radius={6}
            pathOptions={{ color: '#f59e0b', fillColor: '#f59e0b', fillOpacity: 0.45, weight: 1.5 }}
          >
            <Popup>
              <div className="text-xs font-semibold">{node.label}</div>
            </Popup>
          </CircleMarker>
        ))}

        {layers.maritime && STATIC_MARITIME_NODES.map(node => (
          <CircleMarker
            key={node.id}
            center={[node.lat, node.lng]}
            radius={6}
            pathOptions={{ color: '#60a5fa', fillColor: '#60a5fa', fillOpacity: 0.35, weight: 1.5 }}
          >
            <Popup>
              <div className="text-xs font-semibold">{node.label}</div>
            </Popup>
          </CircleMarker>
        ))}

        {layers.satellite && STATIC_SATELLITE_NODES.map(node => (
          <CircleMarker
            key={node.id}
            center={[node.lat, node.lng]}
            radius={5}
            pathOptions={{ color: '#e879f9', fillColor: '#e879f9', fillOpacity: 0.4, weight: 1.5 }}
          >
            <Popup>
              <div className="text-xs font-semibold">{node.label}</div>
            </Popup>
          </CircleMarker>
        ))}

        {layers.borders && (
          <Polyline positions={BORDER_POLYLINE} pathOptions={{ color: '#f8fafc', weight: 1.5, opacity: 0.55 }} />
        )}

        {layers.supplyRoutes && SUPPLY_ROUTES.map((route, index) => (
          <Polyline key={`route-${index}`} positions={route} pathOptions={{ color: '#10b981', weight: 2, opacity: 0.65 }} />
        ))}

        {/* Threat heatmap (Feature 10) */}
        <HeatmapLayer points={heatPoints} visible={showHeatmap} />
      </MapContainer>

      {/* Live indicator */}
      {isLive && (
        <div className="absolute top-3 left-[55px] z-[1000] bg-card/90 border border-border backdrop-blur-sm rounded-md px-2 py-1 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-danger animate-pulse" />
          <span className="text-[10px] font-bold text-danger uppercase">{t('map.live')}</span>
          {lastUpdated && (
            <span className="text-[9px] text-muted-foreground ml-1">
              {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      )}

      {/* Layer Control Panel + Escalation - bottom left */}
      <div className="absolute bottom-3 left-3 z-[1000]">
        <div className="flex items-end gap-1">
          <div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 bg-card/90 border border-border backdrop-blur-sm"
              onClick={() => { setShowPanel(p => !p); setShowEscalation(false); }}
            >
              <Layers className="h-4 w-4" />
            </Button>
          </div>
          <div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 bg-card/90 border border-border backdrop-blur-sm"
              onClick={() => { setShowEscalation(p => !p); setShowPanel(false); }}
            >
              <TrendingUp className="h-4 w-4" />
            </Button>
          </div>
          {/* Heatmap toggle (Feature 10) */}
          <div>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 bg-card/90 border backdrop-blur-sm ${showHeatmap ? 'border-orange-500/50 text-orange-400' : 'border-border'}`}
              onClick={() => setShowHeatmap(p => !p)}
              title="Toggle threat heatmap"
            >
              <Flame className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {showEscalation && (
          <div className="mt-1 bg-card/95 border border-border backdrop-blur-sm rounded-md p-2 min-w-[280px]">
            <EscalationPanel scores={scores} historyMap={historyMap} />
          </div>
        )}
        {showPanel && (
          <div className="mt-1 bg-card/95 border border-border backdrop-blur-sm rounded-md p-2 space-y-1 min-w-[140px] max-h-[50vh] overflow-y-auto">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold px-1">{t('map.layers')}</span>
            {MAP_LAYER_DEFINITIONS.map(layer => (
              <button
                key={layer.key}
                onClick={() => toggleLayer(layer.key)}
                className="flex items-center gap-2 w-full px-1 py-0.5 rounded hover:bg-muted text-[11px]"
              >
                {layers[layer.key] ? <Eye className={`h-3 w-3 ${layer.colorClass}`} /> : <EyeOff className="h-3 w-3 text-muted-foreground" />}
                <span className={layers[layer.key] ? layer.colorClass : 'text-muted-foreground'}>{t(layer.labelKey)}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
