📋 FAILED TO FETCH - TROUBLESHOOTING GUIDE

This error typically occurs when the dashboard can't fetch data from the API.
Root causes and solutions below:

========================================
STEP 1: VERIFY YOU'RE LOGGED IN
========================================

⚠️ MOST COMMON CAUSE: User not logged in

1. Open browser DevTools (F12)
2. Go to Console tab
3. Paste this command:
   localStorage.getItem("token")

✅ If you see a long string (JWT token): You're logged in - continue to Step 2
❌ If you see "null": You're NOT logged in
   → Solution: Login first, then navigate to Analytics

To login:
1. Go to http://localhost:3000
2. Click "Login" or "Sign In"
3. Enter your credentials
4. Click Submit

Wait 2-3 seconds for the page to redirect, then try the Analytics dashboard again.

========================================
STEP 2: CHECK BROWSER CONSOLE FOR DETAILS
========================================

The dashboard now logs detailed information. To see it:

1. Open DevTools Console (F12 → Console tab)
2. Look for these debug messages:
   - 🔍 Dashboard hook - Token check: ✅ Token exists
   - 📡 Fetching dashboard analytics from: http://localhost:5000/api/dashboard/complete-analytics
   - 📊 Response status: 200 OK
   - ✅ Dashboard data received: {...}

If you see any RED ERROR messages (❌), copy them and note what it says.

========================================
STEP 3: VERIFY SERVER IS RUNNING
========================================

Check if server is running on port 5000:

1. Open new PowerShell terminal
2. Run: tasklist | findstr node
3. Should show at least one node.exe process

❌ If no node.exe: Server is NOT running
   → Solution: Start server:
      cd d:\Lingouda\App\CRM\solid_crm\server
      node index.js

✅ If you see node.exe: Server is running

========================================
STEP 4: TEST API ENDPOINT DIRECTLY
========================================

Open browser DevTools Console and run:

const token = localStorage.getItem("token");
const response = await fetch("http://localhost:5000/api/dashboard/complete-analytics", {
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  }
});
console.log("Status:", response.status);
console.log("OK:", response.ok);
const data = await response.json();
console.log("Data:", data);

Expected output:
✅ Status: 200
✅ OK: true
✅ Data: { success: true, data: { metrics: {...}, dailyActivity: [...], ... } }

If you get different output, note the status code:
- 401: Token expired or invalid - Login again
- 403: Permission denied - Check auth middleware
- 404: Endpoint not found - Server issue
- 500: Server error - Check server console for details

========================================
STEP 5: CHECK SERVER CONSOLE OUTPUT
========================================

While the dashboard is loading, look at the server console.

You should see:
✅ "✅ MongoDB connected"
✅ "✅ Follow-Up indexes created successfully"
✅ "⏰ Follow-up reminder cron job started"

⚠️ If you see RED errors in server console, that's the problem.

Common server errors:
- "Cannot find module": Missing file
- "Connect ECONNREFUSED": MongoDB not connected
- "Token is not defined": Auth issue

========================================
STEP 6: CHECK NETWORK TAB
========================================

1. Open DevTools (F12)
2. Go to Network tab
3. Reload the page
4. Look for "complete-analytics" request
5. Click it to see details

Check these fields:
- Status: Should be 200 (green)
- Type: Should be "fetch"
- Size: Should show response size (not 0)
- Headers tab:
  - Request Headers should include:
    Authorization: Bearer {token}
    Content-Type: application/json
  - Response Headers should include:
    Content-Type: application/json

❌ If Status is RED (401, 403, 404, 500):
   - 401: Token issue
   - 403: Permission denied
   - 404: Endpoint not found
   - 500: Server error

========================================
COMMON SOLUTIONS
========================================

ERROR: "No auth token found"
SOLUTION: Login first, wait for redirect

ERROR: "Token is not defined" or "Token expired"
SOLUTION: 
1. Logout by clearing localStorage:
   localStorage.clear()
2. Refresh page
3. Login again

ERROR: "Failed to fetch" (generic)
SOLUTION:
1. Check server is running: tasklist | findstr node
2. Check MongoDB connected in server console
3. Open DevTools Console and check for more specific error
4. Copy the error message and search for it

ERROR: "Server returned 500"
SOLUTION:
1. Check server console for error details
2. Look for database connection issues
3. Verify FollowUpEnhanced model exists

ERROR: "Cannot find module" in server
SOLUTION:
1. Kill server: taskkill /F /IM node.exe
2. Wait 2 seconds
3. Start server again: node index.js

========================================
IF PROBLEM PERSISTS
========================================

Gather this information and provide it:

1. Copy this into browser console:
   console.log("Token:", localStorage.getItem("token")?.substring(0, 20));
   console.log("API Base:", "http://localhost:5000");
   fetch("http://localhost:5000/api/dashboard/metrics", {
     headers: {"Authorization": `Bearer ${localStorage.getItem("token")}`}
   }).then(r => r.json()).then(d => console.log("Metrics Response:", d))

2. Copy the FULL ERROR message from browser console

3. Copy these lines from server console:
   - Connection status (MongoDB connected or error)
   - Any red error messages
   - Port number (should be 5000)

4. Run this in PowerShell:
   curl -H "Authorization: Bearer {token}" http://localhost:5000/api/dashboard/metrics

Provide all this information when asking for help.

========================================
QUICK TEST CHECKLIST
========================================

Before debugging further:

☐ 1. User is logged in (token in localStorage)
☐ 2. Server is running (tasklist shows node.exe)
☐ 3. Browser console shows no auth errors
☐ 4. Network tab shows 200 status for complete-analytics
☐ 5. Server console shows "✅ MongoDB connected"
☐ 6. Server console shows "✅ Follow-Up indexes created successfully"
☐ 7. React app is at http://localhost:3000
☐ 8. Server is at http://localhost:5000

If all above are ✅, the dashboard should work!

