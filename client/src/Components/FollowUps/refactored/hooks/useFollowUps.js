/**
 * useFollowUps Custom Hook
 * Centralized state management for Follow-Up module
 * Handles: data fetching, caching, filtering, sorting, pagination
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import followUpService from '../services/followUpService';
import { FOLLOW_UP_STATUS } from '../constants/config';

/**
 * Custom hook for Follow-Up state management
 * @returns {Object} Follow-up state and handlers
 */
export const useFollowUps = () => {
  // ============================================
  // STATE MANAGEMENT
  // ============================================

  // Tab & Data Management
  const [activeTab, setActiveTab] = useState('leads');
  const [followUps, setFollowUps] = useState([]);
  const [entries, setEntries] = useState([]);
  const [tabCounts, setTabCounts] = useState({ leads: 0, quotations: 0 });

  // Selected Item
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [selectedFollowUp, setSelectedFollowUp] = useState(null);

  // Loading & Error States
  const [loading, setLoading] = useState(false);
  const [isLoadingTab, setIsLoadingTab] = useState(false);
  const [error, setError] = useState(null);
  const [tabError, setTabError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    followUpNote: '',
    followUpDate: '',
    followUpTime: '',
    conversationDetails: '',
    nextFollowUpDate: '',
    nextFollowUpTime: ''
  });

  // Modal & Drawer States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  // Filter & Sort States
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Submit States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Cache & Optimization
  const cacheRef = useRef({
    tabCounts: null,
    followUps: null,
    lastFetch: null
  });
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  /**
   * Clear form data
   */
  const clearFormData = useCallback(() => {
    setFormData({
      followUpNote: '',
      followUpDate: '',
      followUpTime: '',
      conversationDetails: '',
      nextFollowUpDate: '',
      nextFollowUpTime: ''
    });
  }, []);

  /**
   * Reset selected items
   */
  const resetSelection = useCallback(() => {
    setSelectedEntry(null);
    setSelectedFollowUp(null);
    clearFormData();
  }, [clearFormData]);

  /**
   * Check if cache is valid
   */
  const isCacheValid = useCallback(() => {
    if (!cacheRef.current.lastFetch) return false;
    return Date.now() - cacheRef.current.lastFetch < CACHE_DURATION;
  }, []);

  // ============================================
  // DATA FETCHING
  // ============================================

  /**
   * Fetch tab counts
   */
  const fetchTabCounts = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh && isCacheValid() && cacheRef.current.tabCounts) {
      setTabCounts(cacheRef.current.tabCounts);
      return;
    }

    try {
      const counts = await followUpService.getTabCounts();
      setTabCounts(counts);
      cacheRef.current.tabCounts = counts;
      cacheRef.current.lastFetch = Date.now();
    } catch (err) {
      console.error('Error fetching tab counts:', err);
      setError(err.message);
    }
  }, [isCacheValid]);

  /**
   * Fetch entries for active tab
   */
  const fetchEntriesByTab = useCallback(async (tabId) => {
    setIsLoadingTab(true);
    setTabError(null);

    try {
      let data = [];
      if (tabId === 'leads') {
        data = await followUpService.getLeads();
      } else if (tabId === 'quotations') {
        data = await followUpService.getQuotations();
      }
      setEntries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(`Error fetching ${tabId}:`, err);
      setTabError(err.message);
      setEntries([]);
    } finally {
      setIsLoadingTab(false);
    }
  }, []);

  /**
   * Fetch all follow-ups
   */
  const fetchFollowUps = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh && isCacheValid() && cacheRef.current.followUps) {
      setFollowUps(cacheRef.current.followUps);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await followUpService.getFollowUpsWithDetails();
      setFollowUps(data);
      cacheRef.current.followUps = data;
      cacheRef.current.lastFetch = Date.now();
    } catch (err) {
      console.error('Error fetching follow-ups:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isCacheValid]);

  // ============================================
  // FOLLOW-UP OPERATIONS
  // ============================================

  /**
   * Create a new follow-up
   */
  const createFollowUp = useCallback(async () => {
    if (!selectedEntry || !formData.followUpDate || !formData.followUpTime || !formData.followUpNote) {
      setError('Please fill in all required fields');
      return false;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const followUpDateTime = new Date(`${formData.followUpDate}T${formData.followUpTime}`);
      const relatedType = activeTab === 'leads' ? 'Lead' : 'Quotation';

      await followUpService.createFollowUp({
        relatedType,
        relatedId: selectedEntry._id,
        followUpDate: followUpDateTime.toISOString(),
        notes: formData.followUpNote,
        status: FOLLOW_UP_STATUS.PENDING
      });

      setSubmitSuccess(true);
      closeModal();
      resetSelection();
      await fetchFollowUps(true);
      return true;
    } catch (err) {
      console.error('Error creating follow-up:', err);
      setError(err.message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedEntry, formData, activeTab, fetchFollowUps, closeModal, resetSelection]);

  /**
   * Update an existing follow-up
   */
  const updateFollowUp = useCallback(async () => {
    if (!selectedFollowUp || !formData.conversationDetails) {
      setError('Please fill in required fields');
      return false;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const updateData = {
        conversationDetails: formData.conversationDetails
      };

      if (formData.nextFollowUpDate) {
        const nextDateTime = new Date(`${formData.nextFollowUpDate}T${formData.nextFollowUpTime || '09:00'}`);
        updateData.nextFollowUpDate = nextDateTime.toISOString();
      }

      await followUpService.updateFollowUp(selectedFollowUp._id, updateData);

      setSubmitSuccess(true);
      closeUpdateModal();
      resetSelection();
      await fetchFollowUps(true);
      return true;
    } catch (err) {
      console.error('Error updating follow-up:', err);
      setError(err.message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedFollowUp, formData, fetchFollowUps, closeUpdateModal, resetSelection]);

  /**
   * Delete a follow-up
   */
  const deleteFollowUp = useCallback(async (followUpId) => {
    if (!window.confirm('Are you sure you want to delete this follow-up?')) {
      return false;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await followUpService.deleteFollowUp(followUpId);
      setSubmitSuccess(true);
      await fetchFollowUps(true);
      return true;
    } catch (err) {
      console.error('Error deleting follow-up:', err);
      setError(err.message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [fetchFollowUps]);

  // ============================================
  // FILTER & SORT OPERATIONS
  // ============================================

  /**
   * Apply filters to follow-ups
   */
  const getFilteredFollowUps = useCallback(() => {
    let filtered = [...followUps];

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(fu => fu.status === filterStatus);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(fu =>
        fu.entityName?.toLowerCase().includes(query) ||
        fu.entityEmail?.toLowerCase().includes(query) ||
        fu.notes?.toLowerCase().includes(query)
      );
    }

    // Date range filter
    if (startDate) {
      filtered = filtered.filter(fu => new Date(fu.followUpDate) >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(fu => new Date(fu.followUpDate) <= endDate);
    }

    return filtered;
  }, [followUps, filterStatus, searchQuery, startDate, endDate]);

  /**
   * Apply sorting to filtered follow-ups
   */
  const getSortedFollowUps = useCallback(() => {
    const filtered = getFilteredFollowUps();

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.followUpDate) - new Date(b.followUpDate);
        case 'date-desc':
          return new Date(b.followUpDate) - new Date(a.followUpDate);
        case 'name-asc':
          return (a.entityName || '').localeCompare(b.entityName || '');
        case 'name-desc':
          return (b.entityName || '').localeCompare(a.entityName || '');
        case 'status':
          return (a.status || '').localeCompare(b.status || '');
        default:
          return 0;
      }
    });

    return sorted;
  }, [getFilteredFollowUps, sortBy]);

  /**
   * Get paginated results
   */
  const getPaginatedFollowUps = useCallback(() => {
    const sorted = getSortedFollowUps();
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return sorted.slice(start, end);
  }, [getSortedFollowUps, currentPage, pageSize]);

  /**
   * Get total count for pagination
   */
  const getTotalCount = useCallback(() => {
    return getFilteredFollowUps().length;
  }, [getFilteredFollowUps]);

  /**
   * Get total pages
   */
  const getTotalPages = useCallback(() => {
    return Math.ceil(getTotalCount() / pageSize);
  }, [getTotalCount, pageSize]);

  // ============================================
  // MODAL & DRAWER OPERATIONS
  // ============================================

  const openModal = useCallback(() => {
    setIsModalOpen(true);
    clearFormData();
  }, [clearFormData]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    clearFormData();
    setSelectedEntry(null);
  }, [clearFormData]);

  const openUpdateModal = useCallback((followUp) => {
    setSelectedFollowUp(followUp);
    setIsUpdateModalOpen(true);
    clearFormData();
  }, [clearFormData]);

  const closeUpdateModal = useCallback(() => {
    setIsUpdateModalOpen(false);
    setSelectedFollowUp(null);
    clearFormData();
  }, [clearFormData]);

  const openDrawer = useCallback((followUp) => {
    setSelectedFollowUp(followUp);
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setSelectedFollowUp(null);
  }, []);

  // ============================================
  // EFFECTS
  // ============================================

  // Fetch tab counts and entries on mount
  useEffect(() => {
    fetchTabCounts();
    fetchEntriesByTab(activeTab);
  }, []);

  // Fetch entries when tab changes
  useEffect(() => {
    fetchEntriesByTab(activeTab);
  }, [activeTab, fetchEntriesByTab]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, searchQuery, sortBy, startDate, endDate]);

  // ============================================
  // RETURN
  // ============================================

  return {
    // Tab & Navigation
    activeTab,
    setActiveTab,
    tabCounts,

    // Data
    followUps,
    entries,
    selectedEntry,
    selectedFollowUp,

    // Loading & Error States
    loading,
    isLoadingTab,
    error,
    tabError,
    isSubmitting,
    submitSuccess,
    setSubmitSuccess,

    // Form Data
    formData,
    setFormData,

    // Modal & Drawer
    isModalOpen,
    isDrawerOpen,
    isUpdateModalOpen,
    openModal,
    closeModal,
    openDrawer,
    closeDrawer,
    openUpdateModal,
    closeUpdateModal,

    // Filters & Sort
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

    // Pagination
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    getTotalPages,
    getTotalCount,

    // Operations
    fetchFollowUps,
    fetchTabCounts,
    fetchEntriesByTab,
    createFollowUp,
    updateFollowUp,
    deleteFollowUp,

    // Handlers
    resetSelection,
    clearFormData,
    getFilteredFollowUps,
    getSortedFollowUps,
    getPaginatedFollowUps,
    setSelectedEntry,
    setSelectedFollowUp
  };
};

export default useFollowUps;
