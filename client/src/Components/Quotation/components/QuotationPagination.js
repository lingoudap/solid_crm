import React from "react";

const PER_PAGE_OPTIONS = [5, 10, 15, 20, 25];

export default function QuotationPagination({
  page,
  pageCount,
  onPageChange,
  perPage,
  onPerPageChange,
  showingStart,
  showingEnd,
  total,
}) {
  return (
    <>
      <div className="entries-control">
        <div className="entries-info">
          <span>
            <strong>Showing:</strong> {showingStart} to {showingEnd} of {total} entries
          </span>
        </div>
        <div className="entries-buttons">
          <span style={{ fontSize: "13px", color: "#6b7280", fontWeight: "500" }}>
            Entries per page:
          </span>
          {PER_PAGE_OPTIONS.map((num) => (
            <button
              key={num}
              className={perPage === num ? "active" : ""}
              onClick={() => onPerPageChange(num)}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      <div className="pagination" style={{ marginTop: "15px", textAlign: "center" }}>
        <button onClick={() => onPageChange(1)} disabled={page === 1}>
          First
        </button>
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
        >
          Prev
        </button>
        <span style={{ margin: "0 10px" }}>
          Page {page} / {pageCount}
        </span>
        <button
          onClick={() => onPageChange(Math.min(pageCount, page + 1))}
          disabled={page === pageCount}
        >
          Next
        </button>
        <button
          onClick={() => onPageChange(pageCount)}
          disabled={page === pageCount}
        >
          Last
        </button>
      </div>
    </>
  );
}
