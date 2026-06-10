import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface GeoPoint {
  lat: number;
  lng: number;
  radius: number; // meters
}

interface LocationPickerProps {
  value: GeoPoint | null;
  onChange: (v: GeoPoint) => void;
  height?: number;
}

const DEFAULT_CENTER: [number, number] = [32.0853, 34.7818]; // Tel Aviv
const DEFAULT_RADIUS = 200;

const pinIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:30px;height:30px;border-radius:50% 50% 50% 0;
    background:var(--md-primary,#B5651D);
    transform:rotate(-45deg) translate(6px,-6px);
    border:3px solid var(--md-surface,#fff);
    box-shadow:0 3px 8px rgba(0,0,0,.35);
  "></div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 28],
});

export function LocationPicker({ value, onChange, height = 220 }: LocationPickerProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const valueRef = useRef(value);
  valueRef.current = value;

  useEffect(() => {
    if (!hostRef.current || mapRef.current) return;
    const map = L.map(hostRef.current)
      .setView(value ? [value.lat, value.lng] : DEFAULT_CENTER, value ? 15 : 13);
    map.attributionControl.setPrefix(false);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    map.on('click', (e: L.LeafletMouseEvent) => {
      onChange({
        lat: +e.latlng.lat.toFixed(6),
        lng: +e.latlng.lng.toFixed(6),
        radius: valueRef.current?.radius ?? DEFAULT_RADIUS,
      });
    });

    mapRef.current = map;

    // The add-screen overlay animates in; recalc size once it settles
    const t = setTimeout(() => map.invalidateSize(), 500);

    if (!value && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => map.setView([pos.coords.latitude, pos.coords.longitude], 15),
        () => {}, { timeout: 5000 },
      );
    }

    return () => {
      clearTimeout(t);
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
      circleRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reflect value → marker + radius circle
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!value) {
      markerRef.current?.remove(); markerRef.current = null;
      circleRef.current?.remove(); circleRef.current = null;
      return;
    }
    const pos: [number, number] = [value.lat, value.lng];
    if (!markerRef.current) {
      markerRef.current = L.marker(pos, { icon: pinIcon }).addTo(map);
    } else {
      markerRef.current.setLatLng(pos);
    }
    if (!circleRef.current) {
      circleRef.current = L.circle(pos, {
        radius: value.radius,
        color: 'var(--md-primary, #B5651D)',
        fillOpacity: 0.12,
        weight: 2,
      }).addTo(map);
    } else {
      circleRef.current.setLatLng(pos);
      circleRef.current.setRadius(value.radius);
    }
    if (!map.getBounds().contains(pos)) map.panTo(pos);
  }, [value]);

  return (
    <div
      ref={hostRef}
      style={{
        height, borderRadius: 'var(--r-md)', overflow: 'hidden',
        border: '1.5px solid var(--md-outline-variant)',
        // Leaflet panes are LTR-positioned; isolate from the RTL document
        direction: 'ltr',
        zIndex: 0, position: 'relative',
      }}
    />
  );
}
