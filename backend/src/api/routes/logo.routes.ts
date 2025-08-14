import { Router } from 'express';
import { uploadLogoFile } from '../../utils/imageUpload';
import { uploadLogo, getLogo } from '../controllers/logo.controller';

const router = Router();

router.post('/logo', uploadLogoFile, uploadLogo);
router.get('/logo', getLogo);

export default router;
