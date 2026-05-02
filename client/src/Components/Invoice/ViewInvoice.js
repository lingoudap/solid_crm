import React, { useCallback, useEffect, useMemo, useState } from "react";
import InvoicesTable from "./components/InvoicesTable";
import InvoicesToolbar from "./components/InvoicesToolbar";
import InvoicesStats from "./components/InvoicesStats";
import InvoicesBulkActionBar from "./components/InvoicesBulkActionBar";
import InvoicesFilterDrawer from "./components/InvoicesFilterDrawer";
import ViewInvoiceModal from "./components/modals/ViewInvoiceModal";
import EditInvoiceModal from "./components/modals/EditInvoiceModal";
import UpdateStatusModal from "./components/modals/UpdateStatusModal";
import { useInvoices } from "./hooks/useInvoices";
import { useInvoiceFilters } from "./hooks/useInvoiceFilters";
import { useInvoiceSort } from "./hooks/useInvoiceSort";
import { useTableSelection } from "../../hooks/useTableSelection";
import { useLocalStorageState } from "../../hooks/useLocalStorageState";
import INVOICE_CONFIG from "./config";
// Cross-module CSS coupling — see manifest header in ./invoices.css.
// Renames in those files will silently break this page.
import "../Quotation/quotation.css";
import "../Leads/AddLead.css";
import "./invoices.css";

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
    <div className="empty-state-icon">🧾</div>
    <div className="empty-state-title">No Invoices Found</div>
    <div className="empty-state-text">
      Try adjusting your filters or generate one from a delivered order
    </div>
  </div>
);

