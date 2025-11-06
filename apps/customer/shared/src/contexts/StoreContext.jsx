import { createContext, useEffect, useState } from "react";
import { foodService, restaurantService, categoryService } from "@api/services";

export const StoreContext = createContext(null);

// StoreContext CHỈ quản lý food_list và restaurant_list
// Auth logic -> AuthContext
// Cart logic -> CartContext
const StoreContextProvider = (props) => {
  const [food_list, setFoodList] = useState([]);
  const [restaurant_list, setRestaurantList] = useState([]);
  const [categories, setCategories] = useState([]);
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

      // Fetch all categories from backend using categoryService
      const allCategories = await categoryService.getAll();
      setCategories(allCategories);

      // Enrich food data with restaurant name and category name
      const enrichedFoods = foods.map((food, index) => {
        const restaurant = restaurants.find((r) => r.id === food.restaurantId);
        const category = allCategories.find((c) => c.id === food.categoryId);

        // Generate pseudo-random rating and sold count based on food id
        // This ensures consistent values for each food item
        const seed = parseInt(food.id) || index;
        const rating = 3.5 + (seed % 15) / 10; // Rating between 3.5 and 5.0
        const sold = 50 + ((seed * 17) % 500); // Sold between 50 and 550

        return {
          ...food,
          restaurant: restaurant?.name || "Unknown Restaurant",
          category: category?.name || "Uncategorized",
          categoryId: food.categoryId, // Keep original categoryId
          rating: parseFloat(rating.toFixed(1)),
          sold: sold,
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
    categories,
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
