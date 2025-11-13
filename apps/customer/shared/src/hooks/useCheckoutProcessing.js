/**
 * Checkout Processing Hook
 * Handles checkout logic, order preparation, and grouping
 * Shared between web and mobile customer apps
 */

import { useState, useCallback } from "react";
import { restaurantService, orderValidationService } from "shared-services";

export const useCheckoutProcessing = (user) => {
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [checkoutError, setCheckoutError] = useState(null);

    /**
     * Group order items by restaurant
     * @param {Array} orderItems - Order items
     * @returns {Object} - Grouped items by restaurant ID
     */
    const groupOrdersByRestaurant = useCallback((orderItems) => {
        const grouped = {};

        orderItems.forEach((item) => {
            if (!grouped[item.restaurantId]) {
                grouped[item.restaurantId] = [];
            }
            grouped[item.restaurantId].push(item);
        });

        return grouped;
    }, []);

    /**
     * Get restaurant pickup location
     * @param {string} restaurantId - Restaurant ID
     * @returns {Promise<Object|null>} - {lat, lng} or null
     */
    const getRestaurantLocation = useCallback(async (restaurantId) => {
        try {
            const restaurant = await restaurantService.getById(restaurantId);
            if (restaurant && restaurant.location) {
                console.log(
                    "📍 Restaurant location:",
                    restaurant.name,
                    restaurant.location
                );
                return restaurant.location;
            }
        } catch (error) {
            console.warn("⚠️ Could not fetch restaurant location:", error);
        }
        return null;
    }, []);

    /**
     * Prepare order data for each restaurant
     * @param {string} restaurantId - Restaurant ID
     * @param {Array} items - Items for this restaurant
     * @param {Object} customer - Customer data
     * @param {string} addressId - Address ID
     * @param {Object} gpsLocation - GPS location
     * @returns {Promise<Object>} - Prepared order data
     */
    const prepareOrderData = useCallback(
        async (
            restaurantId,
            items,
            customer,
            addressId,
            gpsLocation,
            promotion = null
        ) => {
            const pickupGPS = await getRestaurantLocation(restaurantId);

            const subtotal = items.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
            );

            // Calculate discount if promotion applied
            let discountAmount = 0;
            if (promotion) {
                if (promotion.type === "percentage") {
                    discountAmount = (subtotal * promotion.value) / 100;
                    if (promotion.max_discount && discountAmount > promotion.max_discount) {
                        discountAmount = promotion.max_discount;
                    }
                } else if (promotion.type === "fixed_amount") {
                    discountAmount = promotion.value;
                }
            }

            const total = subtotal - discountAmount;

            return {
                customerId: customer.id || "guest",
                restaurantId: restaurantId,
                addressId: addressId || null,
                items: items,
                customer: {
                    name: customer.name,
                    phone: customer.phone,
                    address: customer.address,
                },
                pickup_gps: pickupGPS,
                dropoff_gps: gpsLocation || null,
                promotion_id: promotion?.id || null,
                total_amount: total,
                subtotal: subtotal,
                deliveryFee: 0,
                discountAmount: discountAmount,
                status: "paid",
                payment_method: "online",
            };
        },
        [getRestaurantLocation]
    );

    /**
     * Process checkout with validation
     * @param {Object} customer - Customer data
     * @param {Array} orderItems - Order items
     * @param {string} restaurantId - Restaurant ID (from cart)
     * @param {string} addressId - Address ID
     * @param {Object} gpsLocation - GPS location
     * @param {Object} promotion - Applied promotion
     * @returns {Promise<Object>} - Result with orders array
     */
    const processCheckoutOrders = useCallback(
        async (customer, orderItems, restaurantId, addressId, gpsLocation, promotion = null) => {
            setLoadingSubmit(true);
            setCheckoutError(null);

            try {
                // Validate checkout data
                const validation = orderValidationService.validateCheckoutData({
                    customer,
                    items: orderItems,
                    address: customer.address,
                });

                if (!validation.valid) {
                    setCheckoutError(validation.errors.join(", "));
                    return {
                        success: false,
                        message: "Validation failed: " + validation.errors.join(", "),
                    };
                }

                // Check if restaurantId provided
                if (!restaurantId) {
                    throw new Error("Restaurant ID is required");
                }

                // Only apply promotion if it matches this restaurant
                const applicablePromo = promotion &&
                    (promotion.scope === "system" ||
                        promotion.restaurant_id === restaurantId)
                    ? promotion
                    : null;

                // Prepare order for single restaurant
                const orderData = await prepareOrderData(
                    restaurantId,
                    orderItems,
                    customer,
                    addressId,
                    gpsLocation,
                    applicablePromo
                );

                const orders = [orderData];

                console.log("✅ Orders prepared:", orders);

                return {
                    success: true,
                    orders: orders,
                    addressId: addressId,
                    gpsLocation: gpsLocation,
                };
            } catch (error) {
                console.error("❌ Checkout processing error:", error);
                setCheckoutError(error.message);
                return {
                    success: false,
                    message: error.message || "Error processing checkout",
                };
            } finally {
                setLoadingSubmit(false);
            }
        },
        [groupOrdersByRestaurant, prepareOrderData]
    );

    /**
     * Clear checkout error
     */
    const clearError = useCallback(() => {
        setCheckoutError(null);
    }, []);

    return {
        loadingSubmit,
        checkoutError,
        groupOrdersByRestaurant,
        getRestaurantLocation,
        prepareOrderData,
        processCheckoutOrders,
        clearError,
    };
};
