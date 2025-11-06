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

  // Fetch data on mount - CHỈ GỌI fetchFoods (đã bao gồm restaurants)
  useEffect(() => {
    fetchFoods();
  }, []);

  // Fetch foods from API - ĐỒNG THỜI fetch restaurants và categories
  const fetchFoods = async () => {
    try {
      setLoading(true);

      // Fetch all data PARALLEL để tăng performance
      const [foods, allRestaurants, allCategories] = await Promise.all([
        foodService.getAll(),
        restaurantService.getAll(),
        categoryService.getAll(),
      ]);

      // Filter only ACTIVE restaurants (approved by admin)
      const activeRestaurants = allRestaurants.filter(
        (r) => r.status === "active"
      );

      console.log(
        `🏪 Restaurants: ${activeRestaurants.length} active / ${allRestaurants.length} total`
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
        .map((food, index) => {
          const restaurant = activeRestaurants.find(
            (r) => r.id === food.restaurantId
          );
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
    } catch (error) {
      console.error("Error fetching foods:", error);
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
