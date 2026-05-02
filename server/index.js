// =================== IMPORTS ===================
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// Models
import User from "./models/User.js";
import Lead from "./models/Leads.js";
import Customer from "./models/Customer.js";
import Order from "./models/Order.js";
import Quotation from "./models/Quotation.js";
import Invoice from "./models/Invoice.js";
import Notification from "./models/Notification.js";

// Routes
import followUpRoutes from "./routes/followUps.js";
import quotationRoutes from "./routes/quotationRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import leadsRoutes from "./routes/leadsRoutes.js";
import bulkUploadRoutes from "./routes/bulkUploadRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import templateRoutes from "./routes/templateRoutes.js";
import printRoutes from "./routes/printRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
//  import quotationRoutes from './routes/quotationRoutesEnhanced.js';

// Config
import connectDB from "./config/db.js";
import followUpReminder from "./cron/followupCron.js";
const app = express();
dotenv.config();

// Connect MongoDB
connectDB()
  .then(() => {
    console.log("✅ MongoDB connected");
    // Start cron AFTER DB is connected
    followUpReminder();
    console.log("⏰ Follow-up reminder cron job started");
  })
  .catch((err) => console.error("❌ DB connect error", err));

// =================== MIDDLEWARE ===================
app.use(cors());
// Increase body size limit to handle large base64 images
app.use(express.json({ limit: "50mb" }));
app.use(bodyParser.json({ limit: "50mb" }));

// =================== AUTH ROUTES ===================
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    console.log("🔍 Login attempt:", email);

    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ User not found:", email);
      return res.status(401).json({ error: "User not found" });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log("❌ Invalid password:", email);
      return res.status(401).json({ error: "Invalid password" });
    }

    console.log("✅ Login successful:", email);

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role || "user",
      },
      companySettings: user.companySettings || {
        logo: null,
        theme: "light",
        language: "English",
        notifications: true,
        autoSave: true
      }
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ error: "Login failed - Server error" });
  }
});

// =================== REGISTER ===================
app.post("/api/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    console.log("📝 Registration attempt:", { email, name });

    // Validation
    if (!email || !password || !name) {
      console.log("❌ Missing fields");
      return res.status(400).json({ error: "Name, email, and password required" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("❌ User already exists:", email);
      return res.status(400).json({ error: "User already exists" });
    }

    // Create new user
    const newUser = new User({ 
      email, 
      password, 
      name,
      createdAt: new Date()
    });
    
    await newUser.save();

    console.log("✅ User registered successfully:", email);
    res.status(201).json({ 
      message: "Registration successful",
      user: { id: newUser._id, email: newUser.email, name: newUser.name }
    });
  } catch (error) {
    console.error("❌ Registration error:", error);
    res.status(500).json({ 
      error: "Registration failed", 
      details: error.message 
    });
  }
});




// Customers CRUD
app.post("/api/customers", async (req, res) => {
  try {
    const newCustomer = new Customer(req.body);
    await newCustomer.save();
    res
      .status(201)
      .json({ message: "Customer added successfully!", customer: newCustomer });
  } catch (error) {
    console.error("Error saving customer:", error);
    res.status(500).json({ error: "Failed to add customer" });
  }
});

app.get("/api/customers", async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
});

app.put("/api/customers/:id", async (req, res) => {
  try {
    const updated = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ error: "Customer not found" });
    res.json({ message: "Customer updated successfully!", customer: updated });
  } catch (error) {
    console.error("Error updating customer:", error);
    res.status(500).json({ error: "Failed to update customer" });
  }
});

app.delete("/api/customers/:id", async (req, res) => {
  try {
    const deleted = await Customer.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Customer not found" });
    res.json({ message: "Customer deleted successfully!" });
  } catch (error) {
    console.error("Error deleting customer:", error);
    res.status(500).json({ error: "Failed to delete customer" });
  }
});

// =================== COMPANY SETTINGS ===================
// Save company settings for user
app.post("/api/company-settings/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { logo, theme, language, notifications, autoSave } = req.body;

    console.log("💾 Saving company settings for user:", userId);

    const user = await User.findByIdAndUpdate(
      userId,
      {
        companySettings: {
          logo,
          theme: theme || "light",
          language: language || "English",
          notifications: notifications !== false,
          autoSave: autoSave !== false
        }
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log("✅ Company settings saved successfully");

    res.json({
      message: "Company settings saved successfully",
      companySettings: user.companySettings
    });
  } catch (error) {
    console.error("❌ Error saving company settings:", error);
    res.status(500).json({ error: "Failed to save company settings" });
  }
});

