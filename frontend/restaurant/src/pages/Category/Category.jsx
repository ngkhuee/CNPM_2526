import React, { useState, useEffect, useContext } from "react";
import "./Category.css";
import { CategoryContext } from "../../Context/CategoryContext";
import { FoodContext } from "../../Context/FoodContext";
import { getImageUrl } from "@utils/imageHelper";
import { MdEdit, MdDelete, MdAdd } from "react-icons/md";

const Category = () => {
  const {
    categories,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    loading,
  } = useContext(CategoryContext);
  const { foodList } = useContext(FoodContext);

  // Get current restaurant's foods only
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const restaurantFoods = foodList.filter(
    (food) => food.restaurantId === user?.restaurantId
  );

  // Debug: Log foodList và categories
  useEffect(() => {
    console.log("📊 Category.jsx Debug:");
    console.log("- User restaurantId:", user.restaurantId);
    console.log("- Total categories:", categories.length);
    console.log(
      "- Categories:",
      categories.map((c) => ({
        id: c.id,
        name: c.name,
        restaurantId: c.restaurantId,
      }))
    );
    console.log("- Total foodList:", foodList.length);
    console.log("- Restaurant foods:", restaurantFoods.length);
    console.log(
      "- Foods sample:",
      restaurantFoods.slice(0, 3).map((f) => ({
        id: f.id,
        name: f.name,
        restaurantId: f.restaurantId,
        category: f.category,
        categoryId: f.categoryId,
      }))
    );
  }, [categories, foodList]);

  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState({
    name: "",
    description: "",
    status: "active",
  });
  const [search, setSearch] = useState("");
  const [showFoodsModal, setShowFoodsModal] = useState(false);
  const [selectedFoods, setSelectedFoods] = useState([]);

  // Open/Close modal
  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentCategory({ name: "", description: "", status: "active" });
  };

  const handleOpenEditModal = (category) => {
    setCurrentCategory(category);
    setEditModal(true);
  };
  const handleCloseEditModal = () => {
    setEditModal(false);
    setCurrentCategory({ name: "", description: "", status: "active" });
  };

  // Thêm category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const categoryData = {
      ...currentCategory,
      restaurantId: user.restaurantId,
    };
    const result = await addCategory(categoryData);
    if (result.success) {
      handleCloseModal();
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      await fetchCategories(user.restaurantId);
    }
  };

  // Chỉnh sửa category
  const handleEditCategory = async (e) => {
    e.preventDefault();
    const result = await updateCategory(currentCategory.id, currentCategory);
    if (result.success) {
      handleCloseEditModal();
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      await fetchCategories(user.restaurantId);
    }
  };

  // Xóa category
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      const result = await deleteCategory(id);
      if (result.success) {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        await fetchCategories(user.restaurantId);
      }
    }
  };

  // Filter categories
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleViewFoods = (categoryId, categoryName) => {
    console.log("handleViewFoods Debug:");
    console.log("- categoryId:", categoryId);
    console.log("- categoryName:", categoryName);
    console.log("- Total restaurantFoods:", restaurantFoods.length);
    console.log("- Sample food:", restaurantFoods[0]);

    // So sánh với cả categoryId VÀ category (string)
    const filtered = restaurantFoods.filter((f) => {
      const matchById = f.categoryId === categoryId;
      const matchByName = f.category === categoryName;
      console.log(
        `Food "${f.name}": categoryId=${f.categoryId}, category=${f.category}, matchById=${matchById}, matchByName=${matchByName}`
      );
      return matchById || matchByName;
    });

    console.log("- Filtered foods:", filtered.length);
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
                      onClick={() => handleViewFoods(cat.id, cat.name)}
                    >
                      {
                        restaurantFoods.filter(
                          (f) =>
                            f.categoryId === cat.id || f.category === cat.name
                        ).length
                      }{" "}
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
                      <MdEdit />
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(cat.id)}
                    >
                      <MdDelete />
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
                    {loading ? "Adding..." : "Add"}
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
                    {loading ? "Saving..." : "Save"}
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
