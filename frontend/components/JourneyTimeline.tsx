'use client';

import React, { useState } from 'react';
import { ShadeSample, Location, ShadeInterval } from '../types';
import { ChevronDown, ChevronUp, Sun, Moon, Clock, MapPin, RefreshCw, Compass } from 'lucide-react';

interface JourneyTimelineProps {
  samples: ShadeSample[];
  start: Location;
  destination: Location;
  shadeIntervals?: ShadeInterval[];
}

export const JourneyTimeline: React.FC<JourneyTimelineProps> = ({
  samples,
  start,
  destination,
  shadeIntervals = []
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!samples || samples.length === 0) return null;

  const departureTimeFormatted = formatTimestampHHMM(samples[0].timestamp);

  function formatTimestampHHMM(isoString: string): string {
    const d = new Date(isoString);
    let hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
  }

  // Calculate intervals if not passed from props
  const intervals = shadeIntervals.length > 0 ? shadeIntervals : [];
  const hasMultipleShadeIntervals = intervals.length > 1;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200/80 space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900">SHADE THROUGHOUT JOURNEY</h3>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Departure: <span className="text-amber-700 font-extrabold">{departureTimeFormatted}</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors flex items-center space-x-1 text-xs font-bold"
        >
          <span>{isExpanded ? 'Hide' : 'Show'} Details</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Requirement 9: Shade Changes Alert Banner */}
      {hasMultipleShadeIntervals && (
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200/80 shadow-sm">
          <div className="flex items-center space-x-2 text-amber-900 font-extrabold text-sm mb-3">
            <RefreshCw className="w-4 h-4 text-amber-600 animate-spin-slow" />
            <span>Shade changes during your journey</span>
          </div>

          <div className="space-y-2">
            {intervals.map((interval, idx) => (
              <div
                key={`interval-${idx}`}
                className="flex items-center justify-between p-3 rounded-xl bg-white border border-amber-200/60 shadow-xs"
              >
                <span className="text-xs font-bold text-slate-700">
                  {interval.startTimeFormatted} – {interval.endTimeFormatted}
                </span>
                <span
                  className={`text-xs font-black px-3 py-1 rounded-full uppercase ${
                    interval.shadedSide === 'LEFT'
                      ? 'bg-sky-100 text-sky-800 border border-sky-200'
                      : interval.shadedSide === 'RIGHT'
                      ? 'bg-sky-100 text-sky-800 border border-sky-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}
                >
                  {interval.shadedSide === 'LEFT'
                    ? '← LEFT SIDE'
                    : interval.shadedSide === 'RIGHT'
                    ? 'RIGHT SIDE →'
                    : 'NO STRONG BIAS'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Visual Timeline Points */}
      {isExpanded && (
        <div className="border-t border-slate-100 pt-6">
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {samples.map((sample, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === samples.length - 1;
              const pointTimeFormatted = formatTimestampHHMM(sample.timestamp);

              let locationName = `Route point ${idx + 1}`;
              if (isFirst) locationName = `Departure: ${start.name}`;
              if (isLast) locationName = `Arrival: ${destination.name}`;

              return (
                <div key={`timeline-${idx}`} className="relative flex items-start space-x-4">
                  {/* Circle dot on timeline */}
                  <div
                    className={`absolute -left-6 top-1.5 w-5 h-5 rounded-full border-2 border-white shadow flex items-center justify-center ${
                      isFirst
                        ? 'bg-emerald-500 ring-4 ring-emerald-100'
                        : isLast
                        ? 'bg-rose-500 ring-4 ring-rose-100'
                        : sample.isNight
                        ? 'bg-indigo-600'
                        : 'bg-amber-400'
                    }`}
                  />

                  <div className="flex-1 bg-slate-50/80 p-4 rounded-2xl border border-slate-100 hover:border-amber-200 transition-colors">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="inline-flex items-center space-x-1.5 text-xs font-extrabold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-md">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>{pointTimeFormatted}</span>
                      </span>
                      <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                        <Compass className="w-3 h-3 text-slate-400" />
                        Heading: {sample.vehicleBearing}°
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5 text-sm font-bold text-slate-800">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate">{locationName}</span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-xs">
                      <div>
                        <span className="text-slate-400 font-medium">Sun direction</span>
                        <p className="font-bold text-slate-700 flex items-center space-x-1 mt-0.5">
                          {sample.isNight ? (
                            <>
                              <Moon className="w-3.5 h-3.5 text-indigo-500" />
                              <span>Below horizon</span>
                            </>
                          ) : (
                            <>
                              <Sun className="w-3.5 h-3.5 text-amber-500" />
                              <span>{sample.sunSide} ({sample.sunAzimuth}°)</span>
                            </>
                          )}
                        </p>
                      </div>

                      <div>
                        <span className="text-slate-400 font-medium">Recommended side</span>
                        <p className="font-bold text-slate-900 mt-0.5">
                          {sample.isNight ? (
                            <span className="text-indigo-600">Any seat</span>
                          ) : sample.shadedSide === 'LEFT' ? (
                            <span className="text-sky-600 font-extrabold">← LEFT</span>
                          ) : sample.shadedSide === 'RIGHT' ? (
                            <span className="text-sky-600 font-extrabold">RIGHT →</span>
                          ) : (
                            <span className="text-amber-600 font-extrabold">No preference</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

