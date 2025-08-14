import { Request, Response } from 'express';
import { z } from 'zod';
import * as workReportService from '../services/work-report.service';
import { createWorkReportSchema, updateWorkReportSchema } from '../validators/work-report.validators';

export const createWorkReport = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const validatedData = createWorkReportSchema.parse(req.body);
        const userId = req.user.id; // Assuming user ID is attached to req.user by auth middleware
        const report = await workReportService.createWorkReport(userId, validatedData);
        res.status(201).json(report);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(400).json({ error: (error as Error).message });
    }
};

export const updateWorkReport = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const reportId = req.params.reportId;
        const validatedData = updateWorkReportSchema.parse(req.body);
        const updatedReport = await workReportService.updateWorkReport(req.user.id, reportId, validatedData);
        res.status(200).json(updatedReport);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(400).json({ error: (error as Error).message });
    }
};

export const getWorkReport = async (req: Request, res: Response) => {
    try {
        const reportId = req.params.reportId;
        const report = await workReportService.getReport(reportId);
        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }
        res.status(200).json(report);
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
};

export const deleteWorkReport = async (req: Request, res: Response) => {
    try {
        const reportId = req.params.reportId;
        await workReportService.deleteReport(reportId);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
};

export const getWorkReportsByUser = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const userId = req.user.id;
        const reports = await workReportService.getReportsByUser(userId);
        res.status(200).json(reports);
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
};
