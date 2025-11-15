import { createContext, useEffect, useState } from "react";
import { foodService, restaurantService, categoryService } from "shared-services";

export const StoreContext = createContext(null);

// StoreContext CHỈ quản lý food_list và restaurant_list
// Auth logic -> AuthContext
// Cart logic -> CartContext
const StoreContextProvider = (props) => {
  const [food_list, setFoodList] = useState([]);
  const [restaurant_list, setRestaurantList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch data on mount - CHỈ GỌI fetchFoods (đã bao gồm restaurants)
  useEffect(() => {
    console.log('[StoreContext] useEffect triggered - calling fetchFoods');
    fetchFoods();
  }, []);

  // Fetch foods from API - ĐỒNG THỜI fetch restaurants và categories
  const fetchFoods = async () => {
    try {
      console.log('[StoreContext] fetchFoods() started');
      setLoading(true);

      // Fetch all data PARALLEL để tăng performance
      const [foods, allRestaurants, allCategories] = await Promise.all([
        foodService.getAll(),
        restaurantService.getAll(),
        categoryService.getAll(),
      ]);

      console.log('[StoreContext] API responses received:', {
        foods: foods?.length,
        restaurants: allRestaurants?.length,
        categories: allCategories?.length,
      });

      // Filter only ACTIVE restaurants (approved by admin)
      const activeRestaurants = allRestaurants.filter(
        (r) => r.status === "active"
      );

      console.log(
        `[StoreContext] 🏪 Restaurants: ${activeRestaurants.length} active / ${allRestaurants.length} total`
      );

      setCategories(allCategories);
      setRestaurantList(activeRestaurants);

      // Enrich food data with restaurant name and category name
      // ONLY include foods from ACTIVE restaurants
      const enrichedFoods = foods
        .filter((food) => {
          const restaurant = activeRestaurants.find(
            (r) => r.id === food.restaurantId
          );
          return restaurant !== undefined; // Only include if restaurant is active
        })
        .map((food) => {
          const restaurant = activeRestaurants.find(
            (r) => r.id === food.restaurantId
          );
          const category = allCategories.find((c) => c.id === food.categoryId);

          return {
            ...food,
            restaurant: restaurant?.name || "Unknown Restaurant",
            category: category?.name || "Uncategorized",
            categoryId: food.categoryId, // Keep original categoryId
            // Rating and sold now come from API (no hard-code)
          };
        });

      setFoodList(enrichedFoods);
      console.log('[StoreContext] fetchFoods() completed successfully:', {
        enrichedFoods: enrichedFoods.length,
      });
    } catch (error) {
      console.error("[StoreContext] Error fetching foods:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch restaurants from API - RIÊNG BIỆT nếu cần refresh
  const fetchRestaurants = async () => {
    try {
      const allRestaurants = await restaurantService.getAll();
      // Filter only ACTIVE restaurants
      const activeRestaurants = allRestaurants.filter(
        (r) => r.status === "active"
      );
      setRestaurantList(activeRestaurants);
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
