import React, { useEffect, useMemo, useState } from "react";
import CustomersTable from "./components/CustomersTable";
import CustomersToolbar from "./components/CustomersToolbar";
import CustomersStats from "./components/CustomersStats";
import CustomersBulkActionBar from "./components/CustomersBulkActionBar";
import CustomersFilterDrawer from "./components/CustomersFilterDrawer";
import CustomersQuickPreview from "./components/CustomersQuickPreview";
import ViewCustomerModal from "./components/modals/ViewCustomerModal";
import EditCustomerModal from "./components/modals/EditCustomerModal";
import WhatsAppModal from "./components/modals/WhatsAppModal";
import { useCustomers } from "./hooks/useCustomers";
import { useCustomerFilters } from "./hooks/useCustomerFilters";
import { useCustomerSort } from "./hooks/useCustomerSort";
import { useTableSelection } from "../../hooks/useTableSelection";
import { useLocalStorageState } from "../../hooks/useLocalStorageState";
import "../Leads/AddLead.css";
import "../Leads/leads.css";

const DEFAULT_COLUMNS = {
  name: true,
  phone: true,
  email: true,
  state: true,
  address: false,
  created: true,
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
    <div className="empty-state-icon">👥</div>
    <div className="empty-state-title">No Customers Found</div>
    <div className="empty-state-text">
      Try adjusting your filters or add a new customer
    </div>
  </div>
);

