import { Router } from 'express';
import multer from 'multer';
import { uploadLogo, getLogo } from '../controllers/logo.controller';

const upload = multer({ dest: 'backend/uploads/' });
const router = Router();

router.post('/logo', upload.single('logo'), uploadLogo);
router.get('/logo', getLogo);

export default router;
