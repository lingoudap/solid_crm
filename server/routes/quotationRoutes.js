import express from "express";
import mongoose from "mongoose";
import PDFDocument from "pdfkit";
import Quotation from "../models/Quotation.js";
import FollowUp from "../models/FollowUpEnhanced.js";

const router = express.Router();

const STATUS_VALUES = ["New", "Active", "Converted", "Lost"];
const PRIORITY_VALUES = ["Low", "Medium", "High"];

// Shared validation for POST and PUT. Returns { ok: true, data } or { ok: false, error }.
function validateQuotationPayload(body) {
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
    priority,
    nextFollowUpDate,
    assignedTo,
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

  const parsedTotalAmount = typeof totalAmount === "string"
    ? parseFloat(totalAmount)
    : totalAmount;

  if (isNaN(parsedTotalAmount) || parsedTotalAmount < 0) {
    return { ok: false, error: "Valid total amount is required" };
  }

  if (status !== undefined && !STATUS_VALUES.includes(status)) {
    return { ok: false, error: `status must be one of ${STATUS_VALUES.join(", ")}` };
  }

  if (priority !== undefined && !PRIORITY_VALUES.includes(priority)) {
    return { ok: false, error: `priority must be one of ${PRIORITY_VALUES.join(", ")}` };
  }

  if (assignedTo && !mongoose.isValidObjectId(assignedTo)) {
    return { ok: false, error: "assignedTo must be a valid user id" };
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
  if (priority !== undefined) data.priority = priority;
  if (nextFollowUpDate !== undefined) {
    data.nextFollowUpDate = nextFollowUpDate ? new Date(nextFollowUpDate) : null;
  }
  if (assignedTo !== undefined) data.assignedTo = assignedTo || null;

  return { ok: true, data };
}

/**
 * ✅ Add New Quotation
 */
router.post("/", async (req, res) => {
  try {
    console.log("📦 Incoming quotation:", req.body);

    const result = validateQuotationPayload(req.body);
    if (!result.ok) {
      return res.status(400).json({ error: result.error });
    }

    const newQuotation = new Quotation(result.data);
    await newQuotation.save();

    res.status(201).json({
      message: "Quotation added successfully!",
      quotation: newQuotation,
    });
  } catch (error) {
    console.error("❌ Error saving quotation:", error);
    res.status(500).json({ error: "Failed to add quotation: " + error.message });
  }
});

/**
 * ✅ Get All Quotations
 */
router.get("/", async (req, res) => {
  try {
    const quotations = await Quotation.find().sort({ createdAt: -1 });

    // Fetch follow-ups from FollowUp collection and attach to quotations
    const quotationsWithFollowUps = await Promise.all(
      quotations.map(async (quotation) => {
        const followUps = await FollowUp.find({ relatedId: quotation._id, relatedType: "Quotation" }).sort({ followUpDate: 1 });
        return {
          ...quotation.toObject(),
          followUpsNew: followUps
        };
      })
    );

    res.json(quotationsWithFollowUps);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * ✅ Export Quotation as PDF
 */
router.get("/:id/export", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid quotation id" });
    }

    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) return res.status(404).json({ error: "Quotation not found" });

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=quotation-${quotation.quotationNumber}.pdf`
    );

    doc.pipe(res);
    doc.fontSize(20).text("Quotation", { align: "center" }).moveDown();

    doc.fontSize(12).text(`Quotation No: ${quotation.quotationNumber}`);
    doc.text(`Date: ${new Date(quotation.date).toLocaleDateString()}`).moveDown();

    doc.fontSize(14).text("Customer Details").moveDown();
    doc.fontSize(12)
      .text(`Name: ${quotation.customerName}`)
      .text(`Email: ${quotation.email}`)
      .text(`Phone: ${quotation.phone}`)
      .text(`Address: ${quotation.address}`)
      .text(`State: ${quotation.state}`)
      .moveDown();

    doc.fontSize(14).text("Items").moveDown();
    quotation.items.forEach((item, index) => {
      doc.fontSize(12)
        .text(`${index + 1}. ${item.itemName}`)
        .text(`Qty: ${item.qty}, Price: ₹${item.price}, Subtotal: ₹${item.subtotal}`)
        .moveDown();
    });

    doc.fontSize(14).text(`Total Amount: ₹${quotation.totalAmount}`, {
      align: "right",
    });

    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

/**
 * ✅ Update Status (used by inline status editor + bulk actions)
 *    Must be defined BEFORE GET /:id so /:id/status doesn't get swallowed.
 */
router.patch("/:id/status", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid quotation id" });
    }

    const { status } = req.body;
    if (!STATUS_VALUES.includes(status)) {
      return res.status(400).json({
        error: `status must be one of ${STATUS_VALUES.join(", ")}`,
      });
    }

    const updated = await Quotation.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ error: "Quotation not found" });

    res.json({ message: "Status updated", quotation: updated });
  } catch (error) {
    console.error("❌ Error updating status:", error);
    res.status(500).json({ error: "Failed to update status: " + error.message });
  }
});

/**
 * ✅ Update Quotation (full replace of editable fields)
 */
router.put("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid quotation id" });
    }

    const result = validateQuotationPayload(req.body);
    if (!result.ok) {
      return res.status(400).json({ error: result.error });
    }

    const updated = await Quotation.findByIdAndUpdate(
      req.params.id,
      { $set: result.data },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ error: "Quotation not found" });

    res.json({ message: "Quotation updated", quotation: updated });
  } catch (error) {
    console.error("❌ Error updating quotation:", error);
    res.status(500).json({ error: "Failed to update quotation: " + error.message });
  }
});

/**
 * ✅ Delete Quotation (cascades its follow-ups so they don't become orphans)
 */
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid quotation id" });
    }

    const deleted = await Quotation.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Quotation not found" });

    const followUpResult = await FollowUp.deleteMany({
      relatedId: deleted._id,
      relatedType: "Quotation",
    });

    res.json({
      message: "Quotation deleted",
      quotationId: deleted._id,
      deletedFollowUps: followUpResult.deletedCount,
    });
  } catch (error) {
    console.error("❌ Error deleting quotation:", error);
    res.status(500).json({ error: "Failed to delete quotation: " + error.message });
  }
});

/**
 * ✅ Get Single Quotation
 */
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid quotation id" });
    }

    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) {
      return res.status(404).json({ error: "Quotation not found" });
    }

    // Fetch follow-ups from FollowUp collection
    const followUps = await FollowUp.find({ relatedId: quotation._id, relatedType: "Quotation" }).sort({ followUpDate: 1 });

    res.json({
      ...quotation.toObject(),
      followUpsNew: followUps
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
