import axios from 'axios';
import { RouteGeometry } from '../types';

const OSRM_BASE_URL = process.env.OSRM_BASE_URL || 'https://router.project-osrm.org';

export async function fetchRoute(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number
): Promise<RouteGeometry> {
  // Validate coordinates
  if (
    isNaN(startLat) ||
    isNaN(startLng) ||
    isNaN(endLat) ||
    isNaN(endLng)
  ) {
    throw new Error('Invalid coordinates provided.');
  }

  if (startLat === endLat && startLng === endLng) {
    throw new Error('Starting point and destination cannot be identical.');
  }

  try {
    const url = `${OSRM_BASE_URL}/route/v1/driving/${startLng},${startLat};${endLng},${endLat}`;
    const response = await axios.get(url, {
      params: {
        overview: 'full',
        geometries: 'geojson',
        steps: 'false'
      },
      timeout: 10000
    });

    if (
      !response.data ||
      response.data.code !== 'Ok' ||
      !response.data.routes ||
      response.data.routes.length === 0
    ) {
      throw new Error('No driving route found between these locations.');
    }

    const route = response.data.routes[0];
    const coordinates: [number, number][] = route.geometry.coordinates; // [lng, lat]
    const distanceMeters = route.distance || 0;
    const durationSeconds = route.duration || 0;

    const distanceKm = Math.round((distanceMeters / 1000) * 10) / 10;
    const durationMinutes = Math.max(1, Math.round(durationSeconds / 60));

    return {
      coordinates,
      distanceKm,
      durationMinutes
    };
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(`OSRM Error: ${error.response.data.message}`);
    }
    console.error('OSRM Routing Error:', error?.message || error);
    throw new Error('Failed to calculate road route between locations.');
  }
}
