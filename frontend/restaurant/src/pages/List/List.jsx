import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./List.css";
import { assets } from "../../assets/assets";
import { getImageUrl } from "@utils/imageHelper";
import { FoodContext } from "../../Context/FoodContext";
import { CategoryContext } from "../../Context/CategoryContext";
import { authService } from "@api/services";
import { MdEdit, MdDelete, MdLocalOffer, MdAdd } from "react-icons/md";

const List = () => {
  const { foodList, deleteFood, updateFood, loading } = useContext(FoodContext);
  const { categories: restaurantCategories } = useContext(CategoryContext);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFood, setEditFood] = useState({
    id: null,
    name: "",
    categoryId: "",
    price: "",
    restaurantName: "",
    image: "",
  });

  // Get current restaurant's foods only
  const user = authService.getCurrentUser();
  const restaurantFoods = foodList.filter(
    (food) => food.restaurantId === user?.restaurantId
  );

  // Debug logging
  console.log("🍔 List.jsx Debug:");
  console.log("- Total foodList:", foodList.length);
  console.log("- Current user restaurantId:", user?.restaurantId);
  console.log("- Restaurant foods:", restaurantFoods.length);
  console.log("- Sample food:", restaurantFoods[0]);

  const getImageSrc = (food) => {
    // Nếu ảnh là base64 (do người dùng upload mới)
    if (food.image?.startsWith("data:image")) return food.image;

    // Nếu ảnh là URL online hoặc path từ backend
    if (food.image?.startsWith("http") || food.image?.startsWith("/images")) {
      return getImageUrl(food.image);
    }

    // Nếu ảnh là key trong assets (legacy support)
    if (assets[food.image]) return assets[food.image];

    // Fallback
    return "";
  };

  const navigate = useNavigate();

  const handleOpenEditModal = (food) => {
    setEditFood(food); // điền sẵn dữ liệu
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setEditFood({
      id: null,
      name: "",
      categoryId: "",
      price: "",
      restaurantName: "",
      image: "",
    });
    setShowEditModal(false);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    // Validation: Bắt buộc phải chọn category
    if (!editFood.categoryId && !editFood.category) {
      alert("⚠️ Please select a category!");
      return;
    }

    // Prepare clean update payload
    const updateData = {
      name: editFood.name,
      description: editFood.description,
      price: Number(editFood.price),
      category: editFood.category,
      categoryId: editFood.categoryId,
      image: editFood.image,
      isAvailable: editFood.isAvailable !== false,
    };

    const result = await updateFood(editFood.id, updateData);
    if (result.success) {
      alert("✅ Food updated successfully!");
      handleCloseEditModal();
    } else {
      alert(`❌ Failed to update: ${result.message}`);
    }
  };
  // const handleImageChange = (file) => {
  //   if (file) {
  //     const imageURL = URL.createObjectURL(file); // tạo URL tạm
  //     setEditFood(prev => ({ ...prev, image: imageURL, file: file }));
  //   }
  // };
  const handleImageChange = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditFood((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFood = async (id) => {
    if (window.confirm("Are you sure you want to delete this food?")) {
      const result = await deleteFood(id);
      if (result.success) {
        alert("Food deleted successfully!");
      } else {
        alert(`Failed to delete: ${result.message}`);
      }
    }
  };

  const formatVND = (value) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value || 0);

  const getCategoryName = (food) => {
    // Nếu có categoryId, tìm trong restaurantCategories
    if (food.categoryId) {
      const category = restaurantCategories.find(
        (c) => c.id === food.categoryId
      );
      return category ? category.name : "Uncategorized";
    }
    // Nếu chỉ có category (string), return trực tiếp
    return food.category || "Uncategorized";
  };

  const filteredFoods = restaurantFoods.filter((item) => {
    const matchName = item.name.toLowerCase().includes(search.toLowerCase());
    // Filter theo category string hoặc categoryId
    const itemCategory = item.categoryId || item.category;
    const matchCategory =
      categoryFilter === "All" ||
      itemCategory === categoryFilter ||
      (!itemCategory && categoryFilter === "Uncategorized"); // Hiển thị food không có category
    return matchName && matchCategory;
  });

  if (loading) {
    return (
      <div className="main-content">
        <div className="loading">Loading foods...</div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="list-header">
        <h2>All Foods List</h2>
        <button className="add-btn" onClick={() => navigate("/add")}>
          <MdAdd /> Add New Food
        </button>
      </div>

      <div className="list-filters">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="All">All Categories</option>
          {/* Hiển thị categories từ restaurantCategories (nếu có) */}
          {restaurantCategories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
          {/* Thêm categories từ food items (string) nếu chưa có trong restaurantCategories */}
          {[
            ...new Set(restaurantFoods.map((f) => f.category).filter(Boolean)),
          ].map((cat) => {
            // Chỉ hiển thị nếu chưa có trong restaurantCategories
            if (
              !restaurantCategories.find(
                (rc) => rc.name === cat || rc.id === cat
              )
            ) {
              return (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              );
            }
            return null;
          })}
          {/* Hiển thị Uncategorized nếu có food không có category */}
          {restaurantFoods.some((f) => !f.category && !f.categoryId) && (
            <option value="Uncategorized">Uncategorized</option>
          )}
        </select>
      </div>

      <div className="cards-wrapper">
        {filteredFoods.length > 0 ? (
          filteredFoods.map((food) => (
            <div className="food-card" key={food.id}>
              <div className="food-img-wrapper">
                {getImageSrc(food) ? (
                  <img src={getImageSrc(food)} alt={food.name} />
                ) : (
                  <p>No image</p>
                )}
              </div>
              <div className="food-info">
                <h4>{food.name}</h4>
                <p className="food-category">{getCategoryName(food)}</p>
                <div className="price-container">
                  <p className="food-price"><MdLocalOffer /> {formatVND(food.price)}</p>
                </div>
              </div>
              <div className="card-actions">
                <button
                  className="edit-btn"
                  onClick={() => handleOpenEditModal(food)}
                >
                  <MdEdit /> Edit
                </button>
                <button
                  className="remove-btn"
                  onClick={() => handleRemoveFood(food.id)}
                >
                  <MdDelete /> Remove
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="no-foods">No foods available</p>
        )}
      </div>
      {showEditModal && (
        <div className="modal-overlay" onClick={handleCloseEditModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Food</h3>
            <form onSubmit={handleEditSubmit}>
              <label>
                Name:
                <input
                  type="text"
                  value={editFood.name}
                  onChange={(e) =>
                    setEditFood({ ...editFood, name: e.target.value })
                  }
                  required
                />
              </label>
              <label>
                Category <span style={{ color: "red" }}>*</span>:
                <select
                  value={editFood.categoryId || editFood.category}
                  onChange={(e) =>
                    setEditFood({
                      ...editFood,
                      categoryId: e.target.value,
                      category: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">-- Select a category (Required) --</option>
                  {/* Categories từ restaurantCategories */}
                  {restaurantCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                  {/* Categories từ food items (string) */}
                  {[
                    ...new Set(
                      restaurantFoods.map((f) => f.category).filter(Boolean)
                    ),
                  ].map((cat) => {
                    if (
                      !restaurantCategories.find(
                        (rc) => rc.name === cat || rc.id === cat
                      )
                    ) {
                      return (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      );
                    }
                    return null;
                  })}
                </select>
              </label>
              <label>
                Price:
                <input
                  type="number"
                  value={editFood.price}
                  onChange={(e) =>
                    setEditFood({ ...editFood, price: e.target.value })
                  }
                  required
                />
              </label>
              <label>
                Image:
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e.target.files[0])}
                />
              </label>
              <div className="modal-buttons">
                <button type="submit" className="submit-btn">
                  Save
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleCloseEditModal}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default List;
