import mongoose from "mongoose";

const templateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Template name is required"],
      trim: true,
      minlength: [1, "Template name cannot be empty"],
      maxlength: [100, "Template name must be less than 100 characters"],
    },
    module: {
      type: String,
      required: [true, "Module is required"],
      enum: {
        values: ["Lead", "Quotation", "Customer", "Order"],
        message: "Module must be one of: Lead, Quotation, Customer, Order",
      },
    },
    content: {
      type: String,
      required: [true, "Template content is required"],
      description: "HTML content with {{placeholders}} for dynamic fields",
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Indexes for efficient querying
templateSchema.index({ module: 1 });
templateSchema.index({ module: 1, isDefault: 1 });

// Ensure only one default template per module
templateSchema.pre("save", async function (next) {
  if (this.isDefault) {
    await mongoose.model("Template").updateMany(
      { module: this.module, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

export default mongoose.model("Template", templateSchema);
