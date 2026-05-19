/**
 * FollowUpTabs Component
 * Tab navigation for switching between Leads and Quotations
 */

import React from 'react';
import '../../../styles/followup-tabs.css';

const FollowUpTabs = ({
  activeTab,
  onTabChange,
  tabCounts,
  isLoading,
  tabs
}) => {
  return (
    <div className="followup-tabs-container">
      <div className="followup-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`followup-tab ${activeTab === tab.id ? 'active' : ''}`}
            disabled={isLoading}
            aria-pressed={activeTab === tab.id}
            title={`${tab.label} (${tabCounts[tab.id] || 0} items)`}
          >
            <span className="tab-label">{tab.label}</span>
            <span className="tab-count">{tabCounts[tab.id] || 0}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default FollowUpTabs;
