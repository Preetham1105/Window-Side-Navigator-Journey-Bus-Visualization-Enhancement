import { Router } from 'express';
import { geocodeHandler } from '../controllers/geocodeController';
import { routeHandler } from '../controllers/routeController';
import { shadeAnalysisHandler } from '../controllers/shadeController';

const router = Router();

router.get('/geocode', geocodeHandler);
router.get('/route', routeHandler);
router.post('/shade/analyze', shadeAnalysisHandler);

export default router;
