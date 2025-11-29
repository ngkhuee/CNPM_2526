import { useCallback } from "react";
import { restaurantService, authService, orderService } from "shared-services";

/**
 * Hook for restaurant approval workflow (approve, block, unblock, delete)
 * Used in Admin Partners page
 */
export const useRestaurantApproval = (onSuccess) => {
    // Approve pending restaurant
    const handleApprove = useCallback(
        async (restaurantId, restaurant) => {
            try {
                // Update restaurant status
                const result = await restaurantService.update(restaurantId, {
                    status: "active",
                    isOpen: true,
                });

                if (result) {
                    // Also update owner user status if owner_id exists
                    if (restaurant?.owner_id) {
                        try {
                            await authService.updateUserStatus(restaurant.owner_id, "active");
                        } catch (err) {
                            console.error("Lỗi khi cập nhật trạng thái người dùng:", err);
                        }
                    }

                    onSuccess?.();
                    return { success: true };
                }
            } catch (err) {
                console.error("Lỗi khi phê duyệt nhà hàng:", err);
                return { success: false, message: err.message };
            }
        },
        [onSuccess]
    );

    // Block active restaurant
    const handleBlock = useCallback(
        async (restaurantId, restaurant) => {
            try {
                // 1. Check for active orders
                const orders = await orderService.getByRestaurant(restaurantId);
                const activeOrders = orders.filter(o =>
                    ['pending', 'paid', 'confirmed', 'preparing', 'delivering', 'arrived'].includes(o.status)
                );

                if (activeOrders.length > 0) {
                    // Check if any order is in critical state
                    const criticalOrders = activeOrders.filter(o =>
                        ['preparing', 'delivering', 'arrived'].includes(o.status)
                    );

                    if (criticalOrders.length > 0) {
                        return {
                            success: false,
                            message: `Không thể khóa: Có ${criticalOrders.length} đơn hàng đang chuẩn bị/giao hàng. Vui lòng đợi hoàn thành.`,
                            code: 'CRITICAL_ORDERS_EXIST'
                        };
                    }

                    // Confirm before cancelling early-stage orders
                    const userConfirmed = window.confirm(
                        `Cảnh báo: Nhà hàng có ${activeOrders.length} đơn hàng đang xử lý\n\n` +
                        `Các đơn hàng sẽ bị HỦY và HOÀN TIỀN cho khách hàng.\n\n` +
                        `Bạn có chắc chắn muốn tiếp tục?`
                    );

                    if (!userConfirmed) {
                        return { success: false, cancelled: true };
                    }

                    // Cancel early-stage orders
                    for (const order of activeOrders) {
                        try {
                            await orderService.update(order.id, {
                                status: 'cancelled',
                                cancellation_reason: 'Nhà hàng bị khóa bởi quản trị viên',
                                cancelled_at: new Date().toISOString(),
                            });
                            console.log(`Đơn ${order.id} bị hủy do nhà hàng bị khóa`);
                        } catch (err) {
                            console.error(`Lỗi khi hủy đơn ${order.id}:`, err);
                        }
                    }
                }

                // 2. Update restaurant status
                const result = await restaurantService.update(restaurantId, {
                    status: "blocked",
                    isOpen: false,
                });

                if (result) {
                    // Also update owner user status if owner_id exists
                    if (restaurant?.owner_id) {
                        try {
                            await authService.updateUserStatus(restaurant.owner_id, "blocked");
                        } catch (err) {
                            console.error("Lỗi khi cập nhật trạng thái người dùng:", err);
                        }
                    }

                    onSuccess?.();
                    return {
                        success: true,
                        cancelledOrders: activeOrders.length
                    };
                }
            } catch (err) {
                console.error("Lỗi khi khóa nhà hàng:", err);
                return { success: false, message: err.message };
            }
        },
        [onSuccess]
    );

    // Unblock blocked restaurant
    const handleUnblock = useCallback(
        async (restaurantId, restaurant) => {
            try {
                // Update restaurant status
                const result = await restaurantService.update(restaurantId, {
                    status: "active",
                    isOpen: true,
                });

                if (result) {
                    // Also update owner user status if owner_id exists
                    if (restaurant?.owner_id) {
                        try {
                            await authService.updateUserStatus(restaurant.owner_id, "active");
                        } catch (err) {
                            console.error("Lỗi khi cập nhật trạng thái người dùng:", err);
                        }
                    }

                    onSuccess?.();
                    return { success: true };
                }
            } catch (err) {
                console.error("Lỗi khi mở khóa nhà hàng:", err);
                return { success: false, message: err.message };
            }
        },
        [onSuccess]
    );

    // Delete restaurant
    const handleDelete = useCallback(
        async (restaurantId) => {
            try {
                await restaurantService.delete(restaurantId);
                onSuccess?.();
                return { success: true };
            } catch (err) {
                console.error("Lỗi khi xóa nhà hàng:", err);
                return { success: false, message: err.message };
            }
        },
        [onSuccess]
    );

    return {
        handleApprove,
        handleBlock,
        handleUnblock,
        handleDelete,
    };
};
