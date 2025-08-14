import { Request, Response } from 'express';
import type { LeaveRequest } from '@prisma/client';
import { leaveRequestService } from '../services/leave-request.service';
import { z } from 'zod';

const leaveRequestSchema = z.object({
  leaveType: z.enum(['ANNUAL', 'SICK', 'UNPAID', 'OTHER']),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  reason: z.string().min(1),
});

export const createLeaveRequest = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const validatedData = leaveRequestSchema.parse(req.body);
    const userId = req.user.id; // Assuming user ID is attached to req.user by auth middleware
    const leaveRequestData = {
      ...validatedData,
      userId,
      userFirstName: req.user.firstName,
      userLastName: req.user.lastName,
    };
    const leaveRequest = await leaveRequestService.createLeaveRequest(leaveRequestData as any);
    res.status(201).json(leaveRequest);
  } catch (error) {
    if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
    }
    res.status(400).json({ error: (error as Error).message });
  }
};

export const cancelLeaveRequest = async (req: Request, res: Response) => {
  const { requestId } = req.params;
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const leaveRequest = await leaveRequestService.cancelLeaveRequest(requestId, req.user.id);
    res.status(200).json(leaveRequest);
  } catch (error) {
    res.status(404).json({ error: (error as Error).message });
  }
};
