import { useState, useEffect } from "react";
import { restaurantService } from "shared-services";

/**
 * Custom hook for restaurant detail page
 * Shared between web and mobile
 *
 * @param {string} restaurantId - Restaurant ID
 * @returns {Object} - Restaurant data, menu items, loading states, and error
 */
const useRestaurantDetail = (restaurantId) => {
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuLoading, setMenuLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Fetch restaurant details
  useEffect(() => {
    if (!restaurantId) {
      setLoading(false);
      return;
    }

    const fetchRestaurant = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await restaurantService.getById(restaurantId);
        setRestaurant(data);
      } catch (err) {
        console.error("Error fetching restaurant:", err);
        setError(err.message || "Failed to load restaurant");
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [restaurantId]);

  // Fetch restaurant menu
  useEffect(() => {
    if (!restaurantId) {
      setMenuLoading(false);
      return;
    }

    const fetchMenu = async () => {
      try {
        setMenuLoading(true);
        const data = await restaurantService.getMenu(restaurantId);

        // Menu items now have rating and sold from backend
        // No need to enrich with hard-coded values
        setMenuItems(data);
      } catch (err) {
        console.error("Error fetching menu:", err);
        // Don't set error here, just log it
        setMenuItems([]);
      } finally {
        setMenuLoading(false);
      }
    };

    fetchMenu();
  }, [restaurantId]);

  // Get unique categories from menu items
  const categories = [
    "All",
    ...new Set(menuItems.map((item) => item.category).filter(Boolean)),
  ];

  // Filter menu items by selected category
  const filteredMenuItems =
    selectedCategory === "All"
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  return {
    restaurant,
    menuItems,
    filteredMenuItems,
    categories,
    selectedCategory,
    setSelectedCategory,
    loading,
    menuLoading,
    error,
  };
};

export default useRestaurantDetail;
