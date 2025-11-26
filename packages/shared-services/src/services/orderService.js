import apiClient from "../config/apiClient";
import { ENDPOINTS } from "../config/endpoints";
import { transformOrderFromAPI, transformOrderToAPI } from "../utils/orderTransformer";

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

      console.log(
        "OrderService.getAll() - Raw orders from API:",
        orders.length
      );

      // Map user and restaurant data to orders and convert to frontend format
      const mappedOrders = orders.map((order) => {
        const user = users.find((u) => u.id === order.user_id) || null;
        const restaurant =
          restaurants.find((r) => r.id === order.restaurant_id) || null;
        const address =
          addresses.find((a) => a.id === order.address_id) || null;

        // Create enriched order with relations
        const enrichedOrder = {
          ...order,
          user,
          restaurant,
          address,
        };

        // ✅ Use unified transformer
        return transformOrderFromAPI(enrichedOrder);
      });

      console.log(
        "OrderService.getAll() - Transformed orders:",
        mappedOrders.length
      );

      return mappedOrders;
    } catch (error) {
      throw error;
    }
  },

  async getById(id) {
    try {
      // Fetch order
      const order = await apiClient.get(ENDPOINTS.ORDERS.BY_ID(id));

      // Fetch relations if available
      let user = null;
      let restaurant = null;
      let address = null;

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

      try {
        if (order.address_id) {
          address = await apiClient.get(`/addresses/${order.address_id}`);
        }
      } catch (err) {
        console.warn("Could not fetch address:", err);
      }

      // Enrich with relations
      const enrichedOrder = {
        ...order,
        user,
        restaurant,
        address,
      };

      // ✅ Use unified transformer
      return transformOrderFromAPI(enrichedOrder);
    } catch (error) {
      throw error;
    }
  },

  async getByUser(userId) {
    try {
      const [orders, restaurants, menus] = await Promise.all([
        apiClient.get(ENDPOINTS.ORDERS.BY_USER(userId)),
        apiClient.get("/restaurants"),
        apiClient.get("/menus"),
      ]);

      const result = orders.map((order) => {
        const restaurant =
          restaurants.find((r) => r.id === order.restaurant_id) || null;

        // Enrich items with foodId from menus
        const enrichedItems = (order.items || []).map((item) => {
          if (!item.menu_id && item.name) {
            const menu = menus.find(
              (m) => m.name === item.name && m.restaurant_id === order.restaurant_id
            );
            if (menu) {
              item.menu_id = menu.id;
            }
          }
          return item;
        });

        const enrichedOrder = {
          ...order,
          items: enrichedItems,
          restaurant,
        };

        // ✅ Use unified transformer
        return transformOrderFromAPI(enrichedOrder);
      });

      console.log("orderService.getByUser() returned:", result.length, "orders");

      return result;
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

        // Enrich with relations
        const enrichedOrder = {
          ...order,
          user,
          restaurant,
          address,
        };

        // ✅ Use unified transformer
        return transformOrderFromAPI(enrichedOrder);
      });
    } catch (error) {
      throw error;
    }
  },

  async create(orderData) {
    try {
      // Validate items
      if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
        throw new Error("Order must contain at least one item");
      }

      // ✅ Use unified transformer to convert to API format
      const payload = transformOrderToAPI(orderData);

      console.log("📤 Creating order with payload:", payload);
      const response = await apiClient.post(ENDPOINTS.ORDERS.BASE, payload);
      console.log("✅ Order created:", response);

      // ✅ Transform response back to frontend format
      return transformOrderFromAPI(response);
    } catch (error) {
      console.error("❌ Order creation failed:", error);
      throw error;
    }
  },
  async updateStatus(id, status) {
    try {
      const response = await apiClient.patch(ENDPOINTS.ORDERS.BY_ID(id), {
        status,
        updated_at: new Date().toISOString(),
      });
      // ✅ Use unified transformer
      return transformOrderFromAPI(response);
    } catch (error) {
      throw error;
    }
  },

  async update(id, orderData) {
    try {
      // Build payload with only provided fields
      const payload = {
        updated_at: new Date().toISOString(),
      };

      // Map fields
      if (orderData.status !== undefined) {
        payload.status = orderData.status;
      }
      if (orderData.droneId || orderData.drone_id) {
        payload.drone_id = orderData.droneId || orderData.drone_id;
      }
      if (orderData.specialInstructions !== undefined) {
        payload.special_instructions = orderData.specialInstructions;
      }
      if (orderData.estimatedDeliveryTime !== undefined) {
        payload.estimated_delivery_time = orderData.estimatedDeliveryTime;
      }
      if (orderData.actualDeliveryTime !== undefined) {
        payload.actual_delivery_time = orderData.actualDeliveryTime;
      }
      if (orderData.rejection_reason !== undefined) {
        payload.rejection_reason = orderData.rejection_reason;
      }
      if (orderData.rejected_at !== undefined) {
        payload.rejected_at = orderData.rejected_at;
      }

      console.log(`📝 Updating order ${id} with payload:`, payload);

      const response = await apiClient.patch(
        ENDPOINTS.ORDERS.BY_ID(id),
        payload
      );
      // ✅ Use unified transformer
      return transformOrderFromAPI(response);
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

  /**
   * Get drone status for an order
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} Drone journey info
   */
  async getDroneStatus(orderId) {
    try {
      const response = await apiClient.get(`/orders/${orderId}/drone-status`);
      return response;
    } catch (error) {
      console.error(`Error fetching drone status for order ${orderId}:`, error);
      throw error;
    }
  },

  /**
   * Update drone journey stage for an order
   * @param {string} orderId - Order ID
   * @param {string} stage - Journey stage
   * @returns {Promise<Object>}
   */
  async updateDroneJourneyStage(orderId, stage) {
    try {
      const response = await apiClient.patch(ENDPOINTS.ORDERS.BY_ID(orderId), {
        drone_journey_stage: stage,
        updated_at: new Date().toISOString(),
      });
      return mapOrderToFrontend(response);
    } catch (error) {
      console.error(`Error updating drone journey stage for order ${orderId}:`, error);
      throw error;
    }
  },
};