const ViewCustomers = ({ onRefreshParent }) => {
  const { customers, isLoading, refetch, deleteById, updateCustomer, bulkDelete } =
    useCustomers();

  const filters = useCustomerFilters(customers);
  const { filteredCustomers, uniqueStates } = filters;

  const { sortBy, sortOrder, handleSort, sortedItems: sortedCustomers } =
    useCustomerSort(filteredCustomers);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const pageCount = Math.max(1, Math.ceil(sortedCustomers.length / perPage));
  const pageData = sortedCustomers.slice((page - 1) * perPage, page * perPage);

  useEffect(() => {
    setPage(1);
  }, [
    filters.filterState,
    filters.filterName,
    filters.query,
    filters.startDate,
    filters.endDate,
    customers,
  ]);

  const pageIds = useMemo(() => pageData.map((c) => c._id), [pageData]);
  const {
    selectedIds: selectedCustomers,
    toggleSelect: handleSelectCustomer,
    toggleSelectAll: handleSelectAll,
    clearSelection,
    isAllSelected,
  } = useTableSelection(pageIds);

  const [visibleColumns, setVisibleColumns] = useLocalStorageState(
    "viewCustomersColumns",
    DEFAULT_COLUMNS
  );
  const [savedFilters, setSavedFilters] = useLocalStorageState(
    "viewCustomersSavedFilters",
    []
  );

  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [dateFilterOpen, setDateFilterOpen] = useState(false);
  const [previewCustomer, setPreviewCustomer] = useState(null);
  const [viewModalCustomer, setViewModalCustomer] = useState(null);
  const [editModalCustomer, setEditModalCustomer] = useState(null);
  const [whatsappCustomer, setWhatsappCustomer] = useState(null);

  const stats = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
    const states = new Set();
    let withEmail = 0;
    let thisWeek = 0;
    let thisMonth = 0;
    for (const c of filteredCustomers) {
      if (c.state) states.add(c.state);
      if (c.email) withEmail++;
      if (c.createdAt) {
        const t = new Date(c.createdAt);
        if (t >= weekAgo) thisWeek++;
        if (t >= monthAgo) thisMonth++;
      }
    }
    return {
      total: filteredCustomers.length,
      thisWeek,
      thisMonth,
      withEmail,
      uniqueStates: states.size,
    };
  }, [filteredCustomers]);

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedCustomers.length} customer(s)?`)) return;
    try {
      await bulkDelete(selectedCustomers);
      alert("✅ Customers deleted successfully!");
      clearSelection();
      await refetch();
      if (onRefreshParent) onRefreshParent();
    } catch (error) {
      alert(`❌ ${error.message || "Failed to delete customers"}`);
    }
  };

  const handleBulkExportCSV = () => {
    try {
      const headers = ["#", "Name", "Phone", "Email", "State", "Address", "Created"];
      const selectedData = customers.filter((c) =>
        selectedCustomers.includes(c._id)
      );
      const rows = selectedData.map((c, i) => [
        i + 1,
        c.name || "-",
        c.phone || "-",
        c.email || "-",
        c.state || "-",
        c.address || "-",
        c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "-",
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
        `customers-bulk-export-${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      alert("✅ CSV exported successfully!");
    } catch (err) {
      alert("❌ Failed to export CSV");
    }
  };

  const handleColumnToggle = (column) =>
    setVisibleColumns((prev) => ({ ...prev, [column]: !prev[column] }));

  const handleSaveFilter = (name) => {
    setSavedFilters((prev) => [
      ...prev,
      {
        id: Date.now(),
        name,
        filterState: filters.filterState,
        filterName: filters.filterName,
        startDate: filters.startDate,
        endDate: filters.endDate,
      },
    ]);
  };

  const handleLoadFilter = (filterId) => {
    const f = savedFilters.find((x) => x.id === filterId);
    if (!f) return;
    filters.setFilterState(f.filterState);
    filters.setFilterName(f.filterName);
    filters.setStartDate(f.startDate);
    filters.setEndDate(f.endDate);
  };

  const handleDeleteFilter = (filterId) =>
    setSavedFilters((prev) => prev.filter((f) => f.id !== filterId));

  const handleExportCSV = () => {
    try {
      const headers = ["#", "Name", "Phone", "Email", "State", "Address", "Created"];
      const rows = pageData.map((c, i) => [
        (page - 1) * perPage + i + 1,
        c.name || "-",
        c.phone || "-",
        c.email || "-",
        c.state || "-",
        c.address || "-",
        c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "-",
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
        `customers-export-${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      alert("✅ CSV exported successfully!");
    } catch (err) {
      alert("❌ Failed to export CSV");
    }
  };

  const handleUpdateCustomer = async (payload) => {
    try {
      await updateCustomer(editModalCustomer._id, payload);
      setEditModalCustomer(null);
      await refetch();
      alert("✅ Customer updated successfully!");
    } catch (error) {
      alert(`❌ ${error.message || "Failed to update customer."}`);
    }
  };

  const handleDeleteCustomer = async (customer) => {
    if (!window.confirm(`Delete customer "${customer.name}"?`)) return;
    try {
      await deleteById(customer._id);
      alert("✅ Customer deleted successfully!");
      await refetch();
      if (onRefreshParent) onRefreshParent();
    } catch (error) {
      alert(`❌ ${error.message || "Failed to delete customer"}`);
    }
  };

  const handleSendCustomerMessage = (customer) => {
    if (!customer.phone) {
      alert("No phone number found for this customer.");
      return;
    }
    setWhatsappCustomer(customer);
  };

  const handleWhatsappSend = (customer, message) => {
    const phone = (customer.phone || "").replace(/[^0-9]/g, "");
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${phone}?text=${encoded}`, "_blank");
    setWhatsappCustomer(null);
  };

  return (
    <div className="leads-container">
      <CustomersFilterDrawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        filterName={filters.filterName}
        onFilterNameChange={filters.setFilterName}
        filterState={filters.filterState}
        onFilterStateChange={filters.setFilterState}
        uniqueStates={uniqueStates}
        onApply={() => setFilterDrawerOpen(false)}
        onReset={filters.resetFilters}
      />

      <CustomersQuickPreview
        customer={previewCustomer}
        onClose={() => setPreviewCustomer(null)}
      />

      <div className="leads-page-header">
        <h1 className="leads-title">Customers Management</h1>
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

      <CustomersStats stats={stats} />

      <CustomersToolbar
        query={filters.query}
        onQueryChange={filters.setQuery}
        onOpenFilterDrawer={() => setFilterDrawerOpen(true)}
        activeFilterCount={
          (filters.filterState !== "all" ? 1 : 0) +
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

      <CustomersBulkActionBar
        count={selectedCustomers.length}
        onExportCSV={handleBulkExportCSV}
        onDelete={handleBulkDelete}
      />

      {isLoading ? (
        <LoadingSkeleton />
      ) : sortedCustomers.length === 0 ? (
        <EmptyState />
      ) : (
        <CustomersTable
          rows={pageData}
          startIndex={(page - 1) * perPage}
          visibleColumns={visibleColumns}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          selectedIds={selectedCustomers}
          onToggleSelect={handleSelectCustomer}
          onToggleSelectAll={handleSelectAll}
          isAllSelected={isAllSelected}
          onPreview={setPreviewCustomer}
          onView={setViewModalCustomer}
          onEdit={(customer) => setEditModalCustomer({ ...customer })}
          onDelete={handleDeleteCustomer}
          onSendWhatsApp={handleSendCustomerMessage}
        />
      )}

      <div className="entries-control">
        <div className="entries-info">
          <span>
            <strong>Showing:</strong>{" "}
            {pageData.length > 0 ? (page - 1) * perPage + 1 : 0} to{" "}
            {Math.min(page * perPage, sortedCustomers.length)} of{" "}
            {sortedCustomers.length} entries
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

      <ViewCustomerModal
        customer={viewModalCustomer}
        onClose={() => setViewModalCustomer(null)}
        onSendWhatsApp={handleSendCustomerMessage}
      />

      <EditCustomerModal
        customer={editModalCustomer}
        onSubmit={handleUpdateCustomer}
        onClose={() => setEditModalCustomer(null)}
      />

      <WhatsAppModal
        customer={whatsappCustomer}
        onClose={() => setWhatsappCustomer(null)}
        onSend={handleWhatsappSend}
      />
    </div>
  );
};

export default ViewCustomers;
