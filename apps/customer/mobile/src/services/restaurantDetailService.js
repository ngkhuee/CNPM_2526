/**
 * RestaurantDetailService
 * Quản lý logic lấy dữ liệu cho trang RestaurantDetail
 * 
 * Tách riêng từ component để:
 * - Dễ test
 * - Reusable
 * - Centralized error handling
 */

import { foodService } from './foodService';
import { restaurantService } from './restaurantService';

export const restaurantDetailService = {
    /**
     * Lấy thông tin nhà hàng + menu (foods)
     * @param {string} restaurantId - ID nhà hàng
     * @returns {Promise} { restaurant, foods }
     */
    async getRestaurantWithFoods(restaurantId) {
        try {
            console.log('[restaurantDetailService] Fetching restaurant:', restaurantId);

            // Fetch restaurant info
            const restaurant = await restaurantService.getById(restaurantId);
            if (!restaurant) {
                throw new Error(`Restaurant ${restaurantId} not found`);
            }

            console.log('[restaurantDetailService] Restaurant fetched:', restaurant.name);

            // Fetch menu/foods từ API
            // Sử dụng getByRestaurant nếu available, fallback to getAll với filter
            let foods = [];
            try {
                foods = await restaurantService.getMenu(restaurantId);
            } catch (error) {
                console.warn('[restaurantDetailService] getMenu failed, trying getAll with filter:', error);
                // Fallback: fetch all foods và filter
                const allFoods = await foodService.getAll();
                foods = allFoods.filter((f) => f.restaurantId === restaurantId);
            }

            console.log('[restaurantDetailService] Foods fetched:', foods.length);

            return {
                restaurant,
                foods,
            };
        } catch (error) {
            console.error('[restaurantDetailService] Error:', error);
            throw error;
        }
    },

    /**
     * Tìm food theo ID trong list
     * @param {array} foods - List foods
     * @param {number} foodId - ID food cần tìm
     * @returns {object|null} Food object hoặc null
     */
    findFoodById(foods, foodId) {
        if (!Array.isArray(foods) || !foodId) {
            return null;
        }

        const food = foods.find((f) => f.id === foodId);
        if (!food) {
            console.warn(`[restaurantDetailService] Food ${foodId} not found in list`);
            return null;
        }

        return food;
    },

    /**
     * Tính toán position của food trong grid
     * @param {array} foods - List foods
     * @param {number} foodId - ID food
     * @param {number} itemsPerRow - Items trên 1 hàng (mặc định 2)
     * @returns {number} Index position
     */
    calculateFoodPosition(foods, foodId, itemsPerRow = 2) {
        if (!Array.isArray(foods)) {
            return 0;
        }

        const index = foods.findIndex((f) => f.id === foodId);
        if (index === -1) {
            console.warn(`[restaurantDetailService] Cannot calculate position for food ${foodId}`);
            return 0;
        }

        return index;
    },
};
