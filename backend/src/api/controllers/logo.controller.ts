import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

export const uploadLogo = async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  // Save the file to /assets or a public folder
  const logoPath = path.join(__dirname, '../../../../assets/logo.png');
  fs.rename(req.file.path, logoPath, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to save logo' });
    }
    return res.json({ url: '/assets/logo.png' });
  });
};

export const getLogo = (req: Request, res: Response) => {
  const logoPath = path.join(__dirname, '../../../../assets/logo.png');
  if (fs.existsSync(logoPath)) {
    res.sendFile(logoPath);
  } else {
    res.status(404).json({ error: 'Logo not found' });
  }
};
