'use client';

import React, { useState, useEffect } from 'react';
import { Location } from '../types';
import { LocationInput } from './LocationInput';
import { Compass, Clock, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

interface RoutePlannerProps {
  onAnalyze: (params: {
    start: Location;
    destination: Location;
    departureTime: string;
    expectedDurationMinutes?: number;
  }) => void;
  isLoading: boolean;
  errorMessage: string | null;
}

export const RoutePlanner: React.FC<RoutePlannerProps> = ({
  onAnalyze,
  isLoading,
  errorMessage
}) => {
  const [start, setStart] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);
  const [departureTime, setDepartureTime] = useState<string>('');
  const [expectedDuration, setExpectedDuration] = useState<string>('');

  // Default departure time to current local datetime formatted for <input type="datetime-local">
  useEffect(() => {
    const now = new Date();
    // Offset local timezone ISO format
    const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setDepartureTime(localIso);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!start) return;
    if (!destination) return;
    if (!departureTime) return;

    const parsedDuration = expectedDuration ? parseInt(expectedDuration, 10) : undefined;
    const departureIso = new Date(departureTime).toISOString();

    onAnalyze({
      start,
      destination,
      departureTime: departureIso,
      expectedDurationMinutes: parsedDuration && !isNaN(parsedDuration) ? parsedDuration : undefined
    });
  };

  // Helper preset function for initial test case (Mysuru -> Krishnarajanagara)
  const handleLoadTestPreset = () => {
    setStart({
      name: 'Mysuru',
      displayName: 'Mysuru, Karnataka, India',
      lat: 12.2958,
      lng: 76.6394
    });
    setDestination({
      name: 'Krishnarajanagara',
      displayName: 'Krishnarajanagara, Karnataka, India',
      lat: 12.4384,
      lng: 76.3847
    });
  };

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Plan a journey</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">Where are you headed?</p>
        </div>
        <button
          type="button"
          onClick={handleLoadTestPreset}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-xs font-semibold hover:bg-amber-100 transition-colors border border-amber-200/60"
          title="Load initial test case: Mysuru → Krishnarajanagara"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Mysuru → KR Nagara</span>
        </button>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-start space-x-3 text-sm">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Calculation Error</p>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <LocationInput
            id="start-location-input"
            label="Starting point"
            placeholder="e.g. Mysuru, Karnataka, India"
            value={start}
            onChange={setStart}
          />

          <LocationInput
            id="destination-location-input"
            label="Destination"
            placeholder="e.g. Krishnarajanagara, Karnataka, India"
            value={destination}
            onChange={setDestination}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="departure-time-input" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Departure
            </label>
            <div className="relative">
              <input
                id="departure-time-input"
                type="datetime-local"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                required
                className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all shadow-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="duration-input" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Expected duration <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <input
                id="duration-input"
                type="number"
                min="1"
                max="1440"
                placeholder="Estimated automatically if empty"
                value={expectedDuration}
                onChange={(e) => setExpectedDuration(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all shadow-sm"
              />
              <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs text-slate-400 font-medium">
                min
              </span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !start || !destination}
          className={`w-full py-4 px-6 rounded-2xl font-bold text-base shadow-lg transition-all flex items-center justify-center space-x-2 ${
            isLoading || !start || !destination
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-amber-500/25 active:scale-[0.99]'
          }`}
        >
          {isLoading ? (
            <>
              <Compass className="w-5 h-5 animate-spin" />
              <span>Calculating your shade...</span>
            </>
          ) : (
            <>
              <span>Find my shade</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
