import React, { useEffect, useRef } from "react";
import "./datefilter.css";

const DateFilterContainer = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  dateFilterOpen,
  setDateFilterOpen,
  onPageChange, // callback to reset page to 1
}) => {
  const [tempStartDate, setTempStartDate] = React.useState(startDate || null);
  const [tempEndDate, setTempEndDate] = React.useState(endDate || null);
  const [customFromDate, setCustomFromDate] = React.useState("");
  const [customToDate, setCustomToDate] = React.useState("");
  const [selectedPreset, setSelectedPreset] = React.useState(null);
  const dateFilterRef = useRef(null);

  // Sync temp dates with applied dates when dropdown opens
  useEffect(() => {
    if (dateFilterOpen) {
      setTempStartDate(startDate || null);
      setTempEndDate(endDate || null);
      setCustomFromDate("");
      setCustomToDate("");
    }
  }, [dateFilterOpen, startDate, endDate]);

  const getDatePresets = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const last7Days = new Date(today);
    last7Days.setDate(last7Days.getDate() - 7);

    const last30Days = new Date(today);
    last30Days.setDate(last30Days.getDate() - 30);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    const yearStart = new Date(today.getFullYear(), 0, 1);
    const yearEnd = new Date(today.getFullYear(), 11, 31);

    const companyStartDate = new Date(2020, 0, 1);

    let thisFinancialYearStart, thisFinancialYearEnd, lastFinancialYearStart, lastFinancialYearEnd;
    if (today.getMonth() >= 3) {
      thisFinancialYearStart = new Date(today.getFullYear(), 3, 1);
      thisFinancialYearEnd = new Date(today.getFullYear() + 1, 2, 31);
      lastFinancialYearStart = new Date(today.getFullYear() - 1, 3, 1);
      lastFinancialYearEnd = new Date(today.getFullYear(), 2, 31);
    } else {
      thisFinancialYearStart = new Date(today.getFullYear() - 1, 3, 1);
      thisFinancialYearEnd = new Date(today.getFullYear(), 2, 31);
      lastFinancialYearStart = new Date(today.getFullYear() - 2, 3, 1);
      lastFinancialYearEnd = new Date(today.getFullYear() - 1, 2, 31);
    }

    return {
      today: { start: today, end: today },
      yesterday: { start: yesterday, end: yesterday },
      last7Days: { start: last7Days, end: today },
      last30Days: { start: last30Days, end: today },
      thisMonth: { start: monthStart, end: monthEnd },
      lastMonth: { start: lastMonthStart, end: lastMonthEnd },
      yearToDate: { start: yearStart, end: today },
      companyStartDate: { start: companyStartDate, end: today },
      thisFinancialYear: { start: thisFinancialYearStart, end: thisFinancialYearEnd },
      lastFinancialYear: { start: lastFinancialYearStart, end: lastFinancialYearEnd }
    };
  };

  const formatDateForDisplay = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  const handlePresetSelect = (preset) => {
    const presets = getDatePresets();
    if (presets[preset]) {
      setTempStartDate(presets[preset].start);
      setTempEndDate(presets[preset].end);
      setCustomFromDate("");
      setCustomToDate("");
      setSelectedPreset(preset);
    }
  };

  const handleCustomDateChange = (from, to) => {
    if (from) {
      setCustomFromDate(from);
      setTempStartDate(new Date(from));
      setSelectedPreset(null);
    }
    if (to) {
      setCustomToDate(to);
      setTempEndDate(new Date(to));
      setSelectedPreset(null);
    }
  };

  const handleApplyDateFilter = () => {
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setDateFilterOpen(false);
    if (onPageChange) onPageChange(1); // Reset to page 1
  };

  const handleCancelDateFilter = () => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    setCustomFromDate("");
    setCustomToDate("");
    setDateFilterOpen(false);
  };

  const isPresetActive = (preset) => {
    return selectedPreset === preset;
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    if (!dateFilterOpen) return;

    const handleMouseDownOutside = (event) => {
      if (dateFilterRef.current && dateFilterRef.current.contains(event.target)) {
        return;
      }
      setDateFilterOpen(false);
    };

    document.addEventListener("mousedown", handleMouseDownOutside);

    return () => {
      document.removeEventListener("mousedown", handleMouseDownOutside);
    };
  }, [dateFilterOpen, setDateFilterOpen]);

  // Determine which preset is active based on applied dates
  useEffect(() => {
    if (!dateFilterOpen || !tempStartDate || !tempEndDate) {
      return;
    }

    const presets = getDatePresets();
    let foundPreset = null;

    for (const [presetName, presetData] of Object.entries(presets)) {
      const tempStart = new Date(tempStartDate);
      const tempEnd = new Date(tempEndDate);
      const presetStart = new Date(presetData.start);
      const presetEnd = new Date(presetData.end);

      tempStart.setHours(0, 0, 0, 0);
      tempEnd.setHours(0, 0, 0, 0);
      presetStart.setHours(0, 0, 0, 0);
      presetEnd.setHours(0, 0, 0, 0);

      if (tempStart.getTime() === presetStart.getTime() && tempEnd.getTime() === presetEnd.getTime()) {
        foundPreset = presetName;
        break;
      }
    }

    if (foundPreset) {
      setSelectedPreset(foundPreset);
    }
  }, [dateFilterOpen, tempStartDate, tempEndDate]);

  return (
    <div className="date-filter-container" ref={dateFilterRef}>
      <button
        className="date-filter-button"
        onClick={() => {
          setDateFilterOpen(!dateFilterOpen);
        }}
      >
        📅 {startDate ? formatDateForDisplay(startDate) : "Apply"} - {endDate ? formatDateForDisplay(endDate) : "Date Filter"}
      </button>
      {dateFilterOpen && (
        <div className="date-filter-dropdown">
          <div className="date-filter-dropdown-header">Select Date Range</div>
          <div className="date-filter-presets">
            <button className={`date-preset-btn ${isPresetActive('today') ? 'active' : ''}`} onClick={() => handlePresetSelect('today')}>Today</button>
            <button className={`date-preset-btn ${isPresetActive('yesterday') ? 'active' : ''}`} onClick={() => handlePresetSelect('yesterday')}>Yesterday</button>
            <button className={`date-preset-btn ${isPresetActive('last7Days') ? 'active' : ''}`} onClick={() => handlePresetSelect('last7Days')}>Last 7 Days</button>
            <button className={`date-preset-btn ${isPresetActive('last30Days') ? 'active' : ''}`} onClick={() => handlePresetSelect('last30Days')}>Last 30 Days</button>
            <button className={`date-preset-btn ${isPresetActive('thisMonth') ? 'active' : ''}`} onClick={() => handlePresetSelect('thisMonth')}>This Month</button>
            <button className={`date-preset-btn ${isPresetActive('lastMonth') ? 'active' : ''}`} onClick={() => handlePresetSelect('lastMonth')}>Last Month</button>
            <button className={`date-preset-btn ${isPresetActive('yearToDate') ? 'active' : ''}`} onClick={() => handlePresetSelect('yearToDate')}>Year to Date</button>
            <button className={`date-preset-btn ${isPresetActive('companyStartDate') ? 'active' : ''}`} onClick={() => handlePresetSelect('companyStartDate')}>Company StartDate</button>
            <button className={`date-preset-btn ${isPresetActive('thisFinancialYear') ? 'active' : ''}`} onClick={() => handlePresetSelect('thisFinancialYear')}>This FY</button>
            <button className={`date-preset-btn ${isPresetActive('lastFinancialYear') ? 'active' : ''}`} onClick={() => handlePresetSelect('lastFinancialYear')}>Last FY</button>
          </div>
          <div className="date-filter-custom">
            <div className="custom-date-inputs">
              <div>
                <label>FROM</label>
                <input
                  type="date"
                  value={customFromDate}
                  onChange={(e) => handleCustomDateChange(e.target.value, customToDate)}
                  className="custom-date-input"
                />
              </div>
              <div>
                <label>TO</label>
                <input
                  type="date"
                  value={customToDate}
                  onChange={(e) => handleCustomDateChange(customFromDate, e.target.value)}
                  className="custom-date-input"
                />
              </div>
            </div>
          </div>
          <div className="date-filter-actions">
            <button className="date-filter-apply" onClick={handleApplyDateFilter}>Apply</button>
            <button className="date-filter-cancel" onClick={handleCancelDateFilter}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateFilterContainer;
