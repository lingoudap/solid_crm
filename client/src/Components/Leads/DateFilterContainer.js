import React, { useEffect, useRef } from "react";

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
  const dateFilterRef = useRef(null);

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
    }
  };

  const handleCustomDateChange = (from, to) => {
    if (from) {
      setCustomFromDate(from);
      setTempStartDate(new Date(from));
    }
    if (to) {
      setCustomToDate(to);
      setTempEndDate(new Date(to));
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
            <button className="date-preset-btn" onClick={() => handlePresetSelect('today')}>Today</button>
            <button className="date-preset-btn" onClick={() => handlePresetSelect('yesterday')}>Yesterday</button>
            <button className="date-preset-btn" onClick={() => handlePresetSelect('last7Days')}>Last 7 Days</button>
            <button className="date-preset-btn" onClick={() => handlePresetSelect('last30Days')}>Last 30 Days</button>
            <button className="date-preset-btn" onClick={() => handlePresetSelect('thisMonth')}>This Month</button>
            <button className="date-preset-btn" onClick={() => handlePresetSelect('lastMonth')}>Last Month</button>
            <button className="date-preset-btn" onClick={() => handlePresetSelect('yearToDate')}>Year to Date</button>
            <button className="date-preset-btn" onClick={() => handlePresetSelect('companyStartDate')}>Company StartDate</button>
            <button className="date-preset-btn" onClick={() => handlePresetSelect('thisFinancialYear')}>This FY</button>
            <button className="date-preset-btn" onClick={() => handlePresetSelect('lastFinancialYear')}>Last FY</button>
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
