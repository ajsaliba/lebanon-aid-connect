/**
 * Leaflet MarkerClusterGroup wrapper for react-leaflet.
 * Smart grouping of dense markers with count badges.
 */

import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

interface MarkerData {
  id: string;
  lat: number;
  lng: number;
  popupContent: string;
  icon?: L.DivIcon;
}

interface Props {
  markers: MarkerData[];
  visible?: boolean;
  maxClusterRadius?: number;
  clusterColor?: string;
}

export function MarkerClusterLayer({ markers, visible = true, maxClusterRadius = 40, clusterColor = '#f59e0b' }: Props) {
  const map = useMap();
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    if (!visible) {
      if (clusterRef.current) {
        map.removeLayer(clusterRef.current);
        clusterRef.current = null;
      }
      return;
    }

    const cluster = L.markerClusterGroup({
      maxClusterRadius,
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      iconCreateFunction(clst) {
        const count = clst.getChildCount();
        const size = count > 20 ? 36 : count > 5 ? 30 : 24;
        return L.divIcon({
          html: `<div style="
            background:${clusterColor};
            width:${size}px;height:${size}px;
            border-radius:50%;
            display:flex;align-items:center;justify-content:center;
            font-size:${size > 30 ? 11 : 10}px;font-weight:700;
            color:#0a0a0a;border:2px solid rgba(0,0,0,0.3);
            box-shadow:0 0 8px ${clusterColor}80;
          ">${count}</div>`,
          className: '',
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });
      },
    });

    for (const m of markers) {
      const marker = L.marker([m.lat, m.lng], { icon: m.icon });
      marker.bindPopup(m.popupContent, { className: 'text-xs' });
      cluster.addLayer(marker);
    }

    map.addLayer(cluster);
    clusterRef.current = cluster;

    return () => {
      map.removeLayer(cluster);
      clusterRef.current = null;
    };
  }, [map, markers, visible, maxClusterRadius, clusterColor]);

  return null;
}
