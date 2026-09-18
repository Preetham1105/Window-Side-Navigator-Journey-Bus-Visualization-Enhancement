import {
  ShadeAnalysis,
  ShadeSample,
  RecommendedShadeSide,
  SunSide,
  RouteComplexity,
  ShadeInterval
} from '../types';
import { calculateSunPosition } from './sunService';
import {
  sampleRouteCoordinates,
  calculateTotalDistanceKm,
  calculateRouteComplexity
} from '../utils/geo';

export const DECISION_THRESHOLD = 10; // 10 percentage point minimum difference required for recommendation

export function formatTimeHHMM(isoString: string): string {
  const d = new Date(isoString);
  let hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minutesStr = minutes < 10 ? '0' + minutes : minutes;
  return `${hours}:${minutesStr} ${ampm}`;
}

export function calculateShadedSide(sunSide: SunSide, isNight: boolean): RecommendedShadeSide {
  if (isNight || sunSide === 'BELOW_HORIZON') {
    return 'ANY_SEAT';
  }
  if (sunSide === 'LEFT') {
    return 'RIGHT';
  }
  if (sunSide === 'RIGHT') {
    return 'LEFT';
  }
  return 'LOW_SIDE_PREFERENCE';
}

export function computeShadeIntervals(samples: ShadeSample[]): {
  intervals: ShadeInterval[];
  changesCount: number;
} {
  const daytimeSamples = samples.filter((s) => !s.isNight);
  if (daytimeSamples.length === 0) {
    return { intervals: [], changesCount: 0 };
  }

  const intervals: ShadeInterval[] = [];
  let currentStart = daytimeSamples[0];
  let currentPrev = daytimeSamples[0];
  let changesCount = 0;

  for (let i = 1; i < daytimeSamples.length; i++) {
    const s = daytimeSamples[i];
    if (s.shadedSide !== currentPrev.shadedSide) {
      intervals.push({
        startMinutes: currentStart.minutesFromStart,
        endMinutes: currentPrev.minutesFromStart,
        startTimeFormatted: formatTimeHHMM(currentStart.timestamp),
        endTimeFormatted: formatTimeHHMM(currentPrev.timestamp),
        shadedSide: currentStart.shadedSide
      });

      if (
        (currentStart.shadedSide === 'LEFT' && s.shadedSide === 'RIGHT') ||
        (currentStart.shadedSide === 'RIGHT' && s.shadedSide === 'LEFT')
      ) {
        changesCount++;
      } else if (currentStart.shadedSide !== s.shadedSide) {
        changesCount++;
      }

      currentStart = s;
    }
    currentPrev = s;
  }

  intervals.push({
    startMinutes: currentStart.minutesFromStart,
    endMinutes: currentPrev.minutesFromStart,
    startTimeFormatted: formatTimeHHMM(currentStart.timestamp),
    endTimeFormatted: formatTimeHHMM(currentPrev.timestamp),
    shadedSide: currentStart.shadedSide
  });

  return { intervals, changesCount };
}

