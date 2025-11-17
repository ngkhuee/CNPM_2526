import { useState, useEffect, useContext } from "react";
import { restaurantService, authService } from "shared-services";
import { RestaurantContext } from "../Context/RestaurantContext";

export const useRestaurantInfo = () => {
    const { setCurrentRestaurant, currentRestaurant } = useContext(RestaurantContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch restaurant info on mount
    useEffect(() => {
        const initializeRestaurant = async () => {
            try {
                const user = await authService.getCurrentUser();
                console.log("useRestaurantInfo - user loaded:", user);
                if (user?.role === "restaurant" && user?.restaurantId && /^r\d+$/.test(user.restaurantId)) {
                    console.log("useRestaurantInfo - fetching restaurant data for:", user.restaurantId);
                    await fetchRestaurantInfo(user.restaurantId);
                } else {
                    console.warn("useRestaurantInfo - User is not restaurant or no restaurantId:", user);
                }
            } catch (err) {
                console.error("Error initializing restaurant info:", err);
            }
        };

        initializeRestaurant();
    }, []);

    const fetchRestaurantInfo = async (restaurantId) => {
        try {
            setLoading(true);
            setError(null);
            console.log("Fetching restaurant info for ID:", restaurantId);
            const restaurant = await restaurantService.getById(restaurantId);
            console.log("Restaurant info fetched:", restaurant);
            setCurrentRestaurant(restaurant);
            return { success: true, restaurant };
        } catch (err) {
            console.error("Error fetching restaurant info:", err);
            setError(err.message);
            return { success: false, message: err.message };
        } finally {
            setLoading(false);
        }
    };

    const updateRestaurant = async (restaurantId, data) => {
        try {
            setLoading(true);
            const updated = await restaurantService.update(restaurantId, data);
            setCurrentRestaurant(updated);
            return { success: true, restaurant: updated };
        } catch (err) {
            console.error("Error updating restaurant:", err);
            setError(err.message);
            return { success: false, message: err.message };
        } finally {
            setLoading(false);
        }
    };

    return {
        currentRestaurant,
        fetchRestaurantInfo,
        updateRestaurant,
        loading,
        error,
    };
};
