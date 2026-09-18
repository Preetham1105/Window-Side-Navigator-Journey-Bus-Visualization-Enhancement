import { Request, Response } from 'express';
import { fetchRoute } from '../services/routingService';

export async function routeHandler(req: Request, res: Response): Promise<void> {
  try {
    const startLat = parseFloat(req.query.startLat as string);
    const startLng = parseFloat(req.query.startLng as string);
    const endLat = parseFloat(req.query.endLat as string);
    const endLng = parseFloat(req.query.endLng as string);

    if (isNaN(startLat) || isNaN(startLng) || isNaN(endLat) || isNaN(endLng)) {
      res.status(400).json({
        success: false,
        error: 'Missing or invalid coordinates (startLat, startLng, endLat, endLng).'
      });
      return;
    }

    const routeData = await fetchRoute(startLat, startLng, endLat, endLng);
    res.json({ success: true, data: routeData });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || 'Routing failed.' });
  }
}
