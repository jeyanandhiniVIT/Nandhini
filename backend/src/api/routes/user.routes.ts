import { Router } from 'express';
import { authenticateJWT, authorizeAdmin, authorizeOwnerOrAdmin } from '../middleware/auth.middleware';
import { createUser, getUserById, updateUser, deleteUser, getAllUsers } from '../controllers/user.controller'; // Added getAllUsers, removed changePassword
import { createUserSchema, updateUserSchema, changePasswordSchema } from '../validators/user.validators';
import { validate } from '../middleware/validation.middleware';

const router = Router();

// User management routes
router.post('/', authenticateJWT, authorizeAdmin, validate(createUserSchema), createUser);
router.get('/', authenticateJWT, authorizeAdmin, getAllUsers); // Route to get all users (admin only)
router.get('/:userId', authenticateJWT, authorizeOwnerOrAdmin, getUserById);
router.put('/:userId', authenticateJWT, authorizeOwnerOrAdmin, validate(updateUserSchema), updateUser);
router.delete('/:userId', authenticateJWT, authorizeAdmin, deleteUser);
// If change password functionality is needed, a controller function for it needs to be implemented.
// router.post('/change-password', authenticateJWT, validate(changePasswordSchema), changePassword);

export default router;
