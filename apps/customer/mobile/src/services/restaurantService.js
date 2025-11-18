/**
 * restaurantService.js - Mobile specific restaurant service
 * Lấy dữ liệu nhà hàng từ API (db.json)
 */

import apiClient from './apiClient';

export const restaurantService = {
    /**
     * Lấy tất cả restaurants
     */
    async getAll(params = {}) {
        try {
            const response = await apiClient.get('/restaurants', { params });
            return (Array.isArray(response) ? response : []).map((restaurant) => ({
                id: restaurant.id,
                name: restaurant.name,
                description: restaurant.description,
                address: restaurant.address,
                latitude: restaurant.latitude,
                longitude: restaurant.longitude,
                phone: restaurant.phone,
                email: restaurant.email,
                image: restaurant.image,
                bannerImage: restaurant.banner_image,
                primaryCategory: restaurant.primary_category,
                rating: restaurant.rating || 0,
                totalReviews: restaurant.total_reviews || 0,
                isOpen: restaurant.is_open,
                openingHours: restaurant.opening_hours,
                deliveryTimeMinutes: restaurant.delivery_time_minutes,
                minOrderAmount: restaurant.min_order_amount,
                createdAt: restaurant.created_at,
                updatedAt: restaurant.updated_at,
            }));
        } catch (error) {
            console.error('[restaurantService.getAll] Error:', error);
            throw error;
        }
    },

    /**
     * Lấy restaurant theo ID
     */
    async getById(id) {
        try {
            const response = await apiClient.get(`/restaurants/${id}`);
            if (!response) return null;

            return {
                id: response.id,
                name: response.name,
                description: response.description,
                address: response.address,
                latitude: response.latitude,
                longitude: response.longitude,
                phone: response.phone,
                email: response.email,
                image: response.image,
                bannerImage: response.banner_image,
                primaryCategory: response.primary_category,
                rating: response.rating || 0,
                totalReviews: response.total_reviews || 0,
                isOpen: response.is_open,
                openingHours: response.opening_hours,
                deliveryTimeMinutes: response.delivery_time_minutes,
                minOrderAmount: response.min_order_amount,
                createdAt: response.created_at,
                updatedAt: response.updated_at,
            };
        } catch (error) {
            console.error('[restaurantService.getById] Error:', error);
            throw error;
        }
    },

    /**
     * Lấy menu (foods) của restaurant
     */
    async getMenu(restaurantId) {
        try {
            const response = await apiClient.get(`/restaurants/${restaurantId}/menu`);
            return (Array.isArray(response) ? response : []).map((menu) => ({
                id: menu.id,
                name: menu.name,
                restaurantId: menu.restaurant_id,
                categoryId: menu.category_id,
                price: menu.price,
                description: menu.description,
                image: menu.image,
                isAvailable: menu.is_available,
                preparationTime: menu.preparation_time_minutes,
                rating: menu.rating || 0,
                sold: menu.sold || 0,
                createdAt: menu.created_at,
                updatedAt: menu.updated_at,
            }));
        } catch (error) {
            console.error('[restaurantService.getMenu] Error:', error);
            throw error;
        }
    },
};
