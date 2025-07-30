import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
import type { User } from '@prisma/client'; // Import User model type

export const getDashboardData = async () => {
  const totalUsers = await prisma.user.count();
  const totalAttendanceRecords = await prisma.attendanceRecord.count();
  const totalBillingRecords = await prisma.billingRecord.count();
  
  const today = new Date();
  const totalClockInsToday = await prisma.attendanceRecord.count({
    where: {
      date: today,
      clockInTime: {
        not: undefined,
      },
    },
  });

  return {
    totalUsers,
    totalAttendanceRecords,
    totalBillingRecords,
    totalClockInsToday,
  };
};
