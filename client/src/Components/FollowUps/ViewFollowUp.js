// ViewFollowUp.js
import React, { useEffect, useState } from "react";
import DateFilterContainer from "../Leads/DateFilterContainer";
import "./ViewFollowUp.css";

export default function ViewFollowUps() {
  const [followUps, setFollowUps] = useState([]);
  const [followUpsWithDetails, setFollowUpsWithDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [dateFilterOpen, setDateFilterOpen] = useState(false);
  
  // Update modal state
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedFollowUp, setSelectedFollowUp] = useState(null);
  const [conversationDetails, setConversationDetails] = useState("");
  const [nextFollowUpDate, setNextFollowUpDate] = useState("");
  const [nextFollowUpTime, setNextFollowUpTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const base = process.env.REACT_APP_API_URL || "http://localhost:5000";

  // Fetch all follow-ups
  const fetchFollowUps = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${base.replace(/\/$/, "")}/api/followups`);
      const data = await res.json();
      setFollowUps(data);
      
      // Fetch details for each follow-up (lead/quotation name)
      const withDetails = await Promise.all(
        data.map(async (fu) => {
          let entityName = "Unknown";
          let entityEmail = "-";
          
          try {
            if (fu.relatedType === "Lead") {
              const leadRes = await fetch(`${base.replace(/\/$/, "")}/api/leads/${fu.relatedId}`);
              if (leadRes.ok) {
                const lead = await leadRes.json();
                entityName = lead.name || "Unknown";
                entityEmail = lead.email || "-";
              }
            } else if (fu.relatedType === "Quotation") {
              const quotRes = await fetch(`${base.replace(/\/$/, "")}/api/quotations/${fu.relatedId}`);
              if (quotRes.ok) {
                const quotation = await quotRes.json();
                entityName = quotation.customerName || "Unknown";
                entityEmail = quotation.email || "-";
              }
            }
          } catch (err) {
            console.error("Error fetching entity details:", err);
          }
          
          return {
            ...fu,
            entityName,
            entityEmail
          };
        })
      );
      
      setFollowUpsWithDetails(withDetails);
    } catch (error) {
      console.error("❌ Error fetching follow-ups:", error);
      alert("Failed to fetch follow-ups");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowUps();
  }, []);

  // Open update modal
  const handleOpenUpdateModal = (followUp) => {
    setSelectedFollowUp(followUp);
    setUpdateModalOpen(true);
    setConversationDetails("");
    setNextFollowUpDate("");
    setNextFollowUpTime("");
    setUpdateError("");
    setUpdateSuccess(false);
  };

  // Submit update
  const handleSubmitUpdate = async () => {
    // Reset error state
    setUpdateError("");
    setUpdateSuccess(false);

    // Validate conversation details
    if (!conversationDetails.trim()) {
      setUpdateError("Please enter conversation details");
      return;
    }

    // Validate that if date is set, time must also be set
    if (nextFollowUpDate && !nextFollowUpTime) {
      setUpdateError("Please enter time for the next follow-up");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("🔍 Starting follow-up update...");
      const updatePayload = {
        conversationDetails: conversationDetails.trim()
      };

      // If next follow-up date is provided, add it to the payload as ISO string
      if (nextFollowUpDate) {
        updatePayload.nextFollowUpDate = new Date(`${nextFollowUpDate}T${nextFollowUpTime}`).toISOString();
      }

      console.log("📤 Sending payload:", updatePayload);
      const apiUrl = `${base.replace(/\/$/, "")}/api/followups/${selectedFollowUp._id}`;
      console.log("📍 API URL:", apiUrl);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(apiUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      console.log("📥 Response status:", response.status);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (jsonErr) {
          console.warn("Could not parse error response JSON:", jsonErr);
        }
        throw new Error(errorMessage);
      }

      let updatedFollowUp;
      try {
        updatedFollowUp = await response.json();
        console.log("✅ Update response parsed:", updatedFollowUp);
      } catch (jsonErr) {
        console.error("❌ Failed to parse response JSON:", jsonErr);
        throw new Error("Server returned invalid response. Please refresh and try again.");
      }

      console.log("✨ Setting success state and closing modal...");
      setUpdateSuccess(true);

      // Close modal after a brief delay to show success message
      setTimeout(() => {
        console.log("🚀 Closing modal and refreshing list...");
        setUpdateModalOpen(false);
        setSelectedFollowUp(null);
        setConversationDetails("");
        setNextFollowUpDate("");
        setNextFollowUpTime("");
        setUpdateSuccess(false);
        setIsSubmitting(false);
        
        // Refresh the follow-up list
        fetchFollowUps();
      }, 1500);
    } catch (error) {
      console.error("❌ Error updating follow-up:", error);
      console.error("Error type:", error.name);
      console.error("Error message:", error.message);
      
      let errorMsg = error.message || "Failed to update follow-up. Please try again.";
      
      // Handle abort errors specifically
      if (error.name === "AbortError") {
        errorMsg = "Request timed out. Server is not responding. Please check the server status.";
      }
      
      setUpdateError(errorMsg);
      setIsSubmitting(false);
    }
  };

  // Helper function to get urgency level and style
  const getUrgency = (followUpDate) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const fuDate = new Date(followUpDate);
    const fuDateOnly = new Date(fuDate.getFullYear(), fuDate.getMonth(), fuDate.getDate());
    
    const daysUntil = Math.ceil((fuDateOnly - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 0) {
      return { label: "OVERDUE", color: "bg-red-100 text-red-800", urgency: 5 };
    } else if (daysUntil === 0) {
      return { label: "TODAY", color: "bg-red-100 text-red-800", urgency: 4 };
    } else if (daysUntil === 1) {
      return { label: "TOMORROW", color: "bg-orange-100 text-orange-800", urgency: 3 };
    } else if (daysUntil <= 7) {
      return { label: "THIS WEEK", color: "bg-yellow-100 text-yellow-800", urgency: 2 };
    } else {
      return { label: "UPCOMING", color: "bg-blue-100 text-blue-800", urgency: 1 };
    }
  };

  // Filter and sort follow-ups based on status, search query, and date range
  const filteredFollowUps = followUpsWithDetails
    .filter((fu) => {
      const matchesStatus = filterStatus === "all" || fu.status === filterStatus;
      const matchesSearch = 
        fu.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fu.entityEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fu.notes.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by date range
      const matchesDateRange = (() => {
        if (!startDate || !endDate) return true;
        const followUpDate = fu.nextFollowUpDate || fu.followUpDate;
        const date = new Date(followUpDate);
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return date >= start && date <= end;
      })();
      
      return matchesStatus && matchesSearch && matchesDateRange;
    })
    .sort((a, b) => {
      // Sort by urgency first (overdue/today first), then by date
      const dateA = a.nextFollowUpDate || a.followUpDate;
      const dateB = b.nextFollowUpDate || b.followUpDate;
      
      const urgencyA = getUrgency(dateA).urgency;
      const urgencyB = getUrgency(dateB).urgency;
      
      if (urgencyA !== urgencyB) {
        return urgencyB - urgencyA; // Higher urgency first
      }
      
      return new Date(dateA) - new Date(dateB); // Earlier dates first
    });

  const getStatusBadge = (status) => {
    const statusColors = {
      "Pending": "bg-yellow-100 text-yellow-800",
      "Running": "bg-orange-100 text-orange-800",
      "Completed": "bg-green-100 text-green-800",
    };
    return statusColors[status] || "bg-gray-100 text-gray-800";
  };

  const getTypeColor = (type) => {
    return type === "Lead" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800";
  };

  return (
    <div className="followup-container p-5">
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Follow-Up — View</h1>
      </div>

      {/* Header Toolbar */}
      <div className="followup-toolbar">
        <button
          className="toolbar-btn toolbar-btn-outline"
          title="Filter results"
        >
          🔍 Filter
        </button>

        <button
          className="toolbar-btn toolbar-btn-gray"
          title="Show/hide columns"
        >
          ⚙️ Columns
        </button>

        <button
          className="toolbar-btn toolbar-btn-yellow"
          title={`${followUpsWithDetails.filter(f =>
            (filterStatus === "all" || f.status === filterStatus) &&
            (searchQuery === "" ||
              f.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              f.entityEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
              f.notes.toLowerCase().includes(searchQuery.toLowerCase()))
          ).length} filters applied`}
        >
          ⊕ Filters ({followUpsWithDetails.filter(f =>
            (filterStatus === "all" || f.status === filterStatus) &&
            (searchQuery === "" ||
              f.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              f.entityEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
              f.notes.toLowerCase().includes(searchQuery.toLowerCase()))
          ).length})
        </button>

        <button
          className="toolbar-btn toolbar-btn-green"
          title="Export to CSV"
        >
          📥 Export CSV
        </button>

        <button
          className="toolbar-btn toolbar-btn-blue"
          onClick={fetchFollowUps}
          disabled={loading}
          title="Refresh data"
        >
          {loading ? "⏳ Loading..." : "🔄 Refresh"}
        </button>

        <button
          className="toolbar-btn toolbar-btn-cyan"
          onClick={() => setDateFilterOpen(!dateFilterOpen)}
          title="Apply date filter"
        >
          📅 Apply - Date Filter
        </button>
      </div>

      {/* Advanced Filters Section */}
      <div className="followup-filters">
        <input
          type="text"
          placeholder="Search by name, email, or notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="followup-search-input"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="followup-status-select"
        >
          <option value="all">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Running">Running</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {/* Date Filter Container */}
      {dateFilterOpen && (
        <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <DateFilterContainer
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            dateFilterOpen={dateFilterOpen}
            setDateFilterOpen={setDateFilterOpen}
            onPageChange={() => {}} 
          />
        </div>
      )}

      {/* Summary Stats */}
      <div className="followup-stats-grid mb-6">
        <div className="bg-blue-50 p-4 rounded border-l-4 border-blue-500">
          <div className="text-gray-600 text-sm">Total Follow-Ups</div>
          <div className="text-2xl font-bold text-blue-600">{followUpsWithDetails.length}</div>
        </div>
        <div className="bg-red-50 p-4 rounded border-l-4 border-red-500">
          <div className="text-gray-600 text-sm">🚨 Overdue or Today</div>
          <div className="text-2xl font-bold text-red-600">
            {followUpsWithDetails.filter(f => {
              const date = f.nextFollowUpDate || f.followUpDate;
              const urgency = getUrgency(date).urgency;
              return urgency >= 4; // Overdue or Today
            }).length}
          </div>
        </div>
        <div className="bg-yellow-50 p-4 rounded border-l-4 border-yellow-500">
          <div className="text-gray-600 text-sm">⚠️ This Week</div>
          <div className="text-2xl font-bold text-yellow-600">
            {followUpsWithDetails.filter(f => {
              const date = f.nextFollowUpDate || f.followUpDate;
              const urgency = getUrgency(date).urgency;
              return urgency === 2; // This Week
            }).length}
          </div>
        </div>
        <div className="bg-orange-50 p-4 rounded border-l-4 border-orange-500">
          <div className="text-gray-600 text-sm">Running</div>
          <div className="text-2xl font-bold text-orange-600">
            {followUpsWithDetails.filter(f => f.status === "Running").length}
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded border-l-4 border-green-500">
          <div className="text-gray-600 text-sm">Completed</div>
          <div className="text-2xl font-bold text-green-600">
            {followUpsWithDetails.filter(f => f.status === "Completed").length}
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table className="followup-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Type</th>
              <th>Entity Name</th>
              <th>Email</th>
              <th>Follow-Up Date</th>
              <th>Reschedule Status</th>
              <th>Notes</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredFollowUps.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: "center", padding: "24px", color: "#6b7280" }}>
                  {followUpsWithDetails.length === 0 ? "📭 No follow-ups added yet" : "🔍 No matches found"}
                </td>
              </tr>
            ) : (
              filteredFollowUps.map((f, idx) => {
                const followUpDate = f.nextFollowUpDate || f.followUpDate;
                const urgency = getUrgency(followUpDate);
                const isUrgent = urgency.urgency >= 4; // Overdue or Today
                
                return (
                  <tr key={f._id} style={{ backgroundColor: isUrgent ? "#fef2f2" : "transparent" }}>
                    <td style={{ fontWeight: "500", color: "#374151" }}>{idx + 1}</td>
                    <td>
                      <span style={{
                        display: "inline-block",
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "600",
                        backgroundColor: f.relatedType === "Lead" ? "#dbeafe" : "#ede9fe",
                        color: f.relatedType === "Lead" ? "#1e40af" : "#5b21b6"
                      }}>
                        {f.relatedType}
                      </span>
                    </td>
                    <td style={{ fontWeight: "500", color: "#1f2937" }}>{f.entityName}</td>
                    <td style={{ color: "#6b7280" }}>{f.entityEmail}</td>
                    <td style={{ fontWeight: "500" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span style={{
                          display: "inline-block",
                          fontSize: "11px",
                          fontWeight: "700",
                          padding: "4px 8px",
                          borderRadius: "12px",
                          width: "fit-content",
                          backgroundColor: urgency.color?.split(" ")[0] === "bg-red-100" ? "#fee2e2" : 
                                         urgency.color?.split(" ")[0] === "bg-orange-100" ? "#fed7aa" :
                                         urgency.color?.split(" ")[0] === "bg-yellow-100" ? "#fef3c7" : "#dbeafe",
                          color: urgency.color?.split(" ")[1] === "text-red-800" ? "#991b1b" : 
                                urgency.color?.split(" ")[1] === "text-orange-800" ? "#92400e" :
                                urgency.color?.split(" ")[1] === "text-yellow-800" ? "#854d0e" : "#1e40af"
                        }}>
                          {urgency.label}
                        </span>
                        <span style={{ color: isUrgent ? "#dc2626" : "#374151", fontSize: "13px" }}>
                          {new Date(followUpDate).toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {f.nextFollowUpDate ? (
                        <span style={{
                          display: "inline-block",
                          padding: "4px 12px",
                          backgroundColor: "#fed7aa",
                          color: "#92400e",
                          borderRadius: "20px",
                          fontWeight: "600",
                          fontSize: "12px"
                        }}>
                          🔄 Rescheduled
                        </span>
                      ) : (
                        <span style={{ color: "#d1d5db", fontSize: "13px" }}>-</span>
                      )}
                    </td>
                    <td style={{ color: "#4b5563", maxWidth: "200px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={f.notes || ""}>
                      {f.notes || "-"}
                    </td>
                    <td>
                      <span style={{
                        display: "inline-block",
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "600",
                        backgroundColor: f.status === "Pending" ? "#fef08a" : f.status === "Running" ? "#fed7aa" : "#dcfce7",
                        color: f.status === "Pending" ? "#854d0e" : f.status === "Running" ? "#92400e" : "#166534"
                      }}>
                        {f.status}
                      </span>
                    </td>
                    <td>
                      {(f.status === "Pending" || f.status === "Running") && (
                        <button
                          onClick={() => handleOpenUpdateModal(f)}
                          style={{
                            backgroundColor: "#3b82f6",
                            color: "white",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "all 0.2s ease"
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = "#2563eb"}
                          onMouseOut={(e) => e.target.style.backgroundColor = "#3b82f6"}
                        >
                          ✏️ Update
                        </button>
                      )}
                      {f.status === "Completed" && (
                        <span style={{ color: "#9ca3af", fontSize: "12px", fontWeight: "600" }}>✓ Closed</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      {filteredFollowUps.length > 0 && (
        <div style={{ marginTop: "16px", padding: "12px 16px", backgroundColor: "#f8f9fb", borderRadius: "8px", fontSize: "14px", color: "#4b5563", display: "inline-block", border: "1px solid #e5e7eb" }}>
          Showing <span style={{ fontWeight: "600" }}>{filteredFollowUps.length}</span> of{" "}
          <span style={{ fontWeight: "600" }}>{followUpsWithDetails.length}</span> follow-ups
        </div>
      )}

      {/* Update Follow-Up Modal */}
      {updateModalOpen && selectedFollowUp && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="modal-box" style={{ maxWidth: '640px' }}>
            {/* Modal Header */}
            <div style={{ borderBottom: '1px solid #e5e7eb', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', borderRadius: '12px 12px 0 0' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1e3a5f', margin: 0 }}>📝 Update Follow-Up</h3>
              <button
                onClick={() => setUpdateModalOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full text-gray-600 hover:text-gray-900 hover:bg-white transition-all duration-200 font-bold text-2xl leading-none shadow-sm hover:shadow-md active:scale-95"
                title="Close"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              {/* Error Message */}
              {updateError && (
                <div style={{ background: '#fef2f2', borderLeft: '4px solid #ef4444', padding: '0.875rem 1rem', borderRadius: '6px' }}>
                  <p style={{ color: '#b91c1c', fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>❌ {updateError}</p>
                </div>
              )}

              {/* Success Message */}
              {updateSuccess && (
                <div style={{ background: '#f0fdf4', borderLeft: '4px solid #22c55e', padding: '0.875rem 1rem', borderRadius: '6px' }}>
                  <p style={{ color: '#15803d', fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>✅ Follow-up updated successfully!</p>
                </div>
              )}

              {/* Follow-Up Details Card */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                <div className="modal-details-grid">
                  <div className="modal-detail-item">
                    <span className="detail-label">Entity</span>
                    <span className="detail-value">{selectedFollowUp.entityName}</span>
                  </div>
                  <div className="modal-detail-item">
                    <span className="detail-label">Type</span>
                    <span className="detail-value">{selectedFollowUp.relatedType}</span>
                  </div>
                  <div className="modal-detail-item">
                    <span className="detail-label">Scheduled Date & Time</span>
                    <span className="detail-value">{new Date(selectedFollowUp.followUpDate).toLocaleString()}</span>
                  </div>
                  <div className="modal-detail-item">
                    <span className="detail-label">Original Notes</span>
                    <span className="detail-value">{selectedFollowUp.notes || "No notes"}</span>
                  </div>
                </div>
                {selectedFollowUp.nextFollowUpDate && (
                  <div style={{ background: '#fff7ed', borderTop: '1px solid #fed7aa', padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#9a3412', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rescheduled to:</span>
                    <span style={{ fontWeight: 700, color: '#c2410c', fontSize: '0.95rem' }}>{new Date(selectedFollowUp.nextFollowUpDate).toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Conversation Details */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: '#1f2937', marginBottom: '0.5rem' }}>
                  Conversation Details <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.625rem', marginTop: 0 }}>What was discussed during the follow-up conversation?</p>
                <textarea
                  value={conversationDetails}
                  onChange={(e) => setConversationDetails(e.target.value)}
                  placeholder="Enter conversation details here..."
                  disabled={isSubmitting}
                  rows="3"
                />
              </div>

              {/* Reschedule Section */}
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '1.25rem', borderRadius: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e40af' }}>Reschedule Follow-Up</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#6b7280', background: '#e5e7eb', padding: '0.125rem 0.5rem', borderRadius: '9999px' }}>Optional</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#4b5563', marginBottom: '1rem', marginTop: '0.25rem' }}>
                  Leave empty to mark as <strong>Completed</strong>. Set a date to reschedule.
                </p>
                <div className="modal-reschedule-grid">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#374151', marginBottom: '0.375rem' }}>Next Date</label>
                    <input
                      type="date"
                      value={nextFollowUpDate}
                      onChange={(e) => setNextFollowUpDate(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#374151', marginBottom: '0.375rem' }}>Time</label>
                    <input
                      type="time"
                      value={nextFollowUpTime}
                      onChange={(e) => setNextFollowUpTime(e.target.value)}
                      disabled={!nextFollowUpDate || isSubmitting}
                    />
                  </div>
                </div>
              </div>

              {/* Status Preview */}
              <div className={`status-preview ${nextFollowUpDate ? 'running' : 'completed'}`}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Status after update:</span>
                {nextFollowUpDate ? (
                  <span style={{ fontWeight: 700, color: '#c2410c', fontSize: '0.9rem' }}>
                    🔄 Running — Rescheduled for {new Date(nextFollowUpDate).toLocaleDateString()}
                  </span>
                ) : (
                  <span style={{ fontWeight: 700, color: '#15803d', fontSize: '0.9rem' }}>
                    ✅ Completed (No reschedule)
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="modal-actions">
                <button
                  onClick={() => setUpdateModalOpen(false)}
                  disabled={isSubmitting}
                >
                  ✕ Cancel
                </button>
                <button
                  onClick={handleSubmitUpdate}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="inline-block animate-spin">⏳</span>
                      Updating...
                    </>
                  ) : (
                    <>
                      <span>✓</span>
                      Update Follow-Up
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
