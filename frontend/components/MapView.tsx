'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Location, RouteGeometry, ShadeSample } from '../types';
import { Loader2 } from 'lucide-react';

interface MapViewProps {
  start: Location;
  destination: Location;
  route: RouteGeometry;
  samples?: ShadeSample[];
}

const DynamicLeafletMap = dynamic(
  () => import('./LeafletMapContent').then((mod) => mod.LeafletMapContent),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] sm:h-[480px] rounded-3xl bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-500">
        <div className="flex flex-col items-center space-y-2">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          <span className="text-sm font-medium">Loading interactive route map...</span>
        </div>
      </div>
    )
  }
);

export const MapView: React.FC<MapViewProps> = (props) => {
  return <DynamicLeafletMap {...props} />;
};
