// client/src/Components/Quotation/ViewQuotation.js
import React, { useEffect, useMemo, useState } from "react";
import "./quotation.css";

import { useQuotations } from "./hooks/useQuotations";
import { useQuotationFilters } from "./hooks/useQuotationFilters";
import { useQuotationSort } from "./hooks/useQuotationSort";
import { useQuotationSelection } from "./hooks/useQuotationSelection";
import { useLocalStorageState } from "./hooks/useLocalStorageState";

import { getApiBase } from "./utils/apiBase";
import { exportQuotationsToCSV } from "./utils/csvExport";

import QuotationStats from "./components/QuotationStats";
import QuotationToolbar from "./components/QuotationToolbar";
import QuotationFilterDrawer from "./components/QuotationFilterDrawer";
import QuotationBulkActionBar from "./components/QuotationBulkActionBar";
import QuotationTable from "./components/QuotationTable";
import QuotationPagination from "./components/QuotationPagination";
import ViewQuotationModal from "./components/modals/ViewQuotationModal";
import EditQuotationModal from "./components/modals/EditQuotationModal";
import AddFollowUpModal from "./components/modals/AddFollowUpModal";

const DEFAULT_COLUMNS = {
  quotationNo: true,
  customer: true,
  amount: true,
  status: true,
  followups: true,
  nextFollowup: true,
  date: true,
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
    <div className="empty-state-icon">📄</div>
    <div className="empty-state-title">No Quotations Found</div>
    <div className="empty-state-text">
      Try adjusting your filters or add a new quotation
    </div>
  </div>
);

