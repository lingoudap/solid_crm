/**
 * Follow-Up Table Component - Integration Guide & Usage Examples
 * Complete examples for implementing the professional CRM table
 */

// =====================================================
// 1. BASIC USAGE EXAMPLE
// =====================================================

import React, { useState, useEffect } from "react";
import FollowUpTable from "./FollowUpTableComponent";

function FollowUpPage() {
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch follow-ups on component mount
  useEffect(() => {
    fetchFollowUps();
  }, []);

  const fetchFollowUps = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/followups");
      const data = await response.json();
      setFollowUps(data.data || []);
    } catch (error) {
      console.error("Error fetching follow-ups:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (followUp) => {
    console.log("Edit follow-up:", followUp);
    // Open edit modal or navigate to edit page
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      try {
        await fetch(`/api/followups/${id}`, { method: "DELETE" });
        setFollowUps(followUps.filter((fu) => fu._id !== id));
      } catch (error) {
        console.error("Error deleting follow-up:", error);
      }
    }
  };

  const handleComplete = async (id) => {
    try {
      const response = await fetch(`/api/followups/${id}/complete`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outcome: "positive",
          userId: "current-user-id",
        }),
      });
      const updated = await response.json();
      setFollowUps(followUps.map((fu) => (fu._id === id ? updated.data : fu)));
    } catch (error) {
      console.error("Error completing follow-up:", error);
    }
  };

  const handleReschedule = (followUp) => {
    console.log("Reschedule follow-up:", followUp);
    // Open reschedule modal
  };

  const handleViewTimeline = (followUp) => {
    console.log("View timeline for:", followUp);
    // Open timeline view
  };

  return (
    <FollowUpTable
      followUps={followUps}
      loading={loading}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onComplete={handleComplete}
      onReschedule={handleReschedule}
      onViewTimeline={handleViewTimeline}
    />
  );
}

export default FollowUpPage;

// =====================================================
// 2. ADVANCED USAGE WITH CUSTOM HOOKS
// =====================================================

import { useCallback, useState } from "react";

