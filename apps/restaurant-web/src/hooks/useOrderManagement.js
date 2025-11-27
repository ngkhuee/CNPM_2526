import { useState, useContext, useEffect } from "react";
import { toast } from "react-toastify";
import { orderService, authService } from "shared-services";
import { OrderContext } from "../Context/OrderContext";

export const useOrderManagement = () => {
    const { setOrders, orders } = useContext(OrderContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const refreshOrders = async () => {
        const user = authService.getCurrentUser();
        if (!user?.restaurantId) {
            return { success: false, message: "Không tìm thấy người dùng hoặc ID nhà hàng" };
        }

        try {
            setLoading(true);
            setError(null);
            const restaurantOrders = await orderService.getByRestaurant(user.restaurantId);
            setOrders(restaurantOrders);
            return { success: true, orders: restaurantOrders };
        } catch (err) {
            console.error("Lỗi khi làm mới đơn hàng:", err);
            setError(err.message || "Không thể làm mới đơn hàng");
            return { success: false, message: err.message };
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, status, additionalData = {}) => {
        try {
            setLoading(true);
            const updateData = { status, ...additionalData };
            await orderService.update(orderId, updateData);
            setOrders((prev) =>
                prev.map((o) => (o.id === orderId ? { ...o, ...updateData } : o))
            );
            toast.success("Đã cập nhật trạng thái đơn hàng!");
            return { success: true };
        } catch (err) {
            console.error("Lỗi khi cập nhật trạng thái đơn hàng:", err);
            setError(err.message || "Không thể cập nhật trạng thái đơn hàng");
            toast.error("Không thể cập nhật trạng thái đơn hàng");
            return { success: false, message: err.message };
        } finally {
            setLoading(false);
        }
    };

    const updateDroneStatus = async (orderId, droneStatus) => {
        try {
            setLoading(true);
            await orderService.update(orderId, { droneStatus });
            setOrders((prev) =>
                prev.map((o) => (o.id === orderId ? { ...o, droneStatus } : o))
            );
            return { success: true };
        } catch (err) {
            console.error("Lỗi khi cập nhật trạng thái drone:", err);
            setError(err.message || "Không thể cập nhật trạng thái drone");
            return { success: false, message: err.message };
        } finally {
            setLoading(false);
        }
    };

    return {
        orders,
        loading,
        error,
        refreshOrders,
        updateOrderStatus,
        updateDroneStatus,
    };
};
