import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';

const router = Router();

// Get trending confessions and analytics
router.get('/trending', AnalyticsController.getTrending);

export default router