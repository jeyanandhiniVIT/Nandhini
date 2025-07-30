import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth.middleware';
import { generate } from '../controllers/ai.controller';
import { validate } from '../middleware/validation.middleware';
import { aiRequestSchema } from '../validators/ai.validators';

const router = Router();

router.post('/generate-content', authenticateJWT, validate(aiRequestSchema), generate);

export default router;
