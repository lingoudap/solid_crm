// INTEGRATION GUIDE - Follow-Up Dashboard

/**
 * QUICK SETUP - Add Follow-Up Dashboard to Your App
 * 
 * Follow these steps to integrate the dashboard into your application
 */

// ==========================================
// STEP 1: Update Main App.js/App.jsx
// ==========================================

// Add this import
import FollowUpDashboard from "./Components/Dashboard/FollowUpDashboard";

// Add route (if using React Router)
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        {/* Other routes */}
        <Route path="/dashboard" element={<FollowUpDashboard />} />
        {/* Other routes */}
      </Routes>
    </Router>
  );
}

// ==========================================
// STEP 2: Add Navigation Link
// ==========================================

// In your Navigation/Sidebar component
<nav>
  <Link to="/dashboard" className="nav-link">
    📊 Dashboard
  </Link>
</nav>

// Or with styling
<a 
  href="/dashboard"
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    borderRadius: '8px',
    textDecoration: 'none',
    color: '#333',
    backgroundColor: '#f5f5f5',
    transition: 'background 0.2s'
  }}
>
  📊 Follow-Up Analytics
</a>

// ==========================================
// STEP 3: Verify Backend Setup
// ==========================================

/*
✅ Check these are completed:

1. ✓ dashboardRoutes.js registered in server/index.js
   - Look for: app.use("/api/dashboard", dashboardRoutes);

2. ✓ dashboardAnalyticsService.js exists
   - Location: server/services/dashboardAnalyticsService.js

3. ✓ authMiddleware.js exists
   - Location: server/middleware/authMiddleware.js

4. ✓ JWT tokens generated on login
   - Check: server/index.js /api/login endpoint

5. ✓ Follow-up data in MongoDB
   - Collection: followups
   - Model: FollowUpEnhanced
*/

// ==========================================
// STEP 4: Test API Endpoints
// ==========================================

// Open browser console and test:
const token = localStorage.getItem('token');

// Test 1: Get metrics
fetch('http://localhost:5000/api/dashboard/metrics', {
  headers: { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(d => console.log('Metrics:', d));

// Test 2: Get complete analytics
fetch('http://localhost:5000/api/dashboard/complete-analytics', {
  headers: { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(d => console.log('Analytics:', d));

// ==========================================
// STEP 5: Customize Dashboard (Optional)
// ==========================================

// Option A: Embed in existing page
function HomePage() {
  return (
    <div>
      <h1>Welcome</h1>
      <FollowUpDashboard />
    </div>
  );
}

// Option B: Add to admin panel
function AdminPanel() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: 0 }}>
      <Sidebar />
      <FollowUpDashboard />
    </div>
  );
}

// Option C: Add to dashboard with other widgets
function Dashboard() {
  return (
    <div>
      <ReportsWidget />
      <FollowUpDashboard />
      <SalesWidget />
    </div>
  );
}

// ==========================================
// STEP 6: Custom Styling (Optional)
// ==========================================

// Wrap dashboard with custom theme provider
import { useDashboard } from "./hooks/useDashboard";

export function CustomDashboard() {
  const { metrics, loading } = useDashboard();
  
  return (
    <div style={{ background: '#f0f0f0', padding: '20px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <FollowUpDashboard />
      </div>
    </div>
  );
}

// ==========================================
// STEP 7: Add Permissions (Optional)
// ==========================================

// Wrap with role-based access
function ProtectedDashboard() {
  const user = localStorage.getItem('user');
  const userRole = JSON.parse(user)?.role;
  
  // Only allow admin/manager roles
  if (!['admin', 'manager'].includes(userRole)) {
    return <div>Access Denied</div>;
  }
  
  return <FollowUpDashboard />;
}

// ==========================================
// STEP 8: Troubleshooting
// ==========================================

/*
Problem: Dashboard shows "Loading..." forever
Solution: 
  1. Check if user is logged in (token in localStorage)
  2. Open browser DevTools > Network tab
  3. Check if API requests return 200
  4. Check server console for errors

Problem: 404 Not Found on /api/dashboard/*
Solution:
  1. Verify dashboardRoutes.js is imported in server/index.js
  2. Check line: app.use("/api/dashboard", dashboardRoutes);
  3. Restart server

Problem: 401 Unauthorized
Solution:
  1. Login again to refresh token
  2. Check token format in localStorage
  3. Verify JWT_SECRET matches in server

Problem: No data showing in charts
Solution:
  1. Check if follow-up data exists in MongoDB
  2. Run: db.followups.find().count()
  3. Check aggregation queries in dashboardAnalyticsService.js
  4. Verify FollowUpEnhanced model has data
*/

// ==========================================
// STEP 9: Performance Tips
// ==========================================

/*
✓ Debounce auto-refresh during editing
✓ Disable auto-refresh on slow connections
✓ Use IndexDB for caching (future)
✓ Lazy load non-critical charts
✓ Use React.memo for chart components
✓ Consider pagination for large datasets
✓ Monitor MongoDB query performance
*/

// Example: Debounced refresh
import { useCallback, useRef } from 'react';

function DashboardWithDebounce() {
  const refreshTimeoutRef = useRef();
  
  const handleRefresh = useCallback(() => {
    clearTimeout(refreshTimeoutRef.current);
    refreshTimeoutRef.current = setTimeout(() => {
      // Call refetch
    }, 1000);
  }, []);
  
  return <FollowUpDashboard />;
}

// ==========================================
// STEP 10: Monitoring
// ==========================================

/*
Log dashboard metrics to analytics:
- Number of users viewing dashboard daily
- Average load time
- API response times
- Error rates
- Most viewed charts
*/

// Example monitoring
function Analytics() {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      console.log(`Dashboard loaded in ${endTime - startTime}ms`);
      // Send to analytics service
    };
  }, []);
}

// ==========================================
// DEPLOYMENT CHECKLIST
// ==========================================

/*
Before deploying to production:

☐ Backend Services:
  ☐ dashboardAnalyticsService.js created
  ☐ dashboardRoutes.js created and registered
  ☐ authMiddleware.js protecting endpoints
  ☐ MongoDB indexes created for performance
  ☐ JWT token generation working
  ☐ Error handling in place
  ☐ Rate limiting configured (optional)

☐ Frontend Components:
  ☐ All component files created
  ☐ All CSS files created
  ☐ useDashboard hook working
  ☐ Imports correct
  ☐ No console errors

☐ Testing:
  ☐ Dashboard loads without errors
  ☐ All API endpoints return data
  ☐ Charts render properly
  ☐ Responsive design verified
  ☐ Dark mode tested
  ☐ Error states tested
  ☐ Permission checks working

☐ Performance:
  ☐ Page load time < 3s
  ☐ API response time < 1s
  ☐ No memory leaks
  ☐ Auto-refresh working
  ☐ Mobile performance verified

☐ Security:
  ☐ JWT tokens validated
  ☐ API protected with auth
  ☐ No sensitive data in frontend
  ☐ CORS properly configured
*/

// ==========================================
// EXAMPLE USAGE IN HOMEPAGE
// ==========================================

import React from 'react';
import FollowUpDashboard from './Components/Dashboard/FollowUpDashboard';
import Header from './Components/Header';
import Sidebar from './Components/Sidebar';

export default function HomePage() {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, overflow: 'auto' }}>
        <Header title="Follow-Up Analytics" />
        <FollowUpDashboard />
      </div>
    </div>
  );
}

// Ready to use! 🎉
