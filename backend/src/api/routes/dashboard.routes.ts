import { Router } from 'express';
import { authenticateJWT, authorizeAdmin } from '../middleware/auth.middleware';
import { getDashboardData } from '../controllers/dashboard.controller';

const router = Router();

// Dashboard data aggregation routes
router.get('/admin', authenticateJWT, authorizeAdmin, getDashboardData);
// Assuming getDashboardData provides data for admin dashboard. Employee dashboard might need a separate controller function or adjustment.

export default router;
