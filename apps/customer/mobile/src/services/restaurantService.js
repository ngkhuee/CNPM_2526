/**
 * restaurantService.js - Mobile specific restaurant service
 * Lấy dữ liệu nhà hàng từ API (db.json) + đăng kí nhà hàng mới
 */

import apiClient from './apiClient';

export const restaurantService = {
    /**
     * Lấy tất cả restaurants (chỉ lấy những nhà hàng đã được duyệt và không bị khóa)
     */
    async getAll(params = {}) {
        try {
            const response = await apiClient.get('/restaurants', { params });
            return (Array.isArray(response) ? response : [])
                .filter((restaurant) => restaurant.status === 'active') // Only show approved & not blocked restaurants
                .map((restaurant) => ({
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
                    status: restaurant.status,
                    createdAt: restaurant.created_at,
                    updatedAt: restaurant.updated_at,
                }));
        } catch (error) {
            console.error('[restaurantService.getAll] Error:', error);
            throw error;
        }
    },

    /**
     * Lấy restaurant theo ID (chỉ trả về nếu nhà hàng đã được duyệt)
     */
    async getById(id) {
        try {
            const response = await apiClient.get(`/restaurants/${id}`);
            if (!response) return null;

            // Check if restaurant is active (approved by admin, not blocked)
            if (response.status !== 'active') {
                console.warn(`[restaurantService.getById] Restaurant ${id} is not active (status: ${response.status})`);
                return null;
            }

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
                status: response.status,
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

    /**
     * Validate if email already exists
     * @param {string} email - Email to check
     * @returns {object} { valid: boolean, message: string }
     */
    async validateEmails(email) {
        try {
            // Fetch all users
            const usersResponse = await apiClient.get('/users');
            const users = usersResponse || [];

            // Check if email exists in users
            const existingUser = users.find((u) => u.email === email);
            if (existingUser) {
                return {
                    valid: false,
                    message: 'This email is already registered as a customer account. Please use a different email.',
                };
            }

            // Fetch all restaurants
            const restaurantsResponse = await apiClient.get('/restaurants');
            const restaurants = restaurantsResponse || [];

            // Check if email exists in restaurants
            const existingRestaurant = restaurants.find(
                (r) => r.email === email || r.ownerEmail === email
            );
            if (existingRestaurant) {
                return {
                    valid: false,
                    message: 'This email is already registered. Please use a different email.',
                };
            }

            return {
                valid: true,
                message: 'Email is available',
            };
        } catch (error) {
            console.error('Error validating emails:', error);
            throw error;
        }
    },

    /**
     * Register new restaurant
     * @param {object} restaurantData - Restaurant information
     * @returns {object} { success, restaurant, message }
     */
    async registerRestaurant(restaurantData) {
        try {
            const response = await apiClient.post('/restaurants/register', restaurantData);
            return response;
        } catch (error) {
            console.error('Error registering restaurant:', error);
            throw error;
        }
    },

    /**
     * Register restaurant owner user
     * @param {object} userData - Owner user information
     * @returns {object} { success, user, message }
     */
    async registerOwner(userData) {
        try {
            const response = await apiClient.post('/users/register-owner', userData);
            return response;
        } catch (error) {
            console.error('Error registering owner:', error);
            throw error;
        }
    },

    /**
     * Check registration status
     * @param {string} userId - User ID
     * @returns {object} user object with status
     */
    async checkRegistrationStatus(userId) {
        try {
            const response = await apiClient.get(`/users/${userId}`);
            return response;
        } catch (error) {
            console.error('Error checking status:', error);
            throw error;
        }
    },
};
