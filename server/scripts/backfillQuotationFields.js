// One-shot migration: set defaults on existing Quotation documents that pre-date
// the status/priority/nextFollowUpDate/assignedTo fields.
//
// Run with:  node scripts/backfillQuotationFields.js
// Idempotent: safe to run multiple times.

import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Quotation from "../models/Quotation.js";

dotenv.config();

async function run() {
  await connectDB();

  const filter = {
    $or: [
      { status: { $exists: false } },
      { priority: { $exists: false } },
      { nextFollowUpDate: { $exists: false } },
      { assignedTo: { $exists: false } },
    ],
  };

  const result = await Quotation.updateMany(filter, {
    $set: {
      status: "New",
      priority: "Medium",
      nextFollowUpDate: null,
      assignedTo: null,
    },
  });

  console.log(
    `Backfill complete. matched=${result.matchedCount} modified=${result.modifiedCount}`
  );

  await mongoose.connection.close();
}

run().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