export function calculateOverallShadeRecommendation(
  samples: ShadeSample[]
): {
  overallShadedSide: RecommendedShadeSide;
  dominantSunSide: SunSide;
  isNight: boolean;
  leftShadePercentage: number;
  rightShadePercentage: number;
  shadeConfidence: number;
  shadeChangesCount: number;
  shadeIntervals: ShadeInterval[];
  decisionThreshold: number;
  counts: { left: number; right: number; frontOrBack: number; night: number };
  averageSunAltitude: number;
  averageSunAzimuth: number;
} {
  if (!samples || samples.length === 0) {
    return {
      overallShadedSide: 'ANY_SEAT',
      dominantSunSide: 'BELOW_HORIZON',
      isNight: true,
      leftShadePercentage: 0,
      rightShadePercentage: 0,
      shadeConfidence: 100,
      shadeChangesCount: 0,
      shadeIntervals: [],
      decisionThreshold: DECISION_THRESHOLD,
      counts: { left: 0, right: 0, frontOrBack: 0, night: 0 },
      averageSunAltitude: 0,
      averageSunAzimuth: 0
    };
  }

  let nightCount = 0;
  let leftShadeCount = 0; // Sun on RIGHT => Shade on LEFT
  let rightShadeCount = 0; // Sun on LEFT => Shade on RIGHT
  let frontOrBackCount = 0;
  let totalAltitude = 0;
  let totalAzimuth = 0;

  for (const sample of samples) {
    totalAltitude += sample.sunAltitude;
    totalAzimuth += sample.sunAzimuth;
    if (sample.isNight) {
      nightCount++;
    } else if (sample.shadedSide === 'LEFT') {
      leftShadeCount++;
    } else if (sample.shadedSide === 'RIGHT') {
      rightShadeCount++;
    } else {
      frontOrBackCount++;
    }
  }

  const averageSunAltitude = Math.round((totalAltitude / samples.length) * 10) / 10;
  const averageSunAzimuth = Math.round((totalAzimuth / samples.length) * 10) / 10;
  const counts = {
    left: leftShadeCount,
    right: rightShadeCount,
    frontOrBack: frontOrBackCount,
    night: nightCount
  };

  // If majority of samples are night (>= 50%)
  if (nightCount >= samples.length * 0.5) {
    return {
      overallShadedSide: 'ANY_SEAT',
      dominantSunSide: 'BELOW_HORIZON',
      isNight: true,
      leftShadePercentage: 0,
      rightShadePercentage: 0,
      shadeConfidence: 100,
      shadeChangesCount: 0,
      shadeIntervals: [],
      decisionThreshold: DECISION_THRESHOLD,
      counts,
      averageSunAltitude: Math.min(0, averageSunAltitude),
      averageSunAzimuth
    };
  }

  const daytimeTotal = samples.length - nightCount;
  const leftShadePercentage = Math.round((leftShadeCount / daytimeTotal) * 100);
  const rightShadePercentage = Math.round((rightShadeCount / daytimeTotal) * 100);
  const diff = Math.abs(leftShadePercentage - rightShadePercentage);

  let overallShadedSide: RecommendedShadeSide;
  let dominantSunSide: SunSide;
  let shadeConfidence: number;

  if (diff < DECISION_THRESHOLD) {
    overallShadedSide = 'LOW_SIDE_PREFERENCE';
    shadeConfidence = Math.max(leftShadePercentage, rightShadePercentage);
    if (leftShadeCount >= rightShadeCount) {
      dominantSunSide = leftShadeCount > 0 ? 'RIGHT' : 'FRONT';
    } else {
      dominantSunSide = 'LEFT';
    }
  } else if (leftShadePercentage > rightShadePercentage) {
    overallShadedSide = 'LEFT';
    dominantSunSide = 'RIGHT';
    shadeConfidence = leftShadePercentage;
  } else {
    overallShadedSide = 'RIGHT';
    dominantSunSide = 'LEFT';
    shadeConfidence = rightShadePercentage;
  }

  const { intervals, changesCount } = computeShadeIntervals(samples);

  return {
    overallShadedSide,
    dominantSunSide,
    isNight: false,
    leftShadePercentage,
    rightShadePercentage,
    shadeConfidence,
    shadeChangesCount: changesCount,
    shadeIntervals: intervals,
    decisionThreshold: DECISION_THRESHOLD,
    counts,
    averageSunAltitude,
    averageSunAzimuth
  };
}

export function analyzeRouteShade(
  coordinates: [number, number][],
  departureTimeISO: string,
  durationMinutes: number
): ShadeAnalysis {
  const departureDate = new Date(departureTimeISO);
  const validDate = isNaN(departureDate.getTime()) ? new Date() : departureDate;

  const totalDistanceKm = Math.round(calculateTotalDistanceKm(coordinates) * 10) / 10;
  const routeComplexity: RouteComplexity = calculateRouteComplexity(coordinates);

  const sampledPoints = sampleRouteCoordinates(coordinates, 2);

  const samples: ShadeSample[] = sampledPoints.map((pt, idx) => {
    const minutesFromStart = Math.round(pt.progressFraction * durationMinutes);
    const sampleTimestamp = new Date(validDate.getTime() + minutesFromStart * 60 * 1000);

    const sunPos = calculateSunPosition(sampleTimestamp, pt.lat, pt.lng, pt.vehicleBearing);
    const shadedSide = calculateShadedSide(sunPos.sunSide, sunPos.isNight);

    return {
      pointIndex: idx,
      minutesFromStart,
      timestamp: sampleTimestamp.toISOString(),
      lat: Math.round(pt.lat * 100000) / 100000,
      lng: Math.round(pt.lng * 100000) / 100000,
      vehicleBearing: pt.vehicleBearing,
      sunAzimuth: sunPos.azimuth,
      sunAltitude: sunPos.altitude,
      isNight: sunPos.isNight,
      sunSide: sunPos.sunSide,
      shadedSide
    };
  });

  const overall = calculateOverallShadeRecommendation(samples);

  return {
    overallShadedSide: overall.overallShadedSide,
    isNight: overall.isNight,
    dominantSunSide: overall.dominantSunSide,
    averageSunAltitude: overall.averageSunAltitude,
    averageSunAzimuth: overall.averageSunAzimuth,
    routeDistanceKm: totalDistanceKm,
    journeyDurationMinutes: Math.round(durationMinutes),
    routeComplexity,
    leftShadePercentage: overall.leftShadePercentage,
    rightShadePercentage: overall.rightShadePercentage,
    shadeConfidence: overall.shadeConfidence,
    shadeChangesCount: overall.shadeChangesCount,
    shadeIntervals: overall.shadeIntervals,
    decisionThreshold: overall.decisionThreshold,
    counts: overall.counts,
    samples
  };
}
