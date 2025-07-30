import { Router } from 'express';
import { authenticateJWT, authorizeAdmin } from '../middleware/auth.middleware';
import { createProject, getAllProjects, getProjectById, updateProject, deleteProject } from '../controllers/project.controller';
import { createProjectSchema, updateProjectSchema } from '../validators/project.validators';
import { validate } from '../middleware/validation.middleware';

const router = Router();

// Admin only routes
router.post('/', authenticateJWT, authorizeAdmin, validate(createProjectSchema), createProject);
router.get('/', authenticateJWT, getAllProjects);
router.get('/:projectId', authenticateJWT, getProjectById);
router.put('/:projectId', authenticateJWT, authorizeAdmin, validate(updateProjectSchema), updateProject);
router.delete('/:projectId', authenticateJWT, authorizeAdmin, deleteProject);

export default router;
