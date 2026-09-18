export interface Location {
  name: string;
  lat: number;
  lng: number;
}

export type SunSide = 'LEFT' | 'RIGHT' | 'FRONT' | 'BACK' | 'BELOW_HORIZON';
export type RecommendedShadeSide = 'LEFT' | 'RIGHT' | 'LOW_SIDE_PREFERENCE' | 'ANY_SEAT';
export type RouteComplexity = 'Straight' | 'Mostly straight' | 'Curvy';

export interface SunPosition {
  azimuth: number; // geographic bearing 0-360 deg
  altitude: number; // degrees above/below horizon
  isNight: boolean;
  sunSide: SunSide;
}

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

export interface JourneyRequest {
  start: Location;
  destination: Location;
  departureTime: string; // ISO string
  expectedDurationMinutes?: number;
}

export interface RouteGeometry {
  coordinates: [number, number][]; // [lng, lat] pairs as returned by OSRM GeoJSON
  distanceKm: number;
  durationMinutes: number;
}

export interface GeocodeResult {
  name: string;
  displayName: string;
  lat: number;
  lng: number;
}
