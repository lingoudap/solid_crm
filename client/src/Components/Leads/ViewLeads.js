import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import DateFilterContainer from "./DateFilterContainer";
import PrintTemplateSelector from "../common/PrintTemplateSelector";
import "./AddLead.css";

const ViewLeads = ({ refreshTrigger, onRefreshParent, openQuotation }) => {
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSource, setFilterSource] = useState("all");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [filterName, setFilterName] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [columnsDropdownOpen, setColumnsDropdownOpen] = useState(false);
  const [openActionId, setOpenActionId] = useState(null);
  const [quickPreviewOpen, setQuickPreviewOpen] = useState(false);
  const [quickPreviewLead, setQuickPreviewLead] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [followUpModalOpen, setFollowUpModalOpen] = useState(false);
  const [selectedLeadForFollowUp, setSelectedLeadForFollowUp] = useState(null);
  const [followUpNote, setFollowUpNote] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpTime, setFollowUpTime] = useState("");
  const [dateFilterOpen, setDateFilterOpen] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
  const [whatsappLead, setWhatsappLead] = useState(null);
  const [whatsappMessage, setWhatsappMessage] = useState("");

  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem("viewLeadsColumns");
    return saved ? JSON.parse(saved) : {
      name: true,
      phone: true,
      email: true,
      source: true,
      status: true,
      followups: true,
      nextFollowup: true,
      created: true,
    };
  });

  const [savedFilters, setSavedFilters] = useState(() => {
    const saved = localStorage.getItem("viewLeadsSavedFilters");
    return saved ? JSON.parse(saved) : [];
  });
  const [savedFiltersDropdownOpen, setSavedFiltersDropdownOpen] = useState(false);
  const [newFilterName, setNewFilterName] = useState("");

  const base = process.env.REACT_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    const closeMenu = (e) => {
      if (!e.target.closest(".action-dropdown-menu") && !e.target.closest(".action-btn")) {
        setOpenActionId(null);
      }
    };
    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const url = `${base.replace(/\/$/, "")}/api/leads`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setLeads(data);
      setSelectedLeads([]);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [base]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getUniqueSources = () => {
    const sources = new Set(leads.map(l => l.Source).filter(Boolean));
    return Array.from(sources).sort();
  };

  const getFollowUpCount = (lead) => {
    const followUpsData = lead.followUpsNew || lead.followUps || [];
    return Array.isArray(followUpsData) ? followUpsData.length : 0;
  };

  const getNextFollowUpDate = (lead) => {
    const followUpsData = lead.followUpsNew || lead.followUps || [];
    if (!Array.isArray(followUpsData) || followUpsData.length === 0) return null;

    const futureDates = followUpsData
      .filter(f => {
        const dateField = f.followUpDate || f.date;
        return dateField && new Date(dateField) > new Date();
      })
      .sort((a, b) => new Date(a.followUpDate || a.date) - new Date(b.followUpDate || b.date));

    return futureDates.length > 0 ? (futureDates[0].followUpDate || futureDates[0].date) : null;
  };

  const isLeadHighlighted = (lead) => {
    const nextFollowUp = getNextFollowUpDate(lead);
    if (!nextFollowUp) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const followUpDate = new Date(nextFollowUp);
    followUpDate.setHours(0, 0, 0, 0);

    if (followUpDate < today) return "overdue";
    if (followUpDate.getTime() === today.getTime()) return "today";
    return null;
  };

  const filteredByAllCriteria = useMemo(() => {
    return leads
      .filter(l => JSON.stringify(l).toLowerCase().includes(query.toLowerCase()))
      .filter(l => {
        if (filterName.trim() === "") return true;
        return (l.name || "").toLowerCase().includes(filterName.toLowerCase());
      })
      .filter(l => (filterStatus === "all" ? true : l.status === filterStatus))
      .filter(l => (filterSource === "all" ? true : l.Source === filterSource));
  }, [leads, query, filterName, filterStatus, filterSource]);

  const visibleLeads = useMemo(() => {
    return filteredByAllCriteria.filter(l => {
      if (!startDate || !endDate) return true;
      const date = new Date(l.createdAt);
      return date >= new Date(startDate) && date <= new Date(endDate);
    });
  }, [filteredByAllCriteria, startDate, endDate]);

  const getSortedLeads = useCallback((leadsToSort) => {
    return [...leadsToSort].sort((a, b) => {
      let aVal, bVal;

      switch (sortBy) {
        case "name":
          aVal = (a.name || "").toLowerCase();
          bVal = (b.name || "").toLowerCase();
          break;
        case "phone":
          aVal = a.phone || "";
          bVal = b.phone || "";
          break;
        case "email":
          aVal = (a.email || "").toLowerCase();
          bVal = (b.email || "").toLowerCase();
          break;
        case "source":
          aVal = (a.Source || "").toLowerCase();
          bVal = (b.Source || "").toLowerCase();
          break;
        case "status":
          const statusOrder = { "New": 1, "Active": 2, "Converted": 3, "Lost": 4 };
          aVal = statusOrder[a.status] || 0;
          bVal = statusOrder[b.status] || 0;
          break;
        case "createdAt":
        default:
          aVal = new Date(a.createdAt || 0);
          bVal = new Date(b.createdAt || 0);
          break;
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [sortBy, sortOrder]);

  const sortedLeads = useMemo(() => getSortedLeads(visibleLeads), [visibleLeads, getSortedLeads]);

  const pageCount = useMemo(() => Math.max(1, Math.ceil(sortedLeads.length / perPage)), [sortedLeads.length, perPage]);
  const pageData = useMemo(() => sortedLeads.slice((page - 1) * perPage, page * perPage), [sortedLeads, page, perPage]);

  const stats = useMemo(() => ({
    total: visibleLeads.length,
    new: visibleLeads.filter(l => l.status === "New").length,
    active: visibleLeads.filter(l => l.status === "Active").length,
    converted: visibleLeads.filter(l => l.status === "Converted").length,
    lost: visibleLeads.filter(l => l.status === "Lost").length,
  }), [visibleLeads]);

  const handleSelectAll = () => {
    if (selectedLeads.length === pageData.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(pageData.map(l => l._id));
    }
  };

  const handleSelectLead = (leadId) => {
    setSelectedLeads(prev =>
      prev.includes(leadId)
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedLeads.length} lead(s)?`)) return;

    try {
      const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
      for (const leadId of selectedLeads) {
        await fetch(`${baseUrl.replace(/\/$/, "")}/api/leads/${leadId}`, { method: "DELETE" });
      }
      alert("✅ Leads deleted successfully!");
      setSelectedLeads([]);
      await fetchData();
    } catch (error) {
      alert(`❌ ${error.message || "Failed to delete leads"}`);
    }
  };

  const handleBulkStatusChange = async (newStatus) => {
    try {
      const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
      for (const leadId of selectedLeads) {
        const lead = leads.find(l => l._id === leadId);
        if (lead) {
          await fetch(`${baseUrl.replace(/\/$/, "")}/api/leads/${leadId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...lead, status: newStatus }),
          });
        }
      }
      alert(`✅ ${selectedLeads.length} lead(s) status updated!`);
      setSelectedLeads([]);
      await fetchData();
    } catch (error) {
      alert(`❌ ${error.message || "Failed to update status"}`);
    }
  };

  const handleBulkExportCSV = () => {
    try {
      const headers = ["#", "Name", "Contact", "Email", "Source", "Status", "Follow-ups", "Created"];
      const selectedLeadsData = leads.filter(l => selectedLeads.includes(l._id));
      const rows = selectedLeadsData.map((l, i) => [
        i + 1,
        l.name || "-",
        l.phone || "-",
        l.email || "-",
        l.Source || "-",
        l.status || "New",
        getFollowUpCount(l),
        l.createdAt ? new Date(l.createdAt).toLocaleDateString() : "-",
      ]);

      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += headers.join(",") + "\n";
      rows.forEach(row => {
        csvContent += row.map(cell => `"${cell}"`).join(",") + "\n";
      });

      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      link.setAttribute("download", `leads-bulk-export-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      alert("✅ CSV exported successfully!");
    } catch (err) {
      alert("❌ Failed to export CSV");
    }
  };

  const handleColumnToggle = (column) => {
    const updated = { ...visibleColumns, [column]: !visibleColumns[column] };
    setVisibleColumns(updated);
    localStorage.setItem("viewLeadsColumns", JSON.stringify(updated));
  };

  const handleSaveFilter = () => {
    if (!newFilterName.trim()) {
      alert("Enter filter name");
      return;
    }

    const newFilter = {
      id: Date.now(),
      name: newFilterName,
      filterStatus,
      filterSource,
      filterName,
      startDate,
      endDate,
    };

    const updated = [...savedFilters, newFilter];
    setSavedFilters(updated);
    localStorage.setItem("viewLeadsSavedFilters", JSON.stringify(updated));
    setNewFilterName("");
    alert("✅ Filter saved!");
  };

  const handleLoadFilter = (filterId) => {
    const filter = savedFilters.find(f => f.id === filterId);
    if (filter) {
      setFilterStatus(filter.filterStatus);
      setFilterSource(filter.filterSource);
      setFilterName(filter.filterName);
      setStartDate(filter.startDate);
      setEndDate(filter.endDate);
      setPage(1);
      setSavedFiltersDropdownOpen(false);
    }
  };

  const handleDeleteFilter = (filterId) => {
    const updated = savedFilters.filter(f => f.id !== filterId);
    setSavedFilters(updated);
    localStorage.setItem("viewLeadsSavedFilters", JSON.stringify(updated));
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
    setPage(1);
  };

  const handleExportCSV = () => {
    try {
      const headers = ["#", "Name", "Contact", "Email", "Source", "Status", "Follow-ups", "Next Follow-up", "Created"];
      const rows = pageData.map((l, i) => [
        (page - 1) * perPage + i + 1,
        l.name || "-",
        l.phone || "-",
        l.email || "-",
        l.Source || "-",
        l.status || "New",
        getFollowUpCount(l),
        getNextFollowUpDate(l) ? new Date(getNextFollowUpDate(l)).toLocaleDateString() : "No scheduled",
        l.createdAt ? new Date(l.createdAt).toLocaleDateString() : "-",
      ]);

      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += headers.join(",") + "\n";
      rows.forEach(row => {
        csvContent += row.map(cell => `"${cell}"`).join(",") + "\n";
      });

      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      link.setAttribute("download", `leads-export-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      alert("✅ CSV exported successfully!");
    } catch (err) {
      alert("❌ Failed to export CSV");
    }
  };

  const handleOpenFollowUpModal = (lead) => {
    setSelectedLeadForFollowUp(lead);
    setFollowUpModalOpen(true);
    setOpenActionId(null);
    setFollowUpNote("");
    setFollowUpDate("");
    setFollowUpTime("");
  };

  const handleSubmitFollowUp = async () => {
    if (!followUpNote || !followUpDate || !followUpTime) {
      alert("❌ Please enter remark, date, and time");
      return;
    }

    try {
      const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
      const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/followups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          relatedId: selectedLeadForFollowUp._id,
          relatedType: "Lead",
          notes: followUpNote,
          followUpDate: new Date(`${followUpDate}T${followUpTime}`).toISOString(),
          status: "Pending"
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to add follow-up");

      alert("✅ Follow-up added successfully!");
      setFollowUpModalOpen(false);
      setSelectedLeadForFollowUp(null);
      setFollowUpNote("");
      setFollowUpDate("");
      setFollowUpTime("");
      await fetchData();
    } catch (error) {
      alert(`❌ ${error.message || "Failed to add follow-up"}`);
    }
  };

  const handleView = (lead) => {
    setSelectedLead(lead);
    setViewModalOpen(true);
    setOpenActionId(null);
  };

  const handleEdit = (lead) => {
    setSelectedLead({ ...lead });
    setEditModalOpen(true);
    setOpenActionId(null);
  };

  const handleUpdateLead = async (e) => {
    e.preventDefault();
    try {
      const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
      const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/leads/${selectedLead._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: selectedLead.name,
          email: selectedLead.email,
          phone: selectedLead.phone,
          address: selectedLead.address,
          state: selectedLead.state,
          Source: selectedLead.Source,
          followUps: selectedLead.followUps || [],
          customFields: selectedLead.customFields || {},
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update lead");
      setEditModalOpen(false);
      await fetchData();
      alert("✅ Lead updated successfully!");
    } catch (error) {
      alert(`❌ ${error.message || "Failed to update lead."}`);
    }
  };

  const handleExportPDF = async (lead) => {
    try {
      const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
      const res = await fetch(`${baseUrl.replace(/\/$/, "")}/api/leads/${lead._id}/export`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "PDF export failed");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lead-${lead.name || lead._id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      alert("✅ PDF exported successfully!");
      setOpenActionId(null);
    } catch (err) {
      alert(`❌ ${err.message || "Failed to export PDF."}`);
    }
  };

  const handleSendLeadMessage = (lead) => {
    if (!lead.phone) {
      alert("No phone number found for this lead.");
      return;
    }
    setWhatsappLead(lead);
    setWhatsappMessage(`Hello ${lead.name || ""},\n\nThank you for visiting and showing your interest in our service and products.`);
    setWhatsappModalOpen(true);
    setOpenActionId(null);
  };

  const handleWhatsappSend = () => {
    if (!whatsappLead) return;
    const phone = whatsappLead.phone.replace(/[^0-9]/g, "");
    const encoded = encodeURIComponent(whatsappMessage);
    window.open(`https://wa.me/${phone}?text=${encoded}`, "_blank");
    setWhatsappModalOpen(false);
    setWhatsappLead(null);
    setWhatsappMessage("");
  };

  const WhatsAppModal = () => {
    if (!whatsappModalOpen || !whatsappLead) return null;
    return (
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.45)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "#fff", borderRadius: 12, width: 420, maxWidth: "95vw", boxShadow: "0 8px 32px rgba(0,0,0,0.18)", overflow: "hidden" }}>
          <div style={{ background: "#25D366", padding: "14px 20px", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>💬</span>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>Send WhatsApp Message</span>
          </div>
          <div style={{ padding: 20 }}>
            <div style={{ marginBottom: 14, display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontWeight: 600, fontSize: 13, color: "#374151" }}>To</label>
              <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#f3f4f6", borderRadius: 8, padding: "8px 12px" }}>
                <span style={{ fontWeight: 600, color: "#111827" }}>{whatsappLead.name}</span>
                <span style={{ color: "#6b7280", fontSize: 13 }}>{whatsappLead.phone}</span>
              </div>
            </div>
            <div style={{ marginBottom: 16, display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontWeight: 600, fontSize: 13, color: "#374151" }}>Message</label>
              <textarea
                value={whatsappMessage}
                onChange={(e) => setWhatsappMessage(e.target.value)}
                rows={5}
                style={{ width: "100%", borderRadius: 8, border: "1px solid #d1d5db", padding: "10px 12px", fontSize: 14, resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                onClick={() => { setWhatsappModalOpen(false); setWhatsappLead(null); setWhatsappMessage(""); }}
                style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid #d1d5db", background: "#fff", cursor: "pointer", fontWeight: 500, fontSize: 14 }}
              >Cancel</button>
              <button
                onClick={handleWhatsappSend}
                disabled={!whatsappMessage.trim()}
                style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: "#25D366", color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 14, opacity: whatsappMessage.trim() ? 1 : 0.5 }}
              >Send via WhatsApp</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleChangeEntries = (newPerPage) => {
    setPerPage(newPerPage);
    setPage(1);
  };

  const handleApplyFilter = () => {
    setPage(1);
    setFilterDrawerOpen(false);
  };

  const handleResetFilter = () => {
    setFilterName("");
    setFilterStatus("all");
    setFilterSource("all");
    setStartDate(null);
    setEndDate(null);
    setPage(1);
  };

  const menuBtnStyle = {
    display: "block",
    width: "100%",
    background: "none",
    border: "none",
    padding: "8px 12px",
    textAlign: "left",
    cursor: "pointer",
    fontSize: "14px",
  };

  const LoadingSkeleton = () => (
    <div className="loading-skeleton">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="skeleton-row">
          <div className="skeleton-cell"></div>
          <div className="skeleton-cell"></div>
          <div className="skeleton-cell"></div>
          <div className="skeleton-cell"></div>
        </div>
      ))}
    </div>
  );

  const EmptyState = () => (
    <div className="empty-state">
      <div className="empty-state-icon">📋</div>
      <div className="empty-state-title">No Leads Found</div>
      <div className="empty-state-text">Try adjusting your filters or add a new lead</div>
    </div>
  );

  const BulkActionBar = () =>
    selectedLeads.length > 0 && (
      <div className="bulk-action-bar">
        <span>{selectedLeads.length} selected</span>
        <select onChange={(e) => { if (e.target.value) handleBulkStatusChange(e.target.value); e.target.value = ""; }} className="bulk-status-select">
          <option value="">Change Status</option>
          <option value="New">New</option>
          <option value="Active">Active</option>
          <option value="Converted">Converted</option>
          <option value="Lost">Lost</option>
        </select>
        <button onClick={handleBulkExportCSV} className="bulk-export-btn">📥 Export CSV</button>
        <button onClick={handleBulkDelete} className="bulk-delete-btn">🗑 Delete</button>
      </div>
    );

  const ColumnToggle = () => (
    <div style={{ position: "relative" }}>
      <button
        className="columns-btn"
        onClick={() => setColumnsDropdownOpen(!columnsDropdownOpen)}
        title="Toggle columns"
      >
        ⚙️ Columns
      </button>
      {columnsDropdownOpen && (
        <div className="columns-dropdown">
          {Object.keys(visibleColumns).map(col => (
            <label key={col} className="column-toggle-item">
              <input
                type="checkbox"
                checked={visibleColumns[col]}
                onChange={() => handleColumnToggle(col)}
              />
              {col.charAt(0).toUpperCase() + col.slice(1).replace(/([A-Z])/g, " $1")}
            </label>
          ))}
        </div>
      )}
    </div>
  );

  const SavedFiltersDropdown = () => (
    <div style={{ position: "relative" }}>
      <button
        className="saved-filters-btn"
        onClick={() => setSavedFiltersDropdownOpen(!savedFiltersDropdownOpen)}
        title="Saved filters"
      >
        ⭐ Filters ({savedFilters.length})
      </button>
      {savedFiltersDropdownOpen && (
        <div className="saved-filters-dropdown">
          <div className="saved-filters-save">
            <input
              type="text"
              placeholder="Filter name"
              value={newFilterName}
              onChange={(e) => setNewFilterName(e.target.value)}
              className="saved-filter-input"
            />
            <button onClick={handleSaveFilter} className="save-filter-btn">Save</button>
          </div>
          {savedFilters.length > 0 ? (
            <div className="saved-filters-list">
              {savedFilters.map(filter => (
                <div key={filter.id} className="saved-filter-item">
                  <button onClick={() => handleLoadFilter(filter.id)}>{filter.name}</button>
                  <button onClick={() => handleDeleteFilter(filter.id)} className="delete-filter-btn">✕</button>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-saved-filters">No saved filters</div>
          )}
        </div>
      )}
    </div>
  );

  const QuickPreviewDrawer = () =>
    quickPreviewOpen && quickPreviewLead && (
      <>
        <div className="quick-preview-overlay" onClick={() => setQuickPreviewOpen(false)} />
        <div className="quick-preview-drawer">
          <div className="quick-preview-header">
            <h3>Quick Preview</h3>
            <button onClick={() => setQuickPreviewOpen(false)} className="quick-preview-close">✕</button>
          </div>
          <div className="quick-preview-content">
            <div className="preview-item">
              <span className="preview-label">Name:</span>
              <span className="preview-value">{quickPreviewLead.name}</span>
            </div>
            <div className="preview-item">
              <span className="preview-label">Phone:</span>
              <span className="preview-value">{quickPreviewLead.phone || "-"}</span>
            </div>
            <div className="preview-item">
              <span className="preview-label">Email:</span>
              <span className="preview-value">{quickPreviewLead.email || "-"}</span>
            </div>
            <div className="preview-item">
              <span className="preview-label">Status:</span>
              <span className={`status-badge status-${(quickPreviewLead.status || "New").toLowerCase()}`}>
                {quickPreviewLead.status || "New"}
              </span>
            </div>
            <div className="preview-item">
              <span className="preview-label">Source:</span>
              <span className="preview-value">{quickPreviewLead.Source || "-"}</span>
            </div>
            <div className="preview-item">
              <span className="preview-label">Follow-ups:</span>
              <span className="followup-badge">{getFollowUpCount(quickPreviewLead)}</span>
            </div>
            <div className="preview-item">
              <span className="preview-label">Next Follow-up:</span>
              <span className="preview-value">
                {getNextFollowUpDate(quickPreviewLead)
                  ? new Date(getNextFollowUpDate(quickPreviewLead)).toLocaleDateString()
                  : "No scheduled"
                }
              </span>
            </div>
          </div>
        </div>
      </>
    );

  const FilterDrawer = () => (
    <>
      {filterDrawerOpen && (
        <div className="filter-overlay" onClick={() => setFilterDrawerOpen(false)} />
      )}
      <div className={`filter-drawer ${filterDrawerOpen ? "open" : ""}`}>
        <div className="filter-drawer-header">
          <h3>Filters</h3>
          <button className="filter-drawer-close" onClick={() => setFilterDrawerOpen(false)}>✕</button>
        </div>
        <div className="filter-drawer-content">
          <div className="filter-group">
            <label>Lead Name</label>
            <input type="text" placeholder="Search by name" value={filterName} onChange={(e) => setFilterName(e.target.value)} className="filter-input" />
          </div>
          <div className="filter-group">
            <label>Status</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
              <option value="all">All Status</option>
              <option value="New">New</option>
              <option value="Active">Active</option>
              <option value="Converted">Converted</option>
              <option value="Lost">Lost</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Source</label>
            <select value={filterSource} onChange={(e) => setFilterSource(e.target.value)} className="filter-select">
              <option value="all">All Sources</option>
              {getUniqueSources().map((source) => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="filter-drawer-footer">
          <button className="filter-apply-btn" onClick={handleApplyFilter}>✓ Apply Filter</button>
          <button className="filter-reset-btn" onClick={handleResetFilter}>↺ Reset</button>
        </div>
      </div>
    </>
  );

  const ViewModal = () =>
    viewModalOpen && selectedLead && (
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
        <div style={{ backgroundColor: "#fff", padding: "30px", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", maxWidth: "500px", width: "90%" }}>
          <h2>Lead Details</h2>
          <p><strong>Lead No:</strong> {selectedLead.leadNumber || selectedLead._id}</p>
          <p><strong>Customer:</strong> {selectedLead.name || "-"}</p>
          <p><strong>Email:</strong> {selectedLead.email}</p>
          <p><strong>Phone:</strong> {selectedLead.phone}</p>
          <p><strong>Status:</strong> {selectedLead.status || "New"}</p>
          <p><strong>Date:</strong> {new Date(selectedLead.createdAt).toLocaleString()}</p>
          <button onClick={() => setViewModalOpen(false)} className="cancel-btn">Close</button>
        </div>
      </div>
    );

  const EditModal = () =>
    editModalOpen && selectedLead && (
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
        <div style={{ backgroundColor: "#fff", padding: "30px", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", maxWidth: "500px", width: "90%" }}>
          <h2>Edit Lead</h2>
          <form onSubmit={handleUpdateLead}>
            <div style={{ marginBottom: "15px" }}>
              <label>Lead Name:</label>
              <input type="text" value={selectedLead.name || ""} onChange={(e) => setSelectedLead({ ...selectedLead, name: e.target.value })} style={{ width: "100%", padding: "8px" }} />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label>Email:</label>
              <input type="email" value={selectedLead.email || ""} onChange={(e) => setSelectedLead({ ...selectedLead, email: e.target.value })} style={{ width: "100%", padding: "8px" }} />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label>Phone:</label>
              <input type="text" value={selectedLead.phone || ""} onChange={(e) => setSelectedLead({ ...selectedLead, phone: e.target.value })} style={{ width: "100%", padding: "8px" }} />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label>Address:</label>
              <input type="text" value={selectedLead.address || ""} onChange={(e) => setSelectedLead({ ...selectedLead, address: e.target.value })} style={{ width: "100%", padding: "8px" }} />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label>State:</label>
              <input type="text" value={selectedLead.state || ""} onChange={(e) => setSelectedLead({ ...selectedLead, state: e.target.value })} style={{ width: "100%", padding: "8px" }} />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label>Source:</label>
              <input type="text" value={selectedLead.Source || ""} onChange={(e) => setSelectedLead({ ...selectedLead, Source: e.target.value })} style={{ width: "100%", padding: "8px" }} />
            </div>
            <button type="submit" style={{ background: "#28a745", color: "white", border: "none", padding: "10px 20px", borderRadius: "5px", cursor: "pointer" }}>Save Changes</button>
            <button type="button" onClick={() => setEditModalOpen(false)} className="cancel-btn">Cancel</button>
          </form>
        </div>
      </div>
    );

  const FollowUpModal = () =>
    followUpModalOpen && selectedLeadForFollowUp && (
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
        <div style={{ backgroundColor: "#fff", padding: "30px", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", maxWidth: "500px", width: "90%" }}>
          <h2>Add Follow-up</h2>
          <p style={{ marginBottom: "15px", color: "#666" }}>Lead: <strong>{selectedLeadForFollowUp.name}</strong></p>
          <form onSubmit={(e) => { e.preventDefault(); handleSubmitFollowUp(); }}>
            <div style={{ marginBottom: "15px" }}>
              <label>Remark:</label>
              <textarea value={followUpNote} onChange={(e) => setFollowUpNote(e.target.value)} placeholder="Enter follow-up notes" style={{ width: "100%", padding: "8px", minHeight: "80px", borderRadius: "5px", border: "1px solid #ccc", fontFamily: "Arial, sans-serif" }} />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label>Follow-up Date:</label>
              <input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }} />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label>Follow-up Time:</label>
              <input type="time" value={followUpTime} onChange={(e) => setFollowUpTime(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }} />
            </div>
            <button type="submit" style={{ background: "#007bff", color: "white", border: "none", padding: "10px 20px", borderRadius: "5px", cursor: "pointer", marginRight: "10px" }}>Add Follow-up</button>
            <button type="button" onClick={() => { setFollowUpModalOpen(false); setSelectedLeadForFollowUp(null); setFollowUpNote(""); setFollowUpDate(""); setFollowUpTime(""); }} style={{ background: "#6c757d", color: "white", border: "none", padding: "10px 20px", borderRadius: "5px", cursor: "pointer" }}>Cancel</button>
          </form>
        </div>
      </div>
    );

  return (
    <div className="leads-container">
      {FilterDrawer()}
      <QuickPreviewDrawer />

      <div className="leads-page-header">
        <h1 className="leads-title">Leads Management</h1>
        <div className="leads-header-actions">
          <button className="refresh-btn" onClick={() => { setFilterName(""); setFilterStatus("all"); setFilterSource("all"); setStartDate(null); setEndDate(null); setPage(1); fetchData(); }}>🔄 Refresh</button>
        </div>
      </div>

      <div className="leads-stats-bar">
        <div className="stat-item"><span className="stat-label">Total</span><span className="stat-value">{stats.total}</span></div>
        <div className="stat-item stat-new"><span className="stat-label">New</span><span className="stat-value">{stats.new}</span></div>
        <div className="stat-item stat-active"><span className="stat-label">Active</span><span className="stat-value">{stats.active}</span></div>
        <div className="stat-item stat-converted"><span className="stat-label">Converted</span><span className="stat-value">{stats.converted}</span></div>
        <div className="stat-item stat-lost"><span className="stat-label">Lost</span><span className="stat-value">{stats.lost}</span></div>
      </div>

      <div className="leads-toolbar">
        <div className="leads-toolbar-left">
          <button className="filter-btn" onClick={() => setFilterDrawerOpen(true)} title="Open filter panel">🔍 Filter</button>
          <DateFilterContainer
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            dateFilterOpen={dateFilterOpen}
            setDateFilterOpen={setDateFilterOpen}
            onPageChange={setPage}
          />
          <SavedFiltersDropdown />
        </div>
        <div className="leads-toolbar-right">
          <ColumnToggle />
          <button className="export-csv-btn" onClick={handleExportCSV} title="Export current data to CSV">📥 Export CSV</button>
        </div>
      </div>

      <BulkActionBar />

      {isLoading ? (
        <LoadingSkeleton />
      ) : sortedLeads.length === 0 ? (
        <EmptyState />
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="leads-data-table">
            <thead>
              <tr>
                <th className="checkbox-col"><input type="checkbox" checked={selectedLeads.length === pageData.length && pageData.length > 0} onChange={handleSelectAll} /></th>
                {visibleColumns.name && <th className={`sortable-header ${sortBy === "name" ? "active" : ""}`} onClick={() => handleSort("name")}>Name {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}</th>}
                {visibleColumns.phone && <th className={`sortable-header ${sortBy === "phone" ? "active" : ""}`} onClick={() => handleSort("phone")}>Contact {sortBy === "phone" && (sortOrder === "asc" ? "↑" : "↓")}</th>}
                {visibleColumns.email && <th className={`sortable-header ${sortBy === "email" ? "active" : ""}`} onClick={() => handleSort("email")}>Email {sortBy === "email" && (sortOrder === "asc" ? "↑" : "↓")}</th>}
                {visibleColumns.source && <th className={`sortable-header ${sortBy === "source" ? "active" : ""}`} onClick={() => handleSort("source")}>Source {sortBy === "source" && (sortOrder === "asc" ? "↑" : "↓")}</th>}
                {visibleColumns.status && <th className={`sortable-header ${sortBy === "status" ? "active" : ""}`} onClick={() => handleSort("status")}>Status {sortBy === "status" && (sortOrder === "asc" ? "↑" : "↓")}</th>}
                {visibleColumns.followups && <th>Follow-ups</th>}
                {visibleColumns.nextFollowup && <th>Next Follow-up</th>}
                {visibleColumns.created && <th className={`sortable-header ${sortBy === "createdAt" ? "active" : ""}`} onClick={() => handleSort("createdAt")}>Created {sortBy === "createdAt" && (sortOrder === "asc" ? "↑" : "↓")}</th>}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageData.map((l) => {
                const highlight = isLeadHighlighted(l);
                const highlightClass = highlight === "today" ? "highlight-today" : highlight === "overdue" ? "highlight-overdue" : "";

                return (
                  <tr key={l._id} className={`lead-row ${highlightClass}`}>
                    <td className="checkbox-col"><input type="checkbox" checked={selectedLeads.includes(l._id)} onChange={() => handleSelectLead(l._id)} /></td>
                    {visibleColumns.name && <td><button onClick={() => { setQuickPreviewLead(l); setQuickPreviewOpen(true); }} style={{ background: "none", border: "none", color: "#007bff", cursor: "pointer" }}>{l.name || "-"}</button></td>}
                    {visibleColumns.phone && <td>{l.phone || "-"}</td>}
                    {visibleColumns.email && <td>{l.email || "-"}</td>}
                    {visibleColumns.source && <td>{l.Source || "-"}</td>}
                    {visibleColumns.status && <td><span className={`status-badge status-${(l.status || "New").toLowerCase()}`}>{l.status || "New"}</span></td>}
                    {visibleColumns.followups && <td><span className="followup-badge">{getFollowUpCount(l)}</span></td>}
                    {visibleColumns.nextFollowup && <td>{getNextFollowUpDate(l) ? new Date(getNextFollowUpDate(l)).toLocaleDateString() : "No scheduled"}</td>}
                    {visibleColumns.created && <td>{l.createdAt ? new Date(l.createdAt).toLocaleDateString() : "-"}</td>}
                    <td style={{ position: "relative" }}>
                      <button className="action-btn" onClick={() => setOpenActionId(openActionId === l._id ? null : l._id)} style={{
                          background: "#007bff",
                          color: "white",
                          border: "none",
                          borderRadius: "5px",
                          padding: "5px 50px",
                          cursor: "pointer",
                        }}>Actions ⬇️</button>
                      {openActionId === l._id && (
                        <div className="action-dropdown-menu" style={{ position: "absolute", top: "100%", left: 0, backgroundColor: "#fff", border: "1px solid #ddd", borderRadius: "5px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)", zIndex: 10, minWidth: "150px" }}>
                          <button onClick={() => handleView(l)} style={menuBtnStyle}>👁 View</button>
                          <button onClick={() => handleEdit(l)} style={menuBtnStyle}>✏️ Edit</button>
                          <button onClick={() => handleExportPDF(l)} style={menuBtnStyle}>📄 Export PDF</button>
                          <button onClick={() => handleOpenFollowUpModal(l)} style={menuBtnStyle}>📞 Add Follow-up</button>
                          <button onClick={() => handleSendLeadMessage(l)} style={menuBtnStyle}>💬 WhatsApp</button>
                          <button style={{ ...menuBtnStyle, padding: 0, overflow: "visible" }}><PrintTemplateSelector module="Lead" record={l} /></button>
                          <button onClick={() => { if (openQuotation) openQuotation(l); setOpenActionId(null); }} style={menuBtnStyle}>🔁 Convert to Quot</button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="entries-control">
        <div className="entries-info"><span><strong>Showing:</strong> {pageData.length > 0 ? (page - 1) * perPage + 1 : 0} to {Math.min(page * perPage, sortedLeads.length)} of {sortedLeads.length} entries</span></div>
        <div className="entries-buttons">
          <span style={{ fontSize: "13px", color: "#6b7280", fontWeight: "500" }}>Entries per page:</span>
          {[5, 10, 15, 20, 25].map((num) => (
            <button key={num} className={perPage === num ? "active" : ""} onClick={() => handleChangeEntries(num)}>{num}</button>
          ))}
        </div>
      </div>

      <div className="pagination">
        <button onClick={() => setPage(1)} disabled={page === 1}>First</button>
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
        <span>Page {page} / {pageCount}</span>
        <button onClick={() => setPage((p) => Math.min(pageCount, p + 1))} disabled={page === pageCount}>Next</button>
        <button onClick={() => setPage(pageCount)} disabled={page === pageCount}>Last</button>
      </div>

      {ViewModal()}
      {EditModal()}
      {FollowUpModal()}
      {WhatsAppModal()}
    </div>
  );
};

export default ViewLeads;
