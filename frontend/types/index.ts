export interface Location {
  name: string;
  lat: number;
  lng: number;
  displayName?: string;
}

export type SunSide = 'LEFT' | 'RIGHT' | 'FRONT' | 'BACK' | 'BELOW_HORIZON';
export type RecommendedShadeSide = 'LEFT' | 'RIGHT' | 'LOW_SIDE_PREFERENCE' | 'ANY_SEAT';
export type RouteComplexity = 'Straight' | 'Mostly straight' | 'Curvy';

export interface ShadeSample {
  pointIndex: number;
  minutesFromStart: number;
  timestamp: string;
  lat: number;
  lng: number;
  vehicleBearing: number;
  sunAzimuth: number;
  sunAltitude: number;
  isNight: boolean;
  sunSide: SunSide;
  shadedSide: RecommendedShadeSide;
}

export interface ShadeInterval {
  startMinutes: number;
  endMinutes: number;
  startTimeFormatted: string;
  endTimeFormatted: string;
  shadedSide: RecommendedShadeSide;
}

export interface ShadeAnalysis {
  overallShadedSide: RecommendedShadeSide;
  isNight: boolean;
  dominantSunSide: SunSide;
  averageSunAltitude: number;
  averageSunAzimuth: number;
  routeDistanceKm: number;
  journeyDurationMinutes: number;
  routeComplexity: RouteComplexity;
  leftShadePercentage: number;
  rightShadePercentage: number;
  shadeConfidence: number;
  shadeChangesCount: number;
  shadeIntervals: ShadeInterval[];
  decisionThreshold: number;
  counts: {
    left: number;
    right: number;
    frontOrBack: number;
    night: number;
  };
  samples: ShadeSample[];
}

export interface RouteGeometry {
  coordinates: [number, number][]; // [lng, lat]
  distanceKm: number;
  durationMinutes: number;
}

export interface JourneyAnalysisResponse {
  route: RouteGeometry;
  analysis: ShadeAnalysis;
}

export interface GeocodeResult {
  name: string;
  displayName: string;
  lat: number;
  lng: number;
}
