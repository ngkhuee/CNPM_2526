/**
 * orderService.js - Service xử lý các hành động liên quan order
 * Gọi API endpoint /orders để tạo order
 */

import apiClient from './apiClient';
// ✅ Import unified transformer
import { transformOrderFromAPI, transformOrderToAPI } from '../utils/orderTransformer';

/**
 * Lấy danh sách orders của user
 * Gọi API với filter user_id từ token
 * 
 * @returns {Array} Danh sách orders của user hiện tại
 */
export const getOrders = async () => {
    try {
        // API endpoint tự động lọc orders theo user_id từ token
        const response = await apiClient.get('/orders');

        // ✅ Transform orders using unified transformer
        const transformedOrders = Array.isArray(response)
            ? response.map(transformOrderFromAPI)
            : response.orders?.map(transformOrderFromAPI) || [];

        console.log('[orderService.getOrders] Transformed:', transformedOrders.length, 'orders');

        return transformedOrders;
    } catch (error) {
        console.error('[orderService.getOrders] Error:', error.message);
        throw error;
    }
};

/**
 * Lấy chi tiết một order
 * 
 * @param {string} orderId - ID của order
 * @returns {Object} Chi tiết order
 */
export const getOrderDetail = async (orderId) => {
    try {
        const response = await apiClient.get(`/orders/${orderId}`);
        console.log('[orderService.getOrderDetail] Response:', response);
        // ✅ Use unified transformer
        return transformOrderFromAPI(response);
    } catch (error) {
        console.error('[orderService.getOrderDetail] Error:', error.message);
        throw error;
    }
};

/**
 * Tạo order từ giỏ hàng
 * 
 * @param {Object} orderData - Dữ liệu order
 * @param {string} orderData.restaurantId - ID nhà hàng
 * @param {Array} orderData.items - Mảng items trong order
 * @param {number} orderData.subtotal - Tổng tiền hàng
 * @param {number} orderData.deliveryFee - Phí giao hàng
 * @param {number} orderData.discountAmount - Tổng tiền giảm
 * @param {number} orderData.total_amount - Tổng tiền cuối cùng
 * @param {string} orderData.payment_method - Phương thức thanh toán (cash, online)
 * @param {Object} orderData.customer - Dữ liệu khách hàng {name, phone, address}
 * @param {string} orderData.promo_code - Mã khuyến mãi (tuỳ chọn)
 * @returns {Object} Order đã tạo
 */
export const submitOrder = async (orderData) => {
    try {
        console.log('[orderService.submitOrder] Submitting order:', orderData);

        // ✅ Use unified transformer to convert to API format
        const payload = transformOrderToAPI(orderData);

        console.log('[orderService.submitOrder] API payload:', payload);

        const response = await apiClient.post('/orders', payload);

        console.log('[orderService.submitOrder] Success:', response);

        // ✅ Transform response back to frontend format
        return transformOrderFromAPI(response);
    } catch (error) {
        console.error('[orderService.submitOrder] Error:', error.message);
        if (error.response?.data) {
            console.error('[orderService.submitOrder] Backend error:', error.response.data);
        }
        throw error;
    }
};

/**
 * Hủy order
 * 
 * @param {string} orderId - ID của order
 * @returns {Object} Response từ API
 */
export const cancelOrder = async (orderId) => {
    try {
        console.log('[orderService.cancelOrder] Cancelling order:', orderId);

        const response = await apiClient.patch(`/orders/${orderId}/cancel`);

        console.log('[orderService.cancelOrder] Success:', response);
        return response;
    } catch (error) {
        console.error('[orderService.cancelOrder] Error:', error.message);
        throw error;
    }
};

/**
 * Cập nhật status order (admin only - for reference)
 * 
 * @param {string} orderId - ID của order
 * @param {string} status - Status mới
 * @returns {Object} Response từ API
 */
export const updateOrderStatus = async (orderId, status) => {
    try {
        console.log('[orderService.updateOrderStatus] Updating order status:', { orderId, status });

        const response = await apiClient.patch(`/orders/${orderId}`, {
            status,
        });

        console.log('[orderService.updateOrderStatus] Success:', response);
        return response;
    } catch (error) {
        console.error('[orderService.updateOrderStatus] Error:', error.message);
        throw error;
    }
};

/**
 * Generic update order method
 * 
 * @param {string} orderId - ID của order
 * @param {Object} data - Data to update
 * @returns {Object} Response từ API
 */
export const updateOrder = async (orderId, data) => {
    try {
        console.log('[orderService.updateOrder] Updating order:', { orderId, data });

        const response = await apiClient.patch(`/orders/${orderId}`, data);

        console.log('[orderService.updateOrder] Success:', response);
        return response;
    } catch (error) {
        console.error('[orderService.updateOrder] Error:', error.message);
        throw error;
    }
};

/**
 * Xóa order
 * 
 * @param {string} orderId - ID của order
 * @returns {Object} Response từ API
 */
export const deleteOrder = async (orderId) => {
    try {
        console.log('[orderService.deleteOrder] Deleting order:', orderId);

        const response = await apiClient.delete(`/orders/${orderId}`);

        console.log('[orderService.deleteOrder] Success:', response);
        return response;
    } catch (error) {
        console.error('[orderService.deleteOrder] Error:', error.message);
        throw error;
    }
};

/**
 * Lấy danh sách mock orders (deprecated - only for development)
 */
export const getMockOrders = () => [
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
];

/**
 * Get status display text
 */
export const getStatusText = (status) => {
    const statusMap = {
        pending: 'Pending',
        confirmed: 'Confirmed',
        preparing: 'Preparing',
        delivering: 'Delivering',
        completed: 'Completed',
        cancelled: 'Cancelled',
    };
    return statusMap[status] || status;
};

/**
 * Get status color
 */
export const getStatusColor = (status) => {
    const colorMap = {
        pending: '#FFA500',
        confirmed: '#2196F3',
        preparing: '#FF9800',
        delivering: '#9C27B0',
        completed: '#4CAF50',
        cancelled: '#F44336',
    };
    return colorMap[status] || '#999';
};

/**
 * Check if order can be cancelled
 */
export const canCancelOrder = (status) => {
    const cancellableStatuses = ['pending', 'confirmed'];
    return cancellableStatuses.includes(status);
};

export default {
    getOrders,
    getOrderDetail,
    submitOrder,
    cancelOrder,
    updateOrder,
    updateOrderStatus,
    deleteOrder,
    getMockOrders,
    getStatusText,
    getStatusColor,
    canCancelOrder,
};
