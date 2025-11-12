import { useState } from "react";
import { toast } from "react-toastify";
import { droneService, orderService } from "shared-services";

export const useDroneAssignment = () => {
    const [loading, setLoading] = useState(false);

    const assignDroneToOrder = async (orderId) => {
        try {
            setLoading(true);
            const availableDrones = await droneService.getAvailableDrones();

            if (!availableDrones || availableDrones.length === 0) {
                toast.warning("No available drones at the moment");
                return { success: true, message: "Order confirmed but no drones available" };
            }

            const randomDrone =
                availableDrones[Math.floor(Math.random() * availableDrones.length)];

            await droneService.updateDrone(randomDrone.id, {
                status: "busy",
                assigned_order_id: orderId,
            });

            await orderService.update(orderId, {
                drone_id: randomDrone.id,
            });

            toast.success(`Drone ${randomDrone.identifier} assigned successfully!`);
            return { success: true, drone: randomDrone };
        } catch (error) {
            console.error("Error assigning drone:", error);
            toast.error("Failed to assign drone");
            return { success: false, message: error.message };
        } finally {
            setLoading(false);
        }
    };

    const releaseDroneFromOrder = async (droneId) => {
        try {
            await droneService.updateDrone(droneId, {
                status: "available",
                assigned_order_id: null,
            });
            return { success: true };
        } catch (error) {
            console.error("Failed to release drone:", error);
            return { success: false, message: error.message };
        }
    };

    return {
        assignDroneToOrder,
        releaseDroneFromOrder,
        loading,
    };
};
