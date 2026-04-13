// server/routes/settingsRoutes.js
import express from "express";
import mongoose from "mongoose";

const router = express.Router();

// Schema for dropdown values (Lead Source, Order Status, etc.)
const settingSchema = new mongoose.Schema({
  type: { type: String, required: true, unique: true },
  values: { type: [String], default: [] },
});

const Setting = mongoose.model("Setting", settingSchema);

// ✅ GET — Fetch a setting (e.g., /api/settings/lead_sources)
router.get("/:type", async (req, res) => {
  try {
    const setting = await Setting.findOne({ type: req.params.type });
    if (!setting) {
      return res.status(200).json({ type: req.params.type, values: [] });
    }
    res.json(setting);
  } catch (error) {
    console.error("Error fetching setting:", error);
    res.status(500).json({ error: "Failed to fetch setting" });
  }
});

// ✅ POST — Create or update a setting
// Supports: { values: [...] } to replace all, { add: "val" } to add one, { remove: "val" } to remove one
router.post("/:type", async (req, res) => {
  try {
    const { values, add, remove } = req.body;

    let setting = await Setting.findOne({ type: req.params.type });
    if (!setting) {
      setting = new Setting({ type: req.params.type, values: [] });
    }

    if (Array.isArray(values)) {
      setting.values = values;
    } else if (add) {
      const trimmed = add.trim();
      if (trimmed && !setting.values.includes(trimmed)) {
        setting.values.push(trimmed);
      }
    } else if (remove) {
      setting.values = setting.values.filter((v) => v !== remove);
    } else {
      return res.status(400).json({ error: "Provide values (array), add (string), or remove (string)" });
    }

    await setting.save();
    res.status(200).json(setting);
  } catch (error) {
    console.error("Error updating setting:", error);
    res.status(500).json({ error: "Failed to update setting" });
  }
});

export default router;
