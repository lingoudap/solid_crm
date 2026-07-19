// FOLLOW-UP SYSTEM - SETUP & TESTING GUIDE

/**
 * STEP 1: Verify Files Exist
 * ✅ FollowUpEnhanced.js exists at: server/models/FollowUpEnhanced.js
 * ✅ followUpsEnhancedRoutes.js exists at: server/routes/followUpsEnhancedRoutes.js
 */

// ==========================================
// STEP 2: Register Routes in server/index.js
// ==========================================

// Add this import at the top (around line 25):
import followUpsEnhancedRoutes from "./routes/followUpsEnhancedRoutes.js";

// The import section should look like:
/*
import followUpRoutes from "./routes/followUps.js";
import followUpsEnhancedRoutes from "./routes/followUpsEnhancedRoutes.js";  // ← ADD THIS
import quotationRoutes from "./routes/quotationRoutes.js";
... rest of imports
*/

// ==========================================
// STEP 3: Add Route Registration
// ==========================================

// Find where routes are registered (around line 344) and add:
// app.use("/api/followups-enhanced", followUpsEnhancedRoutes);

// The routes section should look like:
/*
app.use("/api/followups", followUpRoutes);
app.use("/api/followups-enhanced", followUpsEnhancedRoutes);  // ← ADD THIS
app.use("/api/quotations", quotationRoutes);
... rest of routes
*/

// ==========================================
// STEP 4: Create Indexes in server/index.js
// ==========================================

// Add this code in the connectDB().then() section (after "✅ MongoDB connected"):

/*
connectDB()
  .then(async () => {
    console.log("✅ MongoDB connected");
    
    // Create Follow-Up Indexes
    try {
      await FollowUp.collection.createIndexes([
        { key: { followUpDate: 1 } },           // For sorting by date
        { key: { status: 1 } },                 // For filtering by status
        { key: { relatedType: 1 } },            // For filtering by type
        { key: { relatedId: 1 } },              // For filtering by related item
        { key: { assignedTo: 1 } },             // For user-specific queries
        { key: { isOverdue: 1 } },              // For overdue filtering
        { key: { followUpDate: 1, status: 1 } }, // Compound index for common queries
        { key: { createdAt: -1 } }              // For sorting by creation date
      ]);
      console.log("✅ Follow-Up indexes created successfully");
    } catch (indexError) {
      console.warn("⚠️ Index creation warning:", indexError.message);
    }
    
    // Start cron AFTER DB is connected
    followUpReminder();
    console.log("⏰ Follow-up reminder cron job started");
  })
*/

// ==========================================
// TESTING SECTION
// ==========================================

/**
 * TEST 1: Verify Server Starts Without Errors
 * 
 * Steps:
 * 1. Open terminal in server directory
 * 2. Run: node index.js
 * 3. Look for these messages in console:
 */

const TEST_1_EXPECTED_OUTPUT = `
🔍 Using MongoDB URI: mongodb+srv://...
📁 React build ready
📝 Registering API routes...
✅ Follow-Up indexes created successfully  ← LOOK FOR THIS
🚀 Server running on port 5000
✅ MongoDB connected
⏰ Follow-up reminder cron job started
`;

/**
 * TEST 2: Verify Routes are Registered
 * 
 * Open browser console and run:
 */

// Check if enhanced routes are accessible
const TEST_2_CHECK_ROUTES = `
const token = localStorage.getItem('token');

// Test traditional routes
fetch('http://localhost:5000/api/followups', {
  headers: { 'Authorization': \`Bearer \${token}\` }
})
.then(r => r.json())
.then(d => console.log('Traditional routes:', d));

// Test enhanced routes
fetch('http://localhost:5000/api/followups-enhanced', {
  headers: { 'Authorization': \`Bearer \${token}\` }
})
.then(r => r.json())
.then(d => console.log('Enhanced routes:', d));
`;

/**
 * TEST 3: Verify Indexes are Created
 * 
 * Run in MongoDB:
 */

const TEST_3_CHECK_INDEXES = `
// In MongoDB shell or MongoDB Compass:
db.followups.getIndexes()

// You should see indexes like:
[
  { v: 2, key: { _id: 1 } },
  { v: 2, key: { followUpDate: 1 } },        ← Should exist
  { v: 2, key: { status: 1 } },              ← Should exist
  { v: 2, key: { relatedType: 1 } },         ← Should exist
  { v: 2, key: { relatedId: 1 } },           ← Should exist
  { v: 2, key: { assignedTo: 1 } },          ← Should exist
  { v: 2, key: { isOverdue: 1 } },           ← Should exist
  { v: 2, key: { followUpDate: 1, status: 1 } }, ← Should exist
  { v: 2, key: { createdAt: -1 } }           ← Should exist
]
`;

