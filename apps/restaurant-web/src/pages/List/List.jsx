import React, { useState } from "react";

import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import "./List.css";
import { assets } from "../../assets/assets";
import { MdAdd } from "react-icons/md";
import { FoodDetail } from "shared-ui";
import { useFoodList } from "../../hooks/useFoodList";
import { RestaurantContext } from "../../Context/RestaurantContext";
import FoodCard from "../../components/FoodList/FoodCard";
import FoodFilterBar from "../../components/FoodList/FoodFilterBar";
import FoodEditModal from "../../components/FoodList/FoodEditModal";
import { toast } from "react-toastify";

const List = () => {
  const navigate = useNavigate();
  const { currentRestaurant } = useContext(RestaurantContext);
  const {
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    restaurantFoods,
    filteredFoods,
    categories,
    selectedFood,
    setSelectedFood,
    updateFood,
    deleteFood,
  } = useFoodList();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showFoodDetail, setShowFoodDetail] = useState(false);
  const [editFood, setEditFood] = useState(null);

  const handleOpenEditModal = (food) => {
    setEditFood(food);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setEditFood(null);
    setShowEditModal(false);
  };

  const handleEditSubmit = async (editedFood) => {
    const updateData = {
      name: editedFood.name,
      description: editedFood.description,
      price: Number(editedFood.price),
      category: editedFood.category,
      categoryId: editedFood.categoryId,
      image: editedFood.image,
      isAvailable: editedFood.isAvailable !== false,
    };

    const result = await updateFood(editedFood.id, updateData);
    if (result.success) {
      toast.success("Food updated successfully!");
      handleCloseEditModal();
    } else {
      toast.error("Failed to update: " + result.message);
    }
  };

  const handleRemoveFood = async (id) => {
    if (window.confirm("Are you sure you want to delete this food?")) {
      const result = await deleteFood(id);
      if (result.success) {
        toast.success("Food deleted successfully!");
      } else {
        toast.error("Failed to delete: " + result.message);
      }
    }
  };

  const formatVND = (value) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value || 0);

  const handleViewDetail = (food) => {
    setSelectedFood(food);
    setShowFoodDetail(true);
  };

  return (
    <div className="main-content">
      <div className="list-header">
        <h2>All Foods List</h2>
        <button className="add-btn" onClick={() => navigate("/add")}>
          <MdAdd /> Add New Food
        </button>
      </div>

      <FoodFilterBar
        search={search}
        setSearch={setSearch}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        categories={categories}
        restaurantFoods={restaurantFoods}
      />

      <div className="cards-wrapper">
        {filteredFoods.length > 0 ? (
          filteredFoods.map((food) => (
            <FoodCard
              key={food.id}
              food={food}
              assets={assets}
              categories={categories}
              onEdit={handleOpenEditModal}
              onDelete={handleRemoveFood}
              onViewDetail={handleViewDetail}
              onFormatVND={formatVND}
            />
          ))
        ) : (
          <p className="no-foods">No foods available</p>
        )}
      </div>

      <FoodEditModal
        food={editFood}
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        onSubmit={handleEditSubmit}
        categories={categories}
        restaurantFoods={restaurantFoods}
      />

      {showFoodDetail && selectedFood && (
        <FoodDetail
          food={selectedFood}
          onClose={() => {
            setShowFoodDetail(false);
            setSelectedFood(null);
          }}
          userRole="restaurant"
          currentRestaurantId={currentRestaurant?.id || currentRestaurant?._id}
        />
      )}
    </div>
  );
};

export default List;
