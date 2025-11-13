import React from "react";
import { MdSearch, MdFilterList } from "react-icons/md";
import "./PaymentFilter.css";

const PaymentFilter = ({
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    activeTab,
}) => {
    return (
        <div className="payment-filter">
            {/* Search */}
            <div className="search-box">
                <MdSearch className="search-icon" />
                <input
                    type="text"
                    placeholder="Search by ID or restaurant name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            {/* Status Filter - Only show for completed tab */}
            {activeTab === "completed" && (
                <div className="filter-group">
                    <MdFilterList className="filter-icon" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All Status</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            )}
        </div>
    );
};

export default PaymentFilter;
