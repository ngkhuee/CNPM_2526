import React from "react";

const DeliveryStats = ({ drones, deliveryOrdersCount, totalOrders }) => {
    const activeDronesCount = drones.filter(
        (d) =>
            d.status === "available" ||
            d.status === "busy" ||
            d.status === "delivering"
    ).length;

    return (
        <div className="delivery-stats">
            <div className="stat-card active">
                <div className="stat-icon">
                    <svg
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                </div>
                <div className="stat-info">
                    <p className="stat-label">Active Drones</p>
                    <p className="stat-value">{activeDronesCount}</p>
                </div>
            </div>
            <div className="stat-card delivery">
                <div className="stat-icon">
                    <svg
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                        <line x1="12" y1="22.08" x2="12" y2="12" />
                    </svg>
                </div>
                <div className="stat-info">
                    <p className="stat-label">In Delivery</p>
                    <p className="stat-value">{deliveryOrdersCount}</p>
                </div>
            </div>
            <div className="stat-card total">
                <div className="stat-icon">
                    <svg
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <rect x="1" y="3" width="15" height="13" />
                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                        <circle cx="5.5" cy="18.5" r="2.5" />
                        <circle cx="18.5" cy="18.5" r="2.5" />
                    </svg>
                </div>
                <div className="stat-info">
                    <p className="stat-label">Total Drones</p>
                    <p className="stat-value">{drones.length}</p>
                </div>
            </div>
            <div className="stat-card orders">
                <div className="stat-icon">
                    <svg
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                    </svg>
                </div>
                <div className="stat-info">
                    <p className="stat-label">Total Orders</p>
                    <p className="stat-value">{totalOrders}</p>
                </div>
            </div>
        </div>
    );
};

export default DeliveryStats;
