import express from "express";
import mongoose from "mongoose";
import PDFDocument from "pdfkit";
import Order from "../models/Order.js";
import Quotation from "../models/Quotation.js";

// Fields to surface when populating sourceQuotationId on GET responses.
const QUOTATION_BACKLINK_FIELDS = "quotationId customerName status";

const router = express.Router();

const STATUS_VALUES = ["New", "Processing", "Shipped", "Delivered", "Cancelled"];

function validateOrderPayload(body) {
  const {
    customerName,
    email,
    phone,
    address,
    state,
    items,
    totalAmount,
    customFields,
    status,
    sourceQuotationId,
    date,
  } = body;

  if (!customerName?.trim()) {
    return { ok: false, error: "Customer name is required" };
  }

  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, error: "At least one item is required" };
  }

  const validItems = items.every(
    (item) =>
      item.itemName?.trim() &&
      typeof item.qty === "number" && item.qty > 0 &&
      typeof item.price === "number" && item.price >= 0
  );

  if (!validItems) {
    return {
      ok: false,
      error: "Each item must have a valid name, quantity > 0, and price",
    };
  }

  const parsedTotalAmount =
    typeof totalAmount === "string" ? parseFloat(totalAmount) : totalAmount;

  if (isNaN(parsedTotalAmount) || parsedTotalAmount < 0) {
    return { ok: false, error: "Valid total amount is required" };
  }

  if (status !== undefined && !STATUS_VALUES.includes(status)) {
    return {
      ok: false,
      error: `status must be one of ${STATUS_VALUES.join(", ")}`,
    };
  }

  if (sourceQuotationId && !mongoose.isValidObjectId(sourceQuotationId)) {
    return { ok: false, error: "sourceQuotationId must be a valid id" };
  }

  const data = {
    customerName: customerName.trim(),
    email: email?.trim(),
    phone: phone?.trim(),
    address: address?.trim(),
    state: state?.trim(),
    items: items.map((item) => ({
      ...item,
      itemName: item.itemName.trim(),
      qty: Number(item.qty),
      price: Number(item.price),
      discount: Number(item.discount || 0),
      tax: Number(item.tax || 0),
      subtotal: Number(item.subtotal || 0),
    })),
    totalAmount: Number(parsedTotalAmount),
    customFields: customFields || {},
  };

  if (status !== undefined) data.status = status;
  if (sourceQuotationId !== undefined) {
    data.sourceQuotationId = sourceQuotationId || null;
  }
  if (date !== undefined) data.date = date ? new Date(date) : new Date();

  return { ok: true, data };
}

/**
 * Create order
 */
router.post("/", async (req, res) => {
  try {
    const result = validateOrderPayload(req.body);
    if (!result.ok) return res.status(400).json({ error: result.error });

    const newOrder = new Order(result.data);
    await newOrder.save();

    // If created from a quotation, mark that quotation as Converted.
    // Best-effort: don't fail the order response if this update fails.
    if (newOrder.sourceQuotationId) {
      try {
        await Quotation.findByIdAndUpdate(
          newOrder.sourceQuotationId,
          { $set: { status: "Converted" } },
          { runValidators: true }
        );
      } catch (linkErr) {
        console.error(
          "⚠️ Order saved but failed to mark source quotation Converted:",
          linkErr
        );
      }
    }

    res.status(201).json({
      message: "Order added successfully!",
      order: newOrder,
    });
  } catch (error) {
    console.error("❌ Error saving order:", error);
    res.status(500).json({ error: "Failed to add order: " + error.message });
  }
});

/**
 * List orders
 */
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("sourceQuotationId", QUOTATION_BACKLINK_FIELDS)
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Export Order as PDF
 *    Must be defined BEFORE GET /:id so /:id/export doesn't get swallowed.
 */
router.get("/:id/export", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid order id" });
    }

    const order = await Order.findById(req.params.id).populate(
      "sourceQuotationId",
      QUOTATION_BACKLINK_FIELDS
    );
    if (!order) return res.status(404).json({ error: "Order not found" });

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=order-${order.orderNumber || order._id}.pdf`
    );

    doc.pipe(res);
    doc.fontSize(20).text("Order", { align: "center" }).moveDown();

    doc.fontSize(12).text(`Order No: ${order.orderNumber || order._id}`);
    if (order.sourceQuotationId?.quotationId) {
      doc.text(
        `From Quotation: Q-${String(order.sourceQuotationId.quotationId).padStart(5, "0")}`
      );
    }
    doc
      .text(`Status: ${order.status}`)
      .text(`Date: ${new Date(order.date).toLocaleDateString()}`)
      .moveDown();

    doc.fontSize(14).text("Customer Details").moveDown();
    doc
      .fontSize(12)
      .text(`Name: ${order.customerName}`)
      .text(`Email: ${order.email || "-"}`)
      .text(`Phone: ${order.phone || "-"}`)
      .text(`Address: ${order.address || "-"}`)
      .text(`State: ${order.state || "-"}`)
      .moveDown();

    doc.fontSize(14).text("Items").moveDown();
    order.items.forEach((item, index) => {
      doc
        .fontSize(12)
        .text(`${index + 1}. ${item.itemName}`)
        .text(
          `Qty: ${item.qty}, Price: ₹${item.price}, Subtotal: ₹${item.subtotal}`
        )
        .moveDown();
    });

    doc.fontSize(14).text(`Total Amount: ₹${order.totalAmount}`, {
      align: "right",
    });

    doc.end();
  } catch (error) {
    console.error("Error generating order PDF:", error);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

/**
 * Update status (inline / bulk)
 */
router.patch("/:id/status", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid order id" });
    }

    const { status, remark } = req.body;
    if (!STATUS_VALUES.includes(status)) {
      return res.status(400).json({
        error: `status must be one of ${STATUS_VALUES.join(", ")}`,
      });
    }

    const trimmedRemark = typeof remark === "string" ? remark.trim() : "";
    const historyEntry = {
      status,
      remark: trimmedRemark,
      changedAt: new Date(),
    };

    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      {
        $set: { status },
        $push: { statusHistory: historyEntry },
      },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ error: "Order not found" });

    res.json({ message: "Status updated", order: updated });
  } catch (error) {
    console.error("❌ Error updating status:", error);
    res.status(500).json({ error: "Failed to update status: " + error.message });
  }
});

/**
 * Update order
 */
router.put("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid order id" });
    }

    const result = validateOrderPayload(req.body);
    if (!result.ok) return res.status(400).json({ error: result.error });

    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: result.data },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ error: "Order not found" });

    res.json({ message: "Order updated", order: updated });
  } catch (error) {
    console.error("❌ Error updating order:", error);
    res.status(500).json({ error: "Failed to update order: " + error.message });
  }
});

/**
 * Delete order
 */
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid order id" });
    }

    const deleted = await Order.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Order not found" });

    res.json({ message: "Order deleted", orderId: deleted._id });
  } catch (error) {
    console.error("❌ Error deleting order:", error);
    res.status(500).json({ error: "Failed to delete order: " + error.message });
  }
});

/**
 * Get single order
 */
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid order id" });
    }

    const order = await Order.findById(req.params.id).populate(
      "sourceQuotationId",
      QUOTATION_BACKLINK_FIELDS
    );
    if (!order) return res.status(404).json({ error: "Order not found" });

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
