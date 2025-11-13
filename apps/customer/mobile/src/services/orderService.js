/**
 * Order Service for Mobile
 * Data mapping layer - mirrors shared-services logic
 */
import apiClient, { ENDPOINTS } from '../config/apiClient';

// Helper function to map backend order to frontend format
const mapOrderToFrontend = (order, user = null, restaurant = null, address = null) => ({
    id: order.id,
    _id: order.id,
    userId: order.user_id,
    restaurantId: order.restaurant_id,
    addressId: order.address_id,
    droneId: order.drone_id,
    items: order.items || [],
    subtotal: order.subtotal,
    deliveryFee: order.delivery_fee,
    discountAmount: order.discount_amount,
    totalAmount: order.total_amount,
    paymentMethod: order.payment_method,
    status: order.status,
    specialInstructions: order.special_instructions,
    estimatedDeliveryTime: order.estimated_delivery_time,
    actualDeliveryTime: order.actual_delivery_time,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    user: user,
    userName: user?.full_name || order.user_id,
    restaurant: restaurant,
    restaurantName: restaurant?.name || null,
    restaurant_id: order.restaurant_id,
    customerName: user?.full_name || 'N/A',
    customerPhone: user?.phone || address?.phone || 'N/A',
    customerAddress: address?.full_address || address?.address || 'N/A',
    pickup_gps: order.pickup_gps || restaurant?.location || null,
    dropoff_gps:
        order.dropoff_gps ||
        (address?.latitude && address?.longitude
            ? {
                lat: address.latitude,
                lng: address.longitude,
            }
            : null),
    current_gps: order.current_gps || null,
    drone_id: order.drone_id,
});

export const orderService = {
    async getAll() {
        try {
            const [orders, users, restaurants, addresses] = await Promise.all([
                apiClient.get(ENDPOINTS.ORDERS.BASE),
                apiClient.get('/users'),
                apiClient.get('/restaurants'),
                apiClient.get('/addresses'),
            ]);

            const mappedOrders = orders.map((order) => {
                const user = users.find((u) => u.id === order.user_id) || null;
                const restaurant = restaurants.find((r) => r.id === order.restaurant_id) || null;
                const address = addresses.find((a) => a.id === order.address_id) || null;
                const enrichedOrder = mapOrderToFrontend(order, user, restaurant);
                if (address) {
                    enrichedOrder.address = address;
                    enrichedOrder.addressInfo = {
                        fullAddress: address.full_address,
                        street: address.street,
                        ward: address.ward,
                        district: address.district,
                        city: address.city,
                        phone: address.phone,
                    };
                }
                return enrichedOrder;
            });

            return mappedOrders;
        } catch (error) {
            throw error;
        }
    },

    async create(orderData) {
        try {
            return await apiClient.post(ENDPOINTS.ORDERS.BASE, orderData);
        } catch (error) {
            throw error;
        }
    },

    async getById(id) {
        try {
            const order = await apiClient.get(ENDPOINTS.ORDERS.BY_ID(id));
            return mapOrderToFrontend(order);
        } catch (error) {
            throw error;
        }
    },

    async getByUser(userId) {
        try {
            return await apiClient.get(ENDPOINTS.ORDERS.BY_USER(userId));
        } catch (error) {
            throw error;
        }
    },

    async getByRestaurant(restaurantId) {
        try {
            return await apiClient.get(ENDPOINTS.ORDERS.BY_RESTAURANT(restaurantId));
        } catch (error) {
            throw error;
        }
    },

    async update(id, updateData) {
        try {
            return await apiClient.patch(ENDPOINTS.ORDERS.BY_ID(id), updateData);
        } catch (error) {
            throw error;
        }
    },

    async cancel(id) {
        try {
            return await apiClient.patch(ENDPOINTS.ORDERS.BY_ID(id), {
                status: 'cancelled',
            });
        } catch (error) {
            throw error;
        }
    },
};

export default orderService;
