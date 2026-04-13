import express from "express";
import FollowUp from "../models/FollowUp.js";

const router = express.Router();
 
// Get all follow-ups
router.get("/", async (req, res) => {
  try {
    const data = await FollowUp.find().sort({ followUpDate: 1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new follow-up
router.post("/", async (req, res) => {
  try {
    const { relatedType, relatedId, followUpDate, notes, status } = req.body;
    const followUp = new FollowUp({ relatedType, relatedId, followUpDate, notes, status });
    await followUp.save();
    res.json(followUp);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update follow-up status after conversation
router.put("/:id", async (req, res) => {
  try {
    console.log("🔍 PUT /api/followups/:id - ID:", req.params.id);
    console.log("📨 Request body:", req.body);
    
    const { conversationDetails, nextFollowUpDate } = req.body;
    
    // Validate required field: conversationDetails
    if (!conversationDetails || typeof conversationDetails !== "string" || !conversationDetails.trim()) {
      console.warn("⚠️ Validation error: conversationDetails is missing or empty");
      return res.status(400).json({ error: "conversationDetails is required and cannot be empty" });
    }

    // Validate nextFollowUpDate format if provided
    if (nextFollowUpDate) {
      const dateObj = new Date(nextFollowUpDate);
      if (isNaN(dateObj.getTime())) {
        console.warn("⚠️ Validation error: Invalid date format -", nextFollowUpDate);
        return res.status(400).json({ error: "Invalid nextFollowUpDate format" });
      }
    }

    // Determine status based on reschedule
    const updateData = {
      conversationDetails: conversationDetails.trim(),
      updatedAt: new Date()
    };
    
    // If rescheduling, update the followUpDate and reset notification flags
    if (nextFollowUpDate) {
      updateData.followUpDate = new Date(nextFollowUpDate);
      updateData.nextFollowUpDate = null; // Clear the temporary field
      updateData.status = "Pending"; // Reset to Pending so cron can detect it
      updateData.isReminderSent = false; // IMPORTANT: Reset reminder flag for new schedule
      updateData.isOverdueNotificationSent = false; // Reset overdue flag too
      console.log("📝 Rescheduling follow-up to:", nextFollowUpDate);
    } else {
      // If not rescheduling, mark as completed
      updateData.status = "Completed";
      console.log("📝 Marking follow-up as Completed");
    }
    
    console.log("🔄 Setting status to:", updateData.status);
    
    console.log("🔄 Updating with data:", updateData);
    
    const followUp = await FollowUp.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!followUp) {
      console.error("❌ Follow-up not found with ID:", req.params.id);
      return res.status(404).json({ error: "Follow-up not found" });
    }
    
    console.log("✅ Follow-up updated successfully:", followUp);
    res.json(followUp);
  } catch (err) {
    console.error("❌ Error updating follow-up:", err);
    res.status(400).json({ error: err.message || "Failed to update follow-up" });
  }
});

export default router;
