import React, { useState } from "react";
import { useDroneTracking } from "../../hooks/useDroneTracking";
import { useDroneManagement } from "../../hooks/useDroneManagement";
import DeliveryStats from "./DeliveryStats";
import DroneTable from "./DroneTable";
import DroneForm from "./DroneForm";
import LocationModal from "./LocationModal";
import "./Delivery.css";

const Delivery = () => {
  const { drones, orders, loading, getOrdersByStatus, refresh } =
    useDroneTracking();

  const {
    editingDrone,
    droneForm,
    setDroneForm,
    geocoding,
    showDroneModal,
    setShowDroneModal,
    showLocation,
    setShowLocation,
    locationCoords,
    openAddDrone,
    openEditDrone,
    handleGeocodeAddress,
    saveDrone,
    handleDeleteDrone,
    handleToggleDrone,
    openLocationModal,
  } = useDroneManagement(refresh);

  const [droneFilter, setDroneFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  if (loading) {
    return (
      <div className="delivery-page">
        <h2>Giám sát Giao hàng</h2>
        <p>Đang tải...</p>
      </div>
    );
  }

  const getFilteredDrones = () => {
    let filtered = drones;

    // Filter by status
    if (droneFilter === "all") {
      // No status filter
    } else if (droneFilter === "delivering") {
      filtered = filtered.filter(
        (d) =>
          d.status === "busy" || d.status === "delivering" || d.assignedOrderId
      );
    } else {
      filtered = filtered.filter((d) => d.status === droneFilter);
    }

    // Filter by search term (name or ID)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.name?.toLowerCase().includes(term) ||
          d.id?.toLowerCase().includes(term)
      );
    }

    return filtered;
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      available: "status-available",
      locked: "status-idle",
      busy: "status-delivering",
      delivering: "status-delivering",
    };
    return statusMap[status] || "status-default";
  };

  const getDisplayStatus = (drone) => {
    // 3 trạng thái chính thức: Available, Busy, Locked
    if (drone.status === "locked") {
      return "Đã khóa";
    }
    if (drone.status === "busy" || drone.assignedOrderId) {
      return "Đang bận";
    }
    return "Sẵn sàng";
  };

  const deliveryOrdersCount = getOrdersByStatus("delivering").length;

  return (
    <div className="delivery-page">
      <div className="delivery-header">
        <h2>Quản lý Giao hàng & Drone</h2>
      </div>

      <DeliveryStats
        drones={drones}
        deliveryOrdersCount={deliveryOrdersCount}
        totalOrders={orders.length}
      />

      <div className="delivery-content">
        <div className="section drones-section">
          <div className="section-header">
            <h3>Đội bay Drone</h3>
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              {/* Search bar */}
              <input
                type="text"
                placeholder="Tìm theo tên hoặc ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: "8px 12px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  fontSize: "14px",
                  minWidth: "250px",
                }}
              />
              {/* Status filter */}
              <div className="section-filter">
                <button
                  className={droneFilter === "all" ? "active" : ""}
                  onClick={() => setDroneFilter("all")}
                >
                  Tất cả
                </button>
                <button
                  className={droneFilter === "available" ? "active" : ""}
                  onClick={() => setDroneFilter("available")}
                >
                  Sẵn sàng
                </button>
                <button
                  className={droneFilter === "delivering" ? "active" : ""}
                  onClick={() => setDroneFilter("delivering")}
                >
                  Đang giao
                </button>
                <button
                  className={droneFilter === "locked" ? "active" : ""}
                  onClick={() => setDroneFilter("locked")}
                >
                  Đã khóa
                </button>
              </div>
            </div>
          </div>

          <DroneTable
            drones={drones}
            getFilteredDrones={getFilteredDrones}
            getStatusBadgeClass={getStatusBadgeClass}
            getDisplayStatus={getDisplayStatus}
            onViewLocation={(drone) => openLocationModal(drone, orders)}
            onEdit={openEditDrone}
            onToggle={handleToggleDrone}
            onDelete={handleDeleteDrone}
          />
        </div>
      </div>

      <div style={{ marginTop: 18, display: "flex", gap: 8 }}>
        <button className="btn-primary" onClick={openAddDrone}>
          + Thêm Drone
        </button>
      </div>

      <DroneForm
        isOpen={showDroneModal}
        onClose={() => setShowDroneModal(false)}
        editingDrone={editingDrone}
        formData={droneForm}
        onFormChange={setDroneForm}
        onGeocodeAddress={handleGeocodeAddress}
        geocoding={geocoding}
        onSave={saveDrone}
      />

      <LocationModal
        isOpen={showLocation}
        onClose={() => setShowLocation(false)}
        locationCoords={locationCoords}
      />
    </div>
  );
};

export default Delivery;
