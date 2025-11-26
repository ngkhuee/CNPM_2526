import React from "react";
import { MdRefresh } from "react-icons/md";

const OrderFilter = ({ filter, onFilterChange, getStatusCount, onRefresh, refreshing, searchId, onSearchChange }) => {
    return (
        <div>
            <div className="orders-header">
                <h2>Quản lý Đơn hàng</h2>
                <button
                    onClick={onRefresh}
                    disabled={refreshing}
                    className="refresh-btn"
                >
                    <MdRefresh /> {refreshing ? "Đang làm mới..." : "Làm mới"}
                </button>
            </div>

            <div className="orders-filter">
                <input
                    type="text"
                    placeholder="Tìm theo Mã đơn hàng..."
                    value={searchId}
                    onChange={(e) => onSearchChange(e.target.value)}
                    style={{
                        padding: "8px 12px",
                        borderRadius: "4px",
                        border: "1px solid #ddd",
                        marginRight: "10px",
                        minWidth: "150px",
                        fontSize: "14px",
                    }}
                />
                <button
                    className={filter === "all" ? "active" : ""}
                    onClick={() => onFilterChange("all")}
                >
                    Tất cả ({getStatusCount("all")})
                </button>
                <button
                    className={filter === "delivering" ? "active" : ""}
                    onClick={() => onFilterChange("delivering")}
                >
                    Đang giao ({getStatusCount("delivering")})
                </button>
                <button
                    className={filter === "delivered" ? "active" : ""}
                    onClick={() => onFilterChange("delivered")}
                >
                    Đã giao ({getStatusCount("delivered")})
                </button>
                <button
                    className={filter === "cancelled" ? "active" : ""}
                    onClick={() => onFilterChange("cancelled")}
                >
                    Đã hủy ({getStatusCount("cancelled")})
                </button>
            </div>
        </div>
    );
};

export default OrderFilter;
