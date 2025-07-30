import { PrismaClient } from '@prisma/client';
import type { DailyWorkReport, LeaveRequest, AttendanceRecord } from '@prisma/client';

const prisma = new PrismaClient();

// This is a placeholder type. You should define this based on your actual data model.
export interface EmployeePeriodBillingSummary {
  userId: string;
  userName: string;
  // Add other fields as necessary
  details?: any[]; // Optional details
}

export const calculateBillingPeriod = async (startDate: Date, endDate: Date): Promise<EmployeePeriodBillingSummary[]> => {
  const users = await prisma.user.findMany();
  const summaries: EmployeePeriodBillingSummary[] = [];

  for (const user of users) {
    const dailyWorkReports = await prisma.dailyWorkReport.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        projectLogItems: true,
      },
    });

    const approvedLeaveRequests = await prisma.leaveRequest.findMany({
      where: {
        userId: user.id,
        status: 'APPROVED',
        startDate: {
          lte: endDate,
        },
        endDate: {
          gte: startDate,
        },
      },
    });

    const attendanceRecords = await prisma.attendanceRecord.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Perform calculations based on the fetched data
    const summary: EmployeePeriodBillingSummary = {
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      // Add more fields as necessary
    };

    summaries.push(summary);
  }

  return summaries;
};

export const finalizeBilling = async (userIds: string[], startDate: Date, endDate: Date) => {
  const summaryData = await calculateBillingPeriod(startDate, endDate);
  const filteredSummary = summaryData.filter(s => userIds.includes(s.userId));

  const operations = filteredSummary.flatMap(summary => {
    const billingRecordPromise = prisma.billingRecord.create({
      data: {
        userId: summary.userId,
        projectId: "default-project-id", // Placeholder
        projectName: "Default Project", // Placeholder
        clientName: "Default Client", // Placeholder
        calculatedAmount: 0, // Replace with actual calculation
        date: endDate,
        status: 'FINALIZED',
        billingPeriodStartDate: startDate,
        billingPeriodEndDate: endDate,
        isCountBased: false,
      },
    });

    const messagePromise = prisma.internalMessage.create({
      data: {
        recipientId: summary.userId,
        content: `Your billing for the period ${startDate.toDateString()} - ${endDate.toDateString()} has been finalized.`,
        senderId: 'system', // Or the admin user's ID
        senderName: 'System',
        timestamp: new Date(),
      },
    });
    return [billingRecordPromise, messagePromise];
  });

  return prisma.$transaction(operations);
};
