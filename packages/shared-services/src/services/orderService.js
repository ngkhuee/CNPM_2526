import apiClient from "../config/apiClient";
import { ENDPOINTS } from "../config/endpoints";

// Helper function to map backend order to frontend format
const mapOrderToFrontend = (
  order,
  user = null,
  restaurant = null,
  address = null
) => ({
  id: order.id,
  _id: order.id,
  userId: order.user_id,
  restaurantId: order.restaurant_id,
  addressId: order.address_id,
  droneId: order.drone_id,
  items: (order.items || []).map((item) => ({
    ...item,
    foodId: item.foodId || item.menu_id || item.id,
  })),
  subtotal: order.subtotal,
  deliveryFee: order.delivery_fee,
  discountAmount: order.discount_amount,
  totalAmount: order.total_amount,
  paymentMethod: order.payment_method,
  paymentStatus: order.payment_status,
  payment_status: order.payment_status,
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
  // Customer info (from user and address)
  customerName: user?.full_name || "N/A",
  customerPhone: user?.phone || address?.phone || "N/A",
  customerAddress: address?.full_address || address?.address || "N/A",
  delivery_address: address?.full_address || address?.address || order.delivery_address || "N/A",
  // GPS coordinates
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
      console.log("Sample raw order:", orders[0]);

      // Map user and restaurant data to orders and convert to frontend format
      const mappedOrders = orders.map((order) => {
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

      console.log(
        "OrderService.getAll() - Mapped orders:",
        mappedOrders.length
      );
      console.log("Sample mapped order:", mappedOrders[0]);

      return mappedOrders;
    } catch (error) {
      throw error;
    }
  },

  async getById(id) {
    try {
      // Fetch order, user, restaurant, and address data
      const order = await apiClient.get(ENDPOINTS.ORDERS.BY_ID(id));

      // Fetch user, restaurant, and address info if available
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

      // Create enriched order
      const enrichedOrder = mapOrderToFrontend(order, user, restaurant, address);

      // Override with embedded customer data if available
      if (order.customer) {
        enrichedOrder.customerName = order.customer.name || enrichedOrder.customerName;
        enrichedOrder.customerPhone = order.customer.phone || enrichedOrder.customerPhone;
        enrichedOrder.customerAddress = order.customer.address || enrichedOrder.customerAddress;
      }

      // Add full address info
      if (address) {
        enrichedOrder.addressInfo = {
          fullAddress: address.full_address || address.address_line,
          street: address.street,
          ward: address.ward,
          district: address.district,
          city: address.city,
          phone: address.phone,
        };
      }

      return enrichedOrder;
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

        // Enrich items with foodId by matching with menus
        const enrichedOrder = mapOrderToFrontend(order, null, restaurant);

        enrichedOrder.items = enrichedOrder.items.map((item) => {
          // Try to find menu by name and restaurant_id
          if (!item.foodId && item.name) {
            const menu = menus.find(
              (m) => m.name === item.name && m.restaurant_id === order.restaurant_id
            );
            if (menu) {
              item.foodId = menu.id;
            }
          }
          return item;
        });

        return enrichedOrder;
      });

      console.log("orderService.getByUser() returned:", result);
      if (result.length > 0) {
        console.log("Sample order items:", result[0].items);
      }

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
      // Validate items exist before mapping
      if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
        throw new Error("Order must contain at least one item");
      }

      // Map items to backend format (menu_id instead of foodId/food_id)
      const backendItems = orderData.items.map((item) => ({
        menu_id: item.foodId || item.food_id || item.id, // Support both camelCase and snake_case
        name: item.name,
        quantity: item.quantity,
        unit_price: item.price || item.unit_price,
        subtotal: (item.price || item.unit_price) * item.quantity,
      }));

      // Map frontend camelCase to backend snake_case
      const newOrder = {
        user_id: orderData.customerId,
        restaurant_id: orderData.restaurantId,
        address_id: orderData.addressId,
        items: backendItems,
        subtotal: orderData.subtotal,
        delivery_fee: orderData.deliveryFee || 0,
        discount_amount: orderData.discountAmount || 0,
        total_amount: orderData.total_amount,
        payment_method: orderData.payment_method || "momo",
        status: orderData.status || "pending",
        payment_status: orderData.paymentStatus || "pending",
        special_instructions: orderData.specialInstructions || "",
        customer: orderData.customer,
        dropoff_gps: orderData.dropoff_gps,
        order_number: `ORD-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Remove undefined values
      Object.keys(newOrder).forEach(
        (key) => newOrder[key] === undefined && delete newOrder[key]
      );

      console.log("📤 Sending order to backend:", newOrder);
      const response = await apiClient.post(ENDPOINTS.ORDERS.BASE, newOrder);
      console.log("Backend response:", response);
      return mapOrderToFrontend(response);
    } catch (error) {
      console.error("Order creation failed:", error);
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
      // Map frontend to backend - only include fields that are explicitly provided
      const payload = {
        updated_at: new Date().toISOString(),
      };

      // Only add fields if they exist in orderData
      if (orderData.status !== undefined) {
        payload.status = orderData.status;
      }
      if (orderData.droneId !== undefined) {
        payload.drone_id = orderData.droneId;
      }
      if (orderData.drone_id !== undefined) {
        payload.drone_id = orderData.drone_id;
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