/**
 * TEST 4: API Endpoint Testing
 */

const TEST_4_API_TESTS = `
// Test 1: Get all follow-ups (traditional)
GET http://localhost:5000/api/followups
Headers: { Authorization: Bearer {token} }
Expected: { success: true, data: [...], pagination: {...} }

// Test 2: Get enhanced follow-ups
GET http://localhost:5000/api/followups-enhanced
Headers: { Authorization: Bearer {token} }
Expected: Follow-up list with enhanced fields

// Test 3: Get follow-ups by status
GET http://localhost:5000/api/followups?status=Pending
Headers: { Authorization: Bearer {token} }
Expected: Only pending follow-ups

// Test 4: Get overdue follow-ups
GET http://localhost:5000/api/followups-enhanced?overdue=true
Headers: { Authorization: Bearer {token} }
Expected: Only overdue follow-ups

// Test 5: Create follow-up
POST http://localhost:5000/api/followups
Headers: { 
  Authorization: Bearer {token},
  Content-Type: application/json
}
Body: {
  relatedType: "Lead",
  relatedId: "507f1f77bcf86cd799439011",
  followUpDate: "2026-05-25T10:00:00Z",
  notes: "Test follow-up",
  status: "Pending",
  priority: "high"
}
Expected: { success: true, data: {...followUp...} }
`;

/**
 * TEST 5: Performance Testing
 */

const TEST_5_PERFORMANCE = `
// Measure query performance before and after indexes

// Before Indexes (slow):
// Query: Get all pending follow-ups
// Time: ~500-2000ms (without indexes)

// After Indexes (fast):
// Query: Get all pending follow-ups  
// Time: ~10-50ms (with indexes)

// Check query performance:
db.followups.find({ status: "Pending" }).explain("executionStats")
// Look for: executionStages.stage = "COLLSCAN" (bad) vs "IXSCAN" (good)
`;

// ==========================================
// STEP-BY-STEP TESTING PROCEDURE
// ==========================================

const TESTING_STEPS = `
✅ SETUP VERIFICATION (5 minutes)

1. Check files exist:
   [ ] server/models/FollowUpEnhanced.js exists
   [ ] server/routes/followUpsEnhancedRoutes.js exists

2. Update server/index.js:
   [ ] Add import: import followUpsEnhancedRoutes from "./routes/followUpsEnhancedRoutes.js";
   [ ] Add route: app.use("/api/followups-enhanced", followUpsEnhancedRoutes);
   [ ] Add index creation code in connectDB().then()

3. Verify server starts:
   [ ] Kill any existing node processes
   [ ] Run: node index.js in server directory
   [ ] Look for: "✅ Follow-Up indexes created successfully"
   [ ] Server should start without errors on port 5000

---

✅ ROUTE VERIFICATION (5 minutes)

4. Login to app:
   [ ] Open http://localhost:3000
   [ ] Login with your credentials
   [ ] You're on HomePage

5. Test in browser console:
   [ ] Open DevTools (F12)
   [ ] Go to Console tab
   [ ] Paste test code for TEST_2_CHECK_ROUTES
   [ ] Both routes should return data

---

✅ INDEX VERIFICATION (5 minutes)

6. Check indexes in MongoDB:
   [ ] Open MongoDB Compass
   [ ] Go to solid_crm_db > followups collection
   [ ] Click "Indexes" tab
   [ ] Should see 8-9 indexes (including default _id)
   [ ] All indexes listed in TEST_3_CHECK_INDEXES should exist

---

✅ API ENDPOINT TESTING (10 minutes)

7. Use Postman or browser console:
   [ ] Get all follow-ups → Should return list
   [ ] Get overdue → Should return only overdue
   [ ] Create new → Should create and return ID
   [ ] Update status → Should update successfully
   [ ] Delete → Should delete successfully

---

✅ PERFORMANCE TESTING (5 minutes)

8. Check query performance:
   [ ] Open MongoDB shell or compass
   [ ] Run explain() query
   [ ] Should show IXSCAN (index scan) not COLLSCAN (full collection scan)
   [ ] Queries should execute in < 100ms

---

✅ DASHBOARD TESTING (5 minutes)

9. Test Dashboard Analytics:
   [ ] Click "📊 Analytics" or "📈 Follow-Up Analytics" 
   [ ] Should load without errors
   [ ] Metrics should show data
   [ ] Charts should render
   [ ] All 6 cards visible

---

✅ DATA VALIDATION (5 minutes)

10. Create test data:
    [ ] Create 5 follow-ups manually
    [ ] Assign different statuses (Pending, Completed, etc.)
    [ ] Set various dates (past, today, future)
    [ ] View in Dashboard
    [ ] Verify totals match

---

TOTAL TIME: ~40 minutes
`;

