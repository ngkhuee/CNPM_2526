/**
 * Transform restaurant data from backend to ensure all required fields exist
 */
export const transformRestaurant = (restaurant) => {
    if (!restaurant) return null;

    return {
        id: restaurant.id || '',
        name: restaurant.name || 'Unknown',
        image: restaurant.image || '/images/restaurants/default.png',
        banner_image: restaurant.banner_image || restaurant.image || '/images/restaurants/default.png',
        rating: restaurant.rating || 0,
        total_reviews: restaurant.total_reviews || 0,
        delivery_time_minutes: restaurant.delivery_time_minutes || 30,
        description: restaurant.description || '',
        address: restaurant.address || '',
        phone: restaurant.phone || '',
        email: restaurant.email || '',
        is_open: restaurant.is_open !== undefined ? restaurant.is_open : true,
        ...restaurant
    };
};

/**
 * Transform menu/food data from backend to ensure all required fields exist
 */
export const transformFood = (food) => {
    if (!food) return null;

    return {
        id: food.id || '',
        restaurantId: food.restaurant_id || food.restaurantId || '',
        name: food.name || 'Unknown',
        description: food.description || '',
        price: food.price || 0,
        image: food.image || '/images/foods/default.png',
        rating: food.rating || 0,
        sold: food.sold || 0,
        isAvailable: food.is_available !== undefined ? food.is_available : true,
        ...food
    };
};

/**
 * Transform array of restaurants
 * Only returns ACTIVE restaurants (approved by admin, not blocked)
 */
export const transformRestaurants = (restaurants) => {
    if (!Array.isArray(restaurants)) return [];
    return restaurants
        .map(transformRestaurant)
        .filter(item => item !== null && item !== undefined)
        .filter(item => item.status === 'active'); // Only show approved & not blocked restaurants
};

/**
 * Transform array of foods
 */
export const transformFoods = (foods) => {
    if (!Array.isArray(foods)) return [];
    return foods
        .map(transformFood)
        .filter(item => item !== null && item !== undefined);
};
