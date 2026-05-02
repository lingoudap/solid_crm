import mongoose from "mongoose";
import Counter from "./Counter.js";

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: Number, unique: true, index: true },

    // Customer Info
    customerName: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    address: { type: String },
    state: { type: String },

    // Items Array
    items: [
      {
        itemName: { type: String, required: true },
        qty: { type: Number, required: true, min: 0 },
        unit: { type: String },
        price: { type: Number, required: true, min: 0 },
        discount: { type: Number, default: 0, min: 0, max: 100 },
        tax: { type: Number, default: 0, min: 0 },
        subtotal: { type: Number, required: true, min: 0 },
      },
    ],

    // Total & Custom Fields
    totalAmount: { type: Number, required: true, min: 0 },
    customFields: { type: Object, default: {} },

    // Lifecycle
    status: {
      type: String,
      enum: ["New", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "New",
      index: true,
    },

    // Audit trail of status changes (status + optional remark + timestamp).
    statusHistory: [
      {
        status: { type: String, required: true },
        remark: { type: String, default: "" },
        changedAt: { type: Date, default: Date.now },
      },
    ],

    // Optional link back to source quotation (for Convert-to-Order flow)
    sourceQuotationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quotation",
      default: null,
      index: true,
    },

    // Date
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

orderSchema.pre("save", async function (next) {
  if (this.orderId != null) return next();
  const Model = this.constructor;
  try {
    for (let attempt = 0; attempt < 5; attempt++) {
      const counter = await Counter.findOneAndUpdate(
        { id: "orderId" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      const candidate = counter.seq;

      const collision = await Model.exists({ orderId: candidate });
      if (!collision) {
        this.orderId = candidate;
        return next();
      }

      // Counter is behind existing data (e.g. legacy rows). Sync forward.
      const maxDoc = await Model.findOne({}, { orderId: 1 })
        .sort({ orderId: -1 })
        .lean();
      const floor = maxDoc?.orderId || 0;
      await Counter.findOneAndUpdate(
        { id: "orderId" },
        { $max: { seq: floor } },
        { upsert: true }
      );
    }
    next(new Error("Failed to allocate unique orderId after 5 retries"));
  } catch (err) {
    next(err);
  }
});

orderSchema.virtual("orderNumber").get(function () {
  if (this.orderId == null) return null;
  return `O-${String(this.orderId).padStart(5, "0")}`;
});

orderSchema.set("toJSON", { virtuals: true });
orderSchema.set("toObject", { virtuals: true });

export default mongoose.model("Order", orderSchema);
