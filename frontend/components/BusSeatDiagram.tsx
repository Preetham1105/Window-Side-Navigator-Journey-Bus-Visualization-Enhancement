'use client';

import React from 'react';
import { RecommendedShadeSide, SunSide } from '../types';
import { Sun, Check, Sparkles } from 'lucide-react';

interface BusSeatDiagramProps {
  overallShadedSide: RecommendedShadeSide;
  leftShadePercentage: number;
  rightShadePercentage: number;
  dominantSunSide: SunSide;
  isNight?: boolean;
}

export const BusSeatDiagram: React.FC<BusSeatDiagramProps> = ({
  overallShadedSide,
  leftShadePercentage,
  rightShadePercentage,
  dominantSunSide,
  isNight = false
}) => {
  const isLeftRecommended = !isNight && overallShadedSide === 'LEFT';
  const isRightRecommended = !isNight && overallShadedSide === 'RIGHT';
  const isNoPreference = !isNight && overallShadedSide === 'LOW_SIDE_PREFERENCE';

  // Determine sun icon placement outside the bus diagram relative to bus chassis
  const getSunPositionClasses = () => {
    switch (dominantSunSide) {
      case 'LEFT':
        return 'top-1/2 -left-12 -translate-y-1/2 flex-row';
      case 'RIGHT':
        return 'top-1/2 -right-12 -translate-y-1/2 flex-row-reverse';
      case 'FRONT':
        return '-top-10 left-1/2 -translate-x-1/2 flex-col';
      case 'BACK':
        return '-bottom-10 left-1/2 -translate-x-1/2 flex-col-reverse';
      default:
        return 'top-1/2 -right-12 -translate-y-1/2 flex-row-reverse';
    }
  };

  const getSunArrow = () => {
    switch (dominantSunSide) {
      case 'LEFT':
        return '→';
      case 'RIGHT':
        return '←';
      case 'FRONT':
        return '↓';
      case 'BACK':
        return '↑';
      default:
        return '←';
    }
  };

  return (
    <div className="w-full bg-slate-900 text-slate-100 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 relative overflow-hidden my-6">
      {/* Background Subtle Accent */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <div className="text-center mb-6">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
          BUS SEAT VISUALIZATION
        </h3>
        <p className="text-sm text-slate-300 mt-1 font-medium">
          Top-view looking in the direction of travel
        </p>
      </div>

      {/* Recommendation Banner */}
      <div className="mb-8 flex justify-center text-center">
        {isLeftRecommended && (
          <div className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-sky-500/20 border border-sky-400/40 text-sky-300 font-bold text-sm shadow-lg backdrop-blur">
            <Check className="w-4 h-4 text-sky-400 stroke-[3]" />
            <span>✓ RECOMMENDED: LEFT SIDE WINDOW (More shade)</span>
          </div>
        )}
        {isRightRecommended && (
          <div className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-sky-500/20 border border-sky-400/40 text-sky-300 font-bold text-sm shadow-lg backdrop-blur">
            <Check className="w-4 h-4 text-sky-400 stroke-[3]" />
            <span>✓ RECOMMENDED: RIGHT SIDE WINDOW (More shade)</span>
          </div>
        )}
        {isNoPreference && (
          <div className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 font-bold text-sm shadow-lg backdrop-blur">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>NO STRONG SIDE PREFERENCE</span>
          </div>
        )}
        {isNight && (
          <div className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 font-bold text-sm shadow-lg backdrop-blur">
            <span>NIGHT JOURNEY — ANY SEAT</span>
          </div>
        )}
      </div>

      {/* Main Bus Diagram Layout Container */}
      <div className="relative max-w-sm sm:max-w-md mx-auto my-8">

        {/* Dynamic Sunlight Indicator Icon outside the bus */}
        {!isNight && dominantSunSide !== 'BELOW_HORIZON' && (
          <div
            className={`absolute z-20 flex items-center space-x-1 text-amber-400 animate-pulse ${getSunPositionClasses()}`}
            title={`Sun is on the ${dominantSunSide}`}
          >
            <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center shadow-lg">
              <Sun className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-xl font-black text-amber-300">{getSunArrow()}</span>
          </div>
        )}

        {/* Direction of Travel Header Arrow */}
        <div className="flex flex-col items-center mb-3">
          <span className="text-xs font-black tracking-widest text-emerald-400 uppercase flex items-center gap-1">
            FRONT ↑ (Direction of Travel)
          </span>
        </div>

        {/* Bus Structure Container */}
        <div className="bg-slate-950/90 rounded-3xl p-4 sm:p-6 border-2 border-slate-700 shadow-2xl relative">
          
          {/* Driver Section */}
          <div className="bg-slate-800/80 rounded-2xl p-3 mb-4 text-center border border-slate-700 flex items-center justify-between px-4">
            <span className="text-xs font-bold text-slate-400 tracking-wider">FRONT</span>
            <div className="px-3 py-1 bg-slate-700/80 text-emerald-400 rounded-lg text-xs font-extrabold uppercase border border-slate-600">
              DRIVER 🚘
            </div>
            <span className="text-xs font-bold text-slate-400 tracking-wider">FRONT</span>
          </div>

          <div className="w-full h-px bg-slate-800 my-3" />

          {/* Seat Rows Grid */}
          <div className="grid grid-cols-11 gap-2 items-stretch text-center">
            
            {/* LEFT WINDOW SIDE (Cols 1-4) */}
            <div
              className={`col-span-4 rounded-2xl p-3 border transition-all ${
                isLeftRecommended
                  ? 'bg-sky-950/80 border-sky-400 shadow-lg shadow-sky-500/20 ring-2 ring-sky-400/60'
                  : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div className="text-[10px] sm:text-xs font-black uppercase text-sky-300 tracking-wider mb-2 flex items-center justify-center gap-1">
                <span>LEFT WINDOW</span>
              </div>

              {isLeftRecommended && (
                <div className="mb-2 px-2 py-0.5 rounded bg-sky-500 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                  ✓ RECOMMENDED
                </div>
              )}

              {/* 4 Rows of 2 Seats */}
              <div className="space-y-2.5 my-3">
                {[1, 2, 3, 4].map((row) => (
                  <div key={`left-row-${row}`} className="flex justify-center space-x-2">
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border-2 flex items-center justify-center transition-all ${
                        isLeftRecommended
                          ? 'bg-sky-500 border-sky-300 text-slate-950 font-bold shadow-md shadow-sky-500/30'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                      title={`Left Window Seat Row ${row}`}
                    >
                      <span className="text-xs">🪑</span>
                    </div>
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border-2 flex items-center justify-center transition-all ${
                        isLeftRecommended
                          ? 'bg-sky-500/80 border-sky-300 text-slate-950 font-bold'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                      title={`Left Aisle Seat Row ${row}`}
                    >
                      <span className="text-xs">🪑</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[11px] font-extrabold text-slate-300">SIDE</p>
            </div>

            {/* AISLE (Cols 5-7) */}
            <div className="col-span-3 flex flex-col justify-between py-2 border-x border-dashed border-slate-800">
              <span className="text-[10px] font-extrabold text-slate-500 tracking-widest uppercase writing-mode-vertical">
                AISLE
              </span>
              <div className="my-auto space-y-3 opacity-30 text-xs text-slate-600 font-bold">
                <div>↑</div>
                <div>↑</div>
                <div>↑</div>
              </div>
              <span className="text-[10px] font-extrabold text-slate-500 tracking-widest uppercase">
                AISLE
              </span>
            </div>

            {/* RIGHT WINDOW SIDE (Cols 8-11) */}
            <div
              className={`col-span-4 rounded-2xl p-3 border transition-all ${
                isRightRecommended
                  ? 'bg-sky-950/80 border-sky-400 shadow-lg shadow-sky-500/20 ring-2 ring-sky-400/60'
                  : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div className="text-[10px] sm:text-xs font-black uppercase text-sky-300 tracking-wider mb-2 flex items-center justify-center gap-1">
                <span>RIGHT WINDOW</span>
              </div>

              {isRightRecommended && (
                <div className="mb-2 px-2 py-0.5 rounded bg-sky-500 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                  ✓ RECOMMENDED
                </div>
              )}

              {/* 4 Rows of 2 Seats */}
              <div className="space-y-2.5 my-3">
                {[1, 2, 3, 4].map((row) => (
                  <div key={`right-row-${row}`} className="flex justify-center space-x-2">
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border-2 flex items-center justify-center transition-all ${
                        isRightRecommended
                          ? 'bg-sky-500/80 border-sky-300 text-slate-950 font-bold'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                      title={`Right Aisle Seat Row ${row}`}
                    >
                      <span className="text-xs">🪑</span>
                    </div>
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border-2 flex items-center justify-center transition-all ${
                        isRightRecommended
                          ? 'bg-sky-500 border-sky-300 text-slate-950 font-bold shadow-md shadow-sky-500/30'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                      title={`Right Window Seat Row ${row}`}
                    >
                      <span className="text-xs">🪑</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[11px] font-extrabold text-slate-300">SIDE</p>
            </div>

          </div>

          <div className="w-full h-px bg-slate-800 my-3" />

          {/* Back of Bus */}
          <div className="bg-slate-900 rounded-xl p-2 text-center text-xs font-extrabold text-slate-400 tracking-wider uppercase border border-slate-800">
            BACK ↓
          </div>
        </div>
      </div>

      {/* Side-by-Side Shade Percentages Comparison */}
      <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-800">
        <div
          className={`p-4 rounded-2xl border text-center transition-all ${
            isLeftRecommended
              ? 'bg-sky-950/60 border-sky-500/50'
              : 'bg-slate-800/40 border-slate-700/60'
          }`}
        >
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            LEFT WINDOW
          </span>
          <div className="text-2xl sm:text-3xl font-black text-white mt-1">
            Shade: {leftShadePercentage}%
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2 mt-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isLeftRecommended ? 'bg-sky-400' : 'bg-slate-500'
              }`}
              style={{ width: `${leftShadePercentage}%` }}
            />
          </div>
        </div>

        <div
          className={`p-4 rounded-2xl border text-center transition-all ${
            isRightRecommended
              ? 'bg-sky-950/60 border-sky-500/50'
              : 'bg-slate-800/40 border-slate-700/60'
          }`}
        >
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            RIGHT WINDOW
          </span>
          <div className="text-2xl sm:text-3xl font-black text-white mt-1">
            Shade: {rightShadePercentage}%
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2 mt-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isRightRecommended ? 'bg-sky-400' : 'bg-slate-500'
              }`}
              style={{ width: `${rightShadePercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Recommended Footer Summary */}
      <div className="mt-4 p-3 rounded-xl bg-slate-950 text-center border border-slate-800">
        <span className="text-xs text-slate-400 font-medium">RECOMMENDED WINDOW SEAT: </span>
        <span className="text-sm font-black text-amber-400 uppercase tracking-wide ml-1">
          {isNight
            ? 'ANY SEAT'
            : overallShadedSide === 'LEFT'
            ? 'LEFT WINDOW'
            : overallShadedSide === 'RIGHT'
            ? 'RIGHT WINDOW'
            : 'NO STRONG SIDE PREFERENCE'}
        </span>
      </div>
    </div>
  );
};
