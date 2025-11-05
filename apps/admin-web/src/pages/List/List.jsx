import React, { useState } from "react";
import { useContext } from "react";
import "./List.css";
import { FoodContext } from "../../Context/FoodContext";
import { getImageUrl } from "@utils/imageHelper";
import { formatCurrency } from "shared-utils";
import { toast } from "react-toastify";

const List = () => {
  const { foodList, deleteFood } = useContext(FoodContext);

  const removeFood = async (foodId) => {
    if (window.confirm("Are you sure you want to delete this food item?")) {
      const result = await deleteFood(foodId);
      if (result.success) {
        toast.success("Food deleted successfully!");
      } else {
        toast.error("Failed to delete food");
      }
    }
  };

  return (
    <div className="list add flex-col">
      <p>All Foods List</p>
      <div className="list-table">
        <div className="list-table-format title">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          {/* <b>Description</b> */}
          <b>Action</b>
        </div>
        {foodList.map((item, index) => (
          <div key={index} className="list-table-format">
            <img src={getImageUrl(item.image)} alt={item.name} />
            <p>{item.name}</p>
            <p>{item.category}</p>
            <p>{formatCurrency(item.price)}</p>
            <p className="cursor" onClick={() => removeFood(item._id)}>
              x
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default List;
