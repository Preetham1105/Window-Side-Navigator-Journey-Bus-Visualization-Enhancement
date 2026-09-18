import axios from 'axios';
import { GeocodeResult } from '../types';

const NOMINATIM_BASE_URL =
  process.env.NOMINATIM_BASE_URL || 'https://nominatim.openstreetmap.org';

export async function searchLocations(query: string): Promise<GeocodeResult[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  try {
    const response = await axios.get(`${NOMINATIM_BASE_URL}/search`, {
      params: {
        q: query.trim(),
        format: 'json',
        limit: 5,
        addressdetails: 1
      },
      headers: {
        'User-Agent': 'WindowSideNavigator/1.0 (contact: window-side-navigator)'
      },
      timeout: 5000
    });

    if (!Array.isArray(response.data)) {
      return [];
    }

    return response.data.map((item: any) => ({
      name: item.display_name ? item.display_name.split(',')[0].trim() : item.name || query,
      displayName: item.display_name || item.name || query,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon)
    }));
  } catch (error: any) {
    console.error('Nominatim Geocoding Error:', error?.message || error);
    throw new Error('Failed to fetch location suggestions. Please check network connection.');
  }
}
