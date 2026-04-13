import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
  },
  customerName: {
    type: String,
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  },
  invoiceDate: {
    type: Date,
    default: Date.now,
  },
  dueDate: {
    type: Date,
  },
  totalAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  taxAmount: {
    type: Number,
    default: 0,
  },
  notes: {
    type: String,
  },
  status: {
    type: String,
    enum: ['Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled'],
    default: 'Draft',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Invoice', invoiceSchema);
