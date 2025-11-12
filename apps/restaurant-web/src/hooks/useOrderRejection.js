import { useState } from "react";
import { toast } from "react-toastify";
import { orderService, droneService, authService } from "shared-services";

export const useOrderRejection = (onSuccess) => {
    const [loading, setLoading] = useState(false);

    const rejectOrder = async (orderId, reason) => {
        if (!reason || !reason.trim()) {
            toast.error("Please provide a reason for rejection");
            return { success: false, message: "Reason required" };
        }

        try {
            setLoading(true);

            const order = await orderService.getById(orderId);

            if (order?.drone_id) {
                try {
                    await droneService.updateDrone(order.drone_id, {
                        status: "available",
                        assigned_order_id: null,
                    });
                } catch (droneError) {
                    console.error("Failed to release drone:", droneError);
                }
            }

            await orderService.update(orderId, {
                status: "rejected",
                rejection_reason: reason,
                rejected_at: new Date().toISOString(),
            });

            toast.success("Order rejected. Customer will be notified and refunded.");
            if (onSuccess) onSuccess();
            return { success: true };
        } catch (error) {
            console.error("Error rejecting order:", error);
            toast.error("Failed to reject order");
            return { success: false, message: error.message };
        } finally {
            setLoading(false);
        }
    };

    return {
        rejectOrder,
        loading,
    };
};
