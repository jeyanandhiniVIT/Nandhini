import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

export const uploadLogo = async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  // The file is already saved by multer middleware, so just return the path
  return res.json({ url: `/assets/logo.png` });
};

export const getLogo = (req: Request, res: Response) => {
  const logoPath = path.join(__dirname, '../../../../assets/logo.png');
  if (fs.existsSync(logoPath)) {
    res.sendFile(logoPath);
  } else {
    res.status(404).json({ error: 'Logo not found' });
  }
};
