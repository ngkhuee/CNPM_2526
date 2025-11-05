import { createContext, useEffect, useState } from "react";
import { foodService, restaurantService } from "@api/services";

export const StoreContext = createContext(null);

// StoreContext giờ CHỈ quản lý food_list và restaurant_list (data fetching only)
// Auth logic -> AuthContext
// Cart logic -> CartContext
const StoreContextProvider = (props) => {
  const [food_list, setFoodList] = useState([]);
  const [restaurant_list, setRestaurantList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    fetchFoods();
    fetchRestaurants();
  }, []);

  // Fetch foods from API
  const fetchFoods = async () => {
    try {
      setLoading(true);
      const foods = await foodService.getAll();
      const restaurants = await restaurantService.getAll();

      // Enrich food data with restaurant name and category name
      const enrichedFoods = foods.map((food) => {
        const restaurant = restaurants.find((r) => r.id === food.restaurantId);
        return {
          ...food,
          restaurant: restaurant?.name || "Unknown Restaurant",
          category: food.categoryId,
        };
      });

      setFoodList(enrichedFoods);
      setRestaurantList(restaurants);
    } catch (error) {
      console.error("Error fetching foods:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch restaurants from API
  const fetchRestaurants = async () => {
    try {
      const restaurants = await restaurantService.getAll();
      setRestaurantList(restaurants);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    }
  };

  const contextValue = {
    food_list,
    restaurant_list,
    loading,
    fetchFoods,
    fetchRestaurants,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
