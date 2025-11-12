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

  if (loading) {
    return (
      <div className="delivery-page">
        <h2>Delivery Monitoring</h2>
        <p>Loading...</p>
      </div>
    );
  }

  const getFilteredDrones = () => {
    if (droneFilter === "all") return drones;
    if (droneFilter === "delivering") {
      return drones.filter(
        (d) => d.status === "busy" || d.status === "delivering"
      );
    }
    return drones.filter((d) => d.status === droneFilter);
  };

  const getBatteryClass = (battery) => {
    if (battery >= 70) return "battery-high";
    if (battery >= 30) return "battery-medium";
    return "battery-low";
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      available: "status-available",
      locked: "status-idle",
      busy: "status-delivering",
      delivering: "status-delivering",
      charging: "status-charging",
    };
    return statusMap[status] || "status-default";
  };

  const getDisplayStatus = (drone) => {
    if (drone.status === "busy" || drone.status === "delivering") {
      return "On Delivery";
    }
    if (drone.status === "charging") {
      return "Charging";
    }
    if (drone.status === "locked") {
      return "Locked";
    }
    if (drone.assignedOrderId && drone.status === "available") {
      return "Assigned";
    }
    return "Available";
  };

  const deliveryOrdersCount = getOrdersByStatus("delivering").length;

  return (
    <div className="delivery-page">
      <div className="delivery-header">
        <h2>Delivery & Drone Management</h2>
      </div>

      <DeliveryStats
        drones={drones}
        deliveryOrdersCount={deliveryOrdersCount}
        totalOrders={orders.length}
      />

      <div className="delivery-content">
        <div className="section drones-section">
          <div className="section-header">
            <h3>Drones Fleet</h3>
            <div className="section-filter">
              <button
                className={droneFilter === "all" ? "active" : ""}
                onClick={() => setDroneFilter("all")}
              >
                All
              </button>
              <button
                className={droneFilter === "available" ? "active" : ""}
                onClick={() => setDroneFilter("available")}
              >
                Available
              </button>
              <button
                className={droneFilter === "delivering" ? "active" : ""}
                onClick={() => setDroneFilter("delivering")}
              >
                Delivering
              </button>
              <button
                className={droneFilter === "charging" ? "active" : ""}
                onClick={() => setDroneFilter("charging")}
              >
                Charging
              </button>
            </div>
          </div>

          <DroneTable
            drones={drones}
            getFilteredDrones={getFilteredDrones}
            getBatteryClass={getBatteryClass}
            getStatusBadgeClass={getStatusBadgeClass}
            getDisplayStatus={getDisplayStatus}
            onViewLocation={openLocationModal}
            onEdit={openEditDrone}
            onToggle={handleToggleDrone}
            onDelete={handleDeleteDrone}
          />
        </div>
      </div>

      <div style={{ marginTop: 18, display: "flex", gap: 8 }}>
        <button className="btn-primary" onClick={openAddDrone}>
          + Add Drone
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
