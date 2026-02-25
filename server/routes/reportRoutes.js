import express from 'express';
import Report from '../models/Report.js';
import Order from '../models/Order.js';
import Quotation from '../models/Quotation.js';
import Lead from '../models/Leads.js';
import Customer from '../models/Customer.js';

const router = express.Router();

// Get all reports for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const reports = await Report.find({ userId }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single report
router.get('/:reportId', async (req, res) => {
  try {
    const report = await Report.findById(req.params.reportId);
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new report
router.post('/create', async (req, res) => {
  try {
    const { userId, reportName, reportType, filters, selectedFields, groupBy, includeGraphs, graphType, description } = req.body;

    const newReport = new Report({
      userId,
      reportName,
      reportType,
      description,
      filters,
      selectedFields: selectedFields || [],
      groupBy: groupBy || null,
      includeGraphs: includeGraphs !== false,
      graphType: graphType || 'bar'
    });

    await newReport.save();
    
    // Generate report data
    const data = await generateReportData(reportType, filters, selectedFields, groupBy);
    newReport.generatedData = data;
    newReport.generatedAt = new Date();
    newReport.lastGeneratedAt = new Date();
    
    await newReport.save();
    res.status(201).json(newReport);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update report
router.put('/:reportId', async (req, res) => {
  try {
    const { reportId } = req.params;
    const updateData = req.body;
    
    const report = await Report.findByIdAndUpdate(reportId, updateData, { new: true });
    
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate/Regenerate report data
router.post('/:reportId/generate', async (req, res) => {
  try {
    const { reportId } = req.params;
    const report = await Report.findById(reportId);
    
    if (!report) return res.status(404).json({ error: 'Report not found' });

    const data = await generateReportData(report.reportType, report.filters, report.selectedFields, report.groupBy);
    report.generatedData = data;
    report.generatedAt = new Date();
    report.lastGeneratedAt = new Date();
    
    await report.save();
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete report
router.delete('/:reportId', async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.reportId);
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save report as template
router.post('/:reportId/template', async (req, res) => {
  try {
    const { reportId } = req.params;
    const { templateName } = req.body;
    
    const report = await Report.findByIdAndUpdate(
      reportId,
      { isTemplate: true, templateName },
      { new: true }
    );
    
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get templates
router.get('/templates/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const templates = await Report.find({ userId, isTemplate: true });
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to generate report data
async function generateReportData(reportType, filters = {}, selectedFields = [], groupBy = null) {
  let data = [];

  try {
    const query = buildQuery(filters);

    switch (reportType) {
      case 'sales-summary':
        data = await generateSalesSummary(query, groupBy);
        break;
      case 'item-wise':
        data = await generateItemWiseReport(query);
        break;
      case 'customer-wise':
        data = await generateCustomerWiseReport(query);
        break;
      case 'date-wise':
        data = await generateDateWiseReport(query);
        break;
      case 'lead-conversion':
        data = await generateLeadConversionReport(query);
        break;
      case 'quotation-status':
        data = await generateQuotationStatusReport(query);
        break;
      default:
        data = [];
    }

    // Filter selected fields
    if (selectedFields.length > 0) {
      data = data.map(item => {
        const filtered = {};
        selectedFields.forEach(field => {
          if (item.hasOwnProperty(field)) {
            filtered[field] = item[field];
          }
        });
        return filtered;
      });
    }

    return {
      type: reportType,
      count: data.length,
      data: data,
      generatedAt: new Date()
    };
  } catch (error) {
    console.error('Error generating report data:', error);
    return { error: error.message, data: [] };
  }
}

// Build MongoDB query from filters
function buildQuery(filters) {
  let query = {};

  if (filters.dateFrom || filters.dateTo) {
    query.createdAt = {};
    if (filters.dateFrom) query.createdAt.$gte = new Date(filters.dateFrom);
    if (filters.dateTo) query.createdAt.$lte = new Date(filters.dateTo);
  }

  if (filters.customer) query.name = new RegExp(filters.customer, 'i');
  if (filters.item) query.item = new RegExp(filters.item, 'i');
  if (filters.status) query.status = filters.status;

  return query;
}

// Report generation functions
async function generateSalesSummary(query, groupBy) {
  const orders = await Order.find(query);

  if (groupBy === 'customer') {
    const grouped = {};
    orders.forEach(order => {
      if (!grouped[order.name]) {
        grouped[order.name] = { customer: order.name, totalSales: 0, orderCount: 0, totalQuantity: 0 };
      }
      grouped[order.name].totalSales += order.amount;
      grouped[order.name].orderCount += 1;
      grouped[order.name].totalQuantity += order.quantity;
    });
    return Object.values(grouped);
  } else if (groupBy === 'item') {
    const grouped = {};
    orders.forEach(order => {
      if (!grouped[order.item]) {
        grouped[order.item] = { item: order.item, totalSales: 0, orderCount: 0, totalQuantity: 0 };
      }
      grouped[order.item].totalSales += order.amount;
      grouped[order.item].orderCount += 1;
      grouped[order.item].totalQuantity += order.quantity;
    });
    return Object.values(grouped);
  } else {
    const total = orders.reduce((sum, order) => sum + order.amount, 0);
    const totalQuantity = orders.reduce((sum, order) => sum + order.quantity, 0);
    return [{
      metric: 'Total Sales',
      value: total,
      orderCount: orders.length,
      totalQuantity: totalQuantity,
      averageOrderValue: orders.length > 0 ? (total / orders.length).toFixed(2) : 0
    }];
  }
}

async function generateItemWiseReport(query) {
  const orders = await Order.find(query);
  const grouped = {};

  orders.forEach(order => {
    if (!grouped[order.item]) {
      grouped[order.item] = {
        item: order.item,
        totalQuantity: 0,
        totalSales: 0,
        orderCount: 0,
        averagePrice: 0
      };
    }
    grouped[order.item].totalQuantity += order.quantity;
    grouped[order.item].totalSales += order.amount;
    grouped[order.item].orderCount += 1;
  });

  return Object.values(grouped).map(item => ({
    ...item,
    averagePrice: item.orderCount > 0 ? (item.totalSales / item.orderCount).toFixed(2) : 0
  }));
}

async function generateCustomerWiseReport(query) {
  const orders = await Order.find(query);
  const grouped = {};

  orders.forEach(order => {
    if (!grouped[order.name]) {
      grouped[order.name] = {
        customer: order.name,
        email: order.email,
        phone: order.phone,
        totalSpent: 0,
        orderCount: 0,
        totalQuantity: 0
      };
    }
    grouped[order.name].totalSpent += order.amount;
    grouped[order.name].orderCount += 1;
    grouped[order.name].totalQuantity += order.quantity;
  });

  return Object.values(grouped);
}

async function generateDateWiseReport(query) {
  const orders = await Order.find(query).sort({ createdAt: 1 });
  const grouped = {};

  orders.forEach(order => {
    const date = new Date(order.createdAt).toLocaleDateString();
    if (!grouped[date]) {
      grouped[date] = { date, totalSales: 0, orderCount: 0, totalQuantity: 0 };
    }
    grouped[date].totalSales += order.amount;
    grouped[date].orderCount += 1;
    grouped[date].totalQuantity += order.quantity;
  });

  return Object.values(grouped);
}

async function generateLeadConversionReport(query) {
  const leads = await Lead.find(query);
  const totalLeads = leads.length;
  const convertedLeads = leads.filter(lead => lead.status === 'Converted').length;
  const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(2) : 0;

  return [{
    metric: 'Lead Conversion',
    totalLeads,
    convertedLeads,
    conversionRate: `${conversionRate}%`,
    pendingLeads: totalLeads - convertedLeads
  }];
}

async function generateQuotationStatusReport(query) {
  const quotations = await Quotation.find(query);
  const grouped = {};

  quotations.forEach(quot => {
    const status = quot.status || 'Pending';
    if (!grouped[status]) {
      grouped[status] = { status, count: 0, totalValue: 0 };
    }
    grouped[status].count += 1;
    grouped[status].totalValue += quot.totalAmount || 0;
  });

  return Object.values(grouped);
}

export default router;
