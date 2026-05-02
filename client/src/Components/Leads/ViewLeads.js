import React, { useEffect, useMemo, useState } from "react";
import LeadsTable from "./components/LeadsTable";
import LeadsToolbar from "./components/LeadsToolbar";
import LeadsStats from "./components/LeadsStats";
import LeadsBulkActionBar from "./components/LeadsBulkActionBar";
import LeadsFilterDrawer from "./components/LeadsFilterDrawer";
import LeadsQuickPreview from "./components/LeadsQuickPreview";
import ViewLeadModal from "./components/modals/ViewLeadModal";
import EditLeadModal from "./components/modals/EditLeadModal";
import AddFollowUpLeadModal from "./components/modals/AddFollowUpLeadModal";
import WhatsAppModal from "./components/modals/WhatsAppModal";
import { useLeads } from "./hooks/useLeads";
import { useLeadFilters } from "./hooks/useLeadFilters";
import { useLeadSort } from "./hooks/useLeadSort";
import { useTableSelection } from "../../hooks/useTableSelection";
import { useLocalStorageState } from "../../hooks/useLocalStorageState";
import "./AddLead.css";
import "./leads.css";

const DEFAULT_COLUMNS = {
  name: true,
  phone: true,
  email: true,
  source: true,
  status: true,
  followups: true,
  nextFollowup: true,
  created: true,
};

function getFollowUpCount(lead) {
  const list = lead.followUpsNew || lead.followUps || [];
  return Array.isArray(list) ? list.length : 0;
}

function getNextFollowUpDate(lead) {
  const list = lead.followUpsNew || lead.followUps || [];
  if (!Array.isArray(list) || list.length === 0) return null;
  const future = list
    .filter((f) => {
      const d = f.followUpDate || f.date;
      return d && new Date(d) > new Date();
    })
    .sort(
      (a, b) =>
        new Date(a.followUpDate || a.date) - new Date(b.followUpDate || b.date)
    );
  return future.length > 0 ? future[0].followUpDate || future[0].date : null;
}

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
    <div className="empty-state-text">
      Try adjusting your filters or add a new lead
    </div>
  </div>
);

