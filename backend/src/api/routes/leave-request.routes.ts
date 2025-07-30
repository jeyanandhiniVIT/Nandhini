import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth.middleware';
import { leaveRequestSchema, cancelLeaveRequestSchema } from '../validators/leave-request.validators';
import { validate } from '../middleware/validation.middleware';
import { createLeaveRequest, cancelLeaveRequest } from '../controllers/leave-request.controller';

const router = Router();

// Create a new leave request
router.post('/', authenticateJWT, validate(leaveRequestSchema), createLeaveRequest);

// Cancel a leave request
router.put('/:requestId/cancel', authenticateJWT, validate(cancelLeaveRequestSchema), cancelLeaveRequest);

export default router;
