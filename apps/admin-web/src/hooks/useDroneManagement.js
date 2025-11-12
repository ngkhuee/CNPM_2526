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
            onSuccess?.();
        } catch (err) {
            console.error("Failed to save drone:", err);
            alert("Failed to save drone");
        }
    }, [droneForm, editingDrone, onSuccess]);

    // Delete drone
    const handleDeleteDrone = useCallback(
        async (id) => {
            if (!window.confirm("Delete this drone?")) return;
            try {
                await droneService.deleteDrone(id);
                onSuccess?.();
            } catch (err) {
                console.error("Failed to delete drone:", err);
                alert("Failed to delete drone");
            }
        },
        [onSuccess]
    );

    // Toggle drone status (available/locked)
    const handleToggleDrone = useCallback(
        async (drone) => {
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
                onSuccess?.();
            } catch (err) {
                console.error("Failed to toggle drone:", err);
                alert("Failed to update drone status");
            }
        },
        [onSuccess]
    );

    // Open location modal
    const openLocationModal = useCallback((drone) => {
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
