import { z } from 'zod';

export const aiRequestSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
});

export const aiResponseSchema = z.object({
  generatedText: z.string(),
});