// Custom hook for table state management
function useFollowUpTable() {
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFollowUps = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams(filters);
      const response = await fetch(`/api/followups?${queryParams}`);
      if (!response.ok) throw new Error("Failed to fetch");

      const data = await response.json();
      setFollowUps(data.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching follow-ups:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteFollowUp = useCallback(async (id) => {
    try {
      const response = await fetch(`/api/followups/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "current-user-id" }),
      });

      if (response.ok) {
        setFollowUps((prev) => prev.filter((fu) => fu._id !== id));
      }
    } catch (error) {
      console.error("Error deleting follow-up:", error);
      setError(error.message);
    }
  }, []);

  const completeFollowUp = useCallback(async (id, outcome = "positive") => {
    try {
      const response = await fetch(`/api/followups/${id}/complete`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outcome,
          userId: "current-user-id",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setFollowUps((prev) =>
          prev.map((fu) => (fu._id === id ? data.data : fu))
        );
      }
    } catch (error) {
      console.error("Error completing follow-up:", error);
      setError(error.message);
    }
  }, []);

  const bulkDelete = useCallback(async (ids) => {
    try {
      // Delete all selected follow-ups
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/followups/${id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: "current-user-id" }),
          })
        )
      );

      setFollowUps((prev) => prev.filter((fu) => !ids.includes(fu._id)));
    } catch (error) {
      console.error("Error bulk deleting:", error);
      setError(error.message);
    }
  }, []);

  return {
    followUps,
    loading,
    error,
    fetchFollowUps,
    deleteFollowUp,
    completeFollowUp,
    bulkDelete,
  };
}

// Usage of custom hook
function AdvancedFollowUpPage() {
  const {
    followUps,
    loading,
    error,
    fetchFollowUps,
    deleteFollowUp,
    completeFollowUp,
    bulkDelete,
  } = useFollowUpTable();

  useEffect(() => {
    fetchFollowUps();
  }, [fetchFollowUps]);

  if (error) {
    return <div className="error-banner">{error}</div>;
  }

  return (
    <FollowUpTable
      followUps={followUps}
      loading={loading}
      onEdit={(followUp) => {
        // Implement edit logic
      }}
      onDelete={deleteFollowUp}
      onComplete={completeFollowUp}
      onReschedule={(followUp) => {
        // Implement reschedule logic
      }}
      onViewTimeline={(followUp) => {
        // Implement timeline view logic
      }}
      onBulkDelete={bulkDelete}
      onExportCSV={() => {
        console.log("CSV exported");
      }}
    />
  );
}

// =====================================================
// 3. DATA TRANSFORMATION EXAMPLE
// =====================================================

/**
 * Transform API response to table format
 * Handles nested data and formatting
 */
function transformFollowUpData(apiData) {
  return apiData.map((item) => ({
    _id: item._id,
    customerName: item.relatedId?.customerName || item.relatedId?.name || "Unknown",
    email: item.relatedId?.email || "",
    relatedType: item.relatedType, // "Lead", "Quotation", "Customer"
    followUpDate: item.followUpDate,
    followUpTime: item.followUpTime || "09:00",
    status: item.status, // "Pending", "In Progress", "Completed", etc.
    priority: item.priority, // "low", "medium", "high", "critical"
    assignedTo: item.assignedTo, // User object with name, email
    remark: item.remark,
    nextFollowUp: item.nextFollowUp,
  }));
}

// Usage example
const fetchAndTransform = async () => {
  const response = await fetch("/api/followups");
  const raw = await response.json();
  const transformed = transformFollowUpData(raw.data);
  return transformed;
};

// =====================================================
// 4. WITH CONTEXT API (For Global State)
// =====================================================

import React, { createContext, useContext, useReducer } from "react";

const FollowUpContext = createContext();

const initialState = {
  followUps: [],
  loading: false,
  error: null,
  selectedIds: new Set(),
};

function followUpReducer(state, action) {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return { ...state, followUps: action.payload, loading: false };
    case "FETCH_ERROR":
      return { ...state, error: action.payload, loading: false };
    case "DELETE":
      return {
        ...state,
        followUps: state.followUps.filter((fu) => fu._id !== action.payload),
      };
    case "UPDATE":
      return {
        ...state,
        followUps: state.followUps.map((fu) =>
          fu._id === action.payload._id ? action.payload : fu
        ),
      };
    default:
      return state;
  }
}

export function FollowUpProvider({ children }) {
  const [state, dispatch] = useReducer(followUpReducer, initialState);

  const fetchFollowUps = async () => {
    dispatch({ type: "FETCH_START" });
    try {
      const response = await fetch("/api/followups");
      const data = await response.json();
      dispatch({ type: "FETCH_SUCCESS", payload: data.data });
    } catch (error) {
      dispatch({ type: "FETCH_ERROR", payload: error.message });
    }
  };

  const deleteFollowUp = async (id) => {
    try {
      await fetch(`/api/followups/${id}`, { method: "DELETE" });
      dispatch({ type: "DELETE", payload: id });
    } catch (error) {
      dispatch({ type: "FETCH_ERROR", payload: error.message });
    }
  };

  return (
    <FollowUpContext.Provider value={{ state, fetchFollowUps, deleteFollowUp }}>
      {children}
    </FollowUpContext.Provider>
  );
}

export function useFollowUp() {
  const context = useContext(FollowUpContext);
  if (!context) {
    throw new Error("useFollowUp must be used within FollowUpProvider");
  }
  return context;
}

// Usage in component
function FollowUpPageWithContext() {
  const { state, fetchFollowUps, deleteFollowUp } = useFollowUp();

  useEffect(() => {
    fetchFollowUps();
  }, [fetchFollowUps]);

  return (
    <FollowUpTable
      followUps={state.followUps}
      loading={state.loading}
      onDelete={deleteFollowUp}
      // ... other handlers
    />
  );
}

// =====================================================
// 5. WITH MODAL INTEGRATION
// =====================================================

import Modal from "react-modal";

function FollowUpPageWithModal() {
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFollowUp, setSelectedFollowUp] = useState(null);
  const [modalType, setModalType] = useState(null); // "edit", "reschedule"

  const handleEdit = (followUp) => {
    setSelectedFollowUp(followUp);
    setModalType("edit");
    setModalOpen(true);
  };

  const handleReschedule = (followUp) => {
    setSelectedFollowUp(followUp);
    setModalType("reschedule");
    setModalOpen(true);
  };

  const handleSaveEdit = async (updatedData) => {
    try {
      const response = await fetch(`/api/followups/${selectedFollowUp._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      const data = await response.json();
      setFollowUps(followUps.map((fu) => (fu._id === data.data._id ? data.data : fu)));
      setModalOpen(false);
    } catch (error) {
      console.error("Error saving:", error);
    }
  };

  return (
    <>
      <FollowUpTable
        followUps={followUps}
        loading={loading}
        onEdit={handleEdit}
        onReschedule={handleReschedule}
        // ... other handlers
      />

      <Modal isOpen={modalOpen} onRequestClose={() => setModalOpen(false)}>
        {modalType === "edit" && (
          <EditFollowUpModal followUp={selectedFollowUp} onSave={handleSaveEdit} />
        )}
        {modalType === "reschedule" && (
          <RescheduleFollowUpModal followUp={selectedFollowUp} onSave={handleSaveEdit} />
        )}
      </Modal>
    </>
  );
}

// =====================================================
// 6. WITH REACT QUERY (RECOMMENDED FOR PRODUCTION)
// =====================================================

import { useQuery, useMutation, useQueryClient } from "react-query";

function FollowUpPageWithReactQuery() {
  const queryClient = useQueryClient();

  // Fetch follow-ups
  const { data: followUps = [], isLoading } = useQuery(
    "followups",
    async () => {
      const res = await fetch("/api/followups");
      return res.json();
    }
  );

  // Delete mutation
  const deleteFollowUpMutation = useMutation(
    (id) => fetch(`/api/followups/${id}`, { method: "DELETE" }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("followups");
      },
    }
  );

  // Complete mutation
  const completeFollowUpMutation = useMutation(
    (id) =>
      fetch(`/api/followups/${id}/complete`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outcome: "positive",
          userId: "current-user-id",
        }),
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("followups");
      },
    }
  );

  return (
    <FollowUpTable
      followUps={followUps.data || []}
      loading={isLoading}
      onDelete={(id) => deleteFollowUpMutation.mutate(id)}
      onComplete={(id) => completeFollowUpMutation.mutate(id)}
      // ... other handlers
    />
  );
}

