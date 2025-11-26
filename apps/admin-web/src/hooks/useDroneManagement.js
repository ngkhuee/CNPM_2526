import { useState, useCallback } from "react";
import { droneService } from "shared-services";
import { geocodeAddress } from "shared-utils";

/**
 * Hook for drone management (CRUD operations)
 * Used in Admin Delivery page
 */
export const useDroneManagement = (onSuccess) => {
  const [editingDrone, setEditingDrone] = useState(null);
  const [droneForm, setDroneForm] = useState({
    identifier: "",
    address: "",
    latitude: "",
    longitude: "",
  });
  const [geocoding, setGeocoding] = useState(false);
  const [showDroneModal, setShowDroneModal] = useState(false);
  const [showLocation, setShowLocation] = useState(false);
  const [locationCoords, setLocationCoords] = useState(null);

  // Open modal to add drone
  const openAddDrone = useCallback(() => {
    setEditingDrone(null);
    setDroneForm({
      identifier: "",
      address: "",
      latitude: "",
      longitude: "",
    });
    setShowDroneModal(true);
  }, []);

  // Open modal to edit drone
  const openEditDrone = useCallback((drone) => {
    setEditingDrone(drone);
    setDroneForm({
      identifier: drone.name || drone.identifier || "",
      address: "",
      latitude: drone.latitude || "",
      longitude: drone.longitude || "",
    });
    setShowDroneModal(true);
  }, []);

  // Handle geocoding address
  const handleGeocodeAddress = useCallback(async () => {
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
  }, [droneForm]);

  // Save drone (create or update)
  const saveDrone = useCallback(async () => {
    try {
      // Validation
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
        console.log("[saveDrone] Drone updated:", editingDrone.id);
      } else {
        // Create new drone - Auto-set base location (273 An Dương Vương)
        const BASE_LOCATION = {
          lat: 10.7626,
          lng: 106.682,
          address: "273 An Dương Vương, Phường Chợ Quán, TP. HCM"
        };

        const newDrone = await droneService.createDrone({
          identifier: droneForm.identifier.trim(),
          status: "available",
          latitude: BASE_LOCATION.lat,
          longitude: BASE_LOCATION.lng,
          current_location: {
            lat: BASE_LOCATION.lat,
            lng: BASE_LOCATION.lng,
            address: BASE_LOCATION.address
          },
          battery_level: 100, // Start with full battery
          max_weight_kg: 5,
          assigned_order_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        console.log("[saveDrone] New drone created at base location:", newDrone);
      }

      setShowDroneModal(false);
      setDroneForm({
        identifier: "",
        address: "",
        latitude: "",
        longitude: "",
      });
      onSuccess?.();
    } catch (err) {
      console.error("Failed to save drone:", err);
      alert(`Failed to save drone: ${err.message || err}`);
    }
  }, [droneForm, editingDrone, onSuccess]);

  // Delete drone (only when not delivering)
  const handleDeleteDrone = useCallback(
    async (id, drone) => {
      // Check if drone is delivering
      const isDelivering =
        drone.status === "busy" ||
        drone.status === "delivering" ||
        drone.assignedOrderId !== null;

      if (isDelivering) {
        alert(
          "Chỉ có thể xóa drone khi không đang trong trạng thái vận chuyển"
        );
        return;
      }

      if (!window.confirm("Xóa drone này?")) return;
      try {
        await droneService.deleteDrone(id);
        onSuccess?.();
      } catch (err) {
        console.error("Failed to delete drone:", err);
        alert("Không thể xóa drone");
      }
    },
    [onSuccess]
  );

  // Toggle drone status (available/locked) - only when idle
  const handleToggleDrone = useCallback(
    async (drone) => {
      // Allow locking when available (and no order), allow unlocking when locked
      const hasOrder = drone.assignedOrderId || drone.assigned_order_id;
      const canToggle =
        (drone.status === "available" && !hasOrder) ||
        (drone.status === "locked");

      if (!canToggle) {
        alert(
          "Chỉ có thể khóa/mở khóa drone khi đang trong trạng thái rảnh rỗi (không có đơn)"
        );
        return;
      }

      try {
        const newStatus = drone.status === "available" ? "locked" : "available";
        await droneService.updateDrone(drone.id, {
          status: newStatus,
          updated_at: new Date().toISOString(),
        });
        onSuccess?.();
      } catch (err) {
        console.error("Failed to toggle drone:", err);
        alert("Không thể cập nhật trạng thái drone");
      }
    },
    [onSuccess]
  );

  // Open location modal
  const openLocationModal = useCallback((drone, orders = []) => {
    // Extract address from current_location (can be string or object)
    let address = "Unknown location";
    if (drone.current_location) {
      if (typeof drone.current_location === "string") {
        address = drone.current_location;
      } else if (drone.current_location.address) {
        address = drone.current_location.address;
      }
    }

    // Find assigned order if drone has one
    let orderInfo = null;
    if (drone.assigned_order_id || drone.assignedOrderId) {
      const orderId = drone.assigned_order_id || drone.assignedOrderId;
      const order = orders.find(o => o.id === orderId);
      if (order) {
        orderInfo = {
          orderId: order.id,
          status: order.status,
          droneJourneyStage: order.drone_journey_stage || order.droneJourneyStage,
          restaurantAddress: order.pickup_address || order.pickupAddress,
          customerAddress: order.dropoff_address || order.dropoffAddress,
        };
      }
    }

    setLocationCoords(
      drone.latitude && drone.longitude
        ? {
          lat: drone.latitude,
          lng: drone.longitude,
          address: address,
          updated_at: new Date().toISOString(), // Always use current time when opening modal
          orderInfo: orderInfo,
          droneStatus: drone.status,
        }
        : null
    );
    setShowLocation(true);
  }, []);

  return {
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
  };
};
