import { useEffect, useMemo, useRef, useState } from 'react';
import Globe from 'react-globe.gl';
import {
  DEFAULT_MAP_VIEWPORT,
  type MapLayerContract,
  type MapViewportState,
} from '@/features/map/mapLayerContract';
import { useNewsFeedContext } from '@/contexts/NewsFeedContext';
import { lebanonHospitals } from '@/data/mockData';
import { Globe as GlobeIcon, Layers3, Zap } from 'lucide-react';
import { useTheme } from 'next-themes';

interface MapGlobe3DProps {
  contract: MapLayerContract;
  initialViewport?: MapViewportState;
  onViewportChange?: (viewport: MapViewportState) => void;
}

interface GlobePoint {
  lat: number;
  lng: number;
  color: string;
  radius: number;
  label: string;
}

interface GlobeArc {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string;
}

const SUPPLY_ROUTES: GlobeArc[] = [
  { startLat: 33.9019, startLng: 35.5189, endLat: 33.8463, endLng: 35.902, color: '#10b981' },
  { startLat: 33.2744, startLng: 35.1968, endLat: 33.9806, endLng: 35.6178, color: '#10b981' },
  { startLat: 34.4333, startLng: 35.8333, endLat: 33.3633, endLng: 35.4717, color: '#10b981' },
];

const STATIC_TELECOM_POINTS: GlobePoint[] = [
  { lat: 33.8938, lng: 35.5018, color: '#38bdf8', radius: 0.14, label: 'Beirut Exchange' },
  { lat: 34.4333, lng: 35.8333, color: '#38bdf8', radius: 0.14, label: 'Tripoli Tower Hub' },
  { lat: 33.8463, lng: 35.902, color: '#38bdf8', radius: 0.14, label: 'Bekaa Relay' },
];

const STATIC_POWER_POINTS: GlobePoint[] = [
  { lat: 33.5905, lng: 35.4302, color: '#f59e0b', radius: 0.14, label: 'Jiyeh Plant' },
  { lat: 33.9797, lng: 35.6038, color: '#f59e0b', radius: 0.14, label: 'Zouk Plant' },
  { lat: 34.3209, lng: 35.9935, color: '#f59e0b', radius: 0.14, label: 'Deir Ammar' },
];

const STATIC_MARITIME_POINTS: GlobePoint[] = [
  { lat: 33.91, lng: 35.45, color: '#60a5fa', radius: 0.13, label: 'Beirut Maritime Lane' },
  { lat: 34.5, lng: 35.65, color: '#60a5fa', radius: 0.13, label: 'Tripoli Maritime Lane' },
  { lat: 33.23, lng: 35.12, color: '#60a5fa', radius: 0.13, label: 'Tyre Maritime Lane' },
];

const STATIC_SATELLITE_POINTS: GlobePoint[] = [
  { lat: 34.15, lng: 36.2, color: '#e879f9', radius: 0.12, label: 'EO Pass Alpha' },
  { lat: 33.55, lng: 35.2, color: '#e879f9', radius: 0.12, label: 'EO Pass Bravo' },
  { lat: 34.0, lng: 35.8, color: '#e879f9', radius: 0.12, label: 'EO Pass Charlie' },
];

function hasKeywords(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some(keyword => lower.includes(keyword));
}

