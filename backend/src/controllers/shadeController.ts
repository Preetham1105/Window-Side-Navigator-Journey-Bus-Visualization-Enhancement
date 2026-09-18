import { Request, Response } from 'express';
import { JourneyRequest } from '../types';
import { fetchRoute } from '../services/routingService';
import { analyzeRouteShade } from '../services/shadeService';

export async function shadeAnalysisHandler(req: Request, res: Response): Promise<void> {
  try {
    const { start, destination, departureTime, expectedDurationMinutes }: JourneyRequest = req.body;

    if (!start || typeof start.lat !== 'number' || typeof start.lng !== 'number') {
      res.status(400).json({ success: false, error: 'Valid starting point location is required.' });
      return;
    }

    if (!destination || typeof destination.lat !== 'number' || typeof destination.lng !== 'number') {
      res.status(400).json({ success: false, error: 'Valid destination location is required.' });
      return;
    }

    if (start.lat === destination.lat && start.lng === destination.lng) {
      res.status(400).json({
        success: false,
        error: 'Starting point and destination location cannot be identical.'
      });
      return;
    }

    if (!departureTime || isNaN(new Date(departureTime).getTime())) {
      res.status(400).json({ success: false, error: 'Valid departure date and time is required.' });
      return;
    }

    // 1. Fetch driving route from OSRM
    const routeData = await fetchRoute(start.lat, start.lng, destination.lat, destination.lng);

    // 2. Use user-provided duration if valid, otherwise fallback to OSRM estimated duration
    const finalDuration =
      typeof expectedDurationMinutes === 'number' && expectedDurationMinutes > 0
        ? expectedDurationMinutes
        : routeData.durationMinutes;

    // 3. Perform astronomical shade analysis
    const analysis = analyzeRouteShade(
      routeData.coordinates,
      departureTime,
      finalDuration
    );

    res.json({
      success: true,
      data: {
        route: routeData,
        analysis
      }
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || 'Failed to analyze route shade.' });
  }
}
