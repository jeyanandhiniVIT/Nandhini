import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth.middleware';
import { clockInSchema, clockOutSchema } from '../validators/attendance.validators';
import { AttendanceController } from '../controllers/attendance.controller';
import { validate } from '../middleware/validation.middleware';

const router = Router();

// Clock In
router.post('/clock-in', authenticateJWT, validate(clockInSchema), AttendanceController.clockIn);

// Clock Out
router.post('/clock-out', authenticateJWT, validate(clockOutSchema), AttendanceController.clockOut);

// Get Attendance Status
router.get('/status/me', authenticateJWT, AttendanceController.getStatus);

export default router;
