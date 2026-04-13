import express from "express";
import Invoice from "../models/Invoice.js";
import Customer from "../models/Customer.js";
import Counter from "../models/Counter.js";

const router = express.Router();

// Helper function to generate invoice number
const generateInvoiceNumber = async () => {
  try {
    const counter = await Counter.findByIdAndUpdate(
      { _id: 'invoiceCounter' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    return `INV-${String(counter.seq).padStart(5, '0')}`;
  } catch (err) {
    console.error('Error generating invoice number:', err);
    throw err;
  }
};

// Create a new invoice
router.post('/', async (req, res) => {
  try {
    const { customerId, orderId, invoiceDate, dueDate, totalAmount, taxAmount, notes, status, invoiceNumber } = req.body;

    let finalInvoiceNumber = invoiceNumber;
    if (!finalInvoiceNumber || finalInvoiceNumber.trim() === '') {
      finalInvoiceNumber = await generateInvoiceNumber();
    }

    // Fetch customer name if customer ID provided
    let customerName = null;
    if (customerId) {
      const customer = await Customer.findById(customerId);
      if (customer) {
        customerName = customer.name;
      }
    }

    const newInvoice = new Invoice({
      invoiceNumber: finalInvoiceNumber,
      customerId: customerId || null,
      customerName: customerName || req.body.customerName || null,
      orderId: orderId || null,
      invoiceDate: invoiceDate || new Date(),
      dueDate: dueDate || null,
      totalAmount: totalAmount || 0,
      taxAmount: taxAmount || 0,
      notes: notes || '',
      status: status || 'Draft',
    });

    const savedInvoice = await newInvoice.save();
    res.status(201).json(savedInvoice);
  } catch (err) {
    console.error('Error creating invoice:', err);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Invoice number already exists' });
    }
    res.status(500).json({ message: 'Error creating invoice', error: err.message });
  }
});

// Get all invoices
router.get('/', async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate('customerId', 'name')
      .populate('orderId', 'orderNumber')
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    console.error('Error fetching invoices:', err);
    res.status(500).json({ message: 'Error fetching invoices', error: err.message });
  }
});

// Get a single invoice by ID
router.get('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customerId', 'name')
      .populate('orderId', 'orderNumber');
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    
    res.json(invoice);
  } catch (err) {
    console.error('Error fetching invoice:', err);
    res.status(500).json({ message: 'Error fetching invoice', error: err.message });
  }
});

// Update an invoice
router.put('/:id', async (req, res) => {
  try {
    const { customerId, orderId, invoiceDate, dueDate, totalAmount, taxAmount, notes, status } = req.body;

    let updateData = {
      orderId: orderId || null,
      invoiceDate: invoiceDate || new Date(),
      dueDate: dueDate || null,
      totalAmount: totalAmount || 0,
      taxAmount: taxAmount || 0,
      notes: notes || '',
      status: status || 'Draft',
      updatedAt: new Date(),
    };

    // If customer changed, update customer name
    if (customerId) {
      updateData.customerId = customerId;
      const customer = await Customer.findById(customerId);
      if (customer) {
        updateData.customerName = customer.name;
      }
    }

    const updatedInvoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('customerId', 'name').populate('orderId', 'orderNumber');

    if (!updatedInvoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json(updatedInvoice);
  } catch (err) {
    console.error('Error updating invoice:', err);
    res.status(500).json({ message: 'Error updating invoice', error: err.message });
  }
});

// Delete an invoice
router.delete('/:id', async (req, res) => {
  try {
    const deletedInvoice = await Invoice.findByIdAndDelete(req.params.id);

    if (!deletedInvoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json({ message: 'Invoice deleted successfully', invoice: deletedInvoice });
  } catch (err) {
    console.error('Error deleting invoice:', err);
    res.status(500).json({ message: 'Error deleting invoice', error: err.message });
  }
});

// Get invoices by customer ID
router.get('/customer/:customerId', async (req, res) => {
  try {
    const invoices = await Invoice.find({ customerId: req.params.customerId })
      .populate('orderId', 'orderNumber')
      .sort({ invoiceDate: -1 });
    res.json(invoices);
  } catch (err) {
    console.error('Error fetching invoices by customer:', err);
    res.status(500).json({ message: 'Error fetching invoices', error: err.message });
  }
});

// Get invoices by status
router.get('/status/:status', async (req, res) => {
  try {
    const invoices = await Invoice.find({ status: req.params.status })
      .populate('customerId', 'name')
      .populate('orderId', 'orderNumber')
      .sort({ invoiceDate: -1 });
    res.json(invoices);
  } catch (err) {
    console.error('Error fetching invoices by status:', err);
    res.status(500).json({ message: 'Error fetching invoices', error: err.message });
  }
});

export default router;
