import SunCalc from 'suncalc';
import { SunPosition, SunSide } from '../types';

/**
 * Calculate Sun azimuth and altitude for a given date, location, and vehicle bearing.
 *
 * SunCalc returns:
 *   azimuth: radians from South (0=South, pi/2=West, pi=North, -pi/2=East)
 *   altitude: radians above horizon
 *
 * Converted to standard geographic bearing (0=North, 90=East, 180=South, 270=West).
 */
export function calculateSunPosition(
  date: Date,
  lat: number,
  lng: number,
  vehicleBearing: number
): SunPosition {
  const suncalcPos = SunCalc.getPosition(date, lat, lng);

  const azimuthRad = suncalcPos.azimuth;
  const altitudeRad = suncalcPos.altitude;

  // Convert altitude to degrees
  const altitudeDeg = Math.round(((altitudeRad * 180) / Math.PI) * 10) / 10;

  // Convert azimuth to geographic bearing in degrees [0, 360)
  let azimuthDeg = (azimuthRad * 180) / Math.PI + 180;
  azimuthDeg = ((azimuthDeg % 360) + 360) % 360;
  azimuthDeg = Math.round(azimuthDeg * 10) / 10;

  const isNight = altitudeDeg <= 0;

  if (isNight) {
    return {
      azimuth: azimuthDeg,
      altitude: Math.min(0, altitudeDeg),
      isNight: true,
      sunSide: 'BELOW_HORIZON'
    };
  }

  // Calculate normalized angular difference: sunAzimuth - vehicleBearing (-180 to +180)
  let diff = azimuthDeg - vehicleBearing;
  while (diff > 180) diff -= 360;
  while (diff < -180) diff += 360;

  let sunSide: SunSide;
  if (diff >= -45 && diff <= 45) {
    sunSide = 'FRONT';
  } else if (diff > 45 && diff < 135) {
    sunSide = 'RIGHT';
  } else if (diff >= 135 || diff <= -135) {
    sunSide = 'BACK';
  } else {
    sunSide = 'LEFT'; // -135 to -45
  }

  return {
    azimuth: azimuthDeg,
    altitude: altitudeDeg,
    isNight: false,
    sunSide
  };
}
