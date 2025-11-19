// hooks/useOrderStatus.js - Quản lý order status & timeline
import { Alert } from 'react-native';
import { orderService } from '../services/orderService';
import { showToast } from '../utils/toastHelper';

export const ORDER_TIMELINE = [
    { status: 'pending', label: 'Order Placed', icon: 'shopping-cart' },
    { status: 'confirmed', label: 'Confirmed', icon: 'check-circle' },
    { status: 'preparing', label: 'Preparing', icon: 'local-dining' },
    { status: 'ready', label: 'Ready for Pickup', icon: 'done-all' },
    { status: 'delivering', label: 'On the Way', icon: 'local-shipping' },
    { status: 'delivered', label: 'Delivered', icon: 'flag' },
];

export const useOrderStatus = (order, onRefetch) => {
    const getStatusIndex = () => {
        const statusMap = {
            pending: 0,
            confirmed: 1,
            preparing: 2,
            ready: 3,
            delivering: 4,
            delivered: 5,
        };
        return statusMap[order?.status] || 0;
    };

    const handleConfirmDelivery = () => {
        Alert.alert(
            'Confirm Delivery',
            'Please confirm that you have received the order',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: async () => {
                        try {
                            await orderService.updateOrderStatus(order.id, 'delivered');
                            showToast('success', 'Delivery confirmed');
                            onRefetch?.();
                        } catch (error) {
                            showToast('error', 'Failed to confirm delivery');
                        }
                    },
                },
            ]
        );
    };

    return {
        currentStatusIndex: getStatusIndex(),
        isDelivered: order?.status === 'delivered',
        handleConfirmDelivery,
    };
};
