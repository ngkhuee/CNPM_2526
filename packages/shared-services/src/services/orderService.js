import apiClient from "../config/apiClient";
import { ENDPOINTS } from "../config/endpoints";

// Helper function to map backend order to frontend format
const mapOrderToFrontend = (order, user = null, restaurant = null) => ({
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
});

export const orderService = {
  async getAll() {
    try {
      // Fetch orders, users, restaurants, and addresses separately, then merge
      const [orders, users, restaurants, addresses] = await Promise.all([
        apiClient.get(ENDPOINTS.ORDERS.BASE),
        apiClient.get("/users"),
        apiClient.get("/restaurants"),
        apiClient.get("/addresses"),
      ]);

      // Map user and restaurant data to orders and convert to frontend format
      return orders.map((order) => {
        const user = users.find((u) => u.id === order.user_id) || null;
        const restaurant =
          restaurants.find((r) => r.id === order.restaurant_id) || null;
        const address =
          addresses.find((a) => a.id === order.address_id) || null;

        // Create enriched order
        const enrichedOrder = mapOrderToFrontend(order, user, restaurant);

        // Add address information
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
    } catch (error) {
      throw error;
    }
  },

  async getById(id) {
    try {
      // Fetch order, user, and restaurant data
      const order = await apiClient.get(ENDPOINTS.ORDERS.BY_ID(id));

      // Fetch user and restaurant info if available
      let user = null;
      let restaurant = null;

      try {
        if (order.user_id) {
          user = await apiClient.get(`/users/${order.user_id}`);
        }
      } catch (err) {
        console.warn("Could not fetch user:", err);
      }

      try {
        if (order.restaurant_id) {
          restaurant = await apiClient.get(
            `/restaurants/${order.restaurant_id}`
          );
        }
      } catch (err) {
        console.warn("Could not fetch restaurant:", err);
      }

      return mapOrderToFrontend(order, user, restaurant);
    } catch (error) {
      throw error;
    }
  },

  async getByUser(userId) {
    try {
      const [orders, restaurants] = await Promise.all([
        apiClient.get(ENDPOINTS.ORDERS.BY_USER(userId)),
        apiClient.get("/restaurants"),
      ]);

      return orders.map((order) => {
        const restaurant =
          restaurants.find((r) => r.id === order.restaurant_id) || null;
        return mapOrderToFrontend(order, null, restaurant);
      });
    } catch (error) {
      throw error;
    }
  },

  async getByRestaurant(restaurantId) {
    try {
      const [orders, restaurant, users, addresses] = await Promise.all([
        apiClient.get(ENDPOINTS.ORDERS.BY_RESTAURANT(restaurantId)),
        apiClient.get(`/restaurants/${restaurantId}`),
        apiClient.get("/users"),
        apiClient.get("/addresses"),
      ]);

      return orders.map((order) => {
        const user = users.find((u) => u.id === order.user_id) || null;
        const address =
          addresses.find((a) => a.id === order.address_id) || null;

        // Create enriched order with user and address info
        const enrichedOrder = mapOrderToFrontend(order, user, restaurant);

        // Add address information
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
    } catch (error) {
      throw error;
    }
  },

  async create(orderData) {
    try {
      const newOrder = {
        ...orderData,
        orderNumber: `ORD-${Date.now()}`,
        status: orderData.status || "pending",
        paymentStatus: orderData.paymentStatus || "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return await apiClient.post(ENDPOINTS.ORDERS.BASE, newOrder);
    } catch (error) {
      throw error;
    }
  },

  async updateStatus(id, status) {
    try {
      const response = await apiClient.patch(ENDPOINTS.ORDERS.BY_ID(id), {
        status,
        updated_at: new Date().toISOString(),
      });
      return mapOrderToFrontend(response);
    } catch (error) {
      throw error;
    }
  },

  async update(id, orderData) {
    try {
      // Map frontend to backend
      const payload = {
        status: orderData.status,
        drone_id: orderData.droneId,
        special_instructions: orderData.specialInstructions,
        estimated_delivery_time: orderData.estimatedDeliveryTime,
        actual_delivery_time: orderData.actualDeliveryTime,
        updated_at: new Date().toISOString(),
      };

      // Remove undefined values
      Object.keys(payload).forEach(
        (key) => payload[key] === undefined && delete payload[key]
      );

      const response = await apiClient.patch(
        ENDPOINTS.ORDERS.BY_ID(id),
        payload
      );
      return mapOrderToFrontend(response);
    } catch (error) {
      throw error;
    }
  },

  async cancel(id) {
    try {
      return await this.updateStatus(id, "cancelled");
    } catch (error) {
      throw error;
    }
  },
};
