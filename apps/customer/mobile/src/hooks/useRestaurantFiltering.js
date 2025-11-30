import { useMemo } from 'react';

/**
 * useRestaurantFiltering - Shared hook for filtering restaurants by search query
 * Eliminates duplicate filtering logic across ExploreScreen and SearchResultsScreen
 * 
 * Logic:
 * - Filter active restaurants only
 * - Group foods by restaurant
 * - If search query matches restaurant name -> show ALL foods from that restaurant
 * - If search query doesn't match restaurant name -> only show matching foods
 * - Only return restaurants that have at least 1 food after filtering
 * 
 * @param {Array} restaurantList - List of all restaurants
 * @param {Array} foodList - List of all foods
 * @param {String} searchQuery - Search query string (optional)
 * @returns {Object} { restaurantsWithFoods, totalResults }
 */
export const useRestaurantFiltering = (restaurantList, foodList, searchQuery = '') => {
    const restaurantsWithFoods = useMemo(() => {
        return restaurantList
            .filter(restaurant => restaurant.status === 'active')
            .map(restaurant => {
                // Get all available foods from this restaurant
                let restaurantFoods = foodList.filter(
                    food => food.restaurantId === restaurant.id && food.isAvailable !== false
                );

                // Filter by search query
                if (searchQuery) {
                    const query = searchQuery.toLowerCase();
                    const matchRestaurant = restaurant.name.toLowerCase().includes(query);

                    // If restaurant name matches, show all foods
                    // Otherwise, only show foods that match the query
                    if (!matchRestaurant) {
                        restaurantFoods = restaurantFoods.filter(food =>
                            food.name.toLowerCase().includes(query) ||
                            (food.description && food.description.toLowerCase().includes(query))
                        );
                    }
                }

                return {
                    ...restaurant,
                    foods: restaurantFoods,
                };
            })
            .filter(restaurant => restaurant.foods.length > 0);
    }, [restaurantList, foodList, searchQuery]);

    const totalResults = useMemo(() => {
        return restaurantsWithFoods.reduce((sum, r) => sum + r.foods.length, 0);
    }, [restaurantsWithFoods]);

    return {
        restaurantsWithFoods,
        totalResults,
    };
};
