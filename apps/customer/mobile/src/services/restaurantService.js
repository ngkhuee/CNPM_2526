/**
 * Restaurant Service for Mobile
 * Data mapping layer - converts backend (snake_case) to frontend (camelCase)
 * Mirrors shared-services logic but works with mobile API client
 */
import apiClient, { ENDPOINTS } from '../config/apiClient';

export const restaurantService = {
    async getAll(params = {}) {
        try {
            console.log('[restaurantService] getAll() called');
            const response = await apiClient.get(ENDPOINTS.RESTAURANTS.BASE, { params });
            console.log('[restaurantService] getAll() response:', response);

            if (!Array.isArray(response)) {
                console.warn('[restaurantService] Response is not array:', typeof response);
                return [];
            }

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
                status: restaurant.status || 'active',
                deliveryTime: restaurant.delivery_time_minutes,
                minOrderAmount: restaurant.min_order_amount,
                createdAt: restaurant.created_at,
                updatedAt: restaurant.updated_at,
            }));
        } catch (error) {
            console.error('[restaurantService] getAll() error:', error.message, error);
            throw error;
        }
    },

    async getById(id) {
        try {
            const response = await apiClient.get(ENDPOINTS.RESTAURANTS.BY_ID(id));
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
                status: response.status || 'active',
                deliveryTime: response.delivery_time_minutes,
                minOrderAmount: response.min_order_amount,
                createdAt: response.created_at,
                updatedAt: response.updated_at,
            };
        } catch (error) {
            throw error;
        }
    },

    async getMenu(id) {
        try {
            const response = await apiClient.get(ENDPOINTS.RESTAURANTS.MENU(id));
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
                image: menu.image,
                isAvailable: menu.is_available,
                category: categoriesMap[menu.category_id] || menu.category || 'Other',
                categoryId: menu.category_id,
                rating: menu.rating || 0,
                sold: menu.sold || 0,
                createdAt: menu.created_at,
            }));
        } catch (error) {
            throw error;
        }
    },

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
            Object.keys(payload).forEach(
                (key) => payload[key] === undefined && delete payload[key]
            );
            await apiClient.patch(ENDPOINTS.RESTAURANTS.BY_ID(id), payload);
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

export default restaurantService;
