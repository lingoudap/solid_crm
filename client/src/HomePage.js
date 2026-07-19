import React, { useState, useEffect } from "react";
import "./Components/css/main.css";
import "./Components/css/Home.css";
import Lead from "./Components/Leads/AddLead";
import Quotation from "./Components/Quotation/AddQuotation";
import AddCustomerForm from "./Components/Customer/AddCustomer";
import Order from "./Components/Order/AddOrder";
import AddInvoice from "./Components/Invoice/AddInvoice";
import ViewCustomers from "./Components/Customer/ViewCustomer";
import ViewLeads from "./Components/Leads/ViewLeads";
import ViewQuotations from "./Components/Quotation/ViewQuotation";
import ViewOrders from "./Components/Order/ViewOrder";
import ViewInvoice from "./Components/Invoice/ViewInvoice";
import ViewFollowUps from "./Components/FollowUps/ViewFollowUp";
import Todo from "./Components/TODO/AddTodo";
import ViewTodo from "./Components/TODO/ViewTodo";
import FollowUpPage from "./Components/FollowUps/AddFollowUp";
import FollowUpTable from "./Components/FollowUps/FollowUpTableComponent";
import "./Components/FollowUps/FollowUpTable.css";
import Settings from "./Components/Settings/Settings";
import BulkUpload from "./Components/BulkUpload/BulkUpload";
import CustomPrints from "./Components/CustomPrints"; // Imports from index.jsx (refactored component)
import AddReport from "./Components/Reports/AddReport";
import ViewReports from "./Components/Reports/ViewReports";
import ReportDetails from "./Components/Reports/ReportDetails";
import { useSettings } from "./context/SettingsContext";
import DashboardCharts from "./Components/Dashboard/DashboardCharts.jsx";
import FollowUpDashboard from "./Components/Dashboard/FollowUpDashboard";
import NotificationBadge from "./Components/Notifications/NotificationBadge";

