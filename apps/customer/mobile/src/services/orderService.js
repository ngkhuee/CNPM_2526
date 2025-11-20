/**
 * orderService.js - Service xử lý các hành động liên quan order
 * Gọi API endpoint /orders để tạo order
 */

import apiClient from './apiClient';

/**
 * Transform order từ snake_case (API) sang camelCase (App)
 */
const transformOrder = (order) => {
    if (!order) return null;

    return {
        id: order.id,
        status: order.status,
        totalPrice: order.total_amount || order.totalPrice || 0,
        createdAt: order.created_at,
        created_at: order.created_at,
        updatedAt: order.updated_at,
        updated_at: order.updated_at,
        restaurantId: order.restaurant_id,
        restaurant_id: order.restaurant_id,
        restaurantName: order.restaurant?.name || 'Unknown Restaurant',
        restaurant_name: order.restaurant?.name || 'Unknown Restaurant',
        restaurantAddress: order.restaurant?.address || '',
        restaurant_address: order.restaurant?.address || '',
        deliveryAddress: order.customer?.address || (order.delivery_address || ''),
        delivery_address: order.customer?.address || (order.delivery_address || ''),
        items: (order.items || []).map(item => ({
            id: item.menu_id,
            foodId: item.menu_id,
            menu_id: item.menu_id,
            name: item.name,
            quantity: item.quantity,
            price: item.unit_price || item.price,
            unit_price: item.unit_price || item.price,
            subtotal: item.subtotal || (item.quantity * (item.unit_price || item.price || 0)),
        })),
        paymentMethod: order.payment_method,
        paymentStatus: order.payment_status,
        payment_status: order.payment_status,
        subtotal: order.subtotal || 0,
        deliveryFee: order.delivery_fee || 0,
        delivery_fee: order.delivery_fee || 0,
        discountAmount: order.discount_amount || 0,
        discount_amount: order.discount_amount || 0,
        customer: order.customer || {
            name: order.customerName,
            phone: order.customerPhone,
            address: order.delivery_address,
            email: order.customer?.email,
            id: order.customer?.id,
        },
        customerName: order.customer?.name || order.customerName,
        customerPhone: order.customer?.phone || order.customerPhone,
        specialInstructions: order.special_instructions,
        special_instructions: order.special_instructions,
        // Tracking fields
        drone_id: order.drone_id,
        droneId: order.drone_id,
        estimated_delivery_time: order.estimated_delivery_time,
        estimatedDeliveryTime: order.estimated_delivery_time,
        pickup_gps: order.pickup_gps,
        dropoff_gps: order.dropoff_gps || order.delivery_gps,
        current_gps: order.current_gps,
        order_number: order.order_number,
        orderNumber: order.order_number,
        promo_code: order.promo_code || order.promotion_code,
        promotion_code: order.promo_code || order.promotion_code,
    };
};

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
        // console.log('[orderService.getOrders] Response:', response);

        // Transform orders từ snake_case sang camelCase
        const transformedOrders = Array.isArray(response)
            ? response.map(transformOrder)
            : response.orders?.map(transformOrder) || [];

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
        return transformOrder(response);
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

        // Map frontend format to backend schema (match web's orderService)
        const backendPayload = {
            restaurant_id: orderData.restaurantId || orderData.restaurant_id,
            items: (orderData.items || []).map(item => ({
                menu_id: item.foodId || item.food_id || item.id || item.menu_id, // Support multiple field names
                name: item.name,
                quantity: item.quantity,
                unit_price: item.price || item.unit_price,
                subtotal: (item.price || item.unit_price) * item.quantity,
            })),
            subtotal: orderData.subtotal,
            delivery_fee: orderData.deliveryFee || orderData.delivery_fee || 0,
            discount_amount: orderData.discountAmount || orderData.discount_amount || 0,
            total_amount: orderData.total_amount || orderData.totalAmount,
            payment_method: orderData.payment_method || orderData.paymentMethod || 'momo',
            status: orderData.status || 'pending',
            payment_status: orderData.payment_status || orderData.paymentStatus || 'pending',
            special_instructions: orderData.special_instructions || orderData.specialInstructions || '',
            customer: {
                name: orderData.customer?.name || 'Customer',
                phone: orderData.customer?.phone || '',
                address: orderData.customer?.address || '',
                email: orderData.customer?.email || '',
            },
            delivery_address: orderData.delivery_address || orderData.deliveryAddress,
            delivery_address_id: orderData.delivery_address_id || orderData.deliveryAddressId,
            dropoff_gps: orderData.dropoff_gps || orderData.gps,
            promotion_code: orderData.promotion_code || orderData.promoCode || null,
            promotion_id: orderData.promotion_id || orderData.promotionId || null,
            order_number: orderData.order_number || `ORD-${Date.now()}`,
            created_at: orderData.created_at || new Date().toISOString(),
            updated_at: orderData.updated_at || new Date().toISOString(),
        };

        // Remove undefined/null values
        Object.keys(backendPayload).forEach(
            key => backendPayload[key] === undefined && delete backendPayload[key]
        );

        console.log('[orderService.submitOrder] Backend payload:', backendPayload);

        const response = await apiClient.post('/orders', backendPayload);

        console.log('[orderService.submitOrder] Success:', response);
        return transformOrder(response);
    } catch (error) {
        console.error('[orderService.submitOrder] Error:', error.message);
        // Log detailed error response for debugging
        if (error.response?.data) {
            console.error('[orderService.submitOrder] Backend error response:', error.response.data);
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
