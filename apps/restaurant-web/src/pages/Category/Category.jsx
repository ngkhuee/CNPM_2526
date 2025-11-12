import React, { useState, useEffect, useContext } from "react";
import "./Category.css";
import { CategoryContext } from "../../Context/CategoryContext";
import { FoodContext } from "../../Context/FoodContext";
import { AuthContext } from "../../Context/AuthContext";
import { useCategoryForm } from "../../hooks/useCategoryForm";
import CategoryModal from "./CategoryModal";
import FoodsModal from "./FoodsModal";
import CategoryTable from "./CategoryTable";
import { MdAdd } from "react-icons/md";

const Category = () => {
  const { categories, fetchCategories } = useContext(CategoryContext);
  const { foodList } = useContext(FoodContext);
  const { currentUser } = useContext(AuthContext);

  const [search, setSearch] = useState("");
  const [showFoodsModal, setShowFoodsModal] = useState(false);
  const [selectedFoods, setSelectedFoods] = useState([]);

  const {
    showModal,
    editModal,
    currentCategory,
    loading,
    handleOpenModal,
    handleCloseModal,
    handleOpenEditModal,
    handleCloseEditModal,
    handleAddCategory,
    handleEditCategory,
    handleDelete,
    handleChange,
  } = useCategoryForm();

  // Get current restaurant's foods only
  const restaurantFoods = foodList.filter(
    (food) => food.restaurantId === currentUser?.restaurantId
  );

  // Filter categories
  const filteredCategories = (categories || []).filter((cat) =>
    cat.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleViewFoods = (categoryId, categoryName) => {
    const filtered = restaurantFoods.filter((f) => {
      const matchById = f.categoryId === categoryId;
      const matchByName = f.category === categoryName;
      return matchById || matchByName;
    });
    setSelectedFoods(filtered);
    setShowFoodsModal(true);
  };

  return (
    <div className="main-content">
      <div className="category-page">
        <div className="category-header">
          <h2>Manage Categories</h2>
          <button className="add-btn" onClick={handleOpenModal}>
            <MdAdd /> Add Category
          </button>
        </div>

        <div className="category-filters">
          <input
            type="text"
            placeholder="Search category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <CategoryTable
          categories={filteredCategories}
          restaurantFoods={restaurantFoods}
          onEdit={handleOpenEditModal}
          onDelete={handleDelete}
          onViewFoods={handleViewFoods}
        />

        <CategoryModal
          isOpen={showModal}
          isEditing={false}
          currentCategory={currentCategory}
          loading={loading}
          onSubmit={handleAddCategory}
          onChange={handleChange}
          onClose={handleCloseModal}
        />

        <CategoryModal
          isOpen={editModal}
          isEditing={true}
          currentCategory={currentCategory}
          loading={loading}
          onSubmit={handleEditCategory}
          onChange={handleChange}
          onClose={handleCloseEditModal}
        />

        <FoodsModal
          isOpen={showFoodsModal}
          foods={selectedFoods}
          onClose={() => setShowFoodsModal(false)}
        />
      </div>
    </div>
  );
};

export default Category;
