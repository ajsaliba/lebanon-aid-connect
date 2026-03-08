/**
 * Day/Night terminator overlay for Leaflet.
 * Shows a semi-transparent polygon covering the night side of Earth.
 * Updates every 5 minutes. Follows World Monitor's implementation.
 */

import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

function getSolarPosition(date: Date) {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
  );
  // Solar declination (approximate)
  const declination = -23.44 * Math.cos((2 * Math.PI / 365) * (dayOfYear + 10));
  // Hour angle based on UTC time
  const hours = date.getUTCHours() + date.getUTCMinutes() / 60;
  const solarNoonLng = (12 - hours) * 15;
  return { declination, solarNoonLng };
}

function getTerminatorCoords(date: Date): L.LatLngExpression[] {
  const { declination, solarNoonLng } = getSolarPosition(date);
  const decRad = (declination * Math.PI) / 180;
  const coords: L.LatLngExpression[] = [];

  // Generate terminator line
  for (let i = 0; i <= 360; i++) {
    const lng = -180 + i;
    const lngRad = ((lng - solarNoonLng) * Math.PI) / 180;
    const lat = (Math.atan(-Math.cos(lngRad) / Math.tan(decRad)) * 180) / Math.PI;
    coords.push([lat, lng]);
  }

  return coords;
}

function buildNightPolygon(date: Date): L.LatLngExpression[][] {
  const { declination } = getSolarPosition(date);
  const terminator = getTerminatorCoords(date);

  // Night is on the side away from the sun
  // If declination > 0, sun is in northern hemisphere, so add south cap
  const nightCap: L.LatLngExpression[] = declination >= 0
    ? [[...terminator].reverse(), [-90, 180], [-90, -180]].flat() as any
    : [[...terminator], [90, 180], [90, -180]].flat() as any;

  // Build polygon: terminator + cap to close the night side
  const polygon: L.LatLngExpression[] = [];

  if (declination >= 0) {
    // Night is south of terminator
    for (const coord of terminator) polygon.push(coord);
    polygon.push([-90, 180] as L.LatLngExpression);
    polygon.push([-90, -180] as L.LatLngExpression);
  } else {
    // Night is north of terminator
    for (const coord of terminator) polygon.push(coord);
    polygon.push([90, 180] as L.LatLngExpression);
    polygon.push([90, -180] as L.LatLngExpression);
  }

  return [polygon];
}

export function DayNightOverlay({ visible = true }: { visible?: boolean }) {
  const map = useMap();
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!visible) return;

    const layer = L.polygon(buildNightPolygon(new Date()), {
      color: 'transparent',
      fillColor: '#000000',
      fillOpacity: 0.2,
      interactive: false,
    }).addTo(map);

    // Update every 5 minutes
    const interval = setInterval(() => {
      layer.setLatLngs(buildNightPolygon(new Date()));
      setTick(t => t + 1);
    }, 5 * 60 * 1000);

    return () => {
      clearInterval(interval);
      map.removeLayer(layer);
    };
  }, [map, visible]);

  return null;
}
