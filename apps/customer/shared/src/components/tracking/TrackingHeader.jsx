/**
 * Tracking Header - displays order and restaurant info
 */

import React from "react";

export const TrackingHeader = ({
    order,
    onRefresh,
    refreshing = false,
}) => {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
            }}
        >
            <div>
                <h2 style={{ margin: 0, marginBottom: "8px" }}>
                    Order #{order?.id || order?._id}
                </h2>
                {(order?.restaurantName || order?.restaurant?.name) && (
                    <p
                        style={{
                            color: "#ff6b35",
                            fontWeight: "600",
                            margin: 0,
                            fontSize: "14px",
                        }}
                    >
                        {order.restaurantName || order.restaurant?.name}
                    </p>
                )}
            </div>

            <button
                onClick={onRefresh}
                disabled={refreshing}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 16px",
                    background: refreshing ? "#9e9e9e" : "#4caf50",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: refreshing ? "not-allowed" : "pointer",
                    fontSize: "14px",
                    fontWeight: "600",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                    if (!refreshing) {
                        e.target.style.background = "#45a049";
                        e.target.style.transform = "translateY(-1px)";
                        e.target.style.boxShadow = "0 4px 6px rgba(0,0,0,0.15)";
                    }
                }}
                onMouseLeave={(e) => {
                    if (!refreshing) {
                        e.target.style.background = "#4caf50";
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                    }
                }}
            >
                <span style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }}>
                    🔄
                </span>
                {refreshing ? "Loading..." : "Refresh"}
            </button>
        </div>
    );
};

export default TrackingHeader;
