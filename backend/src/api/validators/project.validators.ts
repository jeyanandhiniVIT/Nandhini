import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(255, 'Project name must be less than 255 characters'),
  billingType: z.enum(['hourly', 'count_based']),
  ratePerHour: z.number().optional(),
  countMetricLabel: z.string().optional(),
  countDivisor: z.number().int().min(1).optional(),
  countMultiplier: z.number().optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(255, 'Project name must be less than 255 characters').optional(),
  billingType: z.enum(['hourly', 'count_based']).optional(),
  ratePerHour: z.number().optional(),
  countMetricLabel: z.string().optional(),
  countDivisor: z.number().int().min(1).optional(),
  countMultiplier: z.number().optional(),
});

export const projectIdSchema = z.object({
  projectId: z.string().uuid('Invalid project ID format'),
});