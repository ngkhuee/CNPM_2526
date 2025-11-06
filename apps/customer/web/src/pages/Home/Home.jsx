import React, { useState, useEffect } from "react";
import Header from "../../components/Header/Header";
import ExploreMenu from "../../components/ExploreMenu/ExploreMenu";
import FoodDisplay from "../../components/FoodDisplay/FoodDisplay";
import AppDownload from "../../components/AppDownload/AppDownload";
import { MdLocationOn, MdRestaurant, MdWarning } from "react-icons/md";

const Home = () => {
  const [selectedFilter, setSelectedFilter] = useState("Top Rated");
  const [userLocation, setUserLocation] = useState(null);
  const [locationPermissionDenied, setLocationPermissionDenied] =
    useState(false);
  const [showAllRestaurants, setShowAllRestaurants] = useState(false);

  // Function to request GPS location
  const requestLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
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
        setShowAllRestaurants(false);
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
      {locationPermissionDenied && (
        <div
          style={{
            backgroundColor: "#fff3cd",
            color: "#856404",
            padding: "12px 20px",
            margin: "20px auto",
            width: "100%",
            // maxWidth: "1200px",
            borderRadius: "8px",
            border: "1px solid #ffeaa7",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "15px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <MdWarning size={20} />
            <span>Location access denied.</span>
          </div>
          {/* <button
            onClick={requestLocation}
            style={{
              backgroundColor: "#ff6b35",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              whiteSpace: "nowrap",
            }}
          >
            <MdLocationOn size={18} />
            View Nearby Restaurants
          </button> */}
        </div>
      )}
      {userLocation && !showAllRestaurants && (
        <div
          style={{
            backgroundColor: "#d4edda",
            color: "#155724",
            padding: "12px 20px",
            margin: "20px auto",
            maxWidth: "1200px",
            borderRadius: "8px",
            border: "1px solid #c3e6cb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "15px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <MdLocationOn size={20} />
            <span>Showing restaurants near your location</span>
          </div>
          <button
            onClick={() => setShowAllRestaurants(true)}
            style={{
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              whiteSpace: "nowrap",
            }}
          >
            <MdRestaurant size={18} />
            Browse All Restaurants
          </button>
        </div>
      )}
      <ExploreMenu
        selected={selectedFilter}
        setSelected={setSelectedFilter}
        userLocation={showAllRestaurants ? null : userLocation}
      />
      <FoodDisplay
        filterBy="featured"
        filterValue={selectedFilter}
        showFilter={false}
      />
      <AppDownload />
    </>
  );
};

export default Home;