// =====================================================
// 7. STYLING WITH TAILWIND CSS (ALTERNATIVE)
// =====================================================

/**
 * If using Tailwind instead of the provided CSS:
 * 
 * 1. Install Tailwind: npm install -D tailwindcss
 * 2. Configure tailwind.config.js
 * 3. Use Tailwind classes in the component
 * 
 * Example table with Tailwind:
 */

function TailwindFollowUpTable({ followUps, loading }) {
  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Status
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {followUps.map((followUp) => (
              <tr key={followUp._id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">{followUp.customerName}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      followUp.status === "Completed"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {followUp.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      followUp.priority === "high"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {followUp.priority}
                  </span>
                </td>
                <td className="px-6 py-4">{new Date(followUp.followUpDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// =====================================================
// 8. CUSTOM COLUMN RENDERER
// =====================================================

/**
 * Allow customization of column rendering
 */

function CustomFollowUpTable({ followUps, columnRenderers = {} }) {
  const defaultRenderers = {
    customerName: (value) => <strong>{value}</strong>,
    status: (value) => <StatusBadge status={value} />,
    priority: (value) => <PriorityBadge priority={value} />,
    followUpDate: (value) => new Date(value).toLocaleDateString(),
  };

  const renderers = { ...defaultRenderers, ...columnRenderers };

  return (
    <table className="followup-table">
      <tbody>
        {followUps.map((followUp) => (
          <tr key={followUp._id}>
            <td>{renderers.customerName(followUp.customerName)}</td>
            <td>{renderers.status(followUp.status)}</td>
            <td>{renderers.priority(followUp.priority)}</td>
            <td>{renderers.followUpDate(followUp.followUpDate)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Usage
<CustomFollowUpTable
  followUps={followUps}
  columnRenderers={{
    customerName: (value) => (
      <a href={`/customer/${value}`} className="text-blue-500 hover:underline">
        {value}
      </a>
    ),
  }}
/>;

// =====================================================
// 9. PROP TYPES DEFINITION
// =====================================================

import PropTypes from "prop-types";

FollowUpTable.propTypes = {
  followUps: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      customerName: PropTypes.string,
      email: PropTypes.string,
      relatedType: PropTypes.string,
      followUpDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
      followUpTime: PropTypes.string,
      status: PropTypes.oneOf(["Pending", "In Progress", "Completed", "Rescheduled", "Cancelled"]),
      priority: PropTypes.oneOf(["low", "medium", "high", "critical"]),
      assignedTo: PropTypes.shape({
        _id: PropTypes.string,
        name: PropTypes.string,
        email: PropTypes.string,
      }),
      remark: PropTypes.string,
      nextFollowUp: PropTypes.shape({
        followUpDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
        followUpTime: PropTypes.string,
      }),
    })
  ),
  loading: PropTypes.bool,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onComplete: PropTypes.func,
  onReschedule: PropTypes.func,
  onViewTimeline: PropTypes.func,
  onExportCSV: PropTypes.func,
  onBulkDelete: PropTypes.func,
  onBulkStatusChange: PropTypes.func,
};

export default FollowUpTable;
