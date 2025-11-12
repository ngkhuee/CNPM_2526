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
        isOpen: restaurant.is_open !== undefined ? restaurant.is_open : true,
        images: [restaurant.image, restaurant.banner_image].filter(Boolean),
        image: restaurant.image,
        banner: restaurant.banner_image,
        ownerUserId: restaurant.owner_id,
        ownerId: restaurant.owner_id,
        ownerEmail: restaurant.email,
        ownerPhone: restaurant.phone,
        phone: restaurant.phone,
        email: restaurant.email,
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
  async getById(id) {
    try {
      console.log("restaurantService.getById() called with id:", id);
      console.log("Endpoint:", ENDPOINTS.RESTAURANTS.BY_ID(id));
      const response = await apiClient.get(ENDPOINTS.RESTAURANTS.BY_ID(id));
      console.log("Raw response:", response);
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
        isOpen: response.is_open !== undefined ? response.is_open : true,
        images: [response.image, response.banner_image].filter(Boolean),
        image: response.image,
        banner: response.banner_image,
        ownerUserId: response.owner_id,
        ownerId: response.owner_id,
        ownerEmail: response.email,
        ownerPhone: response.phone,
        phone: response.phone,
        email: response.email,
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
        rating: menu.rating || 0, // Rating from menu item
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

      const response = await apiClient.patch(
        ENDPOINTS.RESTAURANTS.BY_ID(id),
        payload
      );

      // Return mapped response
      return this.getById(id);
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
