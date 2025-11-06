import React, { useState } from "react";
import { useDroneTracking } from "../../hooks/useDroneTracking";
import { droneService } from "shared-services";
import { geocodeAddress } from "shared-utils";
import { Modal } from "shared-ui";
import "./Delivery.css";

const Delivery = () => {
  const {
    drones,
    orders,
    loading,
    getDronesByStatus,
    getOrdersByStatus,
    refresh,
  } = useDroneTracking();

  const [droneFilter, setDroneFilter] = useState("all");
  const [orderFilter, setOrderFilter] = useState("all");
  const [showDroneModal, setShowDroneModal] = useState(false);
  const [editingDrone, setEditingDrone] = useState(null);
  const [droneForm, setDroneForm] = useState({
    identifier: "",
    address: "",
    latitude: "",
    longitude: "",
  });
  const [geocoding, setGeocoding] = useState(false);
  const [showLocation, setShowLocation] = useState(false);
  const [locationCoords, setLocationCoords] = useState(null);

  const openAddDrone = () => {
    setEditingDrone(null);
    setDroneForm({
      identifier: "",
      address: "",
      latitude: "",
      longitude: "",
    });
    setShowDroneModal(true);
  };

  const openEditDrone = (drone) => {
    setEditingDrone(drone);
    setDroneForm({
      identifier: drone.name || drone.identifier || "",
      address: "",
      latitude: drone.latitude || "",
      longitude: drone.longitude || "",
    });
    setShowDroneModal(true);
  };

  const handleGeocodeAddress = async () => {
    if (!droneForm.address || droneForm.address.trim() === "") {
      alert("Please enter an address");
      return;
    }

    setGeocoding(true);
    try {
      const result = await geocodeAddress(droneForm.address);
      if (result) {
        setDroneForm({
          ...droneForm,
          latitude: result.lat.toString(),
          longitude: result.lng.toString(),
        });
        alert(`Address found: ${result.display_name}`);
      } else {
        alert("Address not found. Please try a different address.");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      alert("Failed to geocode address. Please try again.");
    } finally {
      setGeocoding(false);
    }
  };

  const saveDrone = async () => {
    try {
      if (!droneForm.identifier || droneForm.identifier.trim() === "") {
        alert("Please enter drone name");
        return;
      }

      if (editingDrone) {
        // Only update name when editing
        await droneService.updateDrone(editingDrone.id, {
          identifier: droneForm.identifier,
          updated_at: new Date().toISOString(),
        });
      } else {
        // Create new drone with default location (warehouse)
        await droneService.createDrone({
          identifier: droneForm.identifier,
          status: "available",
          battery_level: 100,
          latitude: 10.77,
          longitude: 106.68,
          current_location: "Warehouse HCM",
          max_weight_kg: 5,
          assigned_order_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
      setShowDroneModal(false);
      await refresh();
    } catch (err) {
      console.error("Failed to save drone:", err);
      alert("Failed to save drone");
    }
  };

  const handleDeleteDrone = async (id) => {
    if (!window.confirm("Delete this drone?")) return;
    try {
      await droneService.deleteDrone(id);
      await refresh();
    } catch (err) {
      console.error("Failed to delete drone:", err);
      alert("Failed to delete drone");
    }
  };

  const handleToggleDrone = async (drone) => {
    // Only allow locking/unlocking when drone is available (not assigned to order)
    if (drone.assignedOrderId) {
      alert("Cannot lock/unlock drone while assigned to an order");
      return;
    }

    try {
      const newStatus = drone.status === "available" ? "locked" : "available";
      await droneService.updateDrone(drone.id, {
        status: newStatus,
        updated_at: new Date().toISOString(),
      });
      await refresh();
    } catch (err) {
      console.error("Failed to toggle drone:", err);
      alert("Failed to update drone status");
    }
  };

  const openLocationModal = (drone) => {
    setLocationCoords(
      drone.latitude && drone.longitude
        ? {
            lat: drone.latitude,
            lng: drone.longitude,
            updated_at: drone.updated_at,
          }
        : null
    );
    setShowLocation(true);
  };

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
      // Include both "busy" and "delivering" statuses
      return drones.filter(
        (d) => d.status === "busy" || d.status === "delivering"
      );
    }
    return getDronesByStatus(droneFilter);
  };

  // Orders are shown in Orders page. Delivery page focuses on drones.

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
    // Check actual status first
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
      // Edge case: assigned but not marked as delivering yet
      return "Assigned";
    }
    return "Available";
  };

  return (
    <div className="delivery-page">
      <div className="delivery-header">
        <h2>Delivery & Drone Management</h2>
      </div>

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
            <p className="stat-value">
              {
                drones.filter(
                  (d) =>
                    d.status === "available" ||
                    d.status === "busy" ||
                    d.status === "delivering"
                ).length
              }
            </p>
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
            <p className="stat-value">
              {getOrdersByStatus("delivering").length}
            </p>
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
            <p className="stat-value">{orders.length}</p>
          </div>
        </div>
      </div>

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
                {getFilteredDrones().length === 0 ? (
                  <tr>
                    <td colSpan="6" className="no-data">
                      No drones found
                    </td>
                  </tr>
                ) : (
                  getFilteredDrones().map((drone) => (
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
                          className={`battery-indicator ${getBatteryClass(drone.battery)}`}
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
                            onClick={() => openLocationModal(drone)}
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
                            onClick={() => openEditDrone(drone)}
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
                            onClick={() => handleToggleDrone(drone)}
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
                            onClick={() => handleDeleteDrone(drone.id)}
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
        </div>
      </div>
      {/* Drone management modals and controls */}
      <div style={{ marginTop: 18, display: "flex", gap: 8 }}>
        <button className="btn-primary" onClick={() => openAddDrone()}>
          + Add Drone
        </button>
      </div>

      <Modal
        isOpen={showDroneModal}
        onClose={() => setShowDroneModal(false)}
        title={editingDrone ? "Edit Drone" : "Add Drone"}
      >
        <div className="drone-form">
          <div className="form-group">
            <label htmlFor="drone-name">Drone Name *</label>
            <input
              id="drone-name"
              className="form-input"
              placeholder="Enter drone identifier (e.g., DRONE-001)"
              value={droneForm.identifier}
              onChange={(e) =>
                setDroneForm({ ...droneForm, identifier: e.target.value })
              }
            />
          </div>

          {/* {!editingDrone && (
            <div
              className="form-note"
              style={{
                padding: "12px",
                background: "#f8f9fa",
                borderRadius: "6px",
                fontSize: "13px",
                color: "#6c757d",
              }}
            >
              <strong>Note:</strong> New drones will be created at the default
              warehouse location (Warehouse HCM) with 100% battery and available
              status.
            </div>
          )} */}

          <div className="form-actions">
            <button onClick={() => saveDrone()} className="btn-primary">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              Save
            </button>
            <button
              onClick={() => setShowDroneModal(false)}
              className="btn-default"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showLocation}
        onClose={() => setShowLocation(false)}
        title="Drone Location"
        width="700px"
      >
        <div className="location-modal">
          {locationCoords ? (
            <>
              <div className="location-info-card">
                <div className="info-row">
                  <span className="info-label">Latitude:</span>
                  <span className="info-value">{locationCoords.lat}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Longitude:</span>
                  <span className="info-value">{locationCoords.lng}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Last Updated:</span>
                  <span className="info-value">
                    {locationCoords.updated_at
                      ? new Date(locationCoords.updated_at).toLocaleString()
                      : "Unknown"}
                  </span>
                </div>
              </div>

              <div className="map-container">
                <iframe
                  title="Drone Location Map"
                  width="100%"
                  height="400"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight="0"
                  marginWidth="0"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${locationCoords.lng - 0.01},${locationCoords.lat - 0.01},${locationCoords.lng + 0.01},${locationCoords.lat + 0.01}&layer=mapnik&marker=${locationCoords.lat},${locationCoords.lng}`}
                  style={{ border: "1px solid #ccc", borderRadius: 8 }}
                />
                <div style={{ marginTop: 8, textAlign: "center" }}>
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${locationCoords.lat}&mlon=${locationCoords.lng}#map=15/${locationCoords.lat}/${locationCoords.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "#ff6b35",
                      textDecoration: "none",
                      fontSize: 14,
                    }}
                  >
                    View on OpenStreetMap →
                  </a>
                </div>
              </div>
            </>
          ) : (
            <p>No location data available</p>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Delivery;
