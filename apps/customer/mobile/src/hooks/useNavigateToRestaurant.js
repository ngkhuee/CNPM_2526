import { useContext } from 'react';
import { NavigationContext } from '../contexts/NavigationContext';
import { foodService } from '../services/foodService';
import { restaurantService } from '../services/restaurantService';

/**
 * useNavigateToRestaurant - Hook an toàn để navigate từ food đến restaurant detail
 * 
 * Functionality:
 * - Validate restaurantId & foodId từ API (từ db.json)
 * - Store state vào Context (tránh prop drilling)
 * - Trigger navigation qua onNavigate callback
 * - Error handling & logging
 * 
 * @param {Function} onNavigate - Callback để set activeScreen trong AppNavigator
 * @returns {Function} Handler function để pass vào onPress
 */
export const useNavigateToRestaurant = (onNavigate) => {
    const { setNavigationState } = useContext(NavigationContext);

    return async (food) => {
        try {
            if (!food) {
                console.error('[useNavigateToRestaurant] Food item is null/undefined');
                return;
            }

            const foodId = food.id;
            const restaurantId = food.restaurantId;

            if (!restaurantId || !foodId) {
                console.error(
                    '[useNavigateToRestaurant] Missing restaurantId or foodId',
                    { foodId, restaurantId }
                );
                return;
            }

            console.log('[useNavigateToRestaurant] Navigating to restaurant:', {
                restaurantId,
                foodId,
                foodName: food.name,
            });

            // VALIDATE: Check nếu restaurant tồn tại trong API
            try {
                const restaurant = await restaurantService.getById(restaurantId);
                if (!restaurant) {
                    console.error(`[useNavigateToRestaurant] Restaurant ${restaurantId} not found`);
                    return;
                }
                console.log('[useNavigateToRestaurant] Restaurant validated:', restaurant.name);
            } catch (restaurantError) {
                console.error('[useNavigateToRestaurant] Error validating restaurant:', restaurantError);
                // Continue anyway - RestaurantDetail sẽ fetch lại
            }

            // VALIDATE: Check nếu food tồn tại trong API
            try {
                const foodData = await foodService.getById(foodId);
                if (!foodData) {
                    console.error(`[useNavigateToRestaurant] Food ${foodId} not found`);
                    return;
                }
                console.log('[useNavigateToRestaurant] Food validated:', foodData.name);
            } catch (foodError) {
                console.error('[useNavigateToRestaurant] Error validating food:', foodError);
                // Continue anyway - RestaurantDetail sẽ fetch lại
            }

            // STORE: Lưu state vào Context (toàn app có thể access)
            setNavigationState({
                targetRestaurantId: restaurantId,
                highlightedFoodId: foodId,
                isNavigating: true,
                navigationData: {
                    foodName: food.name,
                    timestamp: new Date().getTime(),
                },
            });

            // NAVIGATE: Gọi callback để set activeScreen
            if (onNavigate && typeof onNavigate === 'function') {
                onNavigate('restaurant');
            }
        } catch (error) {
            console.error('[useNavigateToRestaurant] Unexpected error:', error);
            // TODO: Có thể hiển thị toast/alert cho user
        }
    };
};
