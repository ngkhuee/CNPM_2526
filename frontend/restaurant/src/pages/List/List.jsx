import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./List.css";
import { assets } from "../../assets/assets";
import { getImageUrl } from "@utils/imageHelper";

const List = ({ foods, setFoods }) => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFood, setEditFood] = useState({
    id: null,
    name: "",
    category: "",
    price: "",
    restaurantName: "",
    image: "",
  });

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

  useEffect(() => {
    const storedFoods = JSON.parse(localStorage.getItem("foods") || "[]");
    setFoods(storedFoods);
  }, [setFoods]);

  const updateFoods = (newFoods) => {
    setFoods(newFoods);
    localStorage.setItem("foods", JSON.stringify(newFoods));
  };
  const handleOpenEditModal = (food) => {
    setEditFood(food); // điền sẵn dữ liệu
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setEditFood({
      id: null,
      name: "",
      category: "",
      price: "",
      restaurantName: "",
      image: "",
    });
    setShowEditModal(false);
  };
  const handleEditSubmit = (e) => {
    e.preventDefault();
    updateFoods(foods.map((f) => (f.id === editFood.id ? editFood : f)));
    handleCloseEditModal();
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

  const removeFood = (id) => updateFoods(foods.filter((f) => f.id !== id));

  const formatVND = (value) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value || 0);

  const categories = [
    "All",
    ...new Set(foods.map((f) => f.category || "Uncategorized")),
  ];

  const filteredFoods = foods.filter((item) => {
    const matchName = item.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      categoryFilter === "All" || item.category === categoryFilter;
    return matchName && matchCategory;
  });

  return (
    <div className="main-content">
      <div className="list-header">
        <h2>All Foods List</h2>
        <button className="add-btn" onClick={() => navigate("/add")}>
          + Add New Food
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
          {categories.map((cat, idx) => (
            <option key={idx} value={cat}>
              {cat}
            </option>
          ))}
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
                <p>{food.restaurantName}</p>
                <p className="food-price">🏷️{formatVND(food.price)}</p>
              </div>
              <div className="card-actions">
                <button
                  className="edit-btn"
                  onClick={() => handleOpenEditModal(food)}
                >
                  ✏️ Edit
                </button>
                <button
                  className="remove-btn"
                  onClick={() => removeFood(food.id)}
                >
                  Remove
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
                Category:
                <input
                  type="text"
                  value={editFood.category}
                  onChange={(e) =>
                    setEditFood({ ...editFood, category: e.target.value })
                  }
                />
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
