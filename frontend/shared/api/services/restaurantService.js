import apiClient from "../config/apiClient";
import { ENDPOINTS } from "../config/endpoints";

export const restaurantService = {
  // GET /restaurants?lat={lat}&lng={lng}&radius=5000 - Lấy danh sách nhà hàng gần
  async getAll(params = {}) {
    try {
      const response = await apiClient.get(ENDPOINTS.RESTAURANTS.BASE, {
        params, // Support lat, lng, radius, time parameters
      });
      // Map backend to frontend
      return response.map((restaurant) => ({
        id: restaurant.id || restaurant.restaurant_id,
        _id: restaurant.id || restaurant.restaurant_id,
        restaurantId: restaurant.id || restaurant.restaurant_id,
        name: restaurant.name,
        location: restaurant.location,
        category: restaurant.category,
        rating: restaurant.rating,
        isOpen:
          restaurant.is_open !== undefined
            ? restaurant.is_open
            : restaurant.status === "active",
        images:
          restaurant.images ||
          [restaurant.image, restaurant.banner].filter(Boolean),
        image: restaurant.images?.[0] || restaurant.image,
        banner: restaurant.images?.[1] || restaurant.banner,
        ownerUserId: restaurant.owner_user_id,
        ownerEmail: restaurant.ownerEmail,
        ownerPhone: restaurant.ownerPhone,
        reviewCount: restaurant.reviewCount || 0,
        status:
          restaurant.status || (restaurant.is_open ? "active" : "inactive"),
        openedAt: restaurant.openedAt,
        createdAt: restaurant.created_at || restaurant.createdAt,
      }));
    } catch (error) {
      throw error;
    }
  },

  // GET /restaurants/:id - Chi tiết nhà hàng
  async getById(id) {
    try {
      console.log("restaurantService.getById() called with id:", id);
      console.log("Endpoint:", ENDPOINTS.RESTAURANTS.BY_ID(id));
      const response = await apiClient.get(ENDPOINTS.RESTAURANTS.BY_ID(id));
      console.log("Raw response:", response);
      // Map backend to frontend
      // JSON Server requires 'id' field, but support 'restaurant_id' for backward compatibility
      return {
        id: response.id || response.restaurant_id,
        _id: response.id || response.restaurant_id,
        restaurantId: response.id || response.restaurant_id,
        name: response.name,
        location: response.location,
        category: response.category,
        rating: response.rating,
        isOpen:
          response.is_open !== undefined
            ? response.is_open
            : response.status === "active",
        images:
          response.images || [response.image, response.banner].filter(Boolean),
        image: response.images?.[0] || response.image,
        banner: response.images?.[1] || response.banner,
        ownerUserId: response.owner_user_id,
        ownerEmail: response.ownerEmail, // Legacy support
        ownerPhone: response.ownerPhone, // Legacy support
        reviewCount: response.reviewCount || 0, // Legacy support
        status: response.status || (response.is_open ? "active" : "inactive"),
        openedAt: response.openedAt,
        createdAt: response.created_at || response.createdAt,
      };
    } catch (error) {
      throw error;
    }
  },

  // GET /restaurants/:id/menu - Xem menu nhà hàng
  async getMenu(id) {
    try {
      const response = await apiClient.get(ENDPOINTS.RESTAURANTS.MENU(id));
      return response.map((menu) => ({
        id: menu.menu_id || menu.id,
        _id: menu.menu_id || menu.id,
        name: menu.item_name,
        restaurantId: menu.restaurant_id,
        price: menu.price,
        description: menu.description,
        image: menu.image_url,
        isAvailable: menu.is_available,
        category: menu.category,
        createdAt: menu.created_at,
      }));
    } catch (error) {
      throw error;
    }
  },

  // Backward compatibility
  async getFoods(id) {
    return this.getMenu(id);
  },

  async getOrders(id) {
    try {
      return await apiClient.get(ENDPOINTS.RESTAURANTS.ORDERS(id));
    } catch (error) {
      throw error;
    }
  },

  async create(restaurantData) {
    try {
      return await apiClient.post(ENDPOINTS.RESTAURANTS.BASE, restaurantData);
    } catch (error) {
      throw error;
    }
  },

  async update(id, restaurantData) {
    try {
      return await apiClient.put(
        ENDPOINTS.RESTAURANTS.BY_ID(id),
        restaurantData
      );
    } catch (error) {
      throw error;
    }
  },

  async delete(id) {
    try {
      return await apiClient.delete(ENDPOINTS.RESTAURANTS.BY_ID(id));
    } catch (error) {
      throw error;
    }
  },
};
