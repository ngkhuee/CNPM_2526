/**
 * useCheckoutProcessing.js
 * Handle order creation and processing logic
 */

import { useState } from 'react';
import { submitOrder } from '../services/orderService';

export const useCheckoutProcessing = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Group cart items by restaurant
     * @param {Array} items - Cart items
     * @returns {Object} Items grouped by restaurant
     */
    const groupOrdersByRestaurant = (items) => {
        return items.reduce((grouped, item) => {
            const restId = item.restaurant_id;
            if (!grouped[restId]) {
                grouped[restId] = [];
            }
            grouped[restId].push(item);
            return grouped;
        }, {});
    };

    /**
     * Prepare order data for API submission
     * @param {Object} checkoutData - Checkout form data
     * @param {Array} items - Cart items
     * @param {number} deliveryFee - Delivery fee from settings
     * @param {Object} appliedPromo - Applied promotion object
     * @param {string} restaurantId - Restaurant ID from cart
     * @returns {Object} Formatted order payload
     */
    const prepareOrderData = (checkoutData, items, deliveryFee, appliedPromo = null, restaurantId = null) => {
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        let discountAmount = 0;

        if (appliedPromo) {
            if (appliedPromo.type === 'percentage') {
                discountAmount = (subtotal * appliedPromo.value) / 100;
                if (appliedPromo.max_discount && discountAmount > appliedPromo.max_discount) {
                    discountAmount = appliedPromo.max_discount;
                }
            } else if (appliedPromo.type === 'fixed' || appliedPromo.type === 'fixed_amount') {
                discountAmount = appliedPromo.value;
            }
            discountAmount = Math.min(discountAmount, subtotal);
        }

        const totalAmount = subtotal + deliveryFee - discountAmount;

        return {
            restaurant_id: restaurantId || items[0]?.restaurant_id, // Use passed restaurantId or fallback to items[0]
            items: items.map(item => ({
                food_id: item.foodId || item.id || item.food_id || item.menu_id, // Support all field name variations
                name: item.name,
                quantity: item.quantity,
                price: item.price,
            })),
            subtotal: subtotal,
            delivery_fee: deliveryFee,
            discount_amount: discountAmount,
            total_amount: totalAmount,
            payment_method: checkoutData.paymentMethod || 'cash',
            payment_status: 'pending',
            status: 'pending',
            customer: {
                name: checkoutData.customerName || 'Customer',
                phone: checkoutData.phone,
                email: checkoutData.email,
                address: checkoutData.address,
            },
            delivery_address: checkoutData.address,
            delivery_address_id: checkoutData.addressId || null,
            dropoff_gps: checkoutData.gps || null,
            promotion_code: appliedPromo?.code || null,
            promotion_id: appliedPromo?.id || null,
            special_instructions: checkoutData.specialInstructions || '',
            created_at: new Date().toISOString(),
        };
    };

    /**
     * Process checkout - create order
     * @param {Object} checkoutData - All checkout form data
     * @param {Array} cartItems - Items in cart
     * @param {number} deliveryFee - Delivery fee
     * @param {Object} appliedPromo - Applied promotion
     * @param {string} restaurantId - Restaurant ID from cart
     * @returns {Promise<Object>} Created order
     */
    const processCheckoutOrder = async (checkoutData, cartItems, deliveryFee, appliedPromo, restaurantId = null) => {
        setLoading(true);
        setError(null);

        try {
            // Validate required fields
            if (!checkoutData.phone || !checkoutData.address) {
                throw new Error('Phone and address are required');
            }

            if (!Array.isArray(cartItems) || cartItems.length === 0) {
                throw new Error('Cart cannot be empty');
            }

            // Prepare order payload
            const orderPayload = prepareOrderData(checkoutData, cartItems, deliveryFee, appliedPromo, restaurantId);

            console.log('[useCheckoutProcessing] Submitting order:', orderPayload);

            // Submit order
            const order = await submitOrder(orderPayload);

            console.log('[useCheckoutProcessing] Order created:', order);

            return order;
        } catch (err) {
            const errorMsg = err.message || 'Failed to process order';
            console.error('[useCheckoutProcessing] Error:', errorMsg);
            setError(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        groupOrdersByRestaurant,
        prepareOrderData,
        processCheckoutOrder,
    };
};
