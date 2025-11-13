import React from "react";
import { MdRefresh, MdToggleOn, MdToggleOff } from "react-icons/md";

const TrackingControls = ({
    refreshing,
    autoRefreshEnabled,
    onRefresh,
    onToggleAutoRefresh,
}) => {
    return (
        <div className="tracking-controls">
            <button onClick={onRefresh} disabled={refreshing} title="Refresh order data">
                <MdRefresh size={18} style={{ marginRight: "8px" }} />
                {refreshing ? "Refreshing..." : "Refresh"}
            </button>

            <button
                onClick={onToggleAutoRefresh}
                className={autoRefreshEnabled ? "active" : ""}
                title={autoRefreshEnabled ? "Disable auto-refresh" : "Enable auto-refresh"}
            >
                {autoRefreshEnabled ? <MdToggleOn size={18} /> : <MdToggleOff size={18} />}
                <span style={{ marginLeft: "8px" }}>
                    Auto-refresh {autoRefreshEnabled ? "ON" : "OFF"}
                </span>
            </button>
        </div>
    );
};

export default TrackingControls;