const ViewQuotations = ({ onRefreshParent, openOrder }) => {
  const {
    quotes,
    loading,
    refetch,
    deleteById,
    updateQuotation,
    updateStatus,
  } = useQuotations();

  const filters = useQuotationFilters(quotes);
  const { filteredQuotes, resetFilters } = filters;

  const { sortBy, sortOrder, handleSort, sortedItems: sortedQuotations } =
    useQuotationSort(filteredQuotes);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const pageCount = Math.max(1, Math.ceil(sortedQuotations.length / perPage));
  const pageData = sortedQuotations.slice(
    (page - 1) * perPage,
    page * perPage
  );

  // Snap to page 1 whenever filters or underlying data change (matches pre-refactor behavior).
  useEffect(() => {
    setPage(1);
  }, [
    filters.filterStatus,
    filters.query,
    filters.startDate,
    filters.endDate,
    quotes,
  ]);

  const pageIds = useMemo(() => pageData.map((q) => q._id), [pageData]);
  const {
    selectedIds: selectedQuotations,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    isAllSelected,
  } = useQuotationSelection(pageIds);

  const [visibleColumns, setVisibleColumns] = useLocalStorageState(
    "viewQuotationsColumns",
    DEFAULT_COLUMNS
  );
  const [savedFilters, setSavedFilters] = useLocalStorageState(
    "viewQuotationsSavedFilters",
    []
  );

  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [dateFilterOpen, setDateFilterOpen] = useState(false);

  const [viewModalQuote, setViewModalQuote] = useState(null);
  const [editModalQuote, setEditModalQuote] = useState(null);
  const [followUpQuote, setFollowUpQuote] = useState(null);

  const stats = useMemo(
    () => ({
      total: filteredQuotes.length,
      new: filteredQuotes.filter((q) => q.status === "New").length,
      active: filteredQuotes.filter((q) => q.status === "Active").length,
      converted: filteredQuotes.filter((q) => q.status === "Converted").length,
      lost: filteredQuotes.filter((q) => q.status === "Lost").length,
    }),
    [filteredQuotes]
  );

  // --- column / saved-filter handlers ---
  const toggleColumn = (col) =>
    setVisibleColumns((prev) => ({ ...prev, [col]: !prev[col] }));

  const saveCurrentFilter = (name) => {
    const newFilter = {
      id: Date.now(),
      name,
      filterStatus: filters.filterStatus,
      startDate: filters.startDate,
      endDate: filters.endDate,
    };
    setSavedFilters((prev) => [...prev, newFilter]);
  };

  const loadFilter = (id) => {
    const filter = savedFilters.find((f) => f.id === id);
    if (!filter) return;
    filters.setFilterStatus(filter.filterStatus);
    filters.setStartDate(filter.startDate);
    filters.setEndDate(filter.endDate);
    setPage(1);
  };

  const deleteFilter = (id) =>
    setSavedFilters((prev) => prev.filter((f) => f.id !== id));

  // --- row actions ---
  const handleView = (q) => setViewModalQuote(q);
  const handleEdit = (q) => setEditModalQuote({ ...q });

  const handleUpdateQuote = async (e) => {
    e.preventDefault();
    try {
      // NOTE: pre-existing schema mismatch — the edit modal uses `name/item/quantity/amount`
      // while the backend expects `customerName/items[]/totalAmount`. The PUT returns 400.
      // Left as-is during refactor; Phase 2 rebuilds this against the real schema.
      await updateQuotation(editModalQuote._id, {
        name: editModalQuote.customerName,
        email: editModalQuote.email,
        phone: editModalQuote.phone,
        item: editModalQuote.item,
        quantity: editModalQuote.quantity,
        amount: editModalQuote.amount,
        address: editModalQuote.address,
        state: editModalQuote.state,
      });
      setEditModalQuote(null);
      await refetch();
      alert("✅ Quotation updated successfully!");
    } catch (error) {
      console.error("Error updating quotation:", error);
      alert(`❌ ${error.message || "Failed to update quotation"}`);
    }
  };

  const handleExportPDF = async (quote) => {
    try {
      const res = await fetch(
        `${getApiBase()}/api/quotations/${quote._id}/export`
      );
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "PDF export failed");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `quotation-${quote.quotationNumber || quote._id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      alert("✅ PDF exported successfully!");
    } catch (err) {
      console.error("Error exporting PDF:", err);
      alert(`❌ ${err.message || "Failed to export PDF."}`);
    }
  };

  const handleConvertToOrder = (q) => {
    if (openOrder) openOrder(q);
  };

  // --- follow-up submission ---
  const handleAddFollowUp = async ({ note, date, time }) => {
    try {
      const res = await fetch(`${getApiBase()}/api/followups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          relatedId: followUpQuote._id,
          relatedType: "Quotation",
          notes: note,
          followUpDate: new Date(`${date}T${time}`).toISOString(),
          status: "Pending",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add follow-up");
      alert("✅ Follow-up added successfully!");
      setFollowUpQuote(null);
      await refetch();
    } catch (error) {
      alert(`❌ ${error.message || "Failed to add follow-up"}`);
    }
  };

  // --- CSV exports ---
  const handleExportCSV = () => {
    try {
      exportQuotationsToCSV(
        pageData,
        `quotations-export-${new Date().toISOString().split("T")[0]}.csv`
      );
      alert("✅ CSV exported successfully!");
    } catch {
      alert("❌ Failed to export CSV");
    }
  };

  const handleBulkExportCSV = () => {
    try {
      const rows = quotes.filter((q) => selectedQuotations.includes(q._id));
      exportQuotationsToCSV(
        rows,
        `quotations-bulk-export-${new Date().toISOString().split("T")[0]}.csv`
      );
      alert("✅ CSV exported successfully!");
    } catch {
      alert("❌ Failed to export CSV");
    }
  };

  // --- bulk actions ---
  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedQuotations.length} quotation(s)?`))
      return;
    try {
      for (const id of selectedQuotations) {
        await deleteById(id);
      }
      alert("✅ Quotations deleted successfully!");
      clearSelection();
      await refetch();
    } catch (error) {
      alert(`❌ ${error.message || "Failed to delete quotations"}`);
    }
  };

  const handleBulkStatusChange = async (newStatus) => {
    try {
      for (const id of selectedQuotations) {
        await updateStatus(id, newStatus);
      }
      alert(`✅ ${selectedQuotations.length} quotation(s) status updated!`);
      clearSelection();
      await refetch();
    } catch (error) {
      alert(`❌ ${error.message || "Failed to update status"}`);
    }
  };

  // --- toolbar handlers ---
  const handleRefresh = () => {
    resetFilters();
    setPage(1);
    refetch();
  };

  const handleApplyFilterDrawer = () => {
    setPage(1);
    setFilterDrawerOpen(false);
  };

  const handleResetFilterDrawer = () => {
    resetFilters();
    setPage(1);
  };

  const showingStart = pageData.length > 0 ? (page - 1) * perPage + 1 : 0;
  const showingEnd = Math.min(page * perPage, filteredQuotes.length);

  return (
    <div className="quotation-container">
      <QuotationFilterDrawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        filterStatus={filters.filterStatus}
        onFilterStatusChange={filters.setFilterStatus}
        onApply={handleApplyFilterDrawer}
        onReset={handleResetFilterDrawer}
      />

      <QuotationStats stats={stats} />

      <QuotationToolbar
        onOpenFilterDrawer={() => setFilterDrawerOpen(true)}
        visibleColumns={visibleColumns}
        onToggleColumn={toggleColumn}
        savedFilters={savedFilters}
        onSaveFilter={saveCurrentFilter}
        onLoadFilter={loadFilter}
        onDeleteFilter={deleteFilter}
        onExportCSV={handleExportCSV}
        onRefresh={handleRefresh}
        startDate={filters.startDate}
        setStartDate={filters.setStartDate}
        endDate={filters.endDate}
        setEndDate={filters.setEndDate}
        dateFilterOpen={dateFilterOpen}
        setDateFilterOpen={setDateFilterOpen}
        onPageChange={setPage}
      />

      <QuotationBulkActionBar
        count={selectedQuotations.length}
        onStatusChange={handleBulkStatusChange}
        onExportCSV={handleBulkExportCSV}
        onDelete={handleBulkDelete}
      />

      {loading ? (
        <LoadingSkeleton />
      ) : pageData.length === 0 ? (
        <EmptyState />
      ) : (
        <QuotationTable
          rows={pageData}
          startIndex={(page - 1) * perPage}
          visibleColumns={visibleColumns}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          selectedIds={selectedQuotations}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
          isAllSelected={isAllSelected}
          onView={handleView}
          onEdit={handleEdit}
          onExportPDF={handleExportPDF}
          onConvertToOrder={handleConvertToOrder}
          onAddFollowUp={setFollowUpQuote}
        />
      )}

      <QuotationPagination
        page={page}
        pageCount={pageCount}
        onPageChange={setPage}
        perPage={perPage}
        onPerPageChange={(n) => {
          setPerPage(n);
          setPage(1);
        }}
        showingStart={showingStart}
        showingEnd={showingEnd}
        total={filteredQuotes.length}
      />

      <ViewQuotationModal
        quotation={viewModalQuote}
        onClose={() => setViewModalQuote(null)}
      />

      <EditQuotationModal
        quotation={editModalQuote}
        onChange={setEditModalQuote}
        onSubmit={handleUpdateQuote}
        onClose={() => setEditModalQuote(null)}
      />

      <AddFollowUpModal
        quotation={followUpQuote}
        onClose={() => setFollowUpQuote(null)}
        onSubmit={handleAddFollowUp}
      />
    </div>
  );
};

export default ViewQuotations;
