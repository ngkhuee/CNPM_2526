import React, { useState, useEffect } from "react";
import Header from "../../components/Header/Header";
import ExploreMenu from "../../components/ExploreMenu/ExploreMenu";
import FoodDisplay from "../../components/FoodDisplay/FoodDisplay";
import RestaurantDisplay from "../../components/RestaurantDisplay/RestaurantDisplay";
import AppDownload from "../../components/AppDownload/AppDownload";
import { MdLocationOn, MdRestaurant, MdWarning } from "react-icons/md";

const Home = () => {
  const [selectedFilter, setSelectedFilter] = useState("Top Rated");
  const [userLocation, setUserLocation] = useState(null);
  const [locationPermissionDenied, setLocationPermissionDenied] =
    useState(false);

  // Function to request GPS location
  const requestLocation = () => {
    if (!navigator.geolocation) {
      console.log("Geolocation not supported");
      setLocationPermissionDenied(true);
      return;
    }

    console.log("Requesting GPS location...");

    // Request user location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("GPS location granted:", position.coords);
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationPermissionDenied(false);
      },
      (error) => {
        console.error("GPS error:", error.code, error.message);
        setLocationPermissionDenied(true);
        setUserLocation(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Request GPS location on mount
  useEffect(() => {
    requestLocation();
  }, []);

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
