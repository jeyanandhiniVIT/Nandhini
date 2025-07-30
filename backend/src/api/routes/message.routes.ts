import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth.middleware';
import { getMyMessages } from '../controllers/message.controller';

const router = Router();

// Route to get messages for the authenticated user
router.get('/my-messages', authenticateJWT, getMyMessages);

export default router;
