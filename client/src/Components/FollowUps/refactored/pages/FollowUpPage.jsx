/**
 * FollowUpPage Component
 * Main container for the Follow-Up module
 * Orchestrates all sub-components and state management
 */

import React, { useEffect } from 'react';
import useFollowUps from '../../hooks/useFollowUps';
import { FOLLOW_UP_TABS } from '../../constants/config';

// Common Components
import FollowUpTabs from '../common/FollowUpTabs';
import FollowUpTable from '../common/FollowUpTable';
import FollowUpFilters from '../common/FollowUpFilters';
import FollowUpModal from '../common/FollowUpModal';
import FollowUpDrawer from '../common/FollowUpDrawer';

// Feature Components
import DashboardCards from '../features/DashboardCards';
import FollowUpTimeline from '../features/FollowUpTimeline';

// Styles
import '../../../styles/followup-page.css';

const FollowUpPage = ({ onCustomerAdded, viewMode = 'table' }) => {
  const {
    // State
    activeTab,
    setActiveTab,
    tabCounts,
    followUps,
    entries,
    selectedEntry,
    selectedFollowUp,
    loading,
    isLoadingTab,
    error,
    tabError,
    isSubmitting,
    submitSuccess,
    setSubmitSuccess,
    formData,
    setFormData,
    isModalOpen,
    isDrawerOpen,
    isUpdateModalOpen,
    filterStatus,
    setFilterStatus,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    getTotalPages,
    getTotalCount,

    // Methods
    openModal,
    closeModal,
    openDrawer,
    closeDrawer,
    openUpdateModal,
    closeUpdateModal,
    createFollowUp,
    updateFollowUp,
    deleteFollowUp,
    fetchFollowUps,
    resetSelection,
    clearFormData,
    getPaginatedFollowUps,
    setSelectedEntry,
    setSelectedFollowUp
  } = useFollowUps();

  // Fetch follow-ups on mount
  useEffect(() => {
    fetchFollowUps();
  }, [fetchFollowUps]);

  // Show success message
  useEffect(() => {
    if (submitSuccess) {
      const timer = setTimeout(() => {
        setSubmitSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [submitSuccess, setSubmitSuccess]);

  // Handle add follow-up from entries table
  const handleAddFollowUp = (entry) => {
    setSelectedEntry(entry);
    openModal();
  };

  // Handle edit follow-up
  const handleEditFollowUp = (followUp) => {
    setSelectedFollowUp(followUp);
    openUpdateModal(followUp);
  };

  // Handle view follow-up
  const handleViewFollowUp = (followUp) => {
    setSelectedFollowUp(followUp);
    openDrawer();
  };

  // Handle create follow-up
  const handleCreateFollowUp = async () => {
    const success = await createFollowUp();
    if (success && onCustomerAdded) {
      onCustomerAdded();
    }
  };

  // Handle update follow-up
  const handleUpdateFollowUp = async () => {
    const success = await updateFollowUp();
    if (success && onCustomerAdded) {
      onCustomerAdded();
    }
  };

  // Handle delete follow-up
  const handleDeleteFollowUp = async (id) => {
    const success = await deleteFollowUp(id);
    if (success && onCustomerAdded) {
      onCustomerAdded();
    }
  };

  // Get paginated data based on view mode
  const displayData = activeTab && viewMode === 'table' 
    ? (activeTab === 'leads' || activeTab === 'quotations' ? entries : getPaginatedFollowUps())
    : getPaginatedFollowUps();

  return (
    <div className="followup-page p-5">
      {/* Header */}
      <div className="followup-header">
        <h1 className="followup-page-title">Follow-Up Management</h1>
        <button
          onClick={openModal}
          className="button button-primary"
          disabled={!selectedEntry && activeTab === 'leads' ? isLoadingTab : false}
        >
          + New Follow-Up
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-error">
          <strong>Error:</strong> {error}
          <button onClick={() => setSubmitSuccess(false)} className="alert-close">
            ×
          </button>
        </div>
      )}

      {/* Success Alert */}
      {submitSuccess && (
        <div className="alert alert-success">
          ✓ Operation completed successfully!
        </div>
      )}

      {/* Dashboard Stats */}
      <section className="followup-section">
        <h2 className="section-title">Overview</h2>
        <DashboardCards followUps={followUps} isLoading={loading} />
      </section>

      {/* Mode Selector */}
      <div className="view-mode-selector">
        <button
          className={`mode-button ${viewMode === 'entries' ? 'active' : ''}`}
          onClick={() => {}}
        >
          Add Follow-Ups
        </button>
        <button
          className={`mode-button ${viewMode === 'table' ? 'active' : ''}`}
          onClick={() => {}}
        >
          View Follow-Ups
        </button>
        <button
          className={`mode-button ${viewMode === 'timeline' ? 'active' : ''}`}
          onClick={() => {}}
        >
          Timeline View
        </button>
      </div>

      {/* Add Follow-Up Mode */}
      {viewMode === 'entries' && (
        <>
          {/* Tabs */}
          <FollowUpTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            tabCounts={tabCounts}
            isLoading={isLoadingTab}
            tabs={FOLLOW_UP_TABS}
          />

          {/* Entries Table */}
          {tabError && (
            <div className="alert alert-error">
              {tabError}
            </div>
          )}

          <FollowUpTable
            entries={entries}
            isLoading={isLoadingTab}
            type="entries"
            onAddFollowUp={handleAddFollowUp}
            emptyMessage={`No ${activeTab} found`}
          />
        </>
      )}

      {/* View Follow-Ups Mode */}
      {viewMode === 'table' && (
        <>
          {/* Filters */}
          <section className="followup-section">
            <h2 className="section-title">Filter & Search</h2>
            <FollowUpFilters
              filterStatus={filterStatus}
              onFilterStatusChange={setFilterStatus}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortBy={sortBy}
              onSortChange={setSortBy}
              startDate={startDate}
              onStartDateChange={setStartDate}
              endDate={endDate}
              onEndDateChange={setEndDate}
              onReset={resetSelection}
            />
          </section>

          {/* Follow-Ups Table */}
          <section className="followup-section">
            <h2 className="section-title">
              Follow-Ups ({getTotalCount()} total)
            </h2>
            <FollowUpTable
              entries={displayData}
              isLoading={loading}
              type="followups"
              onAddFollowUp={openModal}
              onEdit={handleEditFollowUp}
              onDelete={handleDeleteFollowUp}
              onView={handleViewFollowUp}
              emptyMessage="No follow-ups found"
            />
          </section>

          {/* Pagination */}
          {getTotalPages() > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="pagination-button"
              >
                Previous
              </button>

              <span className="pagination-info">
                Page {currentPage} of {getTotalPages()}
              </span>

              <button
                onClick={() => setCurrentPage(Math.min(getTotalPages(), currentPage + 1))}
                disabled={currentPage === getTotalPages()}
                className="pagination-button"
              >
                Next
              </button>

              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="pagination-select"
              >
                <option value="5">5 per page</option>
                <option value="10">10 per page</option>
                <option value="20">20 per page</option>
                <option value="50">50 per page</option>
              </select>
            </div>
          )}
        </>
      )}

      {/* Timeline Mode */}
      {viewMode === 'timeline' && (
        <section className="followup-section">
          <h2 className="section-title">Timeline View</h2>
          <FollowUpTimeline
            followUps={displayData}
            isLoading={loading}
            onSelect={handleViewFollowUp}
          />
        </section>
      )}

      {/* Modal - Add/Edit Follow-Up */}
      <FollowUpModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={selectedFollowUp ? handleUpdateFollowUp : handleCreateFollowUp}
        selectedEntry={selectedEntry}
        formData={formData}
        onFormDataChange={setFormData}
        isSubmitting={isSubmitting}
        error={error}
        mode={selectedFollowUp ? 'edit' : 'create'}
      />

      {/* Modal - Update Follow-Up */}
      {selectedFollowUp && isUpdateModalOpen && (
        <FollowUpModal
          isOpen={isUpdateModalOpen}
          onClose={closeUpdateModal}
          onSubmit={handleUpdateFollowUp}
          selectedEntry={selectedFollowUp}
          formData={formData}
          onFormDataChange={setFormData}
          isSubmitting={isSubmitting}
          error={error}
          mode="edit"
        />
      )}

      {/* Drawer - Follow-Up Details */}
      <FollowUpDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        followUp={selectedFollowUp}
        onEdit={handleEditFollowUp}
        onDelete={handleDeleteFollowUp}
        isLoading={false}
      />
    </div>
  );
};

export default FollowUpPage;
