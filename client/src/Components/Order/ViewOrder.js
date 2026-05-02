import React, { useCallback, useEffect, useMemo, useState } from "react";
import OrdersTable from "./components/OrdersTable";
import OrdersToolbar from "./components/OrdersToolbar";
import OrdersStats from "./components/OrdersStats";
import OrdersBulkActionBar from "./components/OrdersBulkActionBar";
import OrdersFilterDrawer from "./components/OrdersFilterDrawer";
import ViewOrderModal from "./components/modals/ViewOrderModal";
import EditOrderModal from "./components/modals/EditOrderModal";
import WhatsAppModal from "./components/modals/WhatsAppModal";
import UpdateStatusModal from "./components/modals/UpdateStatusModal";
import { useOrders } from "./hooks/useOrders";
import { useOrderFilters } from "./hooks/useOrderFilters";
import { useOrderSort } from "./hooks/useOrderSort";
import { useTableSelection } from "../../hooks/useTableSelection";
import { useLocalStorageState } from "../../hooks/useLocalStorageState";
import ORDER_CONFIG from "./config";
// Cross-module CSS coupling — see manifest header in ./orders.css for the
// exact list of external classes Orders depends on. Renames in those files
// will silently break this page; grep orders.css before refactoring them.
import "../Quotation/quotation.css";
import "../Leads/AddLead.css";
import "./orders.css";

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
    <div className="empty-state-icon">📦</div>
    <div className="empty-state-title">No Orders Found</div>
    <div className="empty-state-text">
      Try adjusting your filters or convert a quotation to an order
    </div>
  </div>
);

