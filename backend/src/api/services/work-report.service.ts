import { PrismaClient } from '@prisma/client';
import { DailyWorkReport, ProjectLogItem } from '@prisma/client';
import { z } from 'zod';
import { createWorkReportSchema, updateWorkReportSchema } from '../validators/work-report.validators';

const prisma = new PrismaClient();

export const createWorkReport = async (userId: string, data: any) => {
  const validatedData = createWorkReportSchema.parse(data);

  const projectLogItems = await Promise.all(validatedData.projectLogItems.map(async (item) => {
    const project = await prisma.project.findUnique({ where: { id: item.projectId } });
    if (!project) {
      throw new Error(`Project with id ${item.projectId} not found`);
    }
    return {
      ...item,
      projectName: project.name,
    };
  }));

  const dailyWorkReport = await prisma.dailyWorkReport.upsert({
    where: {
      userId_date: {
        userId,
        date: new Date(validatedData.date),
      },
    },
    create: {
      userId,
      date: new Date(validatedData.date),
      submittedAt: new Date(),
      projectLogItems: {
        create: projectLogItems,
      },
    },
    update: {
      projectLogItems: {
        deleteMany: {},
        create: projectLogItems,
      },
    },
  });

  return dailyWorkReport;
};

export const updateWorkReport = async (userId: string, reportId: string, data: any) => {
  const validatedData = updateWorkReportSchema.parse(data);

  const projectLogItems = await Promise.all(validatedData.projectLogItems.map(async (item) => {
    const project = await prisma.project.findUnique({ where: { id: item.projectId } });
    if (!project) {
      throw new Error(`Project with id ${item.projectId} not found`);
    }
    return {
      ...item,
      projectName: project.name,
    };
  }));

  const existingReport = await prisma.dailyWorkReport.findUnique({
    where: { id: reportId },
  });

  if (!existingReport || existingReport.userId !== userId) {
    throw new Error('Report not found or you do not have permission to update it.');
  }

  const updatedReport = await prisma.dailyWorkReport.update({
    where: { id: reportId },
    data: {
      projectLogItems: {
        deleteMany: {},
        create: projectLogItems,
      },
    },
  });

  return updatedReport;
};

export const getReport = async (reportId: string) => {
    return await prisma.dailyWorkReport.findUnique({
        where: { id: reportId },
        include: { projectLogItems: true },
    });
}

export const deleteReport = async (reportId: string) => {
    return await prisma.dailyWorkReport.delete({
        where: { id: reportId },
    });
}

export const getReportsByUser = async (userId: string) => {
    return await prisma.dailyWorkReport.findMany({
        where: { userId },
        include: { projectLogItems: true },
        orderBy: { date: 'desc' },
    });
};
