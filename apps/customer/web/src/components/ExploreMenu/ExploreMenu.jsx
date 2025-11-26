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

const ExploreMenu = ({
  selected,
  setSelected,
  userLocation,
  showOnlyNearby = false,
}) => {
  const { restaurant_list, loading } = useContext(StoreContext);

  // Define filter options - Only show Top Rated and Best Selling for main section
  const filterOptions = useMemo(() => {
    if (showOnlyNearby) {
      return []; // No filter options for nearby section
    }

    return [
      { id: "Top Rated", label: "Đánh giá cao", Icon: MdStar },
      {
        id: "Best Selling",
        label: "Bán chạy",
        Icon: MdLocalFireDepartment,
      },
    ];
  }, [showOnlyNearby]);

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

  // If showing only nearby section
  if (showOnlyNearby) {
    if (nearbyRestaurants.length === 0) {
      return null; // Don't show section if no nearby restaurants
    }

    return (
      <div className="explore-menu" style={{ paddingBottom: "20px" }}>
        <h2
          style={{
            fontSize: "28px",
            marginBottom: "10px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <MdLocationOn size={32} style={{ color: "#ff6b35" }} />
          Nhà hàng Gần bạn
        </h2>
        <p style={{ color: "#666", marginBottom: "20px" }}>
          Một số nhà hàng trong bán kính 5km từ vị trí của bạn
        </p>
        <div className="explore-menu-list">
          {nearbyRestaurants.slice(0, 10).map((restaurant) => (
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
        <hr />
      </div>
    );
  }

  // Main "Discover Delicious Food" section
  return (
    <div className="explore-menu" id="explore-menu">
      <h1 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <MdRestaurant size={32} />
        Khám phá Món ngon
      </h1>
      <p className="explore-menu-text">
        Khám phá bộ sưu tập món ăn được đánh giá cao và bán chạy nhất.
        Tìm món yêu thích tiếp theo của bạn!
      </p>

      {/* Filter Options - Only Top Rated and Best Selling */}
      <div className="explore-menu-list" style={{ justifyContent: "flex-end" }}>
        {filterOptions.map((option) => {
          const IconComponent = option.Icon;
          return (
            <div
              key={option.id}
              className={`explore-menu-list-item ${selected === option.id ? "active" : ""}`}
              onClick={() => setSelected && setSelected(option.id)}
              style={{
                cursor: "pointer",
                maxWidth: "200px",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
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

      {/* <hr /> */}
    </div>
  );
};

export default ExploreMenu;
