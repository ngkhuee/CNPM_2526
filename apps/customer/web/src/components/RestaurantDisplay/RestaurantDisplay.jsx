import React, { useContext, useState, useEffect } from "react";
import { StoreContext } from "customer-shared";
import "./RestaurantDisplay.css";
import RestaurantItem from "../RestaurantItem/RestaurantItem";
import { MdRestaurant } from "react-icons/md";

const RestaurantDisplay = ({ showAllRestaurants = false }) => {
  const { restaurant_list } = useContext(StoreContext);

  // Show all restaurants without any filters
  const allRestaurants = [...restaurant_list];

  return (
    <div className="food-display" style={{ marginTop: "40px" }}>
      <h2
        className="restaurant-display-title"
        style={{ display: "flex", alignItems: "center", gap: "10px" }}
      >
        <MdRestaurant size={28} style={{ color: "#ff6b35" }} />
        All Restaurants
      </h2>
      <p style={{ color: "#666", marginBottom: "20px", fontSize: "14px" }}>
        Browse all available restaurants on our platform
      </p>

      <div className="food-display-list">
        {allRestaurants.map((item) => {
          return (
            <RestaurantItem
              key={item._id || item.id}
              id={item._id || item.id}
              image={item.image}
              name={item.name}
              rating={item.rating || 0}
              deliveryTime={item.deliveryTime}
              isOpen={item.isOpen}
              desc={
                <span
                  style={{ display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <MdRestaurant size={16} />{" "}
                  {item.primary_category || item.category || "Restaurant"}
                </span>
              }
            />
          );
        })}
      </div>
    </div>
  );
};
export default RestaurantDisplay;
