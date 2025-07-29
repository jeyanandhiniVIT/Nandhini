import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const userCount = await prisma.user.count();
    const attendanceCount = await prisma.attendanceRecord.count({
      where: {
        date: new Date(),
        clockInTime: { not: undefined },
      },
    });
    const billingCount = await prisma.billingRecord.count();
    const leaveRequestCount = await prisma.leaveRequest.count({
      where: {
        status: 'PENDING',
      },
    });

    const dashboardData = {
      userCount,
      attendanceCount,
      billingCount,
      leaveRequestCount,
    };

    res.status(200).json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
