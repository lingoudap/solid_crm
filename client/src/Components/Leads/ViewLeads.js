import React, { useEffect, useState, useCallback } from "react";
import DateFilter from "./datefilter";
import PrintTemplateSelector from "../common/PrintTemplateSelector";
import "./AddLead.css";

const ViewLeads = ({ refreshTrigger, onRefreshParent, openQuotation }) => {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedLead, setSelectedLead] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [openActionId, setOpenActionId] = useState(null);

  // ✅ FIX: Close dropdown when clicking outside (except on the dropdown itself)
  useEffect(() => {
    const closeMenu = (e) => {
      // Check if click is not on action button or dropdown menu
      if (
        !e.target.closest(".action-dropdown-menu") &&
        !e.target.closest(".action-btn")
      ) {
        setOpenActionId(null);
      }
    };
    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, []);

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

  const perPage = 8;
  const base = process.env.REACT_APP_API_URL || "http://localhost:5000";

  // ✅ Fetch all leads with useCallback to prevent re-creation
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const url = `${base.replace(/\/$/, "")}/api/leads`;
      console.log("🔍 Fetching from URL:", url);
      const res = await fetch(url);
      console.log("🔍 Response Status:", res.status);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      console.log("📊 Fetched Leads Data:", data);
      console.log("📊 Number of leads:", Array.isArray(data) ? data.length : "Not an array");
      console.log("📊 First lead:", data[0]);
      setLeads(data);
      setFilteredLeads(data);
    } catch (err) {
      console.error("❌ Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, [base]);

  // ✅ Fetch on mount
  useEffect(() => {
    console.log("🎯 ViewLeads component mounted, fetching data...");
    fetchData();
  }, [fetchData]);

  // ✅ Search filter
  useEffect(() => {
    const input = document.getElementById("global-search");
    const handler = (e) => setQuery(e.target.value);
    if (input) input.addEventListener("input", handler);
    return () => input && input.removeEventListener("input", handler);
  }, []);

  // ✅ Filter leads
  const visibleLeads = filteredLeads
    .filter((l) =>
      JSON.stringify(l).toLowerCase().includes(query.toLowerCase())
    )
    .filter((l) => (filterStatus === "all" ? true : l.status === filterStatus));

  // ✅ Pagination
  const pageCount = Math.max(1, Math.ceil(visibleLeads.length / perPage));
  const pageData = visibleLeads.slice((page - 1) * perPage, page * perPage);

  // Actions
  const handleView = (lead) => {
    console.log("Action: View", lead && (lead._id || lead.name));
    setSelectedLead(lead);
    setViewModalOpen(true);
    setOpenActionId(null);
  };

  // ✅ Date filter
  const handleDateFilter = (start, end) => {
    if (!start || !end) {
      setFilteredLeads(leads);
      return;
    }
    const filtered = leads.filter((item) => {
      const date = new Date(item.createdAt);
      return date >= start && date <= end;
    });
    setFilteredLeads(filtered);
    setPage(1);
  };

  const handleEdit = (lead) => {
    console.log("Action: Edit", lead && (lead._id || lead.name));
    setSelectedLead({ ...lead });
    setEditModalOpen(true);
    setOpenActionId(null);
  };

  const handleUpdateLead = async (e) => {
    e.preventDefault();
    try {
      const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
      const response = await fetch(
        `${baseUrl.replace(/\/$/, "")}/api/leads/${selectedLead._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
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
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update lead");
      }
      setEditModalOpen(false);
      await fetchData();
      alert("✅ Lead updated successfully!");
    } catch (error) {
      console.error("Error updating lead:", error);
      alert(`❌ ${error.message || "Failed to update lead."}`);
    }
  };

  const handleExportPDF = async (lead) => {
    console.log("Action: ExportPDF", lead && (lead._id || lead.name));
    try {
      const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
      const res = await fetch(
        `${baseUrl.replace(/\/$/, "")}/api/leads/${lead._id}/export`
      );
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
      console.error("Error exporting PDF:", err);
      alert(`❌ ${err.message || "Failed to export PDF."}`);
    }
  };

  // View Modal
  const ViewModal = () =>
    viewModalOpen && selectedLead && (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
        }}
      >
        <div
          style={{
            backgroundColor: "#fff",
            padding: "30px",
            borderRadius: "10px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            maxWidth: "500px",
            width: "90%",
          }}
        >
          <h2>Lead Details</h2>
          <p>
            <strong>Lead No:</strong> {selectedLead.leadNumber || selectedLead._id}
          </p>
          <p>
            <strong>Customer:</strong> {selectedLead.name || "-"}
          </p>
          <p>
            <strong>Email:</strong> {selectedLead.email}
          </p>
          <p>
            <strong>Phone:</strong> {selectedLead.phone}
          </p>
          <p>
            <strong>Status:</strong> {selectedLead.status || "New"}
          </p>
          <p>
            <strong>Date:</strong>{" "}
            {new Date(selectedLead.createdAt).toLocaleString()}
          </p>
          <button
            onClick={() => setViewModalOpen(false)}
            className="cancel-btn"
          >
            Close
          </button>
        </div>
      </div>
    );

  // Edit Modal
  const EditModal = () =>
    editModalOpen && selectedLead && (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
        }}
      >
        <div
          style={{
            backgroundColor: "#fff",
            padding: "30px",
            borderRadius: "10px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            maxWidth: "500px",
            width: "90%",
          }}
        >
          <h2>Edit Lead</h2>
          <form onSubmit={handleUpdateLead}>
            <div style={{ marginBottom: "15px" }}>
              <label>Lead Name:</label>
              <input
                type="text"
                value={selectedLead.name || ""}
                onChange={(e) =>
                  setSelectedLead({ ...selectedLead, name: e.target.value })
                }
                style={{ width: "100%", padding: "8px" }}
              />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label>Email:</label>
              <input
                type="email"
                value={selectedLead.email || ""}
                onChange={(e) =>
                  setSelectedLead({ ...selectedLead, email: e.target.value })
                }
                style={{ width: "100%", padding: "8px" }}
              />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label>Mob:</label>
              <input
                type="text"
                value={selectedLead.phone || ""}
                onChange={(e) =>
                  setSelectedLead({ ...selectedLead, phone: e.target.value })
                }
                style={{ width: "100%", padding: "8px" }}
              />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label>Address:</label>
              <input
                type="text"
                value={selectedLead.address || ""}
                onChange={(e) =>
                  setSelectedLead({ ...selectedLead, address: e.target.value })
                }
                style={{ width: "100%", padding: "8px" }}
              />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label>State:</label>
              <input
                type="text"
                value={selectedLead.state || ""}
                onChange={(e) =>
                  setSelectedLead({ ...selectedLead, state: e.target.value })
                }
                style={{ width: "100%", padding: "8px" }}
              />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label>Source:</label>
              <input
                type="text"
                value={selectedLead.Source || ""}
                onChange={(e) =>
                  setSelectedLead({ ...selectedLead, Source: e.target.value })
                }
                style={{ width: "100%", padding: "8px" }}
              />
            </div>
            <button
              type="submit"
              style={{
                background: "#28a745",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="cancel-btn"
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    );

  return (
    <div style={{ padding: "20px" }}>
      {/* 🔹 Header Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1>Leads</h1>
        <div>Filter</div>
      </div>

      {/* Status Filter */}
      <div style={{ marginBottom: "15px" }}>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: "6px 10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        >
          <option value="all">All</option>
          <option value="New">New</option>
          <option value="Active">Active</option>
          <option value="Converted">Converted</option>
          <option value="Lost">Lost</option>
        </select>

        {/* Date Filter */}
        <DateFilter onFilter={handleDateFilter} />

        {/* Refresh Button */}
        <button
          onClick={() => {
            fetchData();
            setPage(1);
          }}
          style={{
            marginLeft: "10px",
            padding: "6px 12px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            background: "#f0f0f0",
            cursor: "pointer",
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* 🔹 Leads Table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "20px",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f5f5f5", borderBottom: "2px solid #ddd" }}>
            <th style={{ padding: "10px", textAlign: "left" }}>#</th>
            <th style={{ padding: "10px", textAlign: "left" }}>Name</th>
            <th style={{ padding: "10px", textAlign: "left" }}>Contact</th>
            <th style={{ padding: "10px", textAlign: "left" }}>Email</th>
            <th style={{ padding: "10px", textAlign: "left" }}>Source</th>
            <th style={{ padding: "10px", textAlign: "left" }}>Status</th>
            <th style={{ padding: "10px", textAlign: "left" }}>Created</th>
            <th style={{ padding: "10px", textAlign: "left" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {pageData.length === 0 && (
            <tr>
              <td colSpan="8" style={{ textAlign: "center", padding: "20px" }}>
                No leads found.
              </td>
            </tr>
          )}
          {pageData.map((l, i) => (
            <tr key={l._id} style={{ borderBottom: "1px solid #ddd" }}>
              <td style={{ padding: "10px" }}>{(page - 1) * perPage + i + 1}</td>
              <td style={{ padding: "10px" }}>{l.name || "-"}</td>
              <td style={{ padding: "10px" }}>{l.phone || "-"}</td>
              <td style={{ padding: "10px" }}>{l.email || "-"}</td>
              <td style={{ padding: "10px" }}>{l.Source || "-"}</td>
              <td style={{ padding: "10px" }}>{l.status || "New"}</td>
              <td style={{ padding: "10px" }}>
                {l.createdAt ? new Date(l.createdAt).toLocaleDateString() : "-"}
              </td>
              <td style={{ padding: "10px", position: "relative" }}>
                <button
                  className="action-btn"
                  onClick={() =>
                    setOpenActionId(openActionId === l._id ? null : l._id)
                  }
                  style={{
                    background: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    padding: "5px 10px",
                    cursor: "pointer",
                  }}
                >
                  Actions ⬇️
                </button>
                {openActionId === l._id && (
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
                    <button
                      onClick={() => handleView(l)}
                      style={menuBtnStyle}
                    >
                      👁 View
                    </button>
                    <button
                      onClick={() => handleEdit(l)}
                      style={menuBtnStyle}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleExportPDF(l)}
                      style={menuBtnStyle}
                    >
                      📄 Export PDF
                    </button>
                    <button style={{ ...menuBtnStyle, padding: 0, overflow: "visible" }}>
                      <PrintTemplateSelector module="Lead" record={l} />
                    </button>
                    <button
                      onClick={() => {
                        if (openQuotation) openQuotation(l);
                        setOpenActionId(null);
                      }}
                      style={menuBtnStyle}
                    >
                      🔁 Convert to Quot
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 🔹 Pagination */}
      <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
        <button onClick={() => setPage(1)} disabled={page === 1}>
          First
        </button>
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Prev
        </button>
        <span>
          Page {page} / {pageCount}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
          disabled={page === pageCount}
        >
          Next
        </button>
        <button onClick={() => setPage(pageCount)} disabled={page === pageCount}>
          Last
        </button>
      </div>

      {ViewModal()}
      {EditModal()}
    </div>
  );
};

export default ViewLeads;