// ==========================================
// QUICK REFERENCE - COMMANDS TO RUN
// ==========================================

const QUICK_COMMANDS = `
# Terminal 1 - Start Server
cd d:\\Lingouda\\App\\CRM\\solid_crm\\server
node index.js

# Terminal 2 - Start Client (if needed)
cd d:\\Lingouda\\App\\CRM\\solid_crm\\client
npm start

# Check indexes in MongoDB
# Open MongoDB Compass:
# 1. Connect to your cluster
# 2. solid_crm_db > followups collection
# 3. Click "Indexes" tab
# 4. All 8 indexes should be green (active)

# Test API endpoint
curl -X GET http://localhost:5000/api/followups \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

curl -X GET http://localhost:5000/api/followups-enhanced \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
`;

// ==========================================
// EXPECTED RESULTS
// ==========================================

const EXPECTED_RESULTS = `
✅ SERVER STARTUP
- No error messages
- "✅ Follow-Up indexes created successfully" message
- Server running on port 5000

✅ ROUTE REGISTRATION  
- Both /api/followups and /api/followups-enhanced respond
- 200 status codes
- Return JSON data

✅ INDEX CREATION
- 8 indexes visible in MongoDB
- All compound and single indexes present
- All indexes "green" (active)

✅ QUERY PERFORMANCE
- Queries complete in < 100ms
- IXSCAN in execution stats (not COLLSCAN)
- No timeout errors

✅ API FUNCTIONALITY
- Create, Read, Update, Delete all work
- Data persists in MongoDB
- No authentication errors (401)

✅ DASHBOARD
- Loads without errors
- Metrics cards show numbers
- Charts render with data
- Tables display follow-ups
`;

// ==========================================
// TROUBLESHOOTING
// ==========================================

const TROUBLESHOOTING = `
❌ PROBLEM: "Cannot find module followUpsEnhancedRoutes"
✅ SOLUTION:
   1. Check import is correct in index.js
   2. Verify file exists: server/routes/followUpsEnhancedRoutes.js
   3. Check spelling matches exactly
   4. Restart server after adding import

❌ PROBLEM: 404 error on /api/followups-enhanced
✅ SOLUTION:
   1. Check app.use() registration in index.js
   2. Verify route is before app.use("/api", bulkUploadRoutes)
   3. Check auth middleware is applied
   4. Verify token in request header

❌ PROBLEM: Indexes don't appear in MongoDB
✅ SOLUTION:
   1. Check createIndexes() code is added
   2. Verify FollowUp model is imported in index.js
   3. Check MongoDB connection is successful
   4. Look for error messages in server console
   5. Manually create indexes if needed:
      db.followups.createIndex({ followUpDate: 1 })
      db.followups.createIndex({ status: 1 })
      ... etc

❌ PROBLEM: Dashboard shows "No data"
✅ SOLUTION:
   1. Create test follow-ups first
   2. Check MongoDB has data: db.followups.find().count()
   3. Verify indexes are created
   4. Try refresh button on dashboard
   5. Check browser console for errors
   6. Verify JWT token is valid

❌ PROBLEM: Slow query performance
✅ SOLUTION:
   1. Verify indexes exist in MongoDB
   2. Run explain() to check index usage
   3. Drop and recreate indexes if needed
   4. Add missing compound indexes
   5. Check database connection is fast
`;

export {
  TEST_1_EXPECTED_OUTPUT,
  TEST_2_CHECK_ROUTES,
  TEST_3_CHECK_INDEXES,
  TEST_4_API_TESTS,
  TEST_5_PERFORMANCE,
  TESTING_STEPS,
  QUICK_COMMANDS,
  EXPECTED_RESULTS,
  TROUBLESHOOTING
};