const HomePage = ({ setCurrentPage, loggedInUser }) => {
  const { moduleSettings: settings, setModuleSettings } = useSettings();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [customerCount, setCustomerCount] = useState(0);
  const [leadsCount, setLeadsCount] = useState(0);
  const [quotationsCount, setQuotationsCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [activeModule, setActiveModule] = useState("Dashboard");
  const [expandedModule, setExpandedModule] = useState(null);
  const [activeSub, setActiveSub] = useState(null);
  const [appLogo, setAppLogo] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [viewingReportId, setViewingReportId] = useState(null);
  const [followUps, setFollowUps] = useState([]);
  const [followUpLoading, setFollowUpLoading] = useState(false);

  // Include Settings, Reports, Custom Prints in the sidebar
  const modules = ["Lead", "Quotation", "Order", "Invoice", "Customer", "Follow-Up", "ToDo", "Reports", "Bulk Upload", "Custom Prints", "Settings"];

  const defaultBase = process.env.NODE_ENV === "development" ? "http://localhost:5000" : "";
  const apiUrl = process.env.REACT_APP_API_URL || defaultBase;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load logo from localStorage and backend as fallback
  useEffect(() => {
    const loadLogo = () => {
      const savedSettings = localStorage.getItem("userSettings");
      console.log("🔍 Checking localStorage for logo...");
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          if (parsed.logo) {
            console.log("✅ Logo found in localStorage, setting it");
            setAppLogo(parsed.logo);
            return; // Found in localStorage, no need to fetch from backend
          } else {
            console.log("⚠️ No logo found in parsed settings, trying backend...");
          }
        } catch (e) {
          console.warn("Failed to parse saved settings:", e);
        }
      } else {
        console.log("⚠️ No userSettings in localStorage, trying backend...");
      }

      // If not found in localStorage, try to fetch from backend
      const user = localStorage.getItem("user");
      if (user) {
        try {
          const parsedUser = JSON.parse(user);
          if (parsedUser.id) {
            console.log("📥 Fetching company settings from backend for user:", parsedUser.id);
            fetch(`${apiUrl}/api/company-settings/${parsedUser.id}`)
              .then(res => res.json())
              .then(data => {
                if (data.companySettings && data.companySettings.logo) {
                  console.log("✅ Logo fetched from backend, setting it");
                  setAppLogo(data.companySettings.logo);
                  // Save to localStorage for future use
                  localStorage.setItem("userSettings", JSON.stringify(data.companySettings));
                } else {
                  console.log("⚠️ No logo in backend settings");
                }
              })
              .catch(err => console.error("❌ Error fetching company settings:", err));
          }
        } catch (e) {
          console.warn("Failed to parse user data:", e);
        }
      }
    };

    loadLogo();

    // Listen for custom settings update event (same page)
    const handleSettingsUpdate = (event) => {
      console.log("📢 Settings updated event received", event.detail);
      if (event.detail && event.detail.logo) {
        console.log("✅ Logo in event detail, setting it");
        setAppLogo(event.detail.logo);
      }
    };

    // Listen for storage changes (different tab or triggered storage event)
    const handleStorageChange = (event) => {
      console.log("📢 Storage changed event received", event.key);
      if (event.key === "userSettings" || event.key === null) {
        loadLogo();
      }
    };

    window.addEventListener("settingsUpdated", handleSettingsUpdate);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("settingsUpdated", handleSettingsUpdate);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Refresh logo when returning from Settings
  useEffect(() => {
    if (activeModule !== "Settings") {
      const savedSettings = localStorage.getItem("userSettings");
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          if (parsed.logo) {
            setAppLogo(parsed.logo);
          }
        } catch (e) {
          console.warn("Failed to parse saved settings:", e);
        }
      }
    }
  }, [activeModule]);

  // Fetch counts for Dashboard
  const fetchCustomerCount = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/customers`);
      const data = await res.json();
      setCustomerCount(Array.isArray(data) ? data.length : 0);
    } catch (err) {
      console.error(err);
    }
  };
  const fetchLeadsCount = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/leads`);
      const data = await res.json();
      setLeadsCount(Array.isArray(data) ? data.length : 0);
    } catch (err) {
      console.error(err);
    }
  };
  const fetchQuotationsCount = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/quotations`);
      const data = await res.json();
      setQuotationsCount(Array.isArray(data) ? data.length : 0);
    } catch (err) {
      console.error(err);
    }
  };
  const fetchOrdersCount = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders`);
      const data = await res.json();
      setOrdersCount(Array.isArray(data) ? data.length : 0);
    } catch (err) {
      console.error(err);
    }
  };
  const fetchInvoicesCount = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/invoices`);
      const data = await res.json();
      setInvoiceCount(Array.isArray(data) ? data.length : 0);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Follow-Ups Data
  const fetchFollowUps = async () => {
    setFollowUpLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiUrl}/api/followups`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await res.json();
      setFollowUps(data.data || []);
    } catch (err) {
      console.error('Error fetching follow-ups:', err);
      setFollowUps([]);
    } finally {
      setFollowUpLoading(false);
    }
  };

  // Handle Edit Follow-Up
  const handleEdit = (followUp) => {
    try {
      localStorage.setItem('editFollowUp', JSON.stringify(followUp));
      setActiveModule('Follow-Up');
      setActiveSub('Add');
    } catch (e) {
      console.error('Error setting follow-up for edit:', e);
    }
  };

  // Handle Delete Follow-Up
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this follow-up?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiUrl}/api/followups/${id}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        console.log('✅ Follow-up deleted successfully');
        fetchFollowUps();
      }
    } catch (err) {
      console.error('Error deleting follow-up:', err);
    }
  };

  // Handle Complete Follow-Up
  const handleComplete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiUrl}/api/followups/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ status: 'Completed' })
      });
      if (res.ok) {
        console.log('✅ Follow-up marked as completed');
        fetchFollowUps();
      }
    } catch (err) {
      console.error('Error completing follow-up:', err);
    }
  };

  // Handle Reschedule Follow-Up
  const handleReschedule = (followUp) => {
    try {
      localStorage.setItem('rescheduleFollowUp', JSON.stringify(followUp));
      setActiveModule('Follow-Up');
      setActiveSub('Add');
    } catch (e) {
      console.error('Error setting follow-up for reschedule:', e);
    }
  };

  // Handle View Timeline
  const handleTimeline = (followUp) => {
    console.log('📅 View timeline for follow-up:', followUp);
    // Opens a timeline view or modal with follow-up history
    alert(`Timeline for follow-up: ${followUp._id}\n\nThis would show full history and activity log.`);
  };
  useEffect(() => {
    if (activeModule === "Follow-Up" && activeSub === "Table") {
      fetchFollowUps();
    } else if (activeModule === "Dashboard") {
      fetchCustomerCount();
      fetchLeadsCount();
      fetchQuotationsCount();
      fetchOrdersCount();
      fetchInvoicesCount();
    }
  }, [activeModule, activeSub]);

  // Sidebar navigation logic
  const toggleModule = (mod) => {
    setExpandedModule(expandedModule === mod ? null : mod);
  };

  const handleSelectSub = (mod, sub) => {
    setActiveModule(mod);
    setActiveSub(sub);
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      setCurrentPage("login");
    }
  };

  // Toggle dark/light mode via SettingsContext
  const toggleTheme = () => {
    try {
      setModuleSettings(prev => ({ ...prev, theme: prev.theme === "dark" ? "light" : "dark" }));
    } catch (e) {
      console.error("Failed to toggle theme:", e);
    }
  };

  const dashboardChartData = [
    { name: "Customers", value: customerCount },
    { name: "Leads", value: leadsCount },
    { name: "Quotations", value: quotationsCount },
    { name: "Orders", value: ordersCount },
    { name: "Invoices", value: invoiceCount },
  ];

  const getIcon = (item) => {
    const icons = {
      Dashboard: "📊",
      Lead: "📈",
      Quotation: "📃",
      Order: "📦",
      Invoice: "📄",
      Customer: "👥",
      "Follow-Up": "🔔",
      ToDo: "📝",
      "Bulk Upload": "📥",
      "Custom Prints": "🖨️",
      Settings: "⚙️",
      Reports: "📊",
      Logout: "🚪",
    };
    return <span>{icons[item] || "🔹"}</span>;
  };

  // Render main content area
  const renderContent = () => {
    if (activeModule === "Dashboard") {
      return (
        <div className="dashboard-content">
          <p>
            📊 Welcome to Lingouda's Dashboard! Overview of activities & sales operations.
          </p>

          <div className="stats-grid">
            <div className="stat-card customers">
              <div className="stat-content">
                <div className="stat-label">Customers</div>
                <div className="stat-value">{customerCount}</div>
              </div>
              <div className="stat-icon">👥</div>
            </div>

            <div className="stat-card leads">
              <div className="stat-content">
                <div className="stat-label">Leads</div>
                <div className="stat-value">{leadsCount}</div>
              </div>
              <div className="stat-icon">📈</div>
            </div>

            <div className="stat-card quotations">
              <div className="stat-content">
                <div className="stat-label">Quotations</div>
                <div className="stat-value">{quotationsCount}</div>
              </div>
              <div className="stat-icon">📃</div>
            </div>

            <div className="stat-card orders">
              <div className="stat-content">
                <div className="stat-label">Orders</div>
                <div className="stat-value">{ordersCount}</div>
              </div>
              <div className="stat-icon">📦</div>
            </div>
            <div className="stat-card invoices">
              <div className="stat-content">
                <div className="stat-label">Invoices</div>
                <div className="stat-value">{invoiceCount}</div>
              </div>
              <div className="stat-icon">📄</div>
            </div>
          </div>



          {/* Charts */}
          <DashboardCharts />
        </div>
      );
    }

    // Follow-Up Analytics Dashboard
    if (activeModule === "Analytics") {
      return <FollowUpDashboard />;
    }

    switch (activeModule) {
      case "Lead":
        if (activeSub === "Add") return <Lead />;
        if (activeSub === "View")
          return (
            <ViewLeads
              onRefreshParent={fetchLeadsCount}
              openQuotation={(lead) => {
                setActiveModule("Quotation");
                setActiveSub("Add");
                try {
                  localStorage.setItem("convertLead", JSON.stringify(lead || {}));
                } catch (e) { }
              }}
            />
          );
        break;
      case "Quotation":
        if (activeSub === "Add") return <Quotation />;
        if (activeSub === "View")
          return (
            <ViewQuotations
              onRefreshParent={fetchQuotationsCount}
              openOrder={(quote) => {
                setActiveModule("Order");
                setActiveSub("Add");
                try {
                  localStorage.setItem("convertQuote", JSON.stringify(quote || {}));
                } catch (e) { }
              }}
            />
          );
        break;
      case "Order":
        if (activeSub === "Add") return <Order />;
        if (activeSub === "View")
          return (
            <ViewOrders
              onRefreshParent={fetchOrdersCount}
              openInvoice={(order) => {
                setActiveModule("Invoice");
                setActiveSub("Add");
                try {
                  localStorage.setItem(
                    "convertOrder",
                    JSON.stringify(order || {})
                  );
                } catch (e) { }
              }}
            />
          );
        break;
      case "Invoice":
        if (activeSub === "Add") return <AddInvoice />;
        if (activeSub === "View")
          return <ViewInvoice />;
        break;
      case "Customer":
        if (activeSub === "Add")
          return <AddCustomerForm onCustomerAdded={fetchCustomerCount} />;
        if (activeSub === "View")
          return <ViewCustomers onRefreshParent={fetchCustomerCount} />;
        break;
      case "Follow-Up":
        if (activeSub === "Add") return <FollowUpPage />;
        if (activeSub === "View") return <ViewFollowUps />;
        if (activeSub === "Table") return (
          <FollowUpTable
            followUps={followUps}
            loading={followUpLoading}
            onEdit={(fu) => handleEdit(fu)}
            onDelete={(id) => handleDelete(id)}
            onComplete={(id) => handleComplete(id)}
            onReschedule={(fu) => handleReschedule(fu)}
            onViewTimeline={(fu) => handleTimeline(fu)}
          />
        );
        break;
      case "ToDo":
        if (activeSub === "Add") return <Todo />;
        if (activeSub === "View") return <ViewTodo />;
        break;
      case "Bulk Upload":
        return <BulkUpload />;
      case "Custom Prints":
        return <CustomPrints />;
      case "Settings":
        return <Settings />;
      case "Reports":
        if (viewingReportId) {
          return (
            <ReportDetails
              reportId={viewingReportId}
              onBack={() => setViewingReportId(null)}
            />
          );
        }
        if (activeSub === "Add") return <AddReport />;
        if (activeSub === "View")
          return (
            <ViewReports
              onViewReport={(reportId) => setViewingReportId(reportId)}
            />
          );
        break;

      default:
        return <div>Welcome — choose a module from the left.</div>;
    }
  };

  // 🌙 Apply theme from SettingsContext globally
  useEffect(() => {
    document.body.className = settings.theme === "dark" ? "dark" : "light";
  }, [settings.theme]);

  return (
    <div className={`container ${settings.theme === "dark" ? "dark" : "light"}`}>
      {/* Enhanced Top Bar */}
      <div className={`top-bar ${settings.theme === "dark" ? "dark" : "light"}`}>
        {/* LEFT SECTION: SIDEBAR TOGGLE & LOGO */}
        <div className="top-bar-left">
          <button className="sidebar-toggle" onClick={() => { if (sidebarOpen) setExpandedModule(null); setSidebarOpen(!sidebarOpen); }} title="Toggle sidebar">
            {sidebarOpen ? "⬅️" : "➡️"}
          </button>

          {/* Logo Display */}
          {/* <div className="top-bar-logo-container">
            {appLogo ? (
              <img 
                src={appLogo} 
                alt="App Logo" 
                className="top-bar-logo"
              />
            ) : (
              <span style={{ fontSize: "28px" }}>🏢</span>
            )}
          </div> */}

          <h2 className="top-bar-title">Welcome, {loggedInUser?.name || "Admin"}</h2>
        </div>

        {/* CENTER SECTION: SEARCH BAR */}
        <div className="search-container">
          <input
            type="text"
            placeholder="🔍 Search modules, customers..."
            className="search-bar"
          />
        </div>

        {/* RIGHT SECTION: CLOCK & ACTION BUTTONS */}
        <div className="top-bar-right">
          <div className="top-bar-clock">
            ⏰ {currentTime.toLocaleTimeString()}
          </div>

          <div className="top-bar-actions">
            {/* Follow-Up Analytics Button */}
            <button
              className="analytics-button"
              title="Follow-Up Analytics Dashboard"
              onClick={() => {
                setActiveModule("Analytics");
                setActiveSub(null);
                setExpandedModule(null);
              }}
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #ddd",
                background: activeModule === "Analytics" ? "#3B82F6" : "white",
                color: activeModule === "Analytics" ? "white" : "#333",
                cursor: "pointer",
                fontWeight: "500",
                marginRight: "8px",
                transition: "all 0.2s"
              }}
            >
              📊 Analytics
            </button>

            {/* Help Button */}
            <button
              className="help-button"
              title="Help & Support"
              onClick={() => alert("📚 Help & Support - Coming Soon!\n\nFeatures:\n• Documentation\n• Video Tutorials\n• Contact Support\n• FAQ")}
            >
              ❓
            </button>

            {/* Theme Toggle Button */}
            <button
              className="theme-toggle-button"
              title={settings.theme === "dark" ? "Switch to light" : "Switch to dark"}
              onClick={() => toggleTheme()}
              style={{ marginLeft: 8, padding: "6px 8px", borderRadius: 6, cursor: "pointer" }}
            >
              {settings.theme === "dark" ? "☀️" : "🌙"}
            </button>

            {/* Notification Badge with Panel */}
            <NotificationBadge userId={loggedInUser?._id || loggedInUser?.id} />

            {/* Profile Button */}
            <button
              className="profile-button"
              title="User Profile"
              onClick={() => setProfileOpen(!profileOpen)}
            >
              👤
            </button>

            {/* Profile Dropdown (Profile, Settings, Dark mode toggle, Logout) */}
            <div className={`dropdown-menu ${profileOpen ? "active" : ""}`}>
              <div className="dropdown-header">👤 {loggedInUser?.name || "User"}</div>

              <div
                className="dropdown-item"
                onClick={() => {
                  setProfileOpen(false);
                  setActiveModule("Profile");
                }}
              >
                <span className="dropdown-item-icon">👤</span>
                <span className="dropdown-item-text">Profile</span>
              </div>

              <div
                className="dropdown-item"
                onClick={() => {
                  setProfileOpen(false);
                  setActiveModule("Settings");
                }}
              >
                <span className="dropdown-item-icon">⚙️</span>
                <span className="dropdown-item-text">Settings</span>
              </div>

              <div
                className="dropdown-item"
                onClick={() => {
                  toggleTheme();
                }}
              >
                <span className="dropdown-item-icon">🌙</span>
                <span className="dropdown-item-text">
                  {settings.theme === "dark" ? "Switch to Light" : "Switch to Dark"}
                </span>
              </div>

              <div
                className="dropdown-item"
                onClick={() => {
                  setProfileOpen(false);
                  handleLogout();
                }}
              >
                <span className="dropdown-item-icon">🚪</span>
                <span className="dropdown-item-text">Logout</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="content-wrapper">
        {/* Enhanced Sidebar */}
        <div className={`sidebar ${settings.theme === "dark" ? "dark" : "light"} ${sidebarOpen ? "expanded" : "collapsed"}`}>
          <div className="top-bar-logo-container">
            {appLogo ? (
              <img
                src={appLogo}
                alt="App Logo"
                className="top-bar-logo"
              />
            ) : (
              <span style={{ fontSize: "32px" }}>🏢</span>
            )}
          </div>
          <ul className="sidebar-list">
            {/* Dashboard */}
            <li
              className={`sidebar-list-item ${activeModule === "Dashboard" ? "active" : ""
                }`}
              onClick={() => {
                setActiveModule("Dashboard");
                setActiveSub(null);
                setExpandedModule(null);
              }}
              title="Dashboard"
            >
              <span>📊</span>
              {sidebarOpen && <span style={{ marginLeft: "12px", flex: 1 }}>Dashboard</span>}
            </li>

            {/* Follow-Up Analytics */}
            <li
              className={`sidebar-list-item ${activeModule === "Analytics" ? "active" : ""
                }`}
              onClick={() => {
                setActiveModule("Analytics");
                setActiveSub(null);
                setExpandedModule(null);
              }}
              title="Follow-Up Analytics"
            >
              <span>📈</span>
              {sidebarOpen && <span style={{ marginLeft: "12px", flex: 1 }}>Follow-Up Analytics</span>}
            </li>

            {/* Main Modules */}
            {modules.map((mod) => (
              <li key={mod} className="module-group">
                {mod === "Settings" || mod === "Bulk Upload" || mod === "Custom Prints" ? (
                  <div
                    className={`sidebar-list-item ${activeModule === mod ? "active" : ""
                      }`}
                    onClick={() => {
                      setActiveModule(mod);
                      setActiveSub(null);
                      setExpandedModule(null);
                    }}
                    title={mod}
                  >
                    <span>{getIcon(mod)}</span>
                    {sidebarOpen && <span style={{ marginLeft: "12px", flex: 1 }}>{mod}</span>}
                  </div>
                ) : (
                  <>
                    <div
                      className={`sidebar-list-item module-item ${activeModule === mod && !activeSub ? "active" : ""
                        }`}
                      onClick={() => toggleModule(mod)}
                      title={`${expandedModule === mod ? "Collapse" : "Expand"} ${mod}`}
                    >
                      <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
                        <span>{getIcon(mod)}</span>
                        {sidebarOpen && <span style={{ marginLeft: "12px" }}>{mod}</span>}
                      </div>
                      {sidebarOpen && (
                        <span style={{ fontSize: "12px" }}>
                          {expandedModule === mod ? "▾" : "▸"}
                        </span>
                      )}
                    </div>

                    {expandedModule === mod && (
                      <ul className="submenu">
                        <li
                          className={`sidebar-subitem ${activeModule === mod && activeSub === "Add" ? "active" : ""
                            }`}
                          onClick={() => handleSelectSub(mod, "Add")}
                          title={`Add ${mod}`}
                        >
                          <span>➕</span>
                          {sidebarOpen && <span style={{ marginLeft: "8px" }}>Add {mod}</span>}
                        </li>
                        <li
                          className={`sidebar-subitem ${activeModule === mod && activeSub === "View" ? "active" : ""
                            }`}
                          onClick={() => handleSelectSub(mod, "View")}
                          title={`View ${mod}`}
                        >
                          <span>🔎</span>
                          {sidebarOpen && <span style={{ marginLeft: "8px" }}>View {mod}</span>}
                        </li>
                        {mod === "Follow-Up" && (
                          <li
                            className={`sidebar-subitem ${activeModule === mod && activeSub === "Table" ? "active" : ""
                              }`}
                            onClick={() => handleSelectSub(mod, "Table")}
                            title="Table View"
                          >
                            <span>📊</span>
                            {sidebarOpen && <span style={{ marginLeft: "8px" }}>Table View</span>}
                          </li>
                        )}
                      </ul>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>

          {/* Sidebar Footer */}
          {/* <div className="sidebar-footer">
            
            <button
              className="sidebar-footer-item"
              onClick={() => setCurrentPage("login")}
              title="Logout"
            >
              <span>🚪</span>
              {sidebarOpen && <span>Logout</span>}
            </button>
          </div> */}
        </div>

        {/* Main Content */}
        <div className="main-content">
          {/* <h1 style={{ marginLeft: "20px" }}>
            {activeModule}
            {activeSub ? ` — ${activeSub}` : ""}
          </h1> */}

          {activeModule === "Dashboard" && (
            <div className="marquee-wrapper">
              <div className="marquee">
                📢 Welcome to Sales Dashboard! Stay updated with the latest info.
              </div>
            </div>
          )}

          <div className="page-content">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