const ViewInvoice = ({ onRefreshParent }) => {
  const {
    invoices,
    loading,
    refetch,
    deleteById,
    updateInvoice,
    updateStatus,
    bulkDelete,
    bulkUpdateStatus,
  } = useInvoices();

  const filters = useInvoiceFilters(invoices);
  const { filteredInvoices } = filters;

  const { sortBy, sortOrder, handleSort, sortedItems: sortedInvoices } =
    useInvoiceSort(filteredInvoices);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(INVOICE_CONFIG.UI.ITEMS_PER_PAGE);
  const pageCount = Math.max(1, Math.ceil(sortedInvoices.length / perPage));
  const pageData = sortedInvoices.slice((page - 1) * perPage, page * perPage);

  useEffect(() => {
    setPage(1);
  }, [
    filters.filterStatus,
    filters.query,
    filters.startDate,
    filters.endDate,
    invoices,
  ]);

  const pageIds = useMemo(() => pageData.map((i) => i._id), [pageData]);
  const {
    selectedIds: selectedInvoices,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    isAllSelected,
  } = useTableSelection(pageIds);

  const [visibleColumns, setVisibleColumns] = useLocalStorageState(
    "viewInvoicesColumns",
    INVOICE_CONFIG.COLUMNS
  );
  const [savedFilters, setSavedFilters] = useLocalStorageState(
    "viewInvoicesSavedFilters",
    []
  );

  const toggleColumn = useCallback(
    (col) => setVisibleColumns((prev) => ({ ...prev, [col]: !prev[col] })),
    [setVisibleColumns]
  );

  const saveCurrentFilter = useCallback(
    (name) => {
      setSavedFilters((prev) => [
        ...prev,
        {
          id: Date.now(),
          name,
          filterStatus: filters.filterStatus,
          startDate: filters.startDate,
          endDate: filters.endDate,
          query: filters.query,
        },
      ]);
    },
    [
      setSavedFilters,
      filters.filterStatus,
      filters.startDate,
      filters.endDate,
      filters.query,
    ]
  );

  const loadFilter = useCallback(
    (id) => {
      const f = savedFilters.find((x) => x.id === id);
      if (!f) return;
      filters.setFilterStatus(f.filterStatus);
      filters.setStartDate(f.startDate);
      filters.setEndDate(f.endDate);
      filters.setQuery(f.query || "");
      setPage(1);
    },
    [savedFilters, filters]
  );

  const deleteFilter = useCallback(
    (id) => setSavedFilters((prev) => prev.filter((f) => f.id !== id)),
    [setSavedFilters]
  );

  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [dateFilterOpen, setDateFilterOpen] = useState(false);
  const [viewModalInvoice, setViewModalInvoice] = useState(null);
  const [editModalInvoice, setEditModalInvoice] = useState(null);
  const [statusInvoice, setStatusInvoice] = useState(null);

  const stats = useMemo(
    () => ({
      total: filteredInvoices.length,
      draft: filteredInvoices.filter((i) => i.status === "Draft").length,
      sent: filteredInvoices.filter((i) => i.status === "Sent").length,
      paid: filteredInvoices.filter((i) => i.status === "Paid").length,
      overdue: filteredInvoices.filter((i) => i.status === "Overdue").length,
      cancelled: filteredInvoices.filter((i) => i.status === "Cancelled").length,
    }),
    [filteredInvoices]
  );

  // --- row actions (stable identities so memoized rows can skip re-renders) ---
  const handleView = useCallback((inv) => setViewModalInvoice(inv), []);
  const handleEdit = useCallback((inv) => setEditModalInvoice({ ...inv }), []);
  const handleOpenStatusModal = useCallback(
    (inv) => setStatusInvoice(inv),
    []
  );

  const handleDelete = useCallback(
    async (inv) => {
      if (
        !window.confirm(
          `Delete invoice ${inv.invoiceNumber || inv._id}?`
        )
      )
        return;
      try {
        await deleteById(inv._id);
        alert("✅ Invoice deleted!");
        await refetch();
        if (onRefreshParent) onRefreshParent();
      } catch (error) {
        alert(`❌ ${error.message || "Failed to delete invoice"}`);
      }
    },
    [deleteById, refetch, onRefreshParent]
  );

  const handleUpdateInvoice = async (payload) => {
    try {
      await updateInvoice(editModalInvoice._id, payload);
      setEditModalInvoice(null);
      await refetch();
      alert("✅ Invoice updated successfully!");
    } catch (error) {
      alert(`❌ ${error.message || "Failed to update invoice"}`);
    }
  };

  const handleSubmitStatus = async (inv, newStatus, remark) => {
    try {
      await updateStatus(inv._id, newStatus, remark);
      setStatusInvoice(null);
      await refetch();
      alert("✅ Status updated!");
    } catch (error) {
      alert(`❌ ${error.message || "Failed to update status"}`);
    }
  };

  // --- bulk actions ---
  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedInvoices.length} invoice(s)?`))
      return;
    try {
      await bulkDelete(selectedInvoices);
      alert("✅ Invoices deleted!");
      clearSelection();
      await refetch();
      if (onRefreshParent) onRefreshParent();
    } catch (error) {
      alert(`❌ ${error.message || "Failed to delete invoices"}`);
    }
  };

  const handleBulkStatusChange = async (newStatus) => {
    try {
      await bulkUpdateStatus(selectedInvoices, newStatus);
      alert(`✅ ${selectedInvoices.length} invoice(s) status updated!`);
      clearSelection();
      await refetch();
    } catch (error) {
      alert(`❌ ${error.message || "Failed to update status"}`);
    }
  };

  // --- CSV export ---
  const buildCsv = (rows) => {
    const headers = [
      "#",
      "Invoice No.",
      "Customer",
      "Invoice Date",
      "Due Date",
      "Total Amount",
      "Tax",
      "Status",
      "From Order",
      "Notes",
    ];
    const csvRows = rows.map((inv, i) => [
      i + 1,
      inv.invoiceNumber || inv._id,
      inv.customerName || inv.customerId?.name || "-",
      inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString() : "-",
      inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "-",
      inv.totalAmount ?? "-",
      inv.taxAmount ?? "-",
      inv.status || "-",
      inv.orderId?.orderId
        ? `O-${String(inv.orderId.orderId).padStart(5, "0")}`
        : "-",
      (inv.notes || "").replace(/"/g, '""'),
    ]);
    let csv = "data:text/csv;charset=utf-8,";
    csv += headers.join(",") + "\n";
    csvRows.forEach((row) => {
      csv += row.map((cell) => `"${cell}"`).join(",") + "\n";
    });
    return csv;
  };

  const downloadCsv = (csv, filename) => {
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCSV = () => {
    try {
      downloadCsv(
        buildCsv(pageData),
        `invoices-export-${new Date().toISOString().split("T")[0]}.csv`
      );
      alert("✅ CSV exported successfully!");
    } catch {
      alert("❌ Failed to export CSV");
    }
  };

  const handleBulkExportCSV = () => {
    try {
      const rows = invoices.filter((i) => selectedInvoices.includes(i._id));
      downloadCsv(
        buildCsv(rows),
        `invoices-bulk-export-${new Date().toISOString().split("T")[0]}.csv`
      );
      alert("✅ CSV exported successfully!");
    } catch {
      alert("❌ Failed to export CSV");
    }
  };

  return (
    <div className="leads-container">
      <InvoicesFilterDrawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        filterStatus={filters.filterStatus}
        onFilterStatusChange={filters.setFilterStatus}
        onApply={() => setFilterDrawerOpen(false)}
        onReset={filters.resetFilters}
      />

      <div className="leads-page-header">
        <h1 className="leads-title">Invoices</h1>
        <div className="leads-header-actions">
          <button
            className="refresh-btn"
            onClick={() => {
              filters.resetFilters();
              setPage(1);
              refetch();
              if (onRefreshParent) onRefreshParent();
            }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      <InvoicesStats stats={stats} />

      <InvoicesToolbar
        query={filters.query}
        onQueryChange={filters.setQuery}
        onOpenFilterDrawer={() => setFilterDrawerOpen(true)}
        activeFilterCount={
          (filters.filterStatus !== "all" ? 1 : 0) +
          (filters.startDate && filters.endDate ? 1 : 0) +
          (filters.query ? 1 : 0)
        }
        visibleColumns={visibleColumns}
        onToggleColumn={toggleColumn}
        savedFilters={savedFilters}
        onSaveFilter={saveCurrentFilter}
        onLoadFilter={loadFilter}
        onDeleteFilter={deleteFilter}
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

      <InvoicesBulkActionBar
        count={selectedInvoices.length}
        onStatusChange={handleBulkStatusChange}
        onExportCSV={handleBulkExportCSV}
        onDelete={handleBulkDelete}
      />

      {loading ? (
        <LoadingSkeleton />
      ) : sortedInvoices.length === 0 ? (
        <EmptyState />
      ) : (
        <InvoicesTable
          rows={pageData}
          startIndex={(page - 1) * perPage}
          visibleColumns={visibleColumns}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          selectedIds={selectedInvoices}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
          isAllSelected={isAllSelected}
          onView={handleView}
          onEdit={handleEdit}
          onUpdateStatus={handleOpenStatusModal}
          onDelete={handleDelete}
        />
      )}

      <div className="entries-control">
        <div className="entries-info">
          <span>
            <strong>Showing:</strong>{" "}
            {pageData.length > 0 ? (page - 1) * perPage + 1 : 0} to{" "}
            {Math.min(page * perPage, sortedInvoices.length)} of{" "}
            {sortedInvoices.length} entries
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

      <ViewInvoiceModal
        invoice={viewModalInvoice}
        onClose={() => setViewModalInvoice(null)}
      />

      <EditInvoiceModal
        invoice={editModalInvoice}
        onSubmit={handleUpdateInvoice}
        onClose={() => setEditModalInvoice(null)}
      />

      <UpdateStatusModal
        invoice={statusInvoice}
        onClose={() => setStatusInvoice(null)}
        onSubmit={handleSubmitStatus}
      />
    </div>
  );
};

export default ViewInvoice;
