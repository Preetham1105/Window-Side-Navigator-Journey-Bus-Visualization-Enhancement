import { Request, Response } from 'express';
import { searchLocations } from '../services/geocodingService';

export async function geocodeHandler(req: Request, res: Response): Promise<void> {
  try {
    const query = req.query.q as string;
    if (!query) {
      res.status(400).json({ success: false, error: 'Query parameter "q" is required.' });
      return;
    }

    const results = await searchLocations(query);
    res.json({ success: true, data: results });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Geocoding failed.' });
  }
}
