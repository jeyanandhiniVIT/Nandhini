import { PrismaClient } from '@prisma/client';
import type { Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const createBillingRecord = async (data: Prisma.BillingRecordUncheckedCreateInput) => {
    return await prisma.billingRecord.create({
        data,
    });
};

export const getBillingRecords = async (userId: string) => {
    return await prisma.billingRecord.findMany({
        where: { userId },
    });
};

export const updateBillingRecord = async (id: string, data: Prisma.BillingRecordUpdateInput) => {
    return await prisma.billingRecord.update({
        where: { id },
        data,
    });
};

export const deleteBillingRecord = async (id: string) => {
    return await prisma.billingRecord.delete({
        where: { id },
    });
};

export const createBillingRecordDetail = async (data: Prisma.BillingRecordDetailUncheckedCreateInput) => {
    return await prisma.billingRecordDetail.create({
        data,
    });
};

export const getBillingRecordDetails = async (billingRecordId: string) => {
    return await prisma.billingRecordDetail.findMany({
        where: { billingRecordId },
    });
};
