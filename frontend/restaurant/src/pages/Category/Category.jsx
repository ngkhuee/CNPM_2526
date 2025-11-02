import React, { useState, useEffect } from "react";
import "./Category.css";
import { categoryData } from "../../shared/categoryData";
import { getImageUrl } from "@utils/imageHelper";

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState({
    name: "",
    description: "",
    status: "Active",
  });
  const [search, setSearch] = useState("");
  const [foods, setFoods] = useState([]);
  const [showFoodsModal, setShowFoodsModal] = useState(false);
  const [selectedFoods, setSelectedFoods] = useState([]);

  useEffect(() => {
    const storedFoods = JSON.parse(localStorage.getItem("foods") || "[]");
    setFoods(storedFoods);
  }, []);

  useEffect(() => {
    // 🚀 Bỏ qua localStorage khi dev, luôn lấy dữ liệu mới
    setCategories(categoryData);
    localStorage.setItem("categories", JSON.stringify(categoryData));
  }, []);

  const updateCategories = (newCategories) => {
    setCategories(newCategories);
    localStorage.setItem("categories", JSON.stringify(newCategories));
  };

  // Open/Close modal
  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentCategory({ name: "", description: "", status: "Active" });
  };

  const handleOpenEditModal = (category) => {
    setCurrentCategory(category);
    setEditModal(true);
  };
  const handleCloseEditModal = () => {
    setEditModal(false);
    setCurrentCategory({ name: "", description: "", status: "Active" });
  };

  // Thêm category
  const handleAddCategory = (e) => {
    e.preventDefault();
    const nextId = categories.length
      ? categories[categories.length - 1].id + 1
      : 1;
    updateCategories([...categories, { ...currentCategory, id: nextId }]);
    handleCloseModal();
  };

  // Chỉnh sửa category
  const handleEditCategory = (e) => {
    e.preventDefault();
    updateCategories(
      categories.map((cat) =>
        cat.id === currentCategory.id ? currentCategory : cat
      )
    );
    handleCloseEditModal();
  };

  // Xóa category
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      updateCategories(categories.filter((cat) => cat.id !== id));
    }
  };

  // Filter categories
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleViewFoods = (categoryName) => {
    const filtered = foods.filter((f) => f.category === categoryName);
    setSelectedFoods(filtered);
    setShowFoodsModal(true);
  };

  return (
    <div className="main-content">
      <div className="category-page">
        <div className="category-header">
          <h2>Manage Categories</h2>
          <button className="add-btn" onClick={handleOpenModal}>
            ➕ Add Category
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

        <table className="category-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Foods</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.length > 0 ? (
              filteredCategories.map((cat) => (
                <tr key={cat.id}>
                  <td>{cat.name}</td>
                  <td>{cat.description}</td>
                  <td>
                    <button
                      className="view-foods-btn"
                      onClick={() => handleViewFoods(cat.name)}
                    >
                      {foods.filter((f) => f.category === cat.name).length}{" "}
                      items
                    </button>
                  </td>
                  <td>
                    <span className={`status ${cat.status.toLowerCase()}`}>
                      {cat.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => handleOpenEditModal(cat)}
                    >
                      ✏️
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(cat.id)}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: "center" }}>
                  No categories found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Add Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Add New Category</h3>
              <form onSubmit={handleAddCategory}>
                <label>
                  Name:
                  <input
                    type="text"
                    value={currentCategory.name}
                    onChange={(e) =>
                      setCurrentCategory({
                        ...currentCategory,
                        name: e.target.value,
                      })
                    }
                    required
                  />
                </label>
                <label>
                  Description:
                  <textarea
                    value={currentCategory.description}
                    onChange={(e) =>
                      setCurrentCategory({
                        ...currentCategory,
                        description: e.target.value,
                      })
                    }
                  />
                </label>
                <label>
                  Status:
                  <select
                    value={currentCategory.status}
                    onChange={(e) =>
                      setCurrentCategory({
                        ...currentCategory,
                        status: e.target.value,
                      })
                    }
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </label>
                <div className="modal-buttons">
                  <button type="submit" className="submit-btn">
                    Add
                  </button>
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editModal && (
          <div className="modal-overlay" onClick={handleCloseEditModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Edit Category</h3>
              <form onSubmit={handleEditCategory}>
                <label>
                  Name:
                  <input
                    type="text"
                    value={currentCategory.name}
                    onChange={(e) =>
                      setCurrentCategory({
                        ...currentCategory,
                        name: e.target.value,
                      })
                    }
                    required
                  />
                </label>
                <label>
                  Description:
                  <textarea
                    value={currentCategory.description}
                    onChange={(e) =>
                      setCurrentCategory({
                        ...currentCategory,
                        description: e.target.value,
                      })
                    }
                  />
                </label>
                <label>
                  Status:
                  <select
                    value={currentCategory.status}
                    onChange={(e) =>
                      setCurrentCategory({
                        ...currentCategory,
                        status: e.target.value,
                      })
                    }
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
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
        {showFoodsModal && (
          <div
            className="modal-overlay"
            onClick={() => setShowFoodsModal(false)}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Foods in this Category</h3>
              {selectedFoods.length > 0 ? (
                <ul className="foods-list">
                  {selectedFoods.map((food) => (
                    <li key={food.id} className="food-item">
                      <img src={getImageUrl(food.image)} alt={food.name} />
                      <div>
                        <strong>{food.name}</strong>
                        <p>{food.price.toLocaleString()}₫</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No foods found in this category.</p>
              )}
              <button
                className="cancel-btn"
                onClick={() => setShowFoodsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Category;
