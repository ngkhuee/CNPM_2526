import React, { useContext, useState, useEffect } from "react";
import "./FoodDisplay.css";
import { assets } from "../../assets/assets";
import FoodItem from "../FoodItem/FoodItem";
import RestaurantItem from "../RestaurantItem/RestaurantItem";
import { StoreContext } from "customer-shared";

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
  const filteredFood = food_list
    .filter(
      (item) => selectedFilter === "All" || item[filterBy] === selectedFilter
    )
    .filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.restaurant.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="food-display" id="food-display">
      <h2 className="restaurant-display-title">Categories</h2>
      {/* Filter bar */}
      {/* {showFilter && (
        <div className='food-filter-bar'>
          {filters.map(f => (
            <button
              key={f}
              className={selectedFilter === f ? 'active' : ''}
              onClick={() => setSelectedFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      )} */}

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
            placeholder="Search food..."
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
