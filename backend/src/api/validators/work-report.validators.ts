import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const createWorkReportSchema = z.object({
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
  projectLogItems: z.array(z.object({
    projectId: z.string().uuid(),
    hoursWorked: z.number().positive(),
    description: z.string().max(500),
    achievedCount: z.number().optional(),
  })).nonempty(),
});

export const updateWorkReportSchema = z.object({
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
  projectLogItems: z.array(z.object({
    projectId: z.string().uuid(),
    hoursWorked: z.number().positive(),
    description: z.string().max(500),
    achievedCount: z.number().optional(),
  })).nonempty(),
});

export const validateWorkReport = (req: Request, res: Response, next: NextFunction) => {
    const schema = req.method === 'POST' ? createWorkReportSchema : updateWorkReportSchema;
    try {
        schema.parse(req.body);
        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        next(error);
    }
};
