import mongoose from "mongoose";

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 100,
  },
  module: {
    type: String,
    enum: ["Lead", "Quotation", "Customer", "Order"],
    required: true,
  },
  headerContent: {
    type: String,
    default: "",
  },
  bodyFields: {
    type: [String],
    default: [],
  },
  footerContent: {
    type: String,
    default: "",
  },
  showLogo: {
    type: Boolean,
    default: true,
  },
  showDate: {
    type: Boolean,
    default: true,
  },
  showPageNumber: {
    type: Boolean,
    default: true,
  },
  showSignature: {
    type: Boolean,
    default: false,
  },
  paperSize: {
    type: String,
    enum: ["A4", "A3", "Letter"],
    default: "A4",
  },
  orientation: {
    type: String,
    enum: ["portrait", "landscape"],
    default: "portrait",
  },
  margins: {
    top: { type: Number, default: 20 },
    right: { type: Number, default: 20 },
    bottom: { type: Number, default: 20 },
    left: { type: Number, default: 20 },
  },
  fontSize: {
    type: String,
    default: "12px",
  },
  fontFamily: {
    type: String,
    default: "Arial",
  },
  lineSpacing: {
    type: String,
    default: "1.5",
  },
  watermark: {
    type: String,
    default: "",
  },
  watermarkOpacity: {
    type: Number,
    default: 0.1,
    min: 0,
    max: 1,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: String,
    default: "admin",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastModified: {
    type: Date,
    default: Date.now,
  },
});

// Index for finding templates by module
templateSchema.index({ module: 1 });
templateSchema.index({ module: 1, isDefault: 1 });

// Update lastModified before saving
templateSchema.pre("save", function (next) {
  this.lastModified = new Date();
  next();
});

export default mongoose.model("Template", templateSchema);
