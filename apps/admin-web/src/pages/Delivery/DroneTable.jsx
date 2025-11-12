import React from "react";

const DroneTable = ({
    drones,
    getFilteredDrones,
    getBatteryClass,
    getStatusBadgeClass,
    getDisplayStatus,
    onViewLocation,
    onEdit,
    onToggle,
    onDelete,
}) => {
    const filteredDrones = getFilteredDrones();

    return (
        <div className="table-container">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Status</th>
                        <th>Battery</th>
                        <th>Assigned Order</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredDrones.length === 0 ? (
                        <tr>
                            <td colSpan="6" className="no-data">
                                No drones found
                            </td>
                        </tr>
                    ) : (
                        filteredDrones.map((drone) => (
                            <tr key={drone.id}>
                                <td className="drone-id">{drone.id}</td>
                                <td>{drone.name || `Drone ${drone.id}`}</td>
                                <td>
                                    <span
                                        className={`status-badge ${getStatusBadgeClass(
                                            drone.assignedOrderId ? "delivering" : drone.status
                                        )}`}
                                    >
                                        {getDisplayStatus(drone)}
                                    </span>
                                </td>
                                <td>
                                    <span
                                        className={`battery-indicator ${getBatteryClass(
                                            drone.battery
                                        )}`}
                                    >
                                        {drone.battery}%
                                    </span>
                                </td>
                                <td>
                                    {drone.assignedOrderId ? (
                                        <span className="order-link">
                                            #{drone.assignedOrderId}
                                        </span>
                                    ) : (
                                        <span className="no-order">-</span>
                                    )}
                                </td>
                                <td>
                                    <div style={{ display: "flex", gap: 8 }}>
                                        <button
                                            className="btn-action btn-view"
                                            onClick={() => onViewLocation(drone)}
                                            title="View location"
                                        >
                                            <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                                <circle cx="12" cy="10" r="3" />
                                            </svg>
                                        </button>
                                        <button
                                            className="btn-action btn-edit"
                                            onClick={() => onEdit(drone)}
                                            title="Edit"
                                        >
                                            <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                            </svg>
                                        </button>
                                        <button
                                            className="btn-action btn-toggle"
                                            onClick={() => onToggle(drone)}
                                            disabled={drone.assignedOrderId}
                                            title={
                                                drone.assignedOrderId
                                                    ? "Cannot lock drone with active order"
                                                    : drone.status === "locked"
                                                        ? "Unlock drone"
                                                        : "Lock drone"
                                            }
                                            style={{
                                                opacity: drone.assignedOrderId ? 0.5 : 1,
                                                cursor: drone.assignedOrderId
                                                    ? "not-allowed"
                                                    : "pointer",
                                            }}
                                        >
                                            {drone.status === "locked" ? "Unlock" : "Lock"}
                                        </button>
                                        <button
                                            className="btn-action btn-delete"
                                            onClick={() => onDelete(drone.id)}
                                            title="Delete"
                                        >
                                            <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <polyline points="3 6 5 6 21 6" />
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default DroneTable;
