import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  reportId: { type: Number, unique: true, index: true },
  userId: { type: String, required: true },
  reportName: { type: String, required: true },
  reportType: {
    type: String,
    enum: ['sales-summary', 'item-wise', 'customer-wise', 'date-wise', 'lead-conversion', 'quotation-status', 'custom'],
    required: true
  },
  description: String,
  filters: {
    dateFrom: Date,
    dateTo: Date,
    customer: String,
    item: String,
    status: String,
    customFields: mongoose.Schema.Types.Mixed
  },
  selectedFields: [String], // Fields to display in report
  sortBy: { type: String, default: 'date' },
  sortOrder: { type: String, enum: ['asc', 'desc'], default: 'desc' },
  groupBy: String, // Group report by: customer, item, date, status
  includeGraphs: { type: Boolean, default: true },
  graphType: { type: String, enum: ['bar', 'pie', 'line', 'area'], default: 'bar' },
  isTemplate: { type: Boolean, default: false },
  templateName: String,
  generatedData: mongoose.Schema.Types.Mixed,
  generatedAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastGeneratedAt: Date
});

// Auto-generate reportId
reportSchema.pre('save', async function(next) {
  try {
    if (this.isNew && !this.reportId) {
      const Counter = mongoose.model('Counter');
      const counter = await Counter.findOneAndUpdate(
        { id: 'reportId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.reportId = counter.seq;
    }
    this.updatedAt = new Date();
    next();
  } catch (err) {
    next(err);
  }
});

export default mongoose.model('Report', reportSchema);
