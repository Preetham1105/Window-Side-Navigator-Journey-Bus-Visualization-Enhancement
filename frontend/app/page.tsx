'use client';

import React, { useState, useRef } from 'react';
import { Header } from '../components/Header';
import { RoutePlanner } from '../components/RoutePlanner';
import { MapView } from '../components/MapView';
import { ShadeReport } from '../components/ShadeReport';
import { JourneyTimeline } from '../components/JourneyTimeline';
import { RouteComplexity } from '../components/RouteComplexity';
import { Location, JourneyAnalysisResponse } from '../types';
import { calculateJourneyShade } from '../lib/api';
import { ArrowUpRight } from 'lucide-react';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeStart, setActiveStart] = useState<Location | null>(null);
  const [activeDestination, setActiveDestination] = useState<Location | null>(null);
  const [analysisResult, setAnalysisResult] = useState<JourneyAnalysisResponse | null>(null);

  const plannerRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleAnalyzeJourney = async (params: {
    start: Location;
    destination: Location;
    departureTime: string;
    expectedDurationMinutes?: number;
  }) => {
    setIsLoading(true);
    setErrorMessage(null);
    setActiveStart(params.start);
    setActiveDestination(params.destination);

    try {
      const response = await calculateJourneyShade(params);
      setAnalysisResult(response);

      // Smooth scroll to results on completion
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to calculate shade recommendation.');
      setAnalysisResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPlanner = () => {
    plannerRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen pb-16 px-4 sm:px-6 lg:px-8">
      <Header />

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Planner and Map Grid */}
        <div ref={plannerRef} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className={`${analysisResult ? 'lg:col-span-5' : 'lg:col-span-12 max-w-3xl mx-auto w-full'} transition-all`}>
            <RoutePlanner
              onAnalyze={handleAnalyzeJourney}
              isLoading={isLoading}
              errorMessage={errorMessage}
            />
          </div>

          {analysisResult && activeStart && activeDestination && (
            <div className="lg:col-span-7 space-y-6">
              <MapView
                start={activeStart}
                destination={activeDestination}
                route={analysisResult.route}
                samples={analysisResult.analysis.samples}
              />
            </div>
          )}
        </div>

        {/* Detailed Analysis Section */}
        {analysisResult && activeStart && activeDestination && (
          <div ref={resultsRef} className="space-y-8 pt-4 border-t border-slate-200/60">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Journey Analysis</h2>
              <button
                type="button"
                onClick={handleResetPlanner}
                className="inline-flex items-center space-x-1 text-sm font-bold text-amber-600 hover:text-amber-700 transition-colors"
              >
                <span>Plan another journey</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            <ShadeReport analysis={analysisResult.analysis} />

            <JourneyTimeline
              samples={analysisResult.analysis.samples}
              start={activeStart}
              destination={activeDestination}
            />

            <RouteComplexity
              complexity={analysisResult.analysis.routeComplexity}
              distanceKm={analysisResult.analysis.routeDistanceKm}
            />
          </div>
        )}
      </div>
    </div>
  );
}
