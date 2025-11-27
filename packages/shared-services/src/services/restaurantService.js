import apiClient from "../config/apiClient";
import { ENDPOINTS } from "../config/endpoints";
import { isRestaurantOpen } from "shared-utils";

export const restaurantService = {
  // GET /restaurants?lat={lat}&lng={lng}&radius=5000 - Lấy danh sách nhà hàng gần
  // Note: By default, only returns ACTIVE restaurants for customer-facing apps
  async getAll(params = {}, includeAll = false) {
    try {
      const response = await apiClient.get(ENDPOINTS.RESTAURANTS.BASE, {
        params, // Support lat, lng, radius, time parameters
      });
      // Filter only ACTIVE restaurants unless includeAll is true (for admin)
      const filteredRestaurants = includeAll
        ? response
        : response.filter((r) => r.status === 'active');
      // Map backend to frontend
      return filteredRestaurants.map((restaurant) => ({
        id: restaurant.id,
        _id: restaurant.id,
        restaurantId: restaurant.id,
        name: restaurant.name,
        description: restaurant.description,
        address: restaurant.address,
        location: {
          lat: restaurant.latitude,
          lng: restaurant.longitude,
          address: restaurant.address,
        },
        category: restaurant.primary_category,
        rating: restaurant.rating || 0,
        isOpen: isRestaurantOpen(restaurant.opening_hours),
        images: [restaurant.image, restaurant.banner_image].filter(Boolean),
        image: restaurant.image,
        banner: restaurant.banner_image,
        ownerUserId: restaurant.owner_id,
        ownerId: restaurant.owner_id,
        ownerEmail: restaurant.email,
        ownerPhone: restaurant.phone,
        phone: restaurant.phone,
        email: restaurant.email,
        opening_hours: restaurant.opening_hours,
        reviewCount: restaurant.total_reviews || 0,
        status: restaurant.status || "active",
        deliveryTime: restaurant.delivery_time_minutes,
        minOrderAmount: restaurant.min_order_amount,
        createdAt: restaurant.created_at,
        updatedAt: restaurant.updated_at,
      }));
    } catch (error) {
      throw error;
    }
  },

  // GET /restaurants/:id - Chi tiết nhà hàng
  // Note: Returns null if restaurant is not active (for customer-facing apps)
  async getById(id, allowInactive = false) {
    try {
      console.log("restaurantService.getById() called with id:", id);
      console.log("Endpoint:", ENDPOINTS.RESTAURANTS.BY_ID(id));
      const response = await apiClient.get(ENDPOINTS.RESTAURANTS.BY_ID(id));
      console.log("Raw response:", response);

      // Check if restaurant is active (unless allowInactive is true for admin/restaurant-web)
      if (!allowInactive && response.status !== 'active') {
        console.warn(`Restaurant ${id} is not active (status: ${response.status})`);
        return null;
      }

      // Map backend to frontend
      return {
        id: response.id,
        _id: response.id,
        restaurantId: response.id,
        name: response.name,
        description: response.description,
        address: response.address,
        location: {
          lat: response.latitude,
          lng: response.longitude,
          address: response.address,
        },
        category: response.primary_category,
        rating: response.rating || 0,
        isOpen: isRestaurantOpen(response.opening_hours),
        images: [response.image, response.banner_image].filter(Boolean),
        image: response.image,
        banner: response.banner_image,
        ownerUserId: response.owner_id,
        ownerId: response.owner_id,
        ownerEmail: response.email,
        ownerPhone: response.phone,
        phone: response.phone,
        email: response.email,
        opening_hours: response.opening_hours,
        reviewCount: response.total_reviews || 0,
        status: response.status || "active",
        deliveryTime: response.delivery_time_minutes,
        minOrderAmount: response.min_order_amount,
        createdAt: response.created_at,
        updatedAt: response.updated_at,
      };
    } catch (error) {
      throw error;
    }
  },

  // GET /restaurants/:id/menu - Xem menu nhà hàng
  async getMenu(id) {
    try {
      const response = await apiClient.get(ENDPOINTS.RESTAURANTS.MENU(id));

      // Fetch categories to map category_id to category name
      const categoriesResponse = await apiClient.get(ENDPOINTS.CATEGORIES.BASE);
      const categoriesMap = {};
      categoriesResponse.forEach((cat) => {
        categoriesMap[cat.id] = cat.name;
      });

      return response.map((menu) => ({
        id: menu.menu_id || menu.id,
        _id: menu.menu_id || menu.id,
        name: menu.item_name || menu.name,
        restaurantId: menu.restaurant_id,
        price: menu.price,
        description: menu.description,
        image: menu.image, // Support both image_url and image
        isAvailable: menu.is_available,
        category: categoriesMap[menu.category_id] || menu.category || "Other",
        categoryId: menu.category_id,
        rating: menu.rating || 0, // Rating from menu item (calculated in backend)
        sold: menu.sold || 0, // Sold count (calculated from orders in backend)
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
      console.log("=== restaurantService.update called ===");
      console.log("id:", id);
      console.log("restaurantData:", restaurantData);

      // Map frontend (camelCase) to backend (snake_case)
      const payload = {
        name: restaurantData.name,
        description: restaurantData.description,
        address: restaurantData.location?.address || restaurantData.address,
        latitude: restaurantData.location?.lat || restaurantData.latitude,
        longitude: restaurantData.location?.lng || restaurantData.longitude,
        phone: restaurantData.ownerPhone || restaurantData.phone,
        email: restaurantData.ownerEmail || restaurantData.email,
        primary_category: restaurantData.category,
        image: restaurantData.image,
        banner_image: restaurantData.banner || restaurantData.banner_image,
        opening_hours: restaurantData.opening_hours,
        is_open: restaurantData.isOpen,
        status: restaurantData.status,
        delivery_time_minutes: restaurantData.deliveryTime,
        min_order_amount: restaurantData.minOrderAmount,
        updated_at: new Date().toISOString(),
      };

      // Remove undefined values
      Object.keys(payload).forEach(
        (key) => payload[key] === undefined && delete payload[key]
      );

      console.log("payload being sent to API:", payload);

      const response = await apiClient.patch(
        ENDPOINTS.RESTAURANTS.BY_ID(id),
        payload
      );

      console.log("PATCH response:", response);
      console.log("PATCH response opening_hours:", response.opening_hours);

      // Return mapped response - fetch fresh data from API
      const freshData = await this.getById(id);
      console.log("Fresh data from getById:", freshData);
      console.log("Fresh data opening_hours:", freshData.opening_hours);
      return freshData;
    } catch (error) {
      console.error("=== Error in restaurantService.update ===");
      console.error("Error:", error);
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
