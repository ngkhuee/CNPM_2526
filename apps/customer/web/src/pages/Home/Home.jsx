import React, { useState, useEffect, useContext } from "react";
import Header from "../../components/Header/Header";
import ExploreMenu from "../../components/ExploreMenu/ExploreMenu";
import FoodDisplay from "../../components/FoodDisplay/FoodDisplay";
import RestaurantDisplay from "../../components/RestaurantDisplay/RestaurantDisplay";
import AppDownload from "../../components/AppDownload/AppDownload";
import { GeolocationContext } from "customer-shared";
import { MdLocationOn, MdRestaurant, MdWarning } from "react-icons/md";

const Home = () => {
  const [selectedFilter, setSelectedFilter] = useState("Top Rated");
  const { userLocation, requestLocation } = useContext(GeolocationContext);

  // Request GPS location on mount
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return (
    <>
      <Header />

      {/* Nearby Restaurants Section - Only show when GPS is granted */}
      {userLocation && (
        <ExploreMenu
          selected="Nearby"
          userLocation={userLocation}
          showOnlyNearby={true}
        />
      )}

      {/* Discover Delicious Food Section - Always show */}
      <ExploreMenu
        selected={selectedFilter}
        setSelected={setSelectedFilter}
        userLocation={null}
        showOnlyNearby={false}
      />

      {/* Top Rated / Best Selling Dishes */}
      <FoodDisplay
        filterBy="featured"
        filterValue={selectedFilter}
        showFilter={false}
      />

      {/* All Restaurants Section - Always show */}
      <RestaurantDisplay showAllRestaurants={true} />

      <AppDownload />
    </>
  );
};

export default Home;
