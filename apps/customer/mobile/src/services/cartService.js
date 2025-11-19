/**
 * cartService.js - Mobile specific cart API service
 * Gọi API backend để quản lý giỏ hàng
 * 
 * API Endpoints (với /api prefix):
 * GET /api/carts - Lấy giỏ hàng hiện tại
 * POST /api/carts/add - Thêm item vào giỏ
 * PATCH /api/carts/item/:id - Cập nhật item (qty, note)
 * DELETE /api/carts/item/:id - Xóa item khỏi giỏ
 * DELETE /api/carts/clear - Xóa toàn bộ giỏ
 */

import apiClient from './apiClient';

export const cartService = {
    /**
     * Lấy giỏ hàng hiện tại
     * @returns {Object|null} Cart object hoặc null nếu giỏ trống
     */
    async getCart() {
        try {
            const response = await apiClient.get('/carts');
            return response;
        } catch (error) {
            // Nếu error 404 hoặc "not found" → giỏ hàng chưa tồn tại, return null
            if (error.response?.status === 404 || error.message?.toLowerCase().includes('not found')) {
                return null;
            }
            throw error;
        }
    },

    /**
     * Thêm item vào giỏ hàng
     * Nếu khác restaurant thì API sẽ throw error
     * 
     * @param {Object} params
     * @param {string} params.restaurant_id - ID nhà hàng
     * @param {string} params.food_id - ID thực ăn
     * @param {number} params.quantity - Số lượng (default 1)
     * @param {string} params.note - Ghi chú (default "")
     * @returns {Object} Giỏ hàng đã cập nhật
     * @throws {Error} Nếu khác restaurant hoặc lỗi khác
     */
    async addItem({ restaurant_id, food_id, quantity = 1, note = '' }) {
        try {
            console.log('[cartService.addItem] Params:', { restaurant_id, food_id, quantity, note });

            const response = await apiClient.post('/carts/add', {
                restaurant_id,
                food_id,
                quantity,
                note,
            });
            return response;
        } catch (error) {
            console.error('[cartService.addItem] Error:', error.message);
            throw error;
        }
    },

    /**
     * Cập nhật item trong giỏ (số lượng, ghi chú)
     * 
     * @param {Object} params
     * @param {string} params.item_id - ID item trong giỏ
     * @param {number} params.quantity - Số lượng mới
     * @param {string} params.note - Ghi chú mới
     * @returns {Object} Giỏ hàng đã cập nhật
     */
    async updateItem({ item_id, quantity, note = '' }) {
        try {
            const response = await apiClient.patch(`/carts/item/${item_id}`, {
                quantity,
                note,
            });
            return response;
        } catch (error) {
            console.error('[cartService.updateItem] Error:', error.message);
            throw error;
        }
    },

    /**
     * Xóa 1 item khỏi giỏ hàng
     * 
     * @param {string} item_id - ID item cần xóa
     * @returns {Object} Giỏ hàng đã cập nhật
     */
    async removeItem(item_id) {
        try {
            const response = await apiClient.delete(`/carts/item/${item_id}`);
            return response;
        } catch (error) {
            console.error('[cartService.removeItem] Error:', error.message);
            throw error;
        }
    },

    /**
     * Xóa toàn bộ giỏ hàng
     * Sử dụng khi user chuyển sang restaurant khác
     * 
     * @returns {Object} Giỏ hàng trống
     */
    async clearCart() {
        try {
            const response = await apiClient.delete('/carts/clear');
            return response;
        } catch (error) {
            console.error('[cartService.clearCart] Error:', error.message);
            throw error;
        }
    },

    /**
     * Lấy restaurant_id hiện tại trong giỏ
     * Dùng để kiểm tra có thể thêm item từ restaurant khác không
     * 
     * @returns {string|null} Restaurant ID hoặc null nếu giỏ trống
     */
    async getCurrentRestaurantId() {
        try {
            const cart = await this.getCart();
            return cart?.restaurant_id || null;
        } catch (error) {
            console.error('[cartService.getCurrentRestaurantId] Error:', error.message);
            return null;
        }
    },
};
