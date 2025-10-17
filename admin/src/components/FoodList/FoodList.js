// src/components/FoodList/FoodList.js
import React, { useContext } from "react";
import { FoodContext } from "../../Context/FoodContext";

const FoodList = () => {
  const { foodList } = useContext(FoodContext);

  return React.createElement(
    "div",
    { className: "food-list" },
    foodList.map((food) =>
      React.createElement(
        "div",
        { key: food._id, className: "food-item" },
        React.createElement("img", { src: food.image, alt: food.name, width: 100 }),
        React.createElement("h3", null, food.name),
        React.createElement("p", null, food.description),
        React.createElement(
          "p",
          null,
          new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(food.price)
        )
      )
    )
  );
};

export default FoodList;