const ViewLeads = ({ refreshTrigger, onRefreshParent, openQuotation }) => {
  const { leads, isLoading, refetch, updateLead, bulkDelete, bulkUpdateStatus } =
    useLeads();

  const filters = useLeadFilters(leads);
  const { filteredLeads, uniqueSources } = filters;

  const { sortBy, sortOrder, handleSort, sortedItems: sortedLeads } =
    useLeadSort(filteredLeads);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const pageCount = Math.max(1, Math.ceil(sortedLeads.length / perPage));
  const pageData = sortedLeads.slice((page - 1) * perPage, page * perPage);

  // Snap to page 1 when filter inputs or underlying data change.
  useEffect(() => {
    setPage(1);
  }, [
    filters.filterStatus,
    filters.filterSource,
    filters.filterName,
    filters.query,
    filters.startDate,
    filters.endDate,
    leads,
  ]);

  const pageIds = useMemo(() => pageData.map((l) => l._id), [pageData]);
  const {
    selectedIds: selectedLeads,
    toggleSelect: handleSelectLead,
    toggleSelectAll: handleSelectAll,
    clearSelection,
    isAllSelected,
  } = useTableSelection(pageIds);

  const [visibleColumns, setVisibleColumns] = useLocalStorageState(
    "viewLeadsColumns",
    DEFAULT_COLUMNS
  );
  const [savedFilters, setSavedFilters] = useLocalStorageState(
    "viewLeadsSavedFilters",
    []
  );

  // Modal / drawer UI state
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [dateFilterOpen, setDateFilterOpen] = useState(false);
  const [previewLead, setPreviewLead] = useState(null);
  const [viewModalLead, setViewModalLead] = useState(null);
  const [editModalLead, setEditModalLead] = useState(null);
  const [followUpLead, setFollowUpLead] = useState(null);
  const [whatsappLead, setWhatsappLead] = useState(null);

  const stats = useMemo(
    () => ({
      total: filteredLeads.length,
      new: filteredLeads.filter((l) => l.status === "New").length,
      active: filteredLeads.filter((l) => l.status === "Active").length,
      converted: filteredLeads.filter((l) => l.status === "Converted").length,
      lost: filteredLeads.filter((l) => l.status === "Lost").length,
    }),
    [filteredLeads]
  );

  // --- bulk actions ---
  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedLeads.length} lead(s)?`)) return;
    try {
      await bulkDelete(selectedLeads);
      alert("✅ Leads deleted successfully!");
      clearSelection();
      await refetch();
    } catch (error) {
      alert(`❌ ${error.message || "Failed to delete leads"}`);
    }
  };

  const handleBulkStatusChange = async (newStatus) => {
    try {
      await bulkUpdateStatus(selectedLeads, newStatus);
      alert(`✅ ${selectedLeads.length} lead(s) status updated!`);
      clearSelection();
      await refetch();
    } catch (error) {
      alert(`❌ ${error.message || "Failed to update status"}`);
    }
  };

  const handleBulkExportCSV = () => {
    try {
      const headers = ["#", "Name", "Contact", "Email", "Source", "Status", "Follow-ups", "Created"];
      const selectedLeadsData = leads.filter((l) =>
        selectedLeads.includes(l._id)
      );
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
      rows.forEach((row) => {
        csvContent += row.map((cell) => `"${cell}"`).join(",") + "\n";
      });

      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      link.setAttribute(
        "download",
        `leads-bulk-export-${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      alert("✅ CSV exported successfully!");
    } catch (err) {
      alert("❌ Failed to export CSV");
    }
  };

  // --- column visibility ---
  const handleColumnToggle = (column) =>
    setVisibleColumns((prev) => ({ ...prev, [column]: !prev[column] }));

  // --- saved filter presets ---
  const handleSaveFilter = (name) => {
    setSavedFilters((prev) => [
      ...prev,
      {
        id: Date.now(),
        name,
        filterStatus: filters.filterStatus,
        filterSource: filters.filterSource,
        filterName: filters.filterName,
        startDate: filters.startDate,
        endDate: filters.endDate,
      },
    ]);
  };

  const handleLoadFilter = (filterId) => {
    const f = savedFilters.find((x) => x.id === filterId);
    if (!f) return;
    filters.setFilterStatus(f.filterStatus);
    filters.setFilterSource(f.filterSource);
    filters.setFilterName(f.filterName);
    filters.setStartDate(f.startDate);
    filters.setEndDate(f.endDate);
  };

  const handleDeleteFilter = (filterId) =>
    setSavedFilters((prev) => prev.filter((f) => f.id !== filterId));

  // --- per-page CSV export (toolbar button) ---
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
        getNextFollowUpDate(l)
          ? new Date(getNextFollowUpDate(l)).toLocaleDateString()
          : "No scheduled",
        l.createdAt ? new Date(l.createdAt).toLocaleDateString() : "-",
      ]);

      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += headers.join(",") + "\n";
      rows.forEach((row) => {
        csvContent += row.map((cell) => `"${cell}"`).join(",") + "\n";
      });

      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      link.setAttribute(
        "download",
        `leads-export-${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      alert("✅ CSV exported successfully!");
    } catch (err) {
      alert("❌ Failed to export CSV");
    }
  };

  // --- row actions ---
  const handleSubmitFollowUp = async ({ note, date, time }) => {
    try {
      const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
      const response = await fetch(
        `${baseUrl.replace(/\/$/, "")}/api/followups`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            relatedId: followUpLead._id,
            relatedType: "Lead",
            notes: note,
            followUpDate: new Date(`${date}T${time}`).toISOString(),
            status: "Pending",
          }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to add follow-up");
      alert("✅ Follow-up added successfully!");
      setFollowUpLead(null);
      await refetch();
    } catch (error) {
      alert(`❌ ${error.message || "Failed to add follow-up"}`);
    }
  };

  const handleUpdateLead = async (payload) => {
    try {
      await updateLead(editModalLead._id, payload);
      setEditModalLead(null);
      await refetch();
      alert("✅ Lead updated successfully!");
    } catch (error) {
      alert(`❌ ${error.message || "Failed to update lead."}`);
    }
  };

  const handleExportPDF = async (lead) => {
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
  };

  const handleWhatsappSend = (lead, message) => {
    const phone = (lead.phone || "").replace(/[^0-9]/g, "");
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${phone}?text=${encoded}`, "_blank");
    setWhatsappLead(null);
  };

  return (
    <div className="leads-container">
      <LeadsFilterDrawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        filterName={filters.filterName}
        onFilterNameChange={filters.setFilterName}
        filterStatus={filters.filterStatus}
        onFilterStatusChange={filters.setFilterStatus}
        filterSource={filters.filterSource}
        onFilterSourceChange={filters.setFilterSource}
        uniqueSources={uniqueSources}
        onApply={() => setFilterDrawerOpen(false)}
        onReset={filters.resetFilters}
      />

      <LeadsQuickPreview
        lead={previewLead}
        onClose={() => setPreviewLead(null)}
      />

      <div className="leads-page-header">
        <h1 className="leads-title">Leads Management</h1>
        <div className="leads-header-actions">
          <button
            className="refresh-btn"
            onClick={() => {
              filters.resetFilters();
              setPage(1);
              refetch();
            }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      <LeadsStats stats={stats} />

      <LeadsToolbar
        query={filters.query}
        onQueryChange={filters.setQuery}
        onOpenFilterDrawer={() => setFilterDrawerOpen(true)}
        activeFilterCount={
          (filters.filterStatus !== "all" ? 1 : 0) +
          (filters.filterSource !== "all" ? 1 : 0) +
          (filters.filterName ? 1 : 0) +
          (filters.startDate && filters.endDate ? 1 : 0) +
          (filters.query ? 1 : 0)
        }
        visibleColumns={visibleColumns}
        onToggleColumn={handleColumnToggle}
        savedFilters={savedFilters}
        onSaveFilter={handleSaveFilter}
        onLoadFilter={handleLoadFilter}
        onDeleteFilter={handleDeleteFilter}
        onExportCSV={handleExportCSV}
        onRefresh={refetch}
        startDate={filters.startDate}
        setStartDate={filters.setStartDate}
        endDate={filters.endDate}
        setEndDate={filters.setEndDate}
        dateFilterOpen={dateFilterOpen}
        setDateFilterOpen={setDateFilterOpen}
        onPageChange={setPage}
      />

      <LeadsBulkActionBar
        count={selectedLeads.length}
        onStatusChange={handleBulkStatusChange}
        onExportCSV={handleBulkExportCSV}
        onDelete={handleBulkDelete}
      />

      {isLoading ? (
        <LoadingSkeleton />
      ) : sortedLeads.length === 0 ? (
        <EmptyState />
      ) : (
        <LeadsTable
          rows={pageData}
          startIndex={(page - 1) * perPage}
          visibleColumns={visibleColumns}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          selectedIds={selectedLeads}
          onToggleSelect={handleSelectLead}
          onToggleSelectAll={handleSelectAll}
          isAllSelected={isAllSelected}
          onPreview={setPreviewLead}
          onView={setViewModalLead}
          onEdit={(lead) => setEditModalLead({ ...lead })}
          onExportPDF={handleExportPDF}
          onAddFollowUp={setFollowUpLead}
          onConvertToQuotation={(lead) => {
            if (openQuotation) openQuotation(lead);
          }}
          onSendWhatsApp={handleSendLeadMessage}
        />
      )}

      <div className="entries-control">
        <div className="entries-info">
          <span>
            <strong>Showing:</strong>{" "}
            {pageData.length > 0 ? (page - 1) * perPage + 1 : 0} to{" "}
            {Math.min(page * perPage, sortedLeads.length)} of{" "}
            {sortedLeads.length} entries
          </span>
        </div>
        <div className="entries-buttons">
          <span style={{ fontSize: "13px", color: "#6b7280", fontWeight: "500" }}>
            Entries per page:
          </span>
          {[5, 10, 15, 20, 25].map((num) => (
            <button
              key={num}
              className={perPage === num ? "active" : ""}
              onClick={() => {
                setPerPage(num);
                setPage(1);
              }}
            >
              {num}
            </button>
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

      <ViewLeadModal
        lead={viewModalLead}
        onClose={() => setViewModalLead(null)}
        onExportPDF={handleExportPDF}
        onAddFollowUp={setFollowUpLead}
        onSendWhatsApp={handleSendLeadMessage}
      />

      <EditLeadModal
        lead={editModalLead}
        onSubmit={handleUpdateLead}
        onClose={() => setEditModalLead(null)}
      />

      <AddFollowUpLeadModal
        lead={followUpLead}
        onSubmit={handleSubmitFollowUp}
        onClose={() => setFollowUpLead(null)}
      />

      <WhatsAppModal
        lead={whatsappLead}
        onClose={() => setWhatsappLead(null)}
        onSend={handleWhatsappSend}
      />
    </div>
  );
};

export default ViewLeads;
