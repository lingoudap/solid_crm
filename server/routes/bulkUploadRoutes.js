import express from 'express';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Models
import Lead from '../models/Leads.js';
import Quotation from '../models/Quotation.js';
import Customer from '../models/Customer.js';
import Order from '../models/Order.js';
import FollowUp from '../models/FollowUp.js';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '../uploads');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration
const upload = multer({
  dest: uploadsDir,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (!file.originalname.endsWith('.csv')) {
      cb(new Error('Only CSV files are allowed'));
    } else {
      cb(null, true);
    }
  },
});

// ============= MODULE CONFIGURATION =============
const moduleConfig = {
  lead: {
    name: 'Lead',
    model: Lead,
    required_fields: ['Name', 'Email', 'Phone', 'Address', 'State'],
    all_fields: ['Name', 'Email', 'Phone', 'Address', 'State', 'Company', 'Status', 'Source', 'Notes'],
    // Map CSV header labels -> model field keys
    fieldMap: {
      Name: 'name',
      Email: 'email',
      Phone: 'phone',
      Address: 'address',
      State: 'state',
      Company: 'company',
      Status: 'status',
      Source: 'Source',
      Notes: 'notes',
    },
  },
  quotation: {
    name: 'Quotation',
    model: Quotation,
    required_fields: ['CName', 'Amount'],
    all_fields: ['CName', 'Email', 'Phone', 'Address', 'State', 'Amount', 'Descr', 'Date'],
    fieldMap: {
      CName: 'customerName',
      Email: 'email',
      Phone: 'phone',
      Address: 'address',
      State: 'state',
      Amount: 'totalAmount',
      Descr: 'customFields',
      Date: 'date',
    },
  },
  customer: {
    name: 'Customer',
    model: Customer,
    required_fields: ['Name', 'Email', 'Phone', 'Address', 'State'],
    all_fields: ['Name', 'Email', 'Phone', 'Address', 'City', 'State', 'ZipCode'],
    fieldMap: {
      Name: 'name',
      Email: 'email',
      Phone: 'phone',
      Address: 'address',
      City: 'city',
      State: 'state',
      ZipCode: 'zipCode',
    },
  },
  order: {
    name: 'Order',
    model: Order,
    required_fields: ['CName', 'Amount', 'Item', 'Quantity'],
    all_fields: ['CName', 'Email', 'Phone', 'Item', 'Quantity', 'Amount', 'Date', 'Status', 'Notes'],
    fieldMap: {
      CName: 'name',
      Email: 'email',
      Phone: 'phone',
      Item: 'item',
      Quantity: 'quantity',
      Amount: 'amount',
      Date: 'createdAt',
      Status: 'status',
      Notes: 'notes',
    },
  },
  followup: {
    name: 'Follow-Up',
    model: FollowUp,
    required_fields: ['LeadID', 'FollowUpDate'],
    all_fields: ['LeadID', 'FollowUpDate', 'Notes', 'Status', 'Priority'],
    fieldMap: {
      LeadID: 'relatedId',
      FollowUpDate: 'followUpDate',
      Notes: 'notes',
      Status: 'status',
      Priority: 'priority',
    },
  },
};

