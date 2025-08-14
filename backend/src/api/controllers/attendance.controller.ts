import { Request, Response } from 'express';
import * as attendanceService from '../services/attendance.service';

export const AttendanceController = {
  clockIn: async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
      const userId = req.user.id;
      const { date, clockInTime } = req.body;
      const attendanceRecord = await attendanceService.clockIn(userId, date, clockInTime);
      res.status(201).json(attendanceRecord);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  },

  clockOut: async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
      const userId = req.user.id;
      const { date, clockOutTime } = req.body;
      const attendanceRecord = await attendanceService.clockOut(userId, date, clockOutTime);
      res.status(200).json(attendanceRecord);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  },

  getStatus: async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
      const userId = req.user.id;
      const status = await attendanceService.getAttendanceStatus(userId);
      res.status(200).json(status);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  },
};
