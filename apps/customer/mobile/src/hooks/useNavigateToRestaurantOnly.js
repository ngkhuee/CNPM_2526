import { useContext } from 'react';
import { NavigationContext } from '../contexts/NavigationContext';
import { restaurantService } from '../services/restaurantService';

/**
 * useNavigateToRestaurantOnly - Hook để navigate đến restaurant detail (không cần food)
 * 
 * Dùng khi user click vào restaurant card trực tiếp
 * Validate restaurant tồn tại, sau đó navigate
 * 
 * @param {Function} onNavigate - Callback để set activeScreen trong AppNavigator
 * @returns {Function} Handler function để pass vào onPress
 */
export const useNavigateToRestaurantOnly = (onNavigate) => {
    const { setNavigationState, resetNavigationState } = useContext(NavigationContext);

    return async (restaurantId) => {
        try {
            if (!restaurantId) {
                console.error('[useNavigateToRestaurantOnly] Restaurant ID is null/undefined');
                return;
            }

            console.log('[useNavigateToRestaurantOnly] Navigating to restaurant:', restaurantId);

            // VALIDATE: Check nếu restaurant tồn tại trong API
            try {
                const restaurant = await restaurantService.getById(restaurantId);
                if (!restaurant) {
                    console.error(`[useNavigateToRestaurantOnly] Restaurant ${restaurantId} not found`);
                    return;
                }
                console.log('[useNavigateToRestaurantOnly] Restaurant validated:', restaurant.name);
            } catch (restaurantError) {
                console.error('[useNavigateToRestaurantOnly] Error validating restaurant:', restaurantError);
                // Continue anyway - RestaurantDetail sẽ fetch lại
            }

            // SET: Lưu vào Context (xóa highlighted food vì navigating trực tiếp tới restaurant)
            setNavigationState({
                targetRestaurantId: restaurantId,
                highlightedFoodId: null, // No food highlight when clicking restaurant directly
                isNavigating: true,
                navigationData: {
                    source: 'restaurant-card',
                    timestamp: new Date().getTime(),
                },
            });

            // NAVIGATE: Gọi callback để set activeScreen
            if (onNavigate && typeof onNavigate === 'function') {
                onNavigate('restaurant');
            }
        } catch (error) {
            console.error('[useNavigateToRestaurantOnly] Unexpected error:', error);
        }
    };
};
