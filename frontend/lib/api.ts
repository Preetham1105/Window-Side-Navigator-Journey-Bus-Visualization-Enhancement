import axios from 'axios';
import { Location, GeocodeResult, JourneyAnalysisResponse } from '../types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

export async function searchLocationSuggestions(query: string): Promise<GeocodeResult[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    const response = await axios.get(`${API_BASE_URL}/geocode`, {
      params: { q: query.trim() }
    });

    if (response.data && response.data.success) {
      return response.data.data;
    }
    return [];
  } catch (error: any) {
    console.error('API Error searching locations:', error?.response?.data || error?.message);
    return [];
  }
}

export async function calculateJourneyShade(params: {
  start: Location;
  destination: Location;
  departureTime: string;
  expectedDurationMinutes?: number;
}): Promise<JourneyAnalysisResponse> {
  try {
    const response = await axios.post(`${API_BASE_URL}/shade/analyze`, params, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data && response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data?.error || 'Failed to analyze journey shade.');
    }
  } catch (error: any) {
    const msg =
      error.response?.data?.error ||
      error.message ||
      'Failed to communicate with calculation service.';
    throw new Error(msg);
  }
}
