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
                    placeholder="Tìm theo ID hoặc tên nhà hàng..."
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
                        <option value="all">Tất cả</option>
                        <option value="approved">Đã duyệt</option>
                        <option value="rejected">Từ chối</option>
                    </select>
                </div>
            )}
        </div>
    );
};

export default PaymentFilter;
