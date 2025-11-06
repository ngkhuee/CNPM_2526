export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    ME: "/users",
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
    BY_USER: (userId) => `/carts?user_id=${userId}`,
    BY_ID: (id) => `/carts/${id}`,
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
    BY_RESTAURANT: (restaurantId) => `/reviews?restaurantId=${restaurantId}`,
  },

  PAYMENTS: {
    BASE: "/payments",
    BY_ID: (id) => `/payments/${id}`,
    BY_ORDER: (orderId) => `/payments?orderId=${orderId}`,
    PROCESS: "/payments/process",
    CALLBACK: "/payments/callback",
  },

  ADDRESSES: {
    BASE: "/addresses",
    BY_USER: (userId) => `/addresses?user_id=${userId}`,
    BY_ID: (id) => `/addresses/${id}`,
  },

  NOTIFICATIONS: {
    BASE: "/notifications",
    BY_USER: (userId) => `/notifications?userId=${userId}`,
    BY_ID: (id) => `/notifications/${id}`,
    MARK_READ: (id) => `/notifications/${id}`,
  },

  SESSIONS: {
    BASE: "/sessions",
    BY_USER: (userId) => `/sessions?userId=${userId}`,
    REVOKE: (id) => `/sessions/${id}`,
  },

  DRONES: {
    BASE: "/drones",
    BY_ID: (id) => `/drones/${id}`,
    BY_STATUS: (status) => `/drones?status=${status}`,
    AVAILABLE: "/drones?status=available",
  },

  SETTINGS: {
    BASE: "/settings",
    BY_KEY: (key) => `/settings?key=${key}`,
    BY_CATEGORY: (category) => `/settings?category=${category}`,
    DELIVERY_FEE: "/settings?key=delivery_fee",
  },
};
