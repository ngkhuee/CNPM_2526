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
        primary_category: restaurant.primary_category || 'Other',
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
        restaurant_id: food.restaurant_id || '',
        name: food.name || 'Unknown',
        description: food.description || '',
        price: food.price || 0,
        image: food.image || '/images/foods/default.png',
        rating: food.rating || 0,
        is_available: food.is_available !== undefined ? food.is_available : true,
        ...food
    };
};

/**
 * Transform array of restaurants
 */
export const transformRestaurants = (restaurants) => {
    if (!Array.isArray(restaurants)) return [];
    return restaurants
        .map(transformRestaurant)
        .filter(item => item !== null && item !== undefined);
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
