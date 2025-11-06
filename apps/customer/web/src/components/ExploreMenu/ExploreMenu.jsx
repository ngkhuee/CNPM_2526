import React, { useContext, useMemo } from "react";
import "./ExploreMenu.css";
import { StoreContext } from "customer-shared";
import {
  MdRestaurant,
  MdLocationOn,
  MdSearchOff,
  MdStar,
  MdLocalFireDepartment,
} from "react-icons/md";
import { getImageUrl } from "@utils/imageHelper";

// Calculate distance between two GPS coordinates using Haversine formula
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km

  return distance;
};

const ExploreMenu = ({ selected, setSelected, userLocation }) => {
  const { restaurant_list, loading } = useContext(StoreContext);

  // Define filter options
  const filterOptions = useMemo(() => {
    const options = [
      { id: "Top Rated", label: "Top Rated", Icon: MdStar },
      {
        id: "Best Selling",
        label: "Best Selling",
        Icon: MdLocalFireDepartment,
      },
    ];

    // Only show nearby if user has location
    if (userLocation && userLocation.latitude && userLocation.longitude) {
      options.push({
        id: "Nearby",
        label: "Nearby Restaurants",
        Icon: MdLocationOn,
      });
    }

    return options;
  }, [userLocation]);

  // Transform and filter restaurant data for display (only for Nearby option)
  const nearbyRestaurants = useMemo(() => {
    if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
      return [];
    }

    let filteredList = restaurant_list
      .map((r) => {
        const lat = r.location?.lat || r.latitude;
        const lng = r.location?.lng || r.longitude;

        if (lat && lng) {
          const distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            lat,
            lng
          );
          return { ...r, distance };
        }
        return { ...r, distance: null };
      })
      .filter((r) => r.distance !== null && r.distance <= 5)
      .sort((a, b) => a.distance - b.distance);

    return filteredList.map((r) => {
      const imagePath = r.image || r.images?.[0] || "/default-restaurant.png";
      const imageUrl = getImageUrl(imagePath);
      return {
        name: r.name,
        id: r.id || r._id,
        image: imageUrl,
        distance: r.distance,
      };
    });
  }, [restaurant_list, userLocation]);

  return (
    <div className="explore-menu" id="explore-menu">
      <h1 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <MdRestaurant size={32} />
        Discover Delicious Food
      </h1>
      <p className="explore-menu-text">
        Explore our curated selection of top-rated dishes, bestsellers, and
        nearby restaurants. Find your next favorite meal!
      </p>

      {/* Filter Options */}
      <div className="explore-menu-list" style={{ justifyContent: "flex-end" }}>
        {filterOptions.map((option) => {
          const IconComponent = option.Icon;
          return (
            <div
              key={option.id}
              className={`explore-menu-list-item ${selected === option.id ? "active" : ""}`}
              onClick={() => setSelected(option.id)}
              style={{
                cursor: "pointer",
                maxWidth: "200px",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  // flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "10px 16px",
                  background: selected === option.id ? "#ff6b35" : "#f8f9fa",
                  borderRadius: "12px",
                  transition: "all 0.3s",
                }}
              >
                <IconComponent
                  size={32}
                  color={selected === option.id ? "#fff" : "#ff6b35"}
                />
                <span
                  style={{
                    fontWeight: selected === option.id ? "600" : "500",
                    fontSize: "18px",
                    color: selected === option.id ? "#fff" : "#2d2d2d",
                    textAlign: "center",
                  }}
                >
                  {option.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Only show nearby restaurants list if Nearby is selected */}
      {selected === "Nearby" && nearbyRestaurants.length > 0 && (
        <>
          <h2
            style={{
              fontSize: "24px",
              marginTop: "30px",
              marginBottom: "15px",
            }}
          >
            <MdLocationOn
              size={28}
              style={{ verticalAlign: "middle", color: "#ff6b35" }}
            />{" "}
            Restaurants Near You
          </h2>
          <div className="explore-menu-list">
            {nearbyRestaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="explore-menu-list-item"
                onClick={() =>
                  (window.location.href = `/restaurant/${restaurant.id}`)
                }
                style={{ cursor: "pointer" }}
              >
                <img
                  src={restaurant.image}
                  alt={restaurant.name}
                  onError={(e) => {
                    e.target.src = "/default-restaurant.png";
                  }}
                />
                <p>{restaurant.name}</p>
                <span
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    marginTop: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px",
                  }}
                >
                  <MdLocationOn size={14} />
                  {restaurant.distance.toFixed(1)} km
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      <hr />
    </div>
  );
};

export default ExploreMenu;
