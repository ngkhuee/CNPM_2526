import React from "react";
import { MdRefresh, MdToggleOn, MdToggleOff } from "react-icons/md";

const TrackingControls = ({
    refreshing,
    autoRefreshEnabled,
    onRefresh,
    onToggleAutoRefresh,
}) => {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: "12px",
                marginBottom: "16px",
            }}
        >
            {/* Auto-refresh Toggle */}
            <button
                onClick={onToggleAutoRefresh}
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    background: "#fff",
                    border: "1.5px solid #ccc",
                    borderRadius: "6px",
                    padding: "6px 12px",
                    fontWeight: "600",
                    fontSize: "13px",
                    color: "#333",
                    cursor: "pointer",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                    transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                    e.target.style.borderColor = "#888";
                    e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.12)";
                }}
                onMouseLeave={(e) => {
                    e.target.style.borderColor = "#ccc";
                    e.target.style.boxShadow = "0 1px 2px rgba(0,0,0,0.08)";
                }}
                title={
                    autoRefreshEnabled
                        ? "Disable auto-refresh"
                        : "Enable auto-refresh"
                }
            >
                {autoRefreshEnabled ? (
                    <MdToggleOn size={20} color="#2e7d32" />
                ) : (
                    <MdToggleOff size={20} color="#444" />
                )}
                <span>
                    Auto-refresh{" "}
                    <span
                        style={{
                            fontWeight: "700",
                            color: autoRefreshEnabled ? "#2e7d32" : "#444",
                        }}
                    >
                        {autoRefreshEnabled ? "ON" : "OFF"}
                    </span>
                </span>
            </button>

            {/* Refresh Button */}
            <button
                onClick={onRefresh}
                disabled={refreshing}
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "8px 16px",
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
                <MdRefresh
                    size={20}
                    style={{
                        animation: refreshing ? "spin 1s linear infinite" : "none",
                        transformOrigin: "center",
                    }}
                />
                {refreshing ? "Loading..." : "Refresh"}
            </button>

            {/* Inline CSS animation */}
            <style>
                {`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                `}
            </style>
        </div>
    );
};

export default TrackingControls;
