import React, { useContext, useState, useEffect } from "react";
import "./FoodDisplay.css";
import { assets } from "../../assets/assets";
import FoodItem from "../FoodItem/FoodItem";
import RestaurantItem from "../RestaurantItem/RestaurantItem";
import { StoreContext } from "customer-shared";
import { MdStar, MdLocalFireDepartment, MdRestaurant } from "react-icons/md";

const FoodDisplay = ({
  filterBy = "category",
  filterValue = "All",
  showFilter = false,
}) => {
  const { food_list } = useContext(StoreContext);
  // selectedFilter dùng để filter món ăn
  const [selectedFilter, setSelectedFilter] = useState(filterValue);
  // searchTerm dùng để tìm kiếm món ăn
  const [searchTerm, setSearchTerm] = useState("");

  // Lấy danh sách filter (danh mục hoặc restaurants)
  const filters = [
    "All",
    ...Array.from(new Set(food_list.map((f) => f[filterBy]))),
  ];

  // Đồng bộ filterValue khi props thay đổi
  useEffect(() => {
    setSelectedFilter(filterValue);
  }, [filterValue]);

  // Lọc món ăn dựa theo selectedFilter
  let filteredFood = [...food_list];

  // Handle featured filters (Top Rated, Best Selling)
  if (filterBy === "featured") {
    if (filterValue === "Top Rated") {
      // Sort by rating (highest first), limit to top 4
      filteredFood = [...food_list]
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 4);
    } else if (filterValue === "Best Selling") {
      // Sort by sold count (highest first), limit to top 4
      filteredFood = [...food_list]
        .sort((a, b) => (b.sold || 0) - (a.sold || 0))
        .slice(0, 4);
    }
  } else {
    // Original filtering logic
    filteredFood = food_list.filter(
      (item) => selectedFilter === "All" || item[filterBy] === selectedFilter
    );
  }

  // Apply search filter
  filteredFood = filteredFood.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.restaurant.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get display title based on filter
  const getDisplayTitle = () => {
    if (filterBy === "featured") {
      if (filterValue === "Top Rated") {
        return (
          <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <MdStar size={28} style={{ color: "#ff6b35" }} />
            Món Được Đánh Giá Cao
          </span>
        );
      }
      if (filterValue === "Best Selling") {
        return (
          <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <MdLocalFireDepartment size={28} style={{ color: "#ff6b35" }} />
            Món Bán Chạy
          </span>
        );
      }
      if (filterValue === "Nearby") {
        return (
          <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <MdRestaurant size={28} style={{ color: "#ff6b35" }} />
            Món Hiện Có
          </span>
        );
      }
    }
    return "Chọn món yêu thích của bạn";
  };

  return (
    <div className="food-display" id="food-display">
      <h2 className="restaurant-display-title">{getDisplayTitle()}</h2>

      {/* Search bar */}
      {showFilter && (
        <div className="food-display-header">
          <div className="food-filter-bar">
            {filters.map((f) => (
              <button
                key={f}
                className={selectedFilter === f ? "active" : ""}
                onClick={() => setSelectedFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Tìm món ăn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="food-search-input"
          />
        </div>
      )}

      {/*food display list*/}
      <div className="food-display-list">
        {filteredFood.map((item) => {
          return (
            <FoodItem
              key={item._id}
              image={item.image}
              name={item.name}
              desc={item.description}
              price={item.price}
              id={item._id}
              restaurant={item.restaurant}
              restaurantId={item.restaurantId}
              rating={item.rating}
              sold={item.sold}
            />
          );
        })}
        {/* {filteredRestaurants.map((r, i) => (
          <RestaurantItem 
            key={i} 
            name={r} 
            image={restaurantImages[r] || food_list.find(f => f.restaurant === r)?.image} 
          />
        ))} */}
      </div>
    </div>
  );
};
export default FoodDisplay;
