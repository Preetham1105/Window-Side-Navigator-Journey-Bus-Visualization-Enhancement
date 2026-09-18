'use client';

import React from 'react';
import { RouteComplexity as ComplexityType } from '../types';
import { Info, GitCommit } from 'lucide-react';

interface RouteComplexityProps {
  complexity: ComplexityType;
  distanceKm: number;
}

export const RouteComplexity: React.FC<RouteComplexityProps> = ({
  complexity,
  distanceKm
}) => {
  return (
    <div className="space-y-6">
      {/* Route Bends Card */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
            <GitCommit className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Route bends</p>
            <p className="text-base font-extrabold text-slate-900 mt-0.5">
              {distanceKm} km · <span className="lowercase">{complexity}</span>
            </p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
          {complexity}
        </span>
      </div>

      {/* About this calculation & Attribution */}
      <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 text-xs text-slate-500 space-y-4">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-slate-800 text-sm mb-1">About this calculation</h4>
            <p className="leading-relaxed">
              This recommendation uses the Sun's astronomical position and your route direction. It does not account for clouds, buildings, trees, mountains, tunnels, or vehicle window geometry.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-slate-400 gap-2">
          <p className="font-semibold text-slate-600">Built for window-seat optimists</p>
          <p>Data: OpenStreetMap · OSRM · SunCalc</p>
        </div>
      </div>
    </div>
  );
};
