import { Router } from 'express';
import { authenticateJWT, authorizeAdmin } from '../middleware/auth.middleware';
import { calculate, finalize } from '../controllers/billing-calculator.controller';
import { calculateBillingSchema, finalizeBillingSchema } from '../validators/billing-calculator.validators';
import { validate } from '../middleware/validation.middleware';

const router = Router();

// Route to calculate billing for a period
router.post('/calculate', authenticateJWT, authorizeAdmin, validate(calculateBillingSchema), calculate);

// Route to finalize billing for a period
router.post('/finalize', authenticateJWT, authorizeAdmin, validate(finalizeBillingSchema), finalize);

export default router;
