import React from "react";

const DroneTable = ({
  drones,
  getFilteredDrones,
  getStatusBadgeClass,
  getDisplayStatus,
  onViewLocation,
  onEdit,
  onToggle,
  onDelete,
}) => {
  const filteredDrones = getFilteredDrones();

  // Check if drone is delivering (busy/delivering or has assigned order)
  const isDelivering = (drone) => {
    const hasOrder = drone.assignedOrderId || drone.assigned_order_id;
    return (
      drone.status === "busy" ||
      drone.status === "delivering" ||
      hasOrder !== null && hasOrder !== undefined
    );
  };

  // Check if drone can be toggled (available without order, or locked)
  const canToggle = (drone) => {
    const hasOrder = drone.assignedOrderId || drone.assigned_order_id;
    return (
      (drone.status === "available" && !hasOrder) ||
      drone.status === "locked"
    );
  };

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên</th>
            <th>Trạng thái</th>
            <th>Đơn hàng</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {filteredDrones.length === 0 ? (
            <tr>
              <td colSpan="5" className="no-data">
                Không tìm thấy drone
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
                      isDelivering(drone) ? "delivering" : drone.status
                    )}`}
                  >
                    {getDisplayStatus(drone)}
                  </span>
                </td>
                <td>
                  {(drone.assignedOrderId || drone.assigned_order_id) ? (
                    <span className="order-link">#{drone.assignedOrderId || drone.assigned_order_id}</span>
                  ) : (
                    <span className="no-order">-</span>
                  )}
                </td>
                <td>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className="btn-action btn-view"
                      onClick={() => onViewLocation(drone)}
                      title="Xem vị trí"
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
                      title="Sửa tên"
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
                      disabled={!canToggle(drone)}
                      title={
                        !canToggle(drone)
                          ? "Chỉ có thể khóa/mở khóa khi drone không có đơn"
                          : drone.status === "locked"
                            ? "Mở khóa drone"
                            : "Khóa drone"
                      }
                      style={{
                        opacity: !canToggle(drone) ? 0.5 : 1,
                        cursor: !canToggle(drone) ? "not-allowed" : "pointer",
                         width: "80px", textAlign: "center",
                      }}
                    >
                      {drone.status === "locked" ? "Mở khóa" : "Khóa"}
                    </button>
                    <button
                      className="btn-action btn-delete"
                      onClick={() => onDelete(drone.id, drone)}
                      disabled={isDelivering(drone)}
                      title={
                        isDelivering(drone)
                          ? "Chỉ có thể xóa khi drone không đang giao hàng"
                          : "Xóa drone"
                      }
                      style={{
                        opacity: isDelivering(drone) ? 0.5 : 1,
                        cursor: isDelivering(drone) ? "not-allowed" : "pointer",
                      }}
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
