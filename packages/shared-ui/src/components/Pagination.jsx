import React from "react";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import "./Pagination.css";

/**
 * Pagination Component
 * @param {number} currentPage - Current page number (1-indexed)
 * @param {number} totalPages - Total number of pages (can be passed directly)
 * @param {number} totalItems - Total number of items (alternative to totalPages)
 * @param {number} itemsPerPage - Items per page (default: 10)
 * @param {function} onPageChange - Callback when page changes
 */
const Pagination = ({
    currentPage = 1,
    totalPages: propTotalPages,
    totalItems = 0,
    itemsPerPage = 10,
    onPageChange = () => { },
}) => {
    // Support both totalPages (direct) and totalItems (calculated)
    const totalPages = propTotalPages || Math.ceil(totalItems / itemsPerPage);

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
        if (pageNum !== currentPage) {
            onPageChange(pageNum);
        }
    };

    // Generate page numbers: [prev] [1] [2] [3] [...] [last] [next]
    // Max 7 buttons: prev, 3 start pages, ellipsis, last page, next
    const getPageNumbers = () => {
        const pages = [];

        if (totalPages <= 5) {
            // Show all pages if 5 or less
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first 3 pages or pages around current
            if (currentPage <= 3) {
                // Near start: show 1, 2, 3, ..., last
                pages.push(1, 2, 3);
                if (totalPages > 4) pages.push("...");
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                // Near end: show 1, ..., last-2, last-1, last
                pages.push(1);
                if (totalPages > 4) pages.push("...");
                pages.push(totalPages - 2, totalPages - 1, totalPages);
            } else {
                // Middle: show 1, ..., current-1, current, current+1, ..., last
                pages.push(1);
                pages.push("...");
                pages.push(currentPage - 1, currentPage, currentPage + 1);
                pages.push("...");
                pages.push(totalPages);
            }
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className="pagination-wrapper">
            {/* Previous Button */}
            <button
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className={`pagination-btn pagination-arrow ${currentPage === 1 ? "disabled" : ""}`}
                title="Trang trước"
            >
                <MdChevronLeft size={20} />
            </button>

            {/* Page Numbers */}
            {pageNumbers.map((page, idx) => {
                if (page === "...") {
                    return (
                        <span key={`ellipsis-${idx}`} className="pagination-ellipsis">
                            ...
                        </span>
                    );
                }

                return (
                    <button
                        key={page}
                        onClick={() => handlePageClick(page)}
                        className={`pagination-btn pagination-number ${page === currentPage ? "active" : ""}`}
                    >
                        {page}
                    </button>
                );
            })}

            {/* Next Button */}
            <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className={`pagination-btn pagination-arrow ${currentPage === totalPages ? "disabled" : ""}`}
                title="Trang sau"
            >
                <MdChevronRight size={20} />
            </button>
        </div>
    );
};

export default Pagination;
