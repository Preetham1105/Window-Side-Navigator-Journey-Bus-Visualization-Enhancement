import { calculateBearing } from './bearing';
import { RouteComplexity } from '../types';

/**
 * Calculate distance between two coordinates in kilometers using Haversine formula
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate total route distance in kilometers from GeoJSON [lng, lat] coordinates
 */
export function calculateTotalDistanceKm(coordinates: [number, number][]): number {
  let totalKm = 0;
  for (let i = 0; i < coordinates.length - 1; i++) {
    const [lng1, lat1] = coordinates[i];
    const [lng2, lat2] = coordinates[i + 1];
    totalKm += haversineDistance(lat1, lng1, lat2, lng2);
  }
  return totalKm;
}

/**
 * Classify route complexity / bends based on bearing variation along the route
 */
export function calculateRouteComplexity(
  coordinates: [number, number][]
): RouteComplexity {
  if (coordinates.length < 3) return 'Straight';

  let totalAngleChange = 0;
  let segmentCount = 0;

  for (let i = 0; i < coordinates.length - 2; i += Math.max(1, Math.floor(coordinates.length / 30))) {
    const [lng1, lat1] = coordinates[i];
    const [lng2, lat2] = coordinates[i + 1];
    const [lng3, lat3] = coordinates[i + 2];

    const b1 = calculateBearing(lat1, lng1, lat2, lng2);
    const b2 = calculateBearing(lat2, lng2, lat3, lng3);

    let diff = Math.abs(b2 - b1);
    if (diff > 180) diff = 360 - diff;

    totalAngleChange += diff;
    segmentCount++;
  }

  const avgChangePerSegment = segmentCount > 0 ? totalAngleChange / segmentCount : 0;
  const totalDistance = calculateTotalDistanceKm(coordinates);

  // Normalize bend metric by total distance
  const bendIndex = totalDistance > 0 ? totalAngleChange / totalDistance : 0;

  if (bendIndex < 5 && avgChangePerSegment < 8) {
    return 'Straight';
  } else if (bendIndex < 15 && avgChangePerSegment < 20) {
    return 'Mostly straight';
  } else {
    return 'Curvy';
  }
}

export interface SampledPoint {
  index: number;
  lat: number;
  lng: number;
  vehicleBearing: number;
  progressFraction: number; // 0.0 to 1.0
}

/**
 * Sample route coordinates at regular distance intervals along the GeoJSON path
 */
export function sampleRouteCoordinates(
  coordinates: [number, number][],
  targetIntervalKm: number = 2
): SampledPoint[] {
  if (coordinates.length === 0) return [];
  if (coordinates.length === 1) {
    return [
      {
        index: 0,
        lat: coordinates[0][1],
        lng: coordinates[0][0],
        vehicleBearing: 0,
        progressFraction: 0
      }
    ];
  }

  const totalKm = calculateTotalDistanceKm(coordinates);

  // Determine ideal number of samples (at least 5 samples, max 30)
  const desiredCount = Math.max(5, Math.min(30, Math.ceil(totalKm / Math.max(1, targetIntervalKm))));
  const segmentTargetKm = totalKm / (desiredCount - 1);

  const samples: SampledPoint[] = [];
  let accumulatedKm = 0;
  let nextTargetKm = 0;
  let currentSegmentStartIndex = 0;

  for (let i = 0; i < coordinates.length - 1; i++) {
    const [lng1, lat1] = coordinates[i];
    const [lng2, lat2] = coordinates[i + 1];
    const segDist = haversineDistance(lat1, lng1, lat2, lng2);

    // Initial point
    if (i === 0) {
      const initialBearing = calculateBearing(lat1, lng1, lat2, lng2);
      samples.push({
        index: 0,
        lat: lat1,
        lng: lng1,
        vehicleBearing: initialBearing,
        progressFraction: 0
      });
      nextTargetKm += segmentTargetKm;
    }

    // Check if next target km falls within current coordinate segment
    while (
      accumulatedKm + segDist >= nextTargetKm &&
      samples.length < desiredCount - 1
    ) {
      const remainingDistanceInSeg = nextTargetKm - accumulatedKm;
      const ratio = segDist > 0 ? Math.min(1, Math.max(0, remainingDistanceInSeg / segDist)) : 0;

      const interpLat = lat1 + ratio * (lat2 - lat1);
      const interpLng = lng1 + ratio * (lng2 - lng1);
      const bearing = calculateBearing(lat1, lng1, lat2, lng2);

      samples.push({
        index: samples.length,
        lat: interpLat,
        lng: interpLng,
        vehicleBearing: bearing,
        progressFraction: totalKm > 0 ? nextTargetKm / totalKm : 0
      });

      nextTargetKm += segmentTargetKm;
    }

    accumulatedKm += segDist;
  }

  // Always include final destination point
  const lastCoord = coordinates[coordinates.length - 1];
  const secondLastCoord = coordinates[coordinates.length - 2] || coordinates[0];
  const finalBearing = calculateBearing(
    secondLastCoord[1],
    secondLastCoord[0],
    lastCoord[1],
    lastCoord[0]
  );

  samples.push({
    index: samples.length,
    lat: lastCoord[1],
    lng: lastCoord[0],
    vehicleBearing: finalBearing,
    progressFraction: 1.0
  });

  return samples;
}
