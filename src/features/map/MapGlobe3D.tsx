import React, { useEffect, useMemo, useRef, useState } from 'react';
import Globe from 'react-globe.gl';
import type { MapLayerContract } from '@/features/map/mapLayerContract';
import { useNewsFeedContext } from '@/contexts/NewsFeedContext';
import { lebanonHospitals } from '@/data/mockData';
import { Globe as GlobeIcon, Layers3, Zap } from 'lucide-react';
import { useTheme } from 'next-themes';

interface MapGlobe3DProps {
  contract: MapLayerContract;
}

export function MapGlobe3D({ contract }: MapGlobe3DProps) {
  const globeRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  const { enrichedNews } = useNewsFeedContext();
  const layers = contract.layers;

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
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

  // Position over Lebanon roughly on mount
  useEffect(() => {
    if (globeRef.current) {
      // @ts-ignore - Globe methods
      globeRef.current.pointOfView({ lat: 33.8547, lng: 35.8623, altitude: 1.2 }, 1500);
    }
  }, []);

  const geoNews = useMemo(() => enrichedNews.filter(n => n.lat && n.lng), [enrichedNews]);
  const conflictEvents = useMemo(() => geoNews.filter(n => n.category === 'conflict' || n.severity === 'high'), [geoNews]);
  const otherNews = useMemo(() => geoNews.filter(n => n.category !== 'conflict' && n.severity !== 'high'), [geoNews]);

  // Transform to globe points
  const points = useMemo(() => {
    const data = [];
    if (layers.airstrikes || layers.hotspots) {
      conflictEvents.forEach(e => {
        data.push({
          lat: e.lat,
          lng: e.lng,
          color: e.severity === 'high' ? '#ef4444' : '#f97316',
          radius: e.severity === 'high' ? 0.3 : 0.15,
          label: e.title,
          type: 'conflict'
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
          type: 'hospital'
        });
      });
    }

    if (layers.news) {
      otherNews.forEach(n => {
        data.push({
          lat: n.lat,
          lng: n.lng,
          color: '#eab308',
          radius: 0.1,
          label: n.title,
          type: 'news'
        });
      });
    }
    return data;
  }, [layers, conflictEvents, otherNews]);

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
          ref={globeRef}
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
          atmosphereColor="#3b82f6"
          atmosphereAltitude={0.15}
          showGraticules={true}
          graticulesColor={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}
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
