import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth.middleware';
import { validateWorkReport } from '../validators/work-report.validators';
import * as workReportController from '../controllers/work-report.controller';

const router = Router();

// GET /work-reports - Get all work reports for the logged-in user
router.get('/', authenticateJWT, workReportController.getWorkReportsByUser);

// GET /work-reports/:reportId - Get a single work report by ID
router.get('/:reportId', authenticateJWT, workReportController.getWorkReport);

// POST /work-reports - Create a new daily work report
router.post('/', authenticateJWT, validateWorkReport, workReportController.createWorkReport);

// PUT /work-reports/:reportId - Update an existing daily work report
router.put('/:reportId', authenticateJWT, validateWorkReport, workReportController.updateWorkReport);

// DELETE /work-reports/:reportId - Delete a work report by ID
router.delete('/:reportId', authenticateJWT, workReportController.deleteWorkReport);

export default router;