// ============= BULK UPLOAD ENDPOINT =============
router.post('/bulk-upload/:module', upload.single('csvFile'), async (req, res) => {
  const selectedModule = req.params.module.toLowerCase();
  const filePath = req.file.path;

  // Validate module
  if (!moduleConfig[selectedModule]) {
    fs.unlinkSync(filePath);
    return res.status(400).json({ error: 'Invalid module selected.' });
  }

  const config = moduleConfig[selectedModule];
  let processed = 0;
  let failed = 0;
  let errors = [];
  let rows = [];

  try {
    // Parse CSV file; normalize headers to lowercase for robust matching
    fs.createReadStream(filePath)
      .pipe(csv({ mapHeaders: ({ header }) => (header ? header.trim().toLowerCase() : header) }))
      .on('data', (row) => {
        rows.push(row);
      })
      .on('end', async () => {
        try {
          // If no rows, return
          if (rows.length === 0) {
            fs.unlinkSync(filePath);
            return res.status(400).json({ error: 'CSV file contains no data.' });
          }

          // Validate headers: get lowercased headers from parsed rows
          const headers = Object.keys(rows[0]);
          const missingHeaders = config.required_fields.filter(
            (f) => !headers.includes(f.toLowerCase())
          );

          if (missingHeaders.length > 0) {
            fs.unlinkSync(filePath);
            return res.status(400).json({
              error: 'Missing required CSV headers',
              details: `Required headers missing: ${missingHeaders.join(', ')}`,
            });
          }

          // Process each row
          for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowNum = i + 2; // CSV row numbers (1-indexed + header)

            // Validate required fields per row (using lowercased keys)
            const missing = config.required_fields.filter((f) => {
              const key = f.toLowerCase();
              return !row[key] || (typeof row[key] === 'string' && row[key].trim() === '');
            });

            if (missing.length > 0) {
              failed++;
              errors.push(`Row ${rowNum}: Missing required fields: ${missing.join(', ')}`);
              continue;
            }

            // Validate email format (if present)
            if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
              failed++;
              errors.push(`Row ${rowNum}: Invalid email format: ${row.email}`);
              continue;
            }

            // Build object with valid fields mapping CSV headers to model keys
            const dataObject = {};
            config.all_fields.forEach((field) => {
              const csvKey = field.toLowerCase();
              const rawVal = row[csvKey];
              if (rawVal && typeof rawVal === 'string' && rawVal.trim() !== '') {
                const mappedKey = (config.fieldMap && config.fieldMap[field]) || field.toLowerCase();
                dataObject[mappedKey] = rawVal.trim();
              }
            });

            // Auto-fill date if missing
            // Auto-fill date fields (mapped keys)
            if (config.all_fields.includes('Date')) {
              const mapped = (config.fieldMap && config.fieldMap['Date']) || 'date';
              if (!dataObject[mapped] || dataObject[mapped] === '') {
                dataObject[mapped] = new Date().toISOString();
              }
            }
            if (config.all_fields.includes('FollowUpDate')) {
              const mapped = (config.fieldMap && config.fieldMap['FollowUpDate']) || 'followUpDate';
              if (!dataObject[mapped] || dataObject[mapped] === '') {
                dataObject[mapped] = new Date().toISOString();
              }
            }

            try {
              // Create and save document
              const newRecord = new config.model(dataObject);
              await newRecord.save();
              processed++;
            } catch (err) {
              failed++;
              errors.push(`Row ${rowNum}: ${err.message}`);
            }
          }

          // Clean up temporary file
          fs.unlinkSync(filePath);

          // Return success response
          return res.json({
            success: true,
            module: config.name,
            imported: processed,
            failed,
            errors: errors.slice(0, 100), // Limit errors to 100 for response size
          });
        } catch (err) {
          fs.unlinkSync(filePath);
          return res.status(500).json({
            error: 'Error processing file',
            details: err.message,
          });
        }
      })
      .on('error', (err) => {
        fs.unlinkSync(filePath);
        return res.status(400).json({
          error: 'Error parsing CSV file',
          details: err.message,
        });
      });
  } catch (err) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return res.status(500).json({
      error: 'Server error',
      details: err.message,
    });
  }
});

// ============= DOWNLOAD TEMPLATE ENDPOINT =============
const sendTemplate = (req, res) => {
  const selectedModule = req.params.module.toLowerCase();

  if (!moduleConfig[selectedModule]) {
    return res.status(400).json({ error: 'Invalid module selected.' });
  }

  const config = moduleConfig[selectedModule];
  const headers = config.all_fields.join(',');
  const filename = `${selectedModule}_template.csv`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(headers);
};

// Support both paths for backward compatibility:
router.get('/download-template/:module', sendTemplate);
router.get('/bulk-upload/download-template/:module', sendTemplate);

export default router;
