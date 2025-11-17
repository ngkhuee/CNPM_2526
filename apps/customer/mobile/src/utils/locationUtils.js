// Calculate distance between two coordinates in kilometers
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// Get nearby restaurants (within 5km)
export const getNearbyRestaurants = (restaurants, userLocation, limit = 5) => {
    if (!userLocation || !restaurants || restaurants.length === 0) {
        return [];
    }

    const { latitude: userLat, longitude: userLon } = userLocation;

    const nearby = restaurants
        .map((restaurant) => {
            const distance = calculateDistance(
                userLat,
                userLon,
                restaurant.latitude || 0,
                restaurant.longitude || 0
            );
            return { ...restaurant, distance };
        })
        .filter((r) => r.distance <= 5) // Only within 5km
        .sort((a, b) => a.distance - b.distance)
        .slice(0, limit);

    return nearby;
};
