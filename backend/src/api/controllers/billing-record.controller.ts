import { Request, Response } from 'express';
import { z } from 'zod';
import * as billingService from '../services/billing.service';
import { createBillingRecordSchema, updateBillingRecordSchema } from '../validators/billing.validators';

export const createBillingRecord = async (req: Request, res: Response) => {
    try {
        const validatedData = createBillingRecordSchema.parse(req.body);
        const billingRecord = await billingService.createBillingRecord(validatedData);
        res.status(201).json(billingRecord);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(400).json({ error: (error as Error).message });
    }
};

export const getBillingRecords = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const userId = req.user.id;
        const billingRecords = await billingService.getBillingRecords(userId);
        res.status(200).json(billingRecords);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve billing records' });
    }
};

export const importBillingRecordsFromCSV = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded.' });
        }
        // const result = await billingService.importBillingRecordsFromCSV(req.file.path);
        // res.status(200).json(result);
        res.status(501).json({ error: 'Not implemented' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to import billing records' });
    }
};

export const updateBillingRecord = async (req: Request, res: Response) => {
    const { billingRecordId } = req.params;
    try {
        const validatedData = updateBillingRecordSchema.parse(req.body);
        const updatedRecord = await billingService.updateBillingRecord(billingRecordId, validatedData);
        res.status(200).json(updatedRecord);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(400).json({ error: (error as Error).message });
    }
};

export const deleteBillingRecord = async (req: Request, res: Response) => {
    const { billingRecordId } = req.params;
    try {
        await billingService.deleteBillingRecord(billingRecordId);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete billing record' });
    }
};
