'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Location, RouteGeometry, ShadeSample } from '../types';

interface LeafletMapContentProps {
  start: Location;
  destination: Location;
  route: RouteGeometry;
  samples?: ShadeSample[];
}

// Helper hook to fit map bounds automatically
function AutoFitBounds({ coordinates }: { coordinates: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (coordinates && coordinates.length > 0) {
      const bounds = L.latLngBounds(coordinates.map(([lng, lat]) => [lat, lng]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [coordinates, map]);

  return null;
}

// Custom DivIcons for crisp SVG rendering without broken static asset issues
const createStartIcon = () =>
  L.divIcon({
    className: 'custom-map-icon',
    html: `<div class="w-8 h-8 rounded-full bg-emerald-500 border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-xs">A</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });

const createDestIcon = () =>
  L.divIcon({
    className: 'custom-map-icon',
    html: `<div class="w-8 h-8 rounded-full bg-rose-500 border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-xs">B</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });

const createSampleIcon = (shadedSide: string, isNight: boolean) => {
  let bgColor = 'bg-amber-400';
  let label = '☼';

  if (isNight) {
    bgColor = 'bg-indigo-600';
    label = '🌙';
  } else if (shadedSide === 'LEFT') {
    bgColor = 'bg-sky-500';
    label = '←';
  } else if (shadedSide === 'RIGHT') {
    bgColor = 'bg-sky-500';
    label = '→';
  }

  return L.divIcon({
    className: 'custom-sample-icon',
    html: `<div class="w-6 h-6 rounded-full ${bgColor} border-2 border-white shadow flex items-center justify-center text-white text-xs font-bold">${label}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

function bearingToCardinal(deg: number): string {
  const directions = ['North', 'North-East', 'East', 'South-East', 'South', 'South-West', 'West', 'North-West'];
  const index = Math.round(((deg % 360) + 360) % 360 / 45) % 8;
  return directions[index];
}

function formatTimeHHMM(isoString: string): string {
  const d = new Date(isoString);
  let hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minutesStr = minutes < 10 ? '0' + minutes : minutes;
  return `${hours}:${minutesStr} ${ampm}`;
}

export const LeafletMapContent: React.FC<LeafletMapContentProps> = ({
  start,
  destination,
  route,
  samples = []
}) => {
  // Convert OSRM [lng, lat] to Leaflet [lat, lng]
  const polylinePositions: [number, number][] = route.coordinates.map(([lng, lat]) => [
    lat,
    lng
  ]);

  const centerLat = (start.lat + destination.lat) / 2;
  const centerLng = (start.lng + destination.lng) / 2;

  return (
    <div className="w-full h-[400px] sm:h-[480px] rounded-3xl overflow-hidden shadow-lg border border-slate-200 relative z-0">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={10}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <AutoFitBounds coordinates={route.coordinates} />

        {/* Route Polyline */}
        <Polyline
          positions={polylinePositions}
          pathOptions={{
            color: '#f59e0b',
            weight: 5,
            opacity: 0.85,
            lineCap: 'round',
            lineJoin: 'round'
          }}
        />

        {/* Starting Location Marker */}
        <Marker position={[start.lat, start.lng]} icon={createStartIcon()}>
          <Popup>
            <div className="p-1">
              <span className="font-bold text-slate-800">Start:</span> {start.name}
            </div>
          </Popup>
        </Marker>

        {/* Destination Location Marker */}
        <Marker position={[destination.lat, destination.lng]} icon={createDestIcon()}>
          <Popup>
            <div className="p-1">
              <span className="font-bold text-slate-800">Destination:</span> {destination.name}
            </div>
          </Popup>
        </Marker>

        {/* Sampled Route Points */}
        {samples.map((pt, idx) => (
          <Marker
            key={`sample-${idx}`}
            position={[pt.lat, pt.lng]}
            icon={createSampleIcon(pt.shadedSide, pt.isNight)}
          >
            <Popup>
              <div className="p-2 text-xs space-y-1.5 font-sans text-slate-800 min-w-[180px]">
                <div className="border-b border-slate-200 pb-1 font-bold text-slate-900 flex justify-between">
                  <span>TIME</span>
                  <span className="text-amber-700">{formatTimeHHMM(pt.timestamp)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">BUS HEADING:</span>
                  <span className="font-bold">{bearingToCardinal(pt.vehicleBearing)} ({pt.vehicleBearing}°)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">SUN:</span>
                  <span className="font-bold">
                    {pt.isNight ? 'Below horizon' : `${bearingToCardinal(pt.sunAzimuth)} (${pt.sunAzimuth}°)`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">SUN ALTITUDE:</span>
                  <span className="font-bold">{pt.sunAltitude}°</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">SUN SIDE:</span>
                  <span className="font-bold">{pt.sunSide}</span>
                </div>
                <div className="pt-1 border-t border-slate-200 mt-1 flex justify-between font-extrabold text-sky-800">
                  <span>Recommended window:</span>
                  <span>{pt.shadedSide === 'LEFT' ? 'Left' : pt.shadedSide === 'RIGHT' ? 'Right' : 'Any'}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
