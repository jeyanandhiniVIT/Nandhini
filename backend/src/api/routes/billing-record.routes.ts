import { Router } from 'express';
import { authenticateJWT, authorizeAdmin } from '../middleware/auth.middleware';
import { importBillingRecordsFromCSV, createBillingRecord, updateBillingRecord, deleteBillingRecord, getBillingRecords } from '../controllers/billing-record.controller';
import { importBillingRecordsSchema, createBillingRecordSchema, updateBillingRecordSchema } from '../validators/billing.validators';
import { validate } from '../middleware/validation.middleware';

const router = Router();

// Import billing records from CSV
router.post('/import-csv', authenticateJWT, authorizeAdmin, validate(importBillingRecordsSchema), importBillingRecordsFromCSV);

// Create a new billing record
router.post('/', authenticateJWT, authorizeAdmin, validate(createBillingRecordSchema), createBillingRecord);

// Update an existing billing record
router.put('/:billingRecordId', authenticateJWT, authorizeAdmin, validate(updateBillingRecordSchema), updateBillingRecord);

// Delete a billing record
router.delete('/:billingRecordId', authenticateJWT, authorizeAdmin, deleteBillingRecord);

// Get all billing records
router.get('/', authenticateJWT, authorizeAdmin, getBillingRecords);

export default router;
