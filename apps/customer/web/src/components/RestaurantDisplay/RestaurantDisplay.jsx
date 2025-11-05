import React, { useContext, useState, useEffect } from "react";
import { StoreContext } from "../../Context/StoreContext";
import { RestaurantContext } from "../../Context/RestaurantContext";
import "./RestaurantDisplay.css";
import RestaurantItem from "../RestaurantItem/RestaurantItem";
import { MdRestaurant } from "react-icons/md";

const RestaurantDisplay = ({
  filterBy = "category",
  filterValue = "All",
  showFilter = true,
}) => {
  const { food_list } = useContext(StoreContext);
  const { partners: restaurant_list } = useContext(RestaurantContext); // Get from API
  const [userLocation, setUserLocation] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState(filterValue);

  // Lấy vị trí user
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        (err) => console.log("Lỗi lấy vị trí:", err)
      );
    }
  }, []);
  useEffect(() => {
    setSelectedFilter(filterValue);
  }, [filterValue]);

  // Haversine formula để tính km giữa 2 tọa độ
  const getDistance = (loc1, loc2) => {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(loc2.lat - loc1.lat);
    const dLon = toRad(loc2.lng - loc1.lng);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(loc1.lat)) *
        Math.cos(toRad(loc2.lat)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Lọc restaurants
  let filteredRestaurants = [...restaurant_list];
  // Lấy danh sách filter
  //const filters = ["All", ...Array.from(new Set(filteredRestaurants.map(r => r[filterBy])))];

  // Nếu chọn Nearby
  if (selectedFilter === "Nearby" && userLocation) {
    filteredRestaurants = [...restaurant_list].sort(
      (a, b) =>
        getDistance(a.location, userLocation) -
        getDistance(b.location, userLocation)
    );
  }
  // Nếu chọn Newly Opened
  else if (selectedFilter === "Newly Opened") {
    filteredRestaurants = [...restaurant_list].sort(
      (a, b) => new Date(b.openedAt) - new Date(a.openedAt)
    );
  }
  // Nếu filter theo category
  else if (selectedFilter !== "All") {
    filteredRestaurants = restaurant_list.filter(
      (r) => r.category === selectedFilter
    );
  }

  // Nếu muốn loại trùng theo restaurant name (optional)
  // filteredRestaurants = filteredRestaurants.reduce((acc, item) => {
  // if (!acc.find(r => r.restaurant === item.restaurant)) acc.push(item);
  // return acc;
  // }, []);
  const customFilters = ["All", "Nearby", "Trending", "Newly Opened"];

  return (
    <div className="food-display">
      <h2 className="restaurant-display-title">Restaurants</h2>
      {showFilter && (
        <div className="restaurant-filter-bar">
          {customFilters.map((f) => (
            <button
              key={f}
              className={selectedFilter === f ? "active" : ""}
              onClick={() => setSelectedFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      )}

      <div className="food-display-list">
        {filteredRestaurants.map((item) => (
          <RestaurantItem
            key={item._id}
            image={item.image} //  ảnh đại diện restaurant
            name={item.restaurant}
            desc={
              <span
                style={{ display: "flex", alignItems: "center", gap: "4px" }}
              >
                <MdRestaurant /> {item.category} • Opened: {item.openedAt}
              </span>
            }
          />
        ))}
      </div>
    </div>
  );
};
export default RestaurantDisplay;
