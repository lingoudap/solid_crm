import express from "express";
import Lead from "../models/Leads.js";
import FollowUp from "../models/FollowUp.js";
import PDFDocument from "pdfkit";

const router = express.Router();

// =================== CREATE LEAD ===================
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, address, state, Source, status, followUps, customFields } = req.body;

    // Validation
    if (!name || !email || !phone || !address || !state) {
      return res.status(400).json({ error: "All required fields must be filled" });
    }

    // Create new lead
    const newLead = new Lead({
      name,
      email,
      phone,
      address,
      state,
      Source: Source || "Other",
      status: status || "New",
      followUps: followUps || [],
      customFields: customFields || {},
      createdAt: new Date()
    });

    await newLead.save();

    console.log("✅ Lead created:", name);
    res.status(201).json({ 
      message: "Lead added successfully!", 
      lead: newLead 
    });
  } catch (error) {
    console.error("❌ Error creating lead:", error);
    res.status(500).json({ error: "Failed to add lead", details: error.message });
  }
});

// =================== GET ALL LEADS ===================
router.get("/", async (req, res) => {
  try {
    console.log("📍 Fetching leads from collection...");
    const leads = await Lead.find().sort({ createdAt: -1 });
    
    // Fetch follow-ups from FollowUp collection and attach to leads
    const leadsWithFollowUps = await Promise.all(
      leads.map(async (lead) => {
        const followUps = await FollowUp.find({ relatedId: lead._id, relatedType: "Lead" }).sort({ followUpDate: 1 });
        return {
          ...lead.toObject(),
          followUpsNew: followUps // Add follow-ups from the FollowUp collection
        };
      })
    );
    
    console.log("✅ Found", leadsWithFollowUps.length, "leads with follow-ups");
    res.json(leadsWithFollowUps);
  } catch (error) {
    console.error("❌ Error fetching leads:", error);
    res.status(500).json({ error: "Failed to fetch leads" });
  }
});

// =================== GET SINGLE LEAD ===================
router.get("/:id", async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }
    
    // Fetch follow-ups from FollowUp collection
    const followUps = await FollowUp.find({ relatedId: lead._id, relatedType: "Lead" }).sort({ followUpDate: 1 });
    
    res.json({
      ...lead.toObject(),
      followUpsNew: followUps
    });
  } catch (error) {
    console.error("❌ Error fetching lead:", error);
    res.status(500).json({ error: "Failed to fetch lead" });
  }
});

// =================== UPDATE LEAD ===================
router.put("/:id", async (req, res) => {
  try {
    const { name, email, phone, address, state, Source, status, followUps, customFields } = req.body;

    const updatedLead = await Lead.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, address, state, Source, status, followUps, customFields },
      { new: true, runValidators: true }
    );

    if (!updatedLead) {
      return res.status(404).json({ error: "Lead not found" });
    }

    console.log("✅ Lead updated:", updatedLead.name);
    res.json({ message: "Lead updated successfully!", lead: updatedLead });
  } catch (error) {
    console.error("❌ Error updating lead:", error);
    res.status(500).json({ error: "Failed to update lead" });
  }
});

// =================== DELETE LEAD ===================
router.delete("/:id", async (req, res) => {
  try {
    const deletedLead = await Lead.findByIdAndDelete(req.params.name);
    if (!deletedLead) {
      return res.status(404).json({ error: "Lead not found" });
    }

    console.log("✅ Lead deleted:", deletedLead.name);
    res.json({ message: "Lead deleted successfully!" });
  } catch (error) {
    console.error("❌ Error deleting lead:", error);
    res.status(500).json({ error: "Failed to delete lead" });
  }
});
// =================== EXPORT LEAD AS PDF ===================
router.get("/:id/export", async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ error: "Lead not found" });
    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=lead-${lead.name || lead._id}.pdf`
    );

    doc.pipe(res);
    doc.fontSize(20).text("Lead Details", { align: "center" }).moveDown();

    doc.fontSize(12).text(`Name: ${lead.name}`);
    doc.text(`Date: ${new Date(lead.createdAt).toLocaleDateString()}`).moveDown();

    doc.fontSize(14).text("Contact Details").moveDown();
    doc.fontSize(12)
      .text(`Name: ${lead.name}`)
      .text(`Email: ${lead.email}`)
      .text(`Phone: ${lead.phone}`)
      .text(`Address: ${lead.address}`)
      .text(`State: ${lead.state}`)
      .text(`Source: ${lead.Source}`)
      .text(`Status: ${lead.status}`)
      .moveDown();

    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

export default router;
