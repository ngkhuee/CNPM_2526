import React, { createContext, useState, useEffect } from "react";
import { restaurantService } from "shared-services";

export const RestaurantContext = createContext();

export const RestaurantProvider = ({ children }) => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch restaurants on mount
  useEffect(() => {
    fetchRestaurants();
  }, []);

  // Fetch restaurants from API (for customer to view and select)
  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const restaurants = await restaurantService.getAll();
      setPartners(restaurants);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RestaurantContext.Provider
      value={{
        partners,
        fetchRestaurants,
        loading,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export default RestaurantProvider;
