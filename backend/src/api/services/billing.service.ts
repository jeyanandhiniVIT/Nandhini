import { PrismaClient } from '@prisma/client';
import { BillingRecord, BillingRecordDetail } from '@prisma/client';
import { InternalMessage } from '@prisma/client';
import { User } from '@prisma/client';
import { Project } from '@prisma/client';

const prisma = new PrismaClient();

export const createBillingRecord = async (data: BillingRecord) => {
    return await prisma.billingRecord.create({
        data,
    });
};

export const getBillingRecords = async (userId: string) => {
    return await prisma.billingRecord.findMany({
        where: { userId },
    });
};

export const updateBillingRecord = async (id: string, data: Partial<BillingRecord>) => {
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

export const createBillingRecordDetail = async (data: BillingRecordDetail) => {
    return await prisma.billingRecordDetail.create({
        data,
    });
};

export const getBillingRecordDetails = async (billingRecordId: string) => {
    return await prisma.billingRecordDetail.findMany({
        where: { billingRecordId },
    });
};

export const finalizeBillingPeriod = async (billingData: any) => {
    const { userId, projectId, ...rest } = billingData;

    const billingRecord = await createBillingRecord({
        userId,
        projectId,
        ...rest,
    });

    // Create details if needed
    if (billingData.details) {
        await Promise.all(
            billingData.details.map((detail: any) => createBillingRecordDetail({
                billingRecordId: billingRecord.id,
                ...detail,
            }))
        );
    }

    // Send internal message to user
    await prisma.internalMessage.create({
        data: {
            senderId: null, // SYSTEM
            senderName: 'SYSTEM',
            recipientId: userId,
            content: `Your billing record for project ${projectId} has been finalized.`,
            timestamp: new Date(),
        },
    });

    return billingRecord;
};