// Helper functions for image URLs

const API_BASE_URL = (() => {
  // Check for Node/React Native environment first (priority for mobile)
  if (typeof process !== 'undefined' && process.env?.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }
  // Check for Vite environment (web)
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  // Default
  return "http://localhost:4000";
})();

/**
 * Build full image URL from backend path
 * @param {string} imagePath - Path from db.json (e.g., "/images/foods/food_1.png")
 * @returns {string} Full URL
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return "";

  // If already full URL, return as is
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // Build full URL from backend
  return `${API_BASE_URL}${imagePath}`;
};

/**
 * Get food image URL
 * @param {object} food - Food object with image property
 * @returns {string} Full image URL
 */
export const getFoodImageUrl = (food) => {
  return getImageUrl(food?.image);
};

/**
 * Get restaurant image URL
 * @param {object} restaurant - Restaurant object with image property
 * @returns {string} Full image URL
 */
export const getRestaurantImageUrl = (restaurant) => {
  return getImageUrl(restaurant?.image);
};

/**
 * Get restaurant banner URL
 * @param {object} restaurant - Restaurant object with banner property
 * @returns {string} Full banner URL
 */
export const getRestaurantBannerUrl = (restaurant) => {
  return getImageUrl(restaurant?.banner);
};
