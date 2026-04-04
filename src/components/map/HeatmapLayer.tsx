/**
 * Canvas-based heatmap layer for Leaflet (Feature 10).
 * Implements density visualization without external leaflet.heat dependency.
 */
import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';

export interface HeatPoint {
  lat: number;
  lng: number;
  intensity: number; // 0–1
}

interface HeatmapLayerProps {
  points: HeatPoint[];
  visible: boolean;
}

export function HeatmapLayer({ points, visible }: HeatmapLayerProps) {
  const map = useMap();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Bootstrap the canvas overlay on mount
  useEffect(() => {
    const mapContainer = map.getContainer();
    const pane = map.getPane('overlayPane');
    if (!pane) return;

    const div = document.createElement('div');
    div.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:300;';
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;';
    div.appendChild(canvas);
    pane.appendChild(div);
    containerRef.current = div;
    canvasRef.current = canvas;

    // Resize canvas to match map container
    const resize = () => {
      const rect = mapContainer.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mapContainer);

    return () => {
      resizeObserver.disconnect();
      pane.removeChild(div);
    };
  }, [map]);

  // Redraw on map move / zoom / data change
  useEffect(() => {
    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!visible || points.length === 0) return;

      // Each point: draw a radial gradient blob
      for (const pt of points) {
        if (!pt.lat || !pt.lng) continue;

        let screenPt: { x: number; y: number };
        try {
          const p = map.latLngToContainerPoint([pt.lat, pt.lng]);
          screenPt = { x: p.x, y: p.y };
        } catch {
          continue;
        }

        const radius = Math.max(20, 40 * pt.intensity);
        const gradient = ctx.createRadialGradient(
          screenPt.x, screenPt.y, 0,
          screenPt.x, screenPt.y, radius,
        );

        // Gradient: cyan → yellow → red, matching app threat colors
        const alpha = Math.min(0.5, pt.intensity * 0.6);
        if (pt.intensity < 0.4) {
          gradient.addColorStop(0, `rgba(34,211,238,${alpha})`);    // cyan
          gradient.addColorStop(1, 'rgba(34,211,238,0)');
        } else if (pt.intensity < 0.65) {
          gradient.addColorStop(0, `rgba(234,179,8,${alpha})`);     // yellow
          gradient.addColorStop(1, 'rgba(234,179,8,0)');
        } else {
          gradient.addColorStop(0, `rgba(239,68,68,${alpha})`);     // red
          gradient.addColorStop(1, 'rgba(239,68,68,0)');
        }

        ctx.beginPath();
        ctx.arc(screenPt.x, screenPt.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }
    };

    map.on('move zoom moveend zoomend', draw);
    draw();

    return () => {
      map.off('move zoom moveend zoomend', draw);
    };
  }, [map, points, visible]);

  return null;
}
