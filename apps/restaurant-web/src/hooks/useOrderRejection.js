import { useState } from "react";
import { toast } from "react-toastify";
import { orderService, droneService, authService } from "shared-services";

export const useOrderRejection = (onSuccess) => {
    const [loading, setLoading] = useState(false);

    const rejectOrder = async (orderId, reason) => {
        if (!reason || !reason.trim()) {
            toast.error("Vui lòng nhập lý do từ chối");
            return { success: false, message: "Cần nhập lý do" };
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

            toast.success("Đã từ chối đơn hàng. Khách hàng sẽ được thông báo và hoàn tiền.");
            if (onSuccess) onSuccess();
            return { success: true };
        } catch (error) {
            console.error("Lỗi khi từ chối đơn hàng:", error);
            toast.error("Không thể từ chối đơn hàng");
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
