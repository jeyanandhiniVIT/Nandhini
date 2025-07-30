import { Request, Response } from 'express';
import { generateContent as geminiGenerateContent } from '../services/gemini.service';
import { z } from 'zod';

const promptSchema = z.object({
  prompt: z.string().min(1, "Prompt cannot be empty"),
});

export const generate = async (req: Request, res: Response) => {
  try {
    const { prompt } = promptSchema.parse(req.body);
    const result = await geminiGenerateContent(prompt);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};
