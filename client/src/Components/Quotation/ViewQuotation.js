// client/src/Components/Quotation/ViewQuotation.js
import React, { useEffect, useState, useCallback, useMemo } from "react";
import DateFilterContainer from "../Leads/DateFilterContainer";
import PrintTemplateSelector from "../common/PrintTemplateSelector";
import "./quotation.css";

const ViewQuotations = ({ onRefreshParent, openOrder }) => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filteredQuotes, setFilteredQuotes] = useState([]);
  const [page, setPage] = useState(1);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [perPage, setPerPage] = useState(10);

  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [openActionId, setOpenActionId] = useState(null);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [columnsDropdownOpen, setColumnsDropdownOpen] = useState(false);
  const [dateFilterOpen, setDateFilterOpen] = useState(false);
  const [selectedQuotations, setSelectedQuotations] = useState([]);

  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem("viewQuotationsColumns");
    return saved ? JSON.parse(saved) : {
      quotationNo: true,
      customer: true,
      amount: true,
      status: true,
      followups: true,
      nextFollowup: true,
      date: true,
    };
  });

  const [savedFilters, setSavedFilters] = useState(() => {
    const saved = localStorage.getItem("viewQuotationsSavedFilters");
    return saved ? JSON.parse(saved) : [];
  });
  const [savedFiltersDropdownOpen, setSavedFiltersDropdownOpen] = useState(false);
  const [newFilterName, setNewFilterName] = useState("");

  // Follow-up related state
  const [followUpModalOpen, setFollowUpModalOpen] = useState(false);
  const [selectedQuotationForFollowUp, setSelectedQuotationForFollowUp] = useState(null);
  const [followUpNote, setFollowUpNote] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpTime, setFollowUpTime] = useState("");

  // Close dropdown when clicking outside (like Leads view)
  useEffect(() => {
    const closeMenu = (e) => {
      if (!e.target.closest(".action-dropdown-menu") && !e.target.closest(".action-btn")) {
        setOpenActionId(null);
      }
    };
    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, []);

  // Fetch quotations
  const fetchData = async () => {
    setLoading(true);
    try {
      const base = process.env.REACT_APP_API_URL || "http://localhost:5000";
      const res = await fetch(`${base.replace(/\/$/, "")}/api/quotations`);
      if (!res.ok) throw new Error("Fetch failed");
      const data = await res.json();
      setQuotes(data);
      setFilteredQuotes(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Global search input listener
  useEffect(() => {
    const input = document.getElementById("global-search");
    const handler = (e) => setQuery(e.target.value);
    if (input) input.addEventListener("input", handler);
    return () => input && input.removeEventListener("input", handler);
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...quotes];

    if (filterStatus !== "all") {
      result = result.filter((q) => q.status === filterStatus);
    }

    if (query) {
      result = result.filter((q) =>
        JSON.stringify(q).toLowerCase().includes(query.toLowerCase())
      );
    }

    if (startDate && endDate) {
      result = result.filter((q) => {
        const date = new Date(q.createdAt);
        return date >= new Date(startDate) && date <= new Date(endDate);
      });
    }

    setFilteredQuotes(result);
    setPage(1);
  }, [filterStatus, query, startDate, endDate, quotes]);

  const getFollowUpCount = (quotation) => {
    const followUpsData = quotation.followUpsNew || quotation.followUps || [];
    return Array.isArray(followUpsData) ? followUpsData.length : 0;
  };

  const getNextFollowUpDate = (quotation) => {
    const followUpsData = quotation.followUpsNew || quotation.followUps || [];
    if (!Array.isArray(followUpsData) || followUpsData.length === 0) return null;

    const futureDates = followUpsData
      .filter(f => {
        const dateField = f.followUpDate || f.date;
        return dateField && new Date(dateField) > new Date();
      })
      .sort((a, b) => new Date(a.followUpDate || a.date) - new Date(b.followUpDate || b.date));

    return futureDates.length > 0 ? (futureDates[0].followUpDate || futureDates[0].date) : null;
  };

  const isQuotationHighlighted = (quotation) => {
    const nextFollowUp = getNextFollowUpDate(quotation);
    if (!nextFollowUp) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const followUpDate = new Date(nextFollowUp);
    followUpDate.setHours(0, 0, 0, 0);

    if (followUpDate < today) return "overdue";
    if (followUpDate.getTime() === today.getTime()) return "today";
    return null;
  };

  const getSortedQuotations = useCallback((quotesToSort) => {
    return [...quotesToSort].sort((a, b) => {
      let aVal, bVal;

      switch (sortBy) {
        case "quoteNumber":
          aVal = (a.quoteNumber || a.ref || "").toString().toLowerCase();
          bVal = (b.quoteNumber || b.ref || "").toString().toLowerCase();
          break;
        case "customerName":
          aVal = (a.customerName || "").toLowerCase();
          bVal = (b.customerName || "").toLowerCase();
          break;
        case "totalAmount":
          aVal = parseFloat(a.totalAmount || a.amount || 0);
          bVal = parseFloat(b.totalAmount || b.amount || 0);
          break;
        case "status":
          const statusOrder = { "New": 1, "Active": 2, "Converted": 3, "Lost": 4 };
          aVal = statusOrder[a.status] || 0;
          bVal = statusOrder[b.status] || 0;
          break;
        case "followups":
          aVal = getFollowUpCount(a);
          bVal = getFollowUpCount(b);
          break;
        case "nextFollowup":
          const dateA = getNextFollowUpDate(a);
          const dateB = getNextFollowUpDate(b);
          aVal = dateA ? new Date(dateA) : new Date(0);
          bVal = dateB ? new Date(dateB) : new Date(0);
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

  const sortedQuotations = useMemo(() => getSortedQuotations(filteredQuotes), [filteredQuotes, getSortedQuotations]);

  const pageCount = Math.max(1, Math.ceil(sortedQuotations.length / perPage));
  const pageData = sortedQuotations.slice((page - 1) * perPage, page * perPage);

  const stats = useMemo(() => ({
    total: filteredQuotes.length,
    new: filteredQuotes.filter(q => q.status === "New").length,
    active: filteredQuotes.filter(q => q.status === "Active").length,
    converted: filteredQuotes.filter(q => q.status === "Converted").length,
    lost: filteredQuotes.filter(q => q.status === "Lost").length,
  }), [filteredQuotes]);

  // Actions
  const handleView = (quote) => {
    setSelectedQuote(quote);
    setViewModalOpen(true);
  };

  const handleEdit = (quote) => {
    setSelectedQuote({ ...quote });
    setEditModalOpen(true);
  };

  const handleUpdateQuote = async (e) => {
    e.preventDefault();
    try {
      const base = process.env.REACT_APP_API_URL || "http://localhost:5000";
      const response = await fetch(`${base.replace(/\/$/, "")}/api/quotations/${selectedQuote._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: selectedQuote.customerName,
          email: selectedQuote.email,
          phone: selectedQuote.phone,
          item: selectedQuote.item,
          quantity: selectedQuote.quantity,
          amount: selectedQuote.amount,
          address: selectedQuote.address,
          state: selectedQuote.state
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update quotation");
      }

      setEditModalOpen(false);
      fetchData();
      alert("✅ Quotation updated successfully!");
    } catch (error) {
      console.error("Error updating quotation:", error);
      alert(`❌ ${error.message || "Failed to update quotation"}`);
    }
  };

  const handleExportPDF = async (quote) => {
    try {
      const base = process.env.REACT_APP_API_URL || "http://localhost:5000";
      const res = await fetch(`${base.replace(/\/$/, "")}/api/quotations/${quote._id}/export`);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "PDF export failed");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `quotation-${quote.quotationNumber || quote._id}.pdf`;

      // Append to body, click, and remove
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Cleanup
      window.URL.revokeObjectURL(url);

      alert("✅ PDF exported successfully!");
    } catch (err) {
      console.error("Error exporting PDF:", err);
      alert(`❌ ${err.message || "Failed to export PDF."}`);
    }
  };

  const handleColumnToggle = (column) => {
    const updated = { ...visibleColumns, [column]: !visibleColumns[column] };
    setVisibleColumns(updated);
    localStorage.setItem("viewQuotationsColumns", JSON.stringify(updated));
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
      startDate,
      endDate,
    };

    const updated = [...savedFilters, newFilter];
    setSavedFilters(updated);
    localStorage.setItem("viewQuotationsSavedFilters", JSON.stringify(updated));
    setNewFilterName("");
    alert("✅ Filter saved!");
  };

  const handleLoadFilter = (filterId) => {
    const filter = savedFilters.find(f => f.id === filterId);
    if (filter) {
      setFilterStatus(filter.filterStatus);
      setStartDate(filter.startDate);
      setEndDate(filter.endDate);
      setPage(1);
      setSavedFiltersDropdownOpen(false);
    }
  };

  const handleDeleteFilter = (filterId) => {
    const updated = savedFilters.filter(f => f.id !== filterId);
    setSavedFilters(updated);
    localStorage.setItem("viewQuotationsSavedFilters", JSON.stringify(updated));
  };

  const handleExportCSV = () => {
    try {
      const headers = ["#", "Quotation No", "Customer Name", "Total Amount", "Status", "Date"];
      const startIdx = (page - 1) * perPage;
      const rows = pageData.map((q, i) => [
        startIdx + i + 1,
        q.quoteNumber || q.ref || q._id,
        q.customerName || "-",
        q.totalAmount || q.amount || "-",
        q.status || "-",
        q.createdAt ? new Date(q.createdAt).toLocaleDateString() : "-",
      ]);

      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += headers.join(",") + "\n";
      rows.forEach(row => {
        csvContent += row.map(cell => `"${cell}"`).join(",") + "\n";
      });

      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      link.setAttribute("download", `quotations-export-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      alert("✅ CSV exported successfully!");
    } catch (err) {
      alert("❌ Failed to export CSV");
    }
  };

  const handleApplyFilter = () => {
    setPage(1);
    setFilterDrawerOpen(false);
  };

  const handleResetFilter = () => {
    setFilterStatus("all");
    setStartDate(null);
    setEndDate(null);
    setPage(1);
  };

  const handleChangeEntries = (newPerPage) => {
    setPerPage(newPerPage);
    setPage(1);
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };



  const handleSelectAll = () => {
    if (selectedQuotations.length === pageData.length) {
      setSelectedQuotations([]);
    } else {
      setSelectedQuotations(pageData.map(q => q._id));
    }
  };

  const handleSelectQuotation = (quotationId) => {
    setSelectedQuotations(prev =>
      prev.includes(quotationId)
        ? prev.filter(id => id !== quotationId)
        : [...prev, quotationId]
    );
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedQuotations.length} quotation(s)?`)) return;

    try {
      const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
      for (const quotationId of selectedQuotations) {
        await fetch(`${baseUrl.replace(/\/$/, "")}/api/quotations/${quotationId}`, { method: "DELETE" });
      }
      alert("✅ Quotations deleted successfully!");
      setSelectedQuotations([]);
      await fetchData();
    } catch (error) {
      alert(`❌ ${error.message || "Failed to delete quotations"}`);
    }
  };

  const handleBulkStatusChange = async (newStatus) => {
    try {
      const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
      for (const quotationId of selectedQuotations) {
        const quote = quotes.find(q => q._id === quotationId);
        if (quote) {
          await fetch(`${baseUrl.replace(/\/$/, "")}/api/quotations/${quotationId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...quote, status: newStatus }),
          });
        }
      }
      alert(`✅ ${selectedQuotations.length} quotation(s) status updated!`);
      setSelectedQuotations([]);
      await fetchData();
    } catch (error) {
      alert(`❌ ${error.message || "Failed to update status"}`);
    }
  };

  const handleBulkExportCSVSelected = () => {
    try {
      const headers = ["#", "Quotation No", "Customer Name", "Total Amount", "Status", "Date"];
      const selectedQuotationsData = quotes.filter(q => selectedQuotations.includes(q._id));
      const rows = selectedQuotationsData.map((q, i) => [
        i + 1,
        q.quoteNumber || q.ref || q._id,
        q.customerName || "-",
        q.totalAmount || q.amount || "-",
        q.status || "-",
        q.createdAt ? new Date(q.createdAt).toLocaleDateString() : "-",
      ]);

      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += headers.join(",") + "\n";
      rows.forEach(row => {
        csvContent += row.map(cell => `"${cell}"`).join(",") + "\n";
      });

      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      link.setAttribute("download", `quotations-bulk-export-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      alert("✅ CSV exported successfully!");
    } catch (err) {
      alert("❌ Failed to export CSV");
    }
  }

  const handleOpenFollowUpModal = (quotation) => {
    setSelectedQuotationForFollowUp(quotation);
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
          relatedId: selectedQuotationForFollowUp._id,
          relatedType: "Quotation",
          notes: followUpNote,
          followUpDate: new Date(`${followUpDate}T${followUpTime}`).toISOString(),
          status: "Pending"
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to add follow-up");
      alert("✅ Follow-up added successfully!");
      setFollowUpModalOpen(false);
      setSelectedQuotationForFollowUp(null);
      setFollowUpNote("");
      setFollowUpDate("");
      setFollowUpTime("");
      await fetchData();
    } catch (error) {
      alert(`❌ ${error.message || "Failed to add follow-up"}`);
    }
  }

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
      <div className="empty-state-icon">📄</div>
      <div className="empty-state-title">No Quotations Found</div>
      <div className="empty-state-text">Try adjusting your filters or add a new quotation</div>
    </div>
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
            <label>Status</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
              <option value="all">All Status</option>
              <option value="New">New</option>
              <option value="Active">Active</option>
              <option value="Converted">Converted</option>
              <option value="Lost">Lost</option>
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

  const BulkActionBar = () =>
    selectedQuotations.length > 0 && (
      <div className="bulk-action-bar">
        <span>{selectedQuotations.length} selected</span>
        <select onChange={(e) => { if (e.target.value) handleBulkStatusChange(e.target.value); e.target.value = ""; }} className="bulk-status-select">
          <option value="">Change Status</option>
          <option value="New">New</option>
          <option value="Active">Active</option>
          <option value="Converted">Converted</option>
          <option value="Lost">Lost</option>
        </select>
        <button onClick={handleBulkExportCSVSelected} className="bulk-export-btn">📥 Export CSV</button>
        <button onClick={handleBulkDelete} className="bulk-delete-btn">🗑 Delete</button>
      </div>
    );

  // View Modal
  const ViewModal = () =>
    viewModalOpen && selectedQuote && (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>Quotation Details</h2>
          <p><b>Quote No:</b> {selectedQuote.quoteNumber || selectedQuote._id}</p>
          <p><b>Customer:</b> {selectedQuote.customerName || selectedQuote.customerName}</p>
          <p><b>Email:</b> {selectedQuote.email}</p>
          <p><b>Phone:</b> {selectedQuote.phone}</p>
          <p><b>Item:</b> {selectedQuote.item}</p>
          <p><b>Quantity:</b> {selectedQuote.quantity}</p>
          <p><b>Amount:</b> ₹{selectedQuote.amount}</p>
          <p><b>Status:</b> {selectedQuote.status}</p>
          <p><b>Date:</b> {new Date(selectedQuote.createdAt).toLocaleString()}</p>
          <div className="modal-actions">
            <button onClick={() => setViewModalOpen(false)} className="cancel-btn">Close</button>
          </div>
        </div>
      </div>
    );

  // Edit Modal
  const EditModal = () =>
    editModalOpen && selectedQuote && (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>Edit Quotation</h2>
          <form onSubmit={handleUpdateQuote}>
            <div className="form-group">
              <label>Customer Name:</label>
              <input
                type="text"
                value={selectedQuote.name}
                onChange={(e) => setSelectedQuote({ ...selectedQuote, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Item:</label>
              <input
                type="text"
                value={selectedQuote.item}
                onChange={(e) => setSelectedQuote({ ...selectedQuote, item: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Quantity:</label>
              <input
                type="number"
                value={selectedQuote.quantity}
                onChange={(e) => setSelectedQuote({ ...selectedQuote, quantity: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Amount:</label>
              <input
                type="number"
                value={selectedQuote.amount}
                onChange={(e) => setSelectedQuote({ ...selectedQuote, amount: e.target.value })}
              />
            </div>
            <div className="modal-actions">
              <button type="submit" className="save-btn">Save Changes</button>
              <button type="button" onClick={() => setEditModalOpen(false)} className="cancel-btn">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    );

  // Follow-up Modal
  const FollowUpModal = () =>
    followUpModalOpen && selectedQuotationForFollowUp && (
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: "#fff",
          borderRadius: "8px",
          padding: "30px",
          maxWidth: "500px",
          width: "90%",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          maxHeight: "90vh",
          overflowY: "auto"
        }}>
          <h2 style={{ marginTop: 0 }}>Add Follow-up</h2>
          <p style={{ marginBottom: "15px", color: "#666" }}>Quotation: <strong>{selectedQuotationForFollowUp.customerName}</strong></p>
          <form onSubmit={(e) => { e.preventDefault(); handleSubmitFollowUp(); }}>
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", fontWeight: "500", marginBottom: "5px" }}>Remark:</label>
              <textarea
                value={followUpNote}
                onChange={(e) => setFollowUpNote(e.target.value)}
                placeholder="Enter follow-up notes"
                style={{
                  width: "100%",
                  minHeight: "100px",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontFamily: "inherit",
                  fontSize: "14px"
                }}
              />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", fontWeight: "500", marginBottom: "5px" }}>Follow-up Date:</label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px",
                  boxSizing: "border-box"
                }}
              />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", fontWeight: "500", marginBottom: "5px" }}>Follow-up Time:</label>
              <input
                type="time"
                value={followUpTime}
                onChange={(e) => setFollowUpTime(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px",
                  boxSizing: "border-box"
                }}
              />
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                type="submit"
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "500"
                }}
              >
                Add Follow-up
              </button>
              <button
                type="button"
                onClick={() => {
                  setFollowUpModalOpen(false);
                  setSelectedQuotationForFollowUp(null);
                  setFollowUpNote("");
                  setFollowUpDate("");
                  setFollowUpTime("");
                }}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "500"
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );

  return (
    <div className="quotation-container">
      {FilterDrawer()}
  
      
      <div className="leads-stats-bar">
        <div className="stat-item"><span className="stat-label">Total</span><span className="stat-value">{stats.total}</span></div>
        <div className="stat-item stat-new"><span className="stat-label">New</span><span className="stat-value">{stats.new}</span></div>
        <div className="stat-item stat-active"><span className="stat-label">Active</span><span className="stat-value">{stats.active}</span></div>
        <div className="stat-item stat-converted"><span className="stat-label">Converted</span><span className="stat-value">{stats.converted}</span></div>
        <div className="stat-item stat-lost"><span className="stat-label">Lost</span><span className="stat-value">{stats.lost}</span></div>
      </div>

      {/* Header */}
      <div className="header-bar" style={{ marginBottom: "20px" }}>
        <div className="leads-controls" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button className="filter-btn" onClick={() => setFilterDrawerOpen(true)} title="Open filter panel">🔍 Filter</button>
          <ColumnToggle />
          <SavedFiltersDropdown />
          <button className="export-csv-btn" onClick={handleExportCSV} title="Export current data to CSV">📥 Export CSV</button>
          <button className="refresh-btn" onClick={() => { setFilterStatus("all"); setStartDate(null); setEndDate(null); setPage(1); fetchData(); }} style={{ cursor: "pointer" }}>🔄 Refresh</button>
          <DateFilterContainer
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            dateFilterOpen={dateFilterOpen}
            setDateFilterOpen={setDateFilterOpen}
            onPageChange={setPage}
          />
        </div>
      </div>
        {BulkActionBar()}

      {/* Table */}
      {loading ? (
        <LoadingSkeleton />
      ) : pageData.length === 0 ? (
        <EmptyState />
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th className="checkbox-col"><input type="checkbox" checked={selectedQuotations.length === pageData.length && pageData.length > 0} onChange={handleSelectAll} /></th>
                <th>#</th>
                {visibleColumns.quotationNo && <th className={`sortable-header ${sortBy === "quoteNumber" ? "active" : ""}`} onClick={() => handleSort("quoteNumber")}>Quotation No. {sortBy === "quoteNumber" && (sortOrder === "asc" ? "↑" : "↓")}</th>}
                {visibleColumns.customer && <th className={`sortable-header ${sortBy === "customerName" ? "active" : ""}`} onClick={() => handleSort("customerName")}>Customer Name {sortBy === "customerName" && (sortOrder === "asc" ? "↑" : "↓")}</th>}
                {visibleColumns.amount && <th className={`sortable-header ${sortBy === "totalAmount" ? "active" : ""}`} onClick={() => handleSort("totalAmount")}>Total Amount (₹) {sortBy === "totalAmount" && (sortOrder === "asc" ? "↑" : "↓")}</th>}
                {visibleColumns.status && <th className={`sortable-header ${sortBy === "status" ? "active" : ""}`} onClick={() => handleSort("status")}>Status {sortBy === "status" && (sortOrder === "asc" ? "↑" : "↓")}</th>}
                {visibleColumns.followups && <th className={`sortable-header ${sortBy === "followups" ? "active" : ""}`} onClick={() => handleSort("followups")}>Follow-ups {sortBy === "followups" && (sortOrder === "asc" ? "↑" : "↓")}</th>}
                {visibleColumns.nextFollowup && <th className={`sortable-header ${sortBy === "nextFollowup" ? "active" : ""}`} onClick={() => handleSort("nextFollowup")}>Next Follow-up {sortBy === "nextFollowup" && (sortOrder === "asc" ? "↑" : "↓")}</th>}
                {visibleColumns.date && <th className={`sortable-header ${sortBy === "createdAt" ? "active" : ""}`} onClick={() => handleSort("createdAt")}>Date {sortBy === "createdAt" && (sortOrder === "asc" ? "↑" : "↓")}</th>}
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {pageData.map((q, i) => {
                const rowIndex = (page - 1) * perPage + i + 1;
                const highlight = isQuotationHighlighted(q);
                const highlightClass = highlight === "today" ? "highlight-today" : highlight === "overdue" ? "highlight-overdue" : "";
                return (
                  <tr key={q._id || i} className={`quotation-row ${highlightClass}`}>
                    <td className="checkbox-col"><input type="checkbox" checked={selectedQuotations.includes(q._id)} onChange={() => handleSelectQuotation(q._id)} /></td>
                    <td>{rowIndex}</td>
                    {visibleColumns.quotationNo && <td>{q.quoteNumber || q.ref || q._id}</td>}
                    {visibleColumns.customer && <td>{q.customerName || "-"}</td>}
                    {visibleColumns.amount && <td>{q.totalAmount || q.amount || "-"}</td>}
                    {visibleColumns.status && <td>{q.status || "-"}</td>}
                    {visibleColumns.followups && <td><span className="followup-badge">{getFollowUpCount(q)}</span></td>}
                    {visibleColumns.nextFollowup && <td>{getNextFollowUpDate(q) ? new Date(getNextFollowUpDate(q)).toLocaleDateString() : "No scheduled"}</td>}
                    {visibleColumns.date && <td>{q.createdAt ? new Date(q.createdAt).toLocaleString() : "-"}</td>}
                    <td style={{ position: "relative" }}>
                      <button
                        className="action-btn"
                        type="button"
                        onClick={() => setOpenActionId(openActionId === q._id ? null : q._id)}
                        style={{
                          background: "#007bff",
                          color: "white",
                          border: "none",
                          borderRadius: "5px",
                          padding: "5px 50px",
                          cursor: "pointer",
                        }}
                      >
                        Actions ⬇️
                      </button>

                      {openActionId === q._id && (
                        <div
                          className="action-dropdown-menu"
                          style={{
                            position: "absolute",
                            top: "100%",
                            left: 0,
                            backgroundColor: "#fff",
                            border: "1px solid #ddd",
                            borderRadius: "5px",
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                            zIndex: 10,
                            minWidth: "150px",
                          }}
                        >
                          <button onClick={() => handleView(q)} style={menuBtnStyle}>👁 View</button>
                          <button onClick={() => handleEdit(q)} style={menuBtnStyle}>✏️ Edit</button>
                          <button onClick={() => handleExportPDF(q)} style={menuBtnStyle}>📄 Export PDF</button>
                          <button style={{ ...menuBtnStyle, padding: 0, overflow: "visible" }}>
                            <PrintTemplateSelector module="Quotation" record={q} />
                          </button>
                          <button
                            onClick={() => {
                              if (openOrder) openOrder(q);
                              setOpenActionId(null);
                            }}
                            style={menuBtnStyle}
                          >
                            🔁 Convert to Order
                          </button>
                          <button onClick={() => handleOpenFollowUpModal(q)} style={menuBtnStyle}>📞 Add Follow-up</button>
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
        <div className="entries-info"><span><strong>Showing:</strong> {pageData.length > 0 ? (page - 1) * perPage + 1 : 0} to {Math.min(page * perPage, filteredQuotes.length)} of {filteredQuotes.length} entries</span></div>
        <div className="entries-buttons">
          <span style={{ fontSize: "13px", color: "#6b7280", fontWeight: "500" }}>Entries per page:</span>
          {[5, 10, 15, 20, 25].map((num) => (
            <button key={num} className={perPage === num ? "active" : ""} onClick={() => handleChangeEntries(num)}>{num}</button>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="pagination" style={{ marginTop: "15px", textAlign: "center" }}>
        <button onClick={() => setPage(1)} disabled={page === 1}>First</button>
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
        <span style={{ margin: "0 10px" }}>Page {page} / {pageCount}</span>
        <button onClick={() => setPage((p) => Math.min(pageCount, p + 1))} disabled={page === pageCount}>Next</button>
        <button onClick={() => setPage(pageCount)} disabled={page === pageCount}>Last</button>
      </div>

      {/* Render Modals */}
      {ViewModal()}
      {EditModal()}
      {FollowUpModal()}
    </div>
  );
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

export default ViewQuotations;