const ViewOrders = ({ onRefreshParent, openInvoice }) => {
  const {
    orders,
    loading,
    refetch,
    deleteById,
    updateOrder,
    updateStatus,
    bulkDelete,
    bulkUpdateStatus,
  } = useOrders();

  const filters = useOrderFilters(orders);
  const { filteredOrders } = filters;

  const { sortBy, sortOrder, handleSort, sortedItems: sortedOrders } =
    useOrderSort(filteredOrders);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(ORDER_CONFIG.UI.ITEMS_PER_PAGE);
  const pageCount = Math.max(1, Math.ceil(sortedOrders.length / perPage));
  const pageData = sortedOrders.slice((page - 1) * perPage, page * perPage);

  // Snap to page 1 when filter inputs or underlying data change.
  useEffect(() => {
    setPage(1);
  }, [
    filters.filterStatus,
    filters.query,
    filters.startDate,
    filters.endDate,
    orders,
  ]);

  const pageIds = useMemo(() => pageData.map((o) => o._id), [pageData]);
  const {
    selectedIds: selectedOrders,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    isAllSelected,
  } = useTableSelection(pageIds);

  const [visibleColumns, setVisibleColumns] = useLocalStorageState(
    "viewOrdersColumns",
    ORDER_CONFIG.COLUMNS
  );
  const [savedFilters, setSavedFilters] = useLocalStorageState(
    "viewOrdersSavedFilters",
    []
  );

  const toggleColumn = useCallback(
    (col) =>
      setVisibleColumns((prev) => ({ ...prev, [col]: !prev[col] })),
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
  const [viewModalOrder, setViewModalOrder] = useState(null);
  const [editModalOrder, setEditModalOrder] = useState(null);
  const [whatsappOrder, setWhatsappOrder] = useState(null);
  const [statusOrder, setStatusOrder] = useState(null);

  const stats = useMemo(
    () => ({
      total: filteredOrders.length,
      new: filteredOrders.filter((o) => o.status === "New").length,
      processing: filteredOrders.filter((o) => o.status === "Processing").length,
      shipped: filteredOrders.filter((o) => o.status === "Shipped").length,
      delivered: filteredOrders.filter((o) => o.status === "Delivered").length,
      cancelled: filteredOrders.filter((o) => o.status === "Cancelled").length,
    }),
    [filteredOrders]
  );

  // --- row actions (stable so memoized rows can skip re-renders) ---
  const handleView = useCallback((o) => setViewModalOrder(o), []);
  const handleEdit = useCallback((o) => setEditModalOrder({ ...o }), []);

  const handleSendWhatsApp = useCallback((o) => {
    if (!o.phone) {
      alert("No phone number found for this order.");
      return;
    }
    setWhatsappOrder(o);
  }, []);

  const handleDelete = useCallback(
    async (o) => {
      if (!window.confirm(`Delete order for ${o.customerName}?`)) return;
      try {
        await deleteById(o._id);
        alert("✅ Order deleted!");
        await refetch();
      } catch (error) {
        alert(`❌ ${error.message || "Failed to delete order"}`);
      }
    },
    [deleteById, refetch]
  );

  const handleOpenStatusModal = useCallback((o) => setStatusOrder(o), []);

  // Hand off to the Invoice > Add page with the order pre-stashed in
  // localStorage. The user reviews/edits and clicks "Save Invoice" there.
  const handleConvertToInvoice = useCallback(
    (o) => {
      if (openInvoice) openInvoice(o);
    },
    [openInvoice]
  );

  const handleSubmitStatus = async (o, newStatus, remark) => {
    try {
      await updateStatus(o._id, newStatus, remark);
      setStatusOrder(null);
      await refetch();
      alert("✅ Status updated!");
    } catch (error) {
      alert(`❌ ${error.message || "Failed to update status"}`);
    }
  };

  const handleExportPDF = useCallback(async (o) => {
    try {
      const baseUrl = ORDER_CONFIG.API.BASE_URL.replace(/\/$/, "");
      const res = await fetch(`${baseUrl}/api/orders/${o._id}/export`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "PDF export failed");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `order-${o.orderNumber || o._id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      alert("✅ PDF exported successfully!");
    } catch (err) {
      alert(`❌ ${err.message || "Failed to export PDF."}`);
    }
  }, []);

  const handleUpdateOrder = async (payload) => {
    try {
      await updateOrder(editModalOrder._id, payload);
      setEditModalOrder(null);
      await refetch();
      alert("✅ Order updated successfully!");
    } catch (error) {
      alert(`❌ ${error.message || "Failed to update order"}`);
    }
  };

  const handleWhatsappSend = (o, message) => {
    const phone = (o.phone || "").replace(/[^0-9]/g, "");
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${phone}?text=${encoded}`, "_blank");
    setWhatsappOrder(null);
  };

  // --- bulk actions ---
  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedOrders.length} order(s)?`)) return;
    try {
      await bulkDelete(selectedOrders);
      alert("✅ Orders deleted!");
      clearSelection();
      await refetch();
    } catch (error) {
      alert(`❌ ${error.message || "Failed to delete orders"}`);
    }
  };

  const handleBulkStatusChange = async (newStatus) => {
    try {
      await bulkUpdateStatus(selectedOrders, newStatus);
      alert(`✅ ${selectedOrders.length} order(s) status updated!`);
      clearSelection();
      await refetch();
    } catch (error) {
      alert(`❌ ${error.message || "Failed to update status"}`);
    }
  };

  // --- CSV export (current view) ---
  const buildCsv = (rows) => {
    const headers = [
      "#",
      "Order No.",
      "Customer",
      "Email",
      "Phone",
      "Amount",
      "Status",
      "From Quote",
      "Date",
    ];
    const csvRows = rows.map((o, i) => [
      i + 1,
      o.orderNumber || o._id,
      o.customerName || "-",
      o.email || "-",
      o.phone || "-",
      o.totalAmount ?? "-",
      o.status || "-",
      o.sourceQuotationId?.quotationId
        ? `Q-${String(o.sourceQuotationId.quotationId).padStart(5, "0")}`
        : "-",
      o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "-",
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
        `orders-export-${new Date().toISOString().split("T")[0]}.csv`
      );
      alert("✅ CSV exported successfully!");
    } catch {
      alert("❌ Failed to export CSV");
    }
  };

  const handleBulkExportCSV = () => {
    try {
      const rows = orders.filter((o) => selectedOrders.includes(o._id));
      downloadCsv(
        buildCsv(rows),
        `orders-bulk-export-${new Date().toISOString().split("T")[0]}.csv`
      );
      alert("✅ CSV exported successfully!");
    } catch {
      alert("❌ Failed to export CSV");
    }
  };

  return (
    <div className="leads-container">
      <OrdersFilterDrawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        filterStatus={filters.filterStatus}
        onFilterStatusChange={filters.setFilterStatus}
        onApply={() => setFilterDrawerOpen(false)}
        onReset={filters.resetFilters}
      />

      <div className="leads-page-header">
        <h1 className="leads-title">Orders</h1>
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

      <OrdersStats stats={stats} />

      <OrdersToolbar
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

      <OrdersBulkActionBar
        count={selectedOrders.length}
        onStatusChange={handleBulkStatusChange}
        onExportCSV={handleBulkExportCSV}
        onDelete={handleBulkDelete}
      />

      {loading ? (
        <LoadingSkeleton />
      ) : sortedOrders.length === 0 ? (
        <EmptyState />
      ) : (
        <OrdersTable
          rows={pageData}
          startIndex={(page - 1) * perPage}
          visibleColumns={visibleColumns}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          selectedIds={selectedOrders}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
          isAllSelected={isAllSelected}
          onView={handleView}
          onEdit={handleEdit}
          onExportPDF={handleExportPDF}
          onSendWhatsApp={handleSendWhatsApp}
          onDelete={handleDelete}
          onUpdateStatus={handleOpenStatusModal}
          onConvertToInvoice={handleConvertToInvoice}
        />
      )}

      <div className="entries-control">
        <div className="entries-info">
          <span>
            <strong>Showing:</strong>{" "}
            {pageData.length > 0 ? (page - 1) * perPage + 1 : 0} to{" "}
            {Math.min(page * perPage, sortedOrders.length)} of{" "}
            {sortedOrders.length} entries
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

      <ViewOrderModal
        order={viewModalOrder}
        onClose={() => setViewModalOrder(null)}
      />

      <EditOrderModal
        order={editModalOrder}
        onSubmit={handleUpdateOrder}
        onClose={() => setEditModalOrder(null)}
      />

      <WhatsAppModal
        order={whatsappOrder}
        onClose={() => setWhatsappOrder(null)}
        onSend={handleWhatsappSend}
      />

      <UpdateStatusModal
        order={statusOrder}
        onClose={() => setStatusOrder(null)}
        onSubmit={handleSubmitStatus}
      />
    </div>
  );
};

export default ViewOrders;
