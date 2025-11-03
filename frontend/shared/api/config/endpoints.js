export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    ME: "/accounts",
  },

  RESTAURANTS: {
    BASE: "/restaurants",
    BY_ID: (id) => `/restaurants/${id}`,
    MENU: (id) => `/restaurants/${id}/menu`,
    ORDERS: (id) => `/orders?restaurantId=${id}`,
  },

  MENUS: {
    BASE: "/menus",
    BY_ID: (id) => `/menu/${id}`,
    BY_RESTAURANT: (restaurantId) => `/menus?restaurant_id=${restaurantId}`,
    BY_CATEGORY: (categoryId) => `/menus?category=${categoryId}`,
    SEARCH: (query) => `/menus?q=${query}`,
  },

  // Backward compatibility
  FOODS: {
    BASE: "/menus",
    BY_ID: (id) => `/menu/${id}`,
    BY_RESTAURANT: (restaurantId) => `/menus?restaurant_id=${restaurantId}`,
    BY_CATEGORY: (categoryId) => `/menus?category=${categoryId}`,
    SEARCH: (query) => `/menus?q=${query}`,
  },

  CATEGORIES: {
    BASE: "/categories",
    BY_ID: (id) => `/categories/${id}`,
  },

  ORDERS: {
    BASE: "/orders",
    BY_ID: (id) => `/orders/${id}`,
    BY_USER: (userId) => `/orders?customerId=${userId}`,
    BY_RESTAURANT: (restaurantId) => `/orders?restaurantId=${restaurantId}`,
  },

  CART: {
    BASE: "/carts",
    BY_USER: (userId) => `/carts?userId=${userId}`,
    ADD_ITEM: (userId) => `/carts/${userId}/add`,
    REMOVE_ITEM: (userId, foodId) => `/carts/${userId}/items/${foodId}`,
    CLEAR: (userId) => `/carts/${userId}/clear`,
  },

  PROMOTIONS: {
    BASE: "/promotions",
    BY_CODE: (code) => `/promotions?code=${code}`,
    ACTIVE: "/promotions?status=active",
  },

  REVIEWS: {
    BASE: "/reviews",
    BY_FOOD: (foodId) => `/reviews?foodId=${foodId}`,
    BY_USER: (userId) => `/reviews?userId=${userId}`,
  },
};
