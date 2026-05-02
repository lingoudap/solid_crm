// src/pages/AddFollowUps.jsx
import React, { useState, useEffect } from "react";
import "./AddFollowUp.css";

const TABS = [
  { id: "leads", label: "Leads", apiPath: "leads" },
  { id: "quotations", label: "Quotations", apiPath: "quotations" }
];

export default function FollowUpPage({ onCustomerAdded }) {
  // Tab Management
  const [activeTab, setActiveTab] = useState("leads");
  const [tabCounts, setTabCounts] = useState({ leads: 0, quotations: 0 });
  const [isLoadingTab, setIsLoadingTab] = useState(false);

  // Data Management
  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);

  // Form State
  const [followUpNote, setFollowUpNote] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpTime, setFollowUpTime] = useState("");

  const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Fetch data for current active tab
  useEffect(() => {
    fetchEntriesByTab(activeTab);
  }, [activeTab]);

  // Fetch tab counts on mount
  useEffect(() => {
    fetchTabCounts();
  }, []);

  /**
   * Fetch entries for selected tab
   */
  const fetchEntriesByTab = async (tabId) => {
    try {
      setIsLoadingTab(true);
      const tab = TABS.find(t => t.id === tabId);
      if (!tab) return;

      const res = await fetch(`${apiBase.replace(/\/$/, '')}/api/${tab.apiPath}`);
      const data = await res.json();
      setEntries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(`Error fetching ${tabId}:`, err);
      setEntries([]);
    } finally {
      setIsLoadingTab(false);
    }
  };

  /**
   * Fetch counts for all tabs
   */
  const fetchTabCounts = async () => {
    try {
      const leadRes = await fetch(`${apiBase.replace(/\/$/, '')}/api/leads`);
      const quotRes = await fetch(`${apiBase.replace(/\/$/, '')}/api/quotations`);
      
      const leadData = await leadRes.json();
      const quotData = await quotRes.json();

      setTabCounts({
        leads: Array.isArray(leadData) ? leadData.length : 0,
        quotations: Array.isArray(quotData) ? quotData.length : 0
      });
    } catch (err) {
      console.error("Error fetching tab counts:", err);
    }
  };

  /**
   * Handle tab switch
   */
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  /**
   * Handle Add Follow-Up button click
   */
  const handleAddFollowUp = (entry) => {
    setSelectedEntry(entry);
  };

  /**
   * Submit Follow-Up
   */
  const submitFollowUp = async () => {
    if (!followUpNote || !followUpDate || !followUpTime) {
      alert("Please enter remark, date, and time");
      return;
    }

    try {
      const followUpDateTime = new Date(`${followUpDate}T${followUpTime}`);
      
      // Convert tab to relatedType
      const relatedType = activeTab === "leads" ? "Lead" : "Quotation";

      await fetch(`${apiBase.replace(/\/$/, '')}/api/followups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          relatedType: relatedType,
          relatedId: selectedEntry._id,
          followUpDate: followUpDateTime.toISOString(),
          notes: followUpNote,
          status: "Pending"
        }),
      });

      alert("Follow-up added successfully!");
      resetForm();
      if (onCustomerAdded) onCustomerAdded();
    } catch (err) {
      console.error("Error submitting follow-up:", err);
      alert("Error adding follow-up. Please try again.");
    }
  };

  /**
   * Reset form and modal
   */
  const resetForm = () => {
    setSelectedEntry(null);
    setFollowUpNote("");
    setFollowUpDate("");
    setFollowUpTime("");
  };

  return (
    <div className="followup-page p-5">
      <h1 className="followup-page-title">Add Follow-Up</h1>

      {/* Tab Navigation */}
      <div className="followup-tabs-container">
        <div className="followup-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`followup-tab ${activeTab === tab.id ? "active" : ""}`}
              disabled={isLoadingTab}
            >
              <span className="tab-label">{tab.label}</span>
              <span className="tab-count">{tabCounts[tab.id]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoadingTab && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <span>Loading {TABS.find(t => t.id === activeTab)?.label}...</span>
        </div>
      )}

      {/* Entries Table */}
      {!isLoadingTab && (
        <div className="followup-table-wrapper overflow-x-auto mt-4">
          <table className="followup-table min-w-full border border-gray-300 rounded">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-2 px-4 border-b text-left">#</th>
                <th className="py-2 px-4 border-b text-left">
                  {activeTab === "leads" ? "Name" : "Title"}
                </th>
                <th className="py-2 px-4 border-b text-left">Email</th>
                <th className="py-2 px-4 border-b text-left">Phone</th>
                <th className="py-2 px-4 border-b text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500">
                    No {TABS.find(t => t.id === activeTab)?.label.toLowerCase()} found
                  </td>
                </tr>
              ) : (
                entries.map((entry, idx) => (
                  <tr key={entry._id} className="hover:bg-gray-100">
                    <td className="py-2 px-4 border-b">{idx + 1}</td>
                    <td className="py-2 px-4 border-b">{entry.name || entry.title}</td>
                    <td className="py-2 px-4 border-b">{entry.email || "-"}</td>
                    <td className="py-2 px-4 border-b">{entry.phone || "-"}</td>
                    <td className="py-2 px-4 border-b">
                      <button
                        className="followup-button"
                        onClick={() => handleAddFollowUp(entry)}
                      >
                        Add Follow-Up
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {selectedEntry && !isLoadingTab && (
        <div className="modal-bg">
          <div className="modal-box">
            <h2 className="modal-title">
              Add Follow-Up for {selectedEntry.name || selectedEntry.title}
            </h2>

            {/* Date and Time Row */}
            <div className="modal-row">
              <div className="modal-field">
                <label className="modal-label">Date</label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="modal-input"
                />
              </div>
              <div className="modal-field">
                <label className="modal-label">Time</label>
                <input
                  type="time"
                  value={followUpTime}
                  onChange={(e) => setFollowUpTime(e.target.value)}
                  className="modal-input"
                />
              </div>
            </div>

            {/* Remark Field */}
            <div className="modal-field-full">
              <label className="modal-label">Remark</label>
              <textarea
                value={followUpNote}
                onChange={(e) => setFollowUpNote(e.target.value)}
                className="modal-textarea"
                placeholder="Enter follow-up remark"
              />
            </div>

            {/* Modal Buttons */}
            <div className="modal-buttons">
              <button
                onClick={submitFollowUp}
                className="modal-button modal-button-save"
              >
                Save
              </button>
              <button
                onClick={resetForm}
                className="modal-button modal-button-cancel"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
