// services/orderService.js
import axios from 'axios';

const API_BASE_URL = 'http://192.168.0.127:4000';

export const orderService = {
    // Mock orders
    getMockOrders: () => [
        {
            id: '1',
            restaurantId: 'rest-1',
            restaurantName: 'Burger King',
            status: 'completed', // pending, confirmed, preparing, delivering, completed, cancelled
            totalPrice: 150000,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            deliveryAddress: '123 Main Street, District 1',
            items: [
                { id: '1', foodId: 'food-1', name: 'Grilled Beef Burger', quantity: 2, price: 50000, image: null },
                { id: '2', foodId: 'food-2', name: 'Fries', quantity: 1, price: 25000, image: null },
            ],
            deliveryTime: '30 mins',
        },
        {
            id: '2',
            restaurantId: 'rest-2',
            restaurantName: 'Pizza Hut',
            status: 'pending',
            totalPrice: 200000,
            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            deliveryAddress: '456 Park Avenue, District 2',
            items: [
                { id: '1', foodId: 'food-3', name: 'Margarita Pizza', quantity: 1, price: 120000, image: null },
                { id: '2', foodId: 'food-4', name: 'Coke', quantity: 2, price: 40000, image: null },
            ],
            deliveryTime: '45 mins',
        },
        {
            id: '3',
            restaurantId: 'rest-3',
            restaurantName: 'Pho Restaurant',
            status: 'delivering',
            totalPrice: 120000,
            createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
            deliveryAddress: '789 Nguyen Hue, District 1',
            items: [
                { id: '1', foodId: 'food-5', name: 'Beef Pho', quantity: 2, price: 60000, image: null },
            ],
            deliveryTime: '20 mins',
        },
    ],

    // API calls (ready for implementation)
    getOrders: async (userId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/orders/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching orders:', error);
            throw error;
        }
    },

    getOrderDetails: async (orderId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/orders/${orderId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching order details:', error);
            throw error;
        }
    },

    cancelOrder: async (orderId) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/orders/${orderId}/cancel`);
            return response.data;
        } catch (error) {
            console.error('Error cancelling order:', error);
            throw error;
        }
    },

    // Filter orders by status
    getCurrentOrders: (orders) => {
        const activeStatuses = ['pending', 'confirmed', 'preparing', 'delivering'];
        return orders.filter(order => activeStatuses.includes(order.status));
    },

    getHistoryOrders: (orders) => {
        const completeStatuses = ['completed', 'cancelled'];
        return orders.filter(order => completeStatuses.includes(order.status));
    },

    // Get status display text
    getStatusText: (status) => {
        const statusMap = {
            pending: 'Pending',
            confirmed: 'Confirmed',
            preparing: 'Preparing',
            delivering: 'Delivering',
            completed: 'Completed',
            cancelled: 'Cancelled',
        };
        return statusMap[status] || status;
    },

    // Get status color
    getStatusColor: (status) => {
        const colorMap = {
            pending: '#FFA500',
            confirmed: '#2196F3',
            preparing: '#FF9800',
            delivering: '#9C27B0',
            completed: '#4CAF50',
            cancelled: '#F44336',
        };
        return colorMap[status] || '#999';
    },

    // Check if order can be cancelled
    canCancelOrder: (status) => {
        const cancellableStatuses = ['pending', 'confirmed'];
        return cancellableStatuses.includes(status);
    },
};
