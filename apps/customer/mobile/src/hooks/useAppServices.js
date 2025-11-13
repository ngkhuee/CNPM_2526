/**
 * useAppServices - Custom hook to access all mobile services
 * Simplifies imports and provides centralized service access
 */
import {
    authService,
    restaurantService,
    foodService,
    orderService,
    cartService,
    categoryService,
    reviewService,
    paymentService,
    promotionService,
    addressService,
    uploadService,
} from '../services';

export const useAppServices = () => {
    return {
        authService,
        restaurantService,
        foodService,
        orderService,
        cartService,
        categoryService,
        reviewService,
        paymentService,
        promotionService,
        addressService,
        uploadService,
    };
};