export function MapGlobe3D({ contract, initialViewport, onViewportChange }: MapGlobe3DProps) {
  const globeRef = useRef<{
    pointOfView: (view: { lat: number; lng: number; altitude: number }, ms?: number) => void;
  } | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  const { news: enrichedNews } = useNewsFeedContext();
  const layers = contract.layers;

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });
    observer.observe(containerRef.current);
    
    // Initial size
    const rect = containerRef.current.getBoundingClientRect();
    setDimensions({ width: rect.width, height: rect.height });
    
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!globeRef.current) return;
    const next = initialViewport ?? DEFAULT_MAP_VIEWPORT;
    const altitude = Math.max(0.25, Math.min(2.2, 2.2 - (next.zoom * 0.22)));
    globeRef.current.pointOfView({ lat: next.lat, lng: next.lng, altitude }, 1100);
  }, [initialViewport]);

  const geoNews = useMemo(() => enrichedNews.filter(n => n.lat && n.lng), [enrichedNews]);
  const conflictEvents = useMemo(() => geoNews.filter(n => n.category === 'conflict' || n.severity === 'high'), [geoNews]);
  const otherNews = useMemo(() => geoNews.filter(n => n.category !== 'conflict' && n.severity !== 'high'), [geoNews]);
  const protestEvents = useMemo(() => geoNews.filter(item => hasKeywords(`${item.title} ${item.summary}`, ['protest', 'demonstration', 'riot', 'march'])), [geoNews]);
  const displacementEvents = useMemo(() => geoNews.filter(item => hasKeywords(`${item.title} ${item.summary}`, ['displaced', 'refugee', 'evacuation', 'migration'])), [geoNews]);
  const weatherEvents = useMemo(() => geoNews.filter(item => hasKeywords(`${item.title} ${item.summary}`, ['storm', 'flood', 'wind', 'rain', 'heatwave', 'weather'])), [geoNews]);
  const cyberEvents = useMemo(() => geoNews.filter(item => hasKeywords(`${item.title} ${item.summary}`, ['cyber', 'malware', 'phishing', 'ransomware', 'outage', 'ddos'])), [geoNews]);

  const points = useMemo(() => {
    const data: GlobePoint[] = [];
    if (layers.airstrikes || layers.hotspots) {
      conflictEvents.forEach(e => {
        data.push({
          lat: e.lat!,
          lng: e.lng!,
          color: e.severity === 'high' ? '#ef4444' : '#f97316',
          radius: e.severity === 'high' ? 0.3 : 0.15,
          label: `Conflict: ${e.title}`,
        });
      });
    }

    if (layers.hospitals) {
      lebanonHospitals.forEach(h => {
        data.push({
          lat: h.lat,
          lng: h.lng,
          color: '#3b82f6',
          radius: 0.15,
          label: h.name,
        });
      });
    }

    if (layers.news) {
      otherNews.forEach(n => {
        data.push({
          lat: n.lat!,
          lng: n.lng!,
          color: '#eab308',
          radius: 0.1,
          label: n.title,
        });
      });
    }

    if (layers.protests) {
      protestEvents.forEach(event => {
        data.push({
          lat: event.lat!,
          lng: event.lng!,
          color: '#fb7185',
          radius: 0.12,
          label: `Protest signal: ${event.title}`,
        });
      });
    }

    if (layers.displacement) {
      displacementEvents.forEach(event => {
        data.push({
          lat: event.lat!,
          lng: event.lng!,
          color: '#84cc16',
          radius: 0.12,
          label: `Displacement signal: ${event.title}`,
        });
      });
    }

    if (layers.weather) {
      weatherEvents.forEach(event => {
        data.push({
          lat: event.lat!,
          lng: event.lng!,
          color: '#93c5fd',
          radius: 0.11,
          label: `Weather signal: ${event.title}`,
        });
      });
    }

    if (layers.cyber) {
      cyberEvents.forEach(event => {
        data.push({
          lat: event.lat!,
          lng: event.lng!,
          color: '#22d3ee',
          radius: 0.11,
          label: `Cyber signal: ${event.title}`,
        });
      });
    }

    if (layers.telecom) data.push(...STATIC_TELECOM_POINTS);
    if (layers.powerGrid) data.push(...STATIC_POWER_POINTS);
    if (layers.maritime) data.push(...STATIC_MARITIME_POINTS);
    if (layers.satellite) data.push(...STATIC_SATELLITE_POINTS);

    return data;
  }, [layers, conflictEvents, otherNews, protestEvents, displacementEvents, weatherEvents, cyberEvents]);

  const routes = useMemo(() => {
    if (!layers.supplyRoutes) return [];
    return SUPPLY_ROUTES;
  }, [layers.supplyRoutes]);

  const activeLayersCount = Object.values(layers).filter(Boolean).length;
  const isDark = theme === 'dark' || !theme;
  const bgImg = isDark ? '//unpkg.com/three-globe/example/img/night-sky.png' : '';
  const globeImg = isDark 
    ? '//unpkg.com/three-globe/example/img/earth-dark.jpg'
    : '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg';

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden bg-background">
      {dimensions.width > 0 && dimensions.height > 0 && (
        <Globe
          ref={globeRef as never}
          width={dimensions.width}
          height={dimensions.height}
          globeImageUrl={globeImg}
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          backgroundImageUrl={bgImg}
          pointsData={points}
          pointLat="lat"
          pointLng="lng"
          pointColor="color"
          pointAltitude="radius"
          pointRadius="radius"
          pointLabel="label"
          arcsData={routes}
          arcStartLat="startLat"
          arcStartLng="startLng"
          arcEndLat="endLat"
          arcEndLng="endLng"
          arcColor="color"
          arcDashLength={0.35}
          arcDashGap={0.15}
          arcDashAnimateTime={2800}
          atmosphereColor="#3b82f6"
          atmosphereAltitude={0.15}
          showGraticules={true}
          graticulesColor={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}
          onPointClick={(point) => {
            if (!onViewportChange || !point) return;
            const p = point as GlobePoint;
            onViewportChange({ lat: p.lat, lng: p.lng, zoom: 7 });
          }}
        />
      )}
      
      {/* UX: Clean HUD overlay matching Operations Shell */}
      <div className="absolute top-4 left-4 pointer-events-none z-10 flex flex-col gap-2">
        <div className="bg-card/80 backdrop-blur-md border border-border shadow-lg rounded-xl px-3 py-2 flex items-center gap-2.5 transition-all">
          <div className="p-1.5 bg-primary/10 rounded-md">
            <GlobeIcon className="w-4 h-4 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground">Satellite View</span>
            <span className="text-[10px] text-muted-foreground font-medium">3D Engine: Globe.GL Active</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 pointer-events-none z-10">
        <div className="bg-card/85 backdrop-blur-md border border-border shadow-lg rounded-xl p-2.5 flex flex-col gap-1.5 transition-all w-48">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5"><Layers3 className="h-3 w-3" /> Shared Layers</span>
            <span className="bg-muted px-1.5 rounded">{activeLayersCount} active</span>
          </div>
          <div className="h-px w-full bg-border my-1" />
          <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 justify-between">
            <span>Points Tracked</span>
            <span className="font-mono text-primary font-bold flex items-center gap-1"><Zap className="w-3 h-3 text-primary" /> {points.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
