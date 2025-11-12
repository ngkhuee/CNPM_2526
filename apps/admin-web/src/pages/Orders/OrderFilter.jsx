import React from "react";

const OrderFilter = ({ filter, onFilterChange, getStatusCount, autoRefresh, onAutoRefreshChange, onRefresh, refreshing }) => {
    return (
        <div className="orders-header">
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                <h2>Order Management</h2>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <button
                        onClick={onRefresh}
                        disabled={refreshing}
                        style={{
                            padding: "8px 12px",
                            background: refreshing ? "#9e9e9e" : "#4caf50",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            cursor: refreshing ? "not-allowed" : "pointer",
                            fontSize: "14px",
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                        }}
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            style={{
                                animation: refreshing ? "spin 1s linear infinite" : "none",
                            }}
                        >
                            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                        </svg>
                        {refreshing ? "Refreshing..." : "Refresh"}
                    </button>
                    <label
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "14px",
                            cursor: "pointer",
                            userSelect: "none",
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={autoRefresh}
                            onChange={(e) => onAutoRefreshChange(e.target.checked)}
                            style={{ cursor: "pointer" }}
                        />
                        <span>Auto-refresh (5s)</span>
                    </label>
                </div>
            </div>
            <div className="orders-filter">
                <button
                    className={filter === "all" ? "active" : ""}
                    onClick={() => onFilterChange("all")}
                >
                    All ({getStatusCount("all")})
                </button>
                <button
                    className={filter === "pending" ? "active" : ""}
                    onClick={() => onFilterChange("pending")}
                >
                    Pending ({getStatusCount("pending")})
                </button>
                <button
                    className={filter === "delivering" ? "active" : ""}
                    onClick={() => onFilterChange("delivering")}
                >
                    Delivering ({getStatusCount("delivering")})
                </button>
                <button
                    className={filter === "delivered" ? "active" : ""}
                    onClick={() => onFilterChange("delivered")}
                >
                    Delivered ({getStatusCount("delivered")})
                </button>
            </div>
        </div>
    );
};

export default OrderFilter;
