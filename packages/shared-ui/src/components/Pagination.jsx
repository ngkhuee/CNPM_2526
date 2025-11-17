import React from "react";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";
import "./Pagination.css";

/**
 * Pagination Component
 * @param {number} currentPage - Current page number (1-indexed)
 * @param {number} totalItems - Total number of items
 * @param {number} itemsPerPage - Items per page (default: 10)
 * @param {function} onPageChange - Callback when page changes
 * @param {object} style - Additional CSS styles
 */
const Pagination = ({
    currentPage = 1,
    totalItems = 0,
    itemsPerPage = 10,
    onPageChange = () => { },
    style = {},
}) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (totalPages <= 1) {
        return null;
    }

    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    const handlePageClick = (pageNum) => {
        onPageChange(pageNum);
    };

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            // Calculate middle range
            let start = Math.max(2, currentPage - 1);
            let end = Math.min(totalPages - 1, currentPage + 1);

            if (start > 2) {
                pages.push("...");
            }

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (end < totalPages - 1) {
                pages.push("...");
            }

            // Always show last page
            pages.push(totalPages);
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div
            className="pagination-container"
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px",
                padding: "20px",
                flexWrap: "wrap",
                ...style,
            }}
        >
            {/* Previous Button */}
            <button
                onClick={handlePrevious}
                disabled={currentPage === 1}
                style={{
                    padding: "8px 12px",
                    background: currentPage === 1 ? "#e0e0e0" : "#ff6b35",
                    color: currentPage === 1 ? "#999" : "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "14px",
                    fontWeight: "500",
                    transition: "all 0.3s ease",
                }}
                className="pagination-prev"
            >
                <MdNavigateBefore size={18} />
                Previous
            </button>

            {/* Page Numbers */}
            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", alignItems: "center" }}>
                {pageNumbers.map((page, idx) => {
                    if (page === "...") {
                        return (
                            <span
                                key={`ellipsis-${idx}`}
                                style={{
                                    padding: "4px 6px",
                                    color: "#999",
                                    fontSize: "14px",
                                }}
                            >
                                ...
                            </span>
                        );
                    }

                    const isCurrentPage = page === currentPage;
                    return (
                        <button
                            key={page}
                            onClick={() => handlePageClick(page)}
                            disabled={isCurrentPage}
                            style={{
                                padding: "8px 12px",
                                minWidth: "36px",
                                background: isCurrentPage ? "#ff6b35" : "#f5f5f5",
                                color: isCurrentPage ? "white" : "#333",
                                border: isCurrentPage ? "2px solid #ff6b35" : "1px solid #ddd",
                                borderRadius: "4px",
                                cursor: isCurrentPage ? "default" : "pointer",
                                fontSize: "14px",
                                fontWeight: isCurrentPage ? "600" : "500",
                                transition: "all 0.3s ease",
                            }}
                            className={`pagination-page ${isCurrentPage ? "active" : ""}`}
                        >
                            {page}
                        </button>
                    );
                })}
            </div>

            {/* Next Button */}
            <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                style={{
                    padding: "8px 12px",
                    background: currentPage === totalPages ? "#e0e0e0" : "#ff6b35",
                    color: currentPage === totalPages ? "#999" : "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "14px",
                    fontWeight: "500",
                    transition: "all 0.3s ease",
                }}
                className="pagination-next"
            >
                Next
                <MdNavigateNext size={18} />
            </button>

            {/* Info Text */}
            <div
                style={{
                    fontSize: "13px",
                    color: "#666",
                    marginLeft: "16px",
                    whiteSpace: "nowrap",
                }}
            >
                Page {currentPage} of {totalPages} ({totalItems} items)
            </div>
        </div>
    );
};

export default Pagination;