// Get company settings for user
app.get("/api/company-settings/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      companySettings: user.companySettings || {
        logo: null,
        theme: "light",
        language: "English",
        notifications: true,
        autoSave: true
      }
    });
  } catch (error) {
    console.error("❌ Error fetching company settings:", error);
    res.status(500).json({ error: "Failed to fetch company settings" });
  }
});

// =================== COMPANY PROFILE ===================
// Save company profile
app.post("/api/company-profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const profileData = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { companyProfile: profileData },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "Company profile saved", companyProfile: user.companyProfile });
  } catch (error) {
    console.error("Error saving company profile:", error);
    res.status(500).json({ error: "Failed to save company profile" });
  }
});

// Get company profile
app.get("/api/company-profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ companyProfile: user.companyProfile || {} });
  } catch (error) {
    console.error("Error fetching company profile:", error);
    res.status(500).json({ error: "Failed to fetch company profile" });
  }
});

// =================== FRONTEND DEPLOYMENT ===================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 👉 FIXED PATH (client folder is OUTSIDE /server folder)
const clientBuildPath = path.join(__dirname, "../client/build");

console.log("📁 Looking for React build at:", clientBuildPath);
console.log(
  "📁 index.html exists?",
  fs.existsSync(path.join(clientBuildPath, "index.html"))
);

// =================== ROUTES ===================
console.log("📝 Registering API routes...");

// Register specific routes FIRST (before generic ones)
app.use("/api/followups", followUpRoutes);
app.use("/api/quotations", quotationRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/leads", leadsRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/print", printRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/notifications", notificationRoutes);

// Register generic /api routes LAST
app.use("/api", bulkUploadRoutes);

console.log("✅ API routes registered successfully");

// =================== STATIC FILES (After API routes!) ===================
app.use(express.static(clientBuildPath));
app.get("/api/chart-data", async (req, res) => {
  try {
    const { table, dateColumn, fromDate, toDate, interval } = req.query;

    if (!table || !dateColumn || !fromDate || !toDate) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    // Map table names to models
    const tableMap = {
      "db_enq": Lead,
      "db_quote": Quotation,
      "db_oa": Order,
      "db_invoice": Invoice
    };

    const collection = tableMap[table];
    if (!collection) {
      return res.status(400).json({ error: "Invalid table name" });
    }

    // Parse dates
    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);
    endDate.setHours(23, 59, 59, 999);

    console.log(`[Chart Data] Table: ${table}, Column: ${dateColumn}, Range: ${startDate} to ${endDate}, Interval: ${interval}`);

    // Build aggregation pipeline
    let groupByFormat;
    switch (interval) {
      case "day":
        groupByFormat = {
          $dateToString: { format: "%Y-%m-%d", date: `$${dateColumn}` }
        };
        break;
      case "month":
        groupByFormat = {
          $dateToString: { format: "%Y-%m", date: `$${dateColumn}` }
        };
        break;
      case "year":
        groupByFormat = {
          $dateToString: { format: "%Y", date: `$${dateColumn}` }
        };
        break;
      default:
        groupByFormat = {
          $dateToString: { format: "%Y-%m-%d", date: `$${dateColumn}` }
        };
    }

    const pipeline = [
      {
        $match: {
          [dateColumn]: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: groupByFormat,
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ];

    // Execute aggregation - use exec() for older Mongoose or without for newer
    const data = await collection.aggregate(pipeline);

    console.log(`[Chart Data] Found ${data.length} records for ${table}`);

    // Format the response
    const labels = data.map(d => d._id || "Unknown");
    const counts = data.map(d => d.count || 0);

    res.json({
      labels,
      data: counts
    });
  } catch (err) {
    console.error("Error fetching chart data:", err);
    res.status(500).json({ error: "Failed to fetch chart data", details: err.message });
  }
});

// 👉 API 404 Handler (for undefined API routes)
app.use("/api", (req, res) => {
  res.status(404).json({ error: "API endpoint not found" });
});

// 👉 CATCH-ALL ROUTE (Must be AFTER all API routes)
app.get("*", (req, res) => {
  res.sendFile(path.join(clientBuildPath, "index.html"));
});

// =================== ERROR HANDLING ===================
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// =================== START SERVER ===================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
