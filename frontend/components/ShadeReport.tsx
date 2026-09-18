'use client';

import React from 'react';
import { ShadeAnalysis } from '../types';
import { BusSeatDiagram } from './BusSeatDiagram';
import { Sun, Moon, ArrowLeft, ArrowRight, ShieldCheck, Compass, Navigation, Clock, Info, RefreshCw, Award } from 'lucide-react';

interface ShadeReportProps {
  analysis: ShadeAnalysis;
}

export const ShadeReport: React.FC<ShadeReportProps> = ({ analysis }) => {
  const {
    overallShadedSide,
    isNight,
    dominantSunSide,
    averageSunAltitude,
    routeDistanceKm,
    journeyDurationMinutes,
    leftShadePercentage = 0,
    rightShadePercentage = 0,
    shadeConfidence = 100,
    shadeChangesCount = 0
  } = analysis;

  if (isNight) {
    return (
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 space-y-6">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
            <Moon className="w-3.5 h-3.5" />
            <span>Night journey</span>
          </span>
          <span className="text-slate-400 text-sm font-medium">No direct sunlight</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">SHADE REPORT</h2>

        <div className="p-6 rounded-2xl bg-indigo-950/60 border border-indigo-800/40 text-center">
          <div className="w-12 h-12 rounded-full bg-indigo-900/80 mx-auto flex items-center justify-center text-indigo-300 mb-3 shadow-inner">
            <Moon className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-indigo-100">It's dark out there.</h3>
          <p className="text-sm text-indigo-300/80 mt-1">No sun exposure expected for this journey.</p>

          <div className="mt-5 py-3 px-6 rounded-xl bg-indigo-900/40 border border-indigo-700/50 inline-block">
            <p className="text-xl font-extrabold text-white tracking-wide">
              ANY SEAT WILL DO
            </p>
          </div>
        </div>

        <BusSeatDiagram
          overallShadedSide="ANY_SEAT"
          leftShadePercentage={0}
          rightShadePercentage={0}
          dominantSunSide="BELOW_HORIZON"
          isNight={true}
        />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-850/80 border border-slate-800">
            <p className="text-xs text-slate-400 font-medium">Sun direction</p>
            <p className="text-lg font-bold text-slate-100 mt-1">Below horizon</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-850/80 border border-slate-800">
            <p className="text-xs text-slate-400 font-medium">Sun altitude</p>
            <p className="text-lg font-bold text-slate-100 mt-1">0°</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-850/80 border border-slate-800">
            <p className="text-xs text-slate-400 font-medium">Route</p>
            <p className="text-lg font-bold text-slate-100 mt-1">{routeDistanceKm} km</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-850/80 border border-slate-800">
            <p className="text-xs text-slate-400 font-medium">Journey</p>
            <p className="text-lg font-bold text-slate-100 mt-1">{journeyDurationMinutes} min</p>
          </div>
        </div>

        {/* User Explanation Notice */}
        <div className="flex items-start space-x-3 p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-medium">
          <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <p>
            Left and right are determined from the bus's direction of travel, not from the map screen.
          </p>
        </div>
      </div>
    );
  }

  // Daytime Report
  const getShadeTitle = () => {
    if (overallShadedSide === 'LEFT') return 'LEFT WINDOW RECOMMENDED';
    if (overallShadedSide === 'RIGHT') return 'RIGHT WINDOW RECOMMENDED';
    return 'NO STRONG SIDE PREFERENCE';
  };

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50/40 rounded-3xl p-6 sm:p-8 shadow-xl border border-amber-200/80 space-y-6">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 text-xs font-semibold uppercase tracking-wider">
          <Sun className="w-3.5 h-3.5 text-amber-500" />
          <span>Daylight Journey</span>
        </span>
        <span className="text-amber-800/60 text-xs font-medium">Astronomical Sun position</span>
      </div>

      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">SHADE REPORT</h2>

      {/* Main Overall Shade Result Card */}
      <div className="p-6 rounded-2xl bg-white/90 backdrop-blur border border-amber-200 shadow-md">
        <div className="text-center pb-4 border-b border-amber-100">
          <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">Recommended Window</p>
          
          <div className="flex items-center justify-center space-x-3 my-2">
            {overallShadedSide === 'LEFT' && (
              <div className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-md">
                <ArrowLeft className="w-5 h-5" />
              </div>
            )}
            {overallShadedSide === 'RIGHT' && (
              <div className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-md">
                <ArrowRight className="w-5 h-5" />
              </div>
            )}
            {overallShadedSide === 'LOW_SIDE_PREFERENCE' && (
              <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-md">
                <ShieldCheck className="w-5 h-5" />
              </div>
            )}
            <h3 className="text-3xl font-black text-slate-900">
              {overallShadedSide === 'LEFT'
                ? 'LEFT WINDOW'
                : overallShadedSide === 'RIGHT'
                ? 'RIGHT WINDOW'
                : 'NO STRONG PREFERENCE'}
            </h3>
          </div>

          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
            ✓ {getShadeTitle()}
          </p>
        </div>

        {/* Shade Percentage & Confidence Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-2">
          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 text-center">
            <span className="text-xs text-slate-500 font-medium">Left-side shade</span>
            <p className="text-xl font-black text-slate-900 mt-0.5">{leftShadePercentage}%</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 text-center">
            <span className="text-xs text-slate-500 font-medium">Right-side shade</span>
            <p className="text-xl font-black text-slate-900 mt-0.5">{rightShadePercentage}%</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 text-center">
            <div className="flex items-center justify-center space-x-1 text-slate-500 text-xs font-medium">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>Shade confidence</span>
            </div>
            <p className="text-xl font-black text-emerald-600 mt-0.5">{shadeConfidence}%</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 text-center">
            <div className="flex items-center justify-center space-x-1 text-slate-500 text-xs font-medium">
              <RefreshCw className="w-3.5 h-3.5 text-amber-500" />
              <span>Shade changes</span>
            </div>
            <p className="text-xl font-black text-slate-900 mt-0.5">
              {shadeChangesCount} {shadeChangesCount === 1 ? 'time' : 'times'}
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 italic mt-4 pt-3 border-t border-slate-100">
          Based on the calculated sun position along your route.
        </p>
      </div>

      {/* Embedded Bus Seat Visualization Component */}
      <BusSeatDiagram
        overallShadedSide={overallShadedSide}
        leftShadePercentage={leftShadePercentage}
        rightShadePercentage={rightShadePercentage}
        dominantSunSide={dominantSunSide}
        isNight={false}
      />

      {/* Additional Route Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white/80 border border-amber-100 shadow-sm">
          <div className="flex items-center space-x-1.5 text-slate-500 text-xs font-medium">
            <Compass className="w-3.5 h-3.5 text-amber-500" />
            <span>Sun direction</span>
          </div>
          <p className="text-lg font-bold text-slate-900 mt-1">{dominantSunSide}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white/80 border border-amber-100 shadow-sm">
          <div className="flex items-center space-x-1.5 text-slate-500 text-xs font-medium">
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>Sun altitude</span>
          </div>
          <p className="text-lg font-bold text-slate-900 mt-1">{averageSunAltitude}°</p>
        </div>

        <div className="p-4 rounded-2xl bg-white/80 border border-amber-100 shadow-sm">
          <div className="flex items-center space-x-1.5 text-slate-500 text-xs font-medium">
            <Navigation className="w-3.5 h-3.5 text-amber-500" />
            <span>Route</span>
          </div>
          <p className="text-lg font-bold text-slate-900 mt-1">{routeDistanceKm} km</p>
        </div>

        <div className="p-4 rounded-2xl bg-white/80 border border-amber-100 shadow-sm">
          <div className="flex items-center space-x-1.5 text-slate-500 text-xs font-medium">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Journey</span>
          </div>
          <p className="text-lg font-bold text-slate-900 mt-1">{journeyDurationMinutes} min</p>
        </div>
      </div>

      {/* Requirement 12 User Explanation Banner */}
      <div className="flex items-start space-x-3 p-4 rounded-2xl bg-amber-100/60 border border-amber-200 text-amber-900 text-xs font-medium shadow-sm">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-amber-950">Important Orientation Notice:</p>
          <p className="mt-0.5 text-amber-800">
            Left and right are determined from the bus's direction of travel, not from the map screen.
          </p>
        </div>
      </div>
    </div>
  );
};

