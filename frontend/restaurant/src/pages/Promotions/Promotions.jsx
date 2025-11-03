import React, { useState, useContext, useEffect } from "react";
import "./Promotions.css";
import { MdEdit, MdDelete, MdAdd } from "react-icons/md";
import { PromotionContext } from "../../Context/PromotionContext";
import { RestaurantContext } from "../../Context/RestaurantContext";
import { authService } from "@api/services";

const Promotions = () => {
  const {
    getRestaurantPromotions,
    addPromotion,
    updatePromotion,
    deletePromotion,
    fetchPromotions,
    loading,
  } = useContext(PromotionContext);
  const { currentRestaurant } = useContext(RestaurantContext);
  const [restaurantPromotions, setRestaurantPromotions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newPromo, setNewPromo] = useState({
    code: "",
    name: "",
    description: "",
    type: "percentage",
    value: "",
    minOrderValue: "",
    maxDiscount: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editPromo, setEditPromo] = useState({
    id: null,
    code: "",
    name: "",
    description: "",
    type: "percentage",
    value: "",
    minOrderValue: "",
    maxDiscount: "",
    startDate: "",
    endDate: "",
  });

  // Load restaurant promotions
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user && user.restaurantId) {
      const promos = getRestaurantPromotions(user.restaurantId);
      setRestaurantPromotions(promos);
    }
  }, [getRestaurantPromotions]);

  // Modal handlers
  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setNewPromo({
      code: "",
      name: "",
      description: "",
      type: "percentage",
      value: "",
      minOrderValue: "",
      maxDiscount: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    });
  };

  // Auto-calculate status based on dates
  const calculateStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) {
      return "upcoming";
    } else if (now > end) {
      return "expired";
    } else {
      return "active";
    }
  };

  // Validate form
  const validatePromotion = (promo) => {
    // Check code
    if (!promo.code || promo.code.trim().length < 3) {
      alert("Code must be at least 3 characters!");
      return false;
    }

    // Check value
    const value = Number(promo.value);
    if (!promo.value || value <= 0) {
      alert("Value must be greater than 0!");
      return false;
    }

    // Check percentage range
    if (promo.type === "percentage" && (value < 1 || value > 100)) {
      alert("Percentage must be between 1 and 100!");
      return false;
    }

    // Check fixed amount
    if (promo.type === "fixed" && value < 1000) {
      alert("Fixed discount must be at least 1,000₫!");
      return false;
    }

    // Check dates
    const startDate = new Date(promo.startDate);
    const endDate = new Date(promo.endDate);

    if (endDate <= startDate) {
      alert("End date must be after start date!");
      return false;
    }

    // Check minOrderValue
    if (promo.minOrderValue && Number(promo.minOrderValue) < 0) {
      alert("Minimum order value cannot be negative!");
      return false;
    }

    // Check maxDiscount for percentage type
    if (
      promo.type === "percentage" &&
      promo.maxDiscount &&
      Number(promo.maxDiscount) <= 0
    ) {
      alert("Maximum discount must be greater than 0!");
      return false;
    }

    return true;
  };

  // Add promotion
  const handleAddPromotion = async (e) => {
    e.preventDefault();

    if (!validatePromotion(newPromo)) {
      return;
    }

    const user = authService.getCurrentUser();

    if (!user || !user.restaurantId) {
      alert("❌ Restaurant ID not found!");
      return;
    }

    // Calculate status based on dates
    const status = calculateStatus(newPromo.startDate, newPromo.endDate);

    const promotionData = {
      code: newPromo.code.trim().toUpperCase(),
      name: newPromo.name.trim(),
      description: newPromo.description.trim(),
      type: newPromo.type,
      value: Number(newPromo.value),
      minOrderValue: Number(newPromo.minOrderValue) || 0,
      maxDiscount: Number(newPromo.maxDiscount) || 0,
      startDate: new Date(newPromo.startDate).toISOString(),
      endDate: new Date(newPromo.endDate).toISOString(),
      status: status,
      restaurantId: user.restaurantId,
      createdBy: "restaurant",
      applicableRestaurants: [user.restaurantId],
      usageLimit: 1000,
      usedCount: 0,
    };

    const result = await addPromotion(promotionData);
    if (result.success) {
      // Fetch fresh data from backend
      await fetchPromotions();
      const promos = getRestaurantPromotions(user.restaurantId);
      setRestaurantPromotions(promos);
      handleCloseModal();
    }
  };

  // Change status (removed - status is auto-calculated)
  const handleStatusChange = async (id, newStatus) => {
    const promo = restaurantPromotions.find((p) => p.id === id);
    if (promo) {
      await updatePromotion(id, { ...promo, status: newStatus });
      await fetchPromotions();
      const user = authService.getCurrentUser();
      const promos = getRestaurantPromotions(user.restaurantId);
      setRestaurantPromotions(promos);
    }
  };

  // Edit modal
  const handleOpenEditModal = (promo) => {
    setEditPromo(promo);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditPromo({
      id: null,
      code: "",
      name: "",
      description: "",
      type: "percentage",
      value: "",
      minOrderValue: "",
      maxDiscount: "",
      startDate: "",
      endDate: "",
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!validatePromotion(editPromo)) {
      return;
    }

    // Calculate status based on dates
    const status = calculateStatus(editPromo.startDate, editPromo.endDate);

    const updatedData = {
      ...editPromo,
      code: editPromo.code.trim().toUpperCase(),
      name: editPromo.name.trim(),
      description: editPromo.description.trim(),
      value: Number(editPromo.value),
      minOrderValue: Number(editPromo.minOrderValue) || 0,
      maxDiscount: Number(editPromo.maxDiscount) || 0,
      status: status,
    };

    const result = await updatePromotion(editPromo.id, updatedData);
    if (result.success) {
      await fetchPromotions();
      const user = authService.getCurrentUser();
      const promos = getRestaurantPromotions(user.restaurantId);
      setRestaurantPromotions(promos);
      handleCloseEditModal();
    }
  };

  // Delete promotion
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this promotion?")) {
      const result = await deletePromotion(id);
      if (result.success) {
        await fetchPromotions();
        const user = authService.getCurrentUser();
        const promos = getRestaurantPromotions(user.restaurantId);
        setRestaurantPromotions(promos);
      }
    }
  };

  return (
    <div className="main-content">
      <div className="promotions-page">
        <div className="promotions-header">
          <h2>My Restaurant Promotions</h2>
          <button
            className="add-btn"
            onClick={handleOpenModal}
            disabled={loading}
          >
            <MdAdd /> Add Promotion
          </button>
        </div>

        {loading && <p>Loading promotions...</p>}

        <table className="promotions-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Description</th>
              <th>Type</th>
              <th>Value</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {restaurantPromotions.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: "center" }}>
                  No promotions yet. Create your first promotion!
                </td>
              </tr>
            ) : (
              restaurantPromotions.map((promo) => (
                <tr key={promo.id}>
                  <td>
                    <strong>{promo.code}</strong>
                  </td>
                  <td>{promo.name}</td>
                  <td>{promo.description}</td>
                  <td>
                    {promo.type === "percentage"
                      ? "Percentage"
                      : "Fixed Amount"}
                  </td>
                  <td>
                    {promo.type === "percentage"
                      ? `${promo.value}%`
                      : `${promo.value.toLocaleString()}₫`}
                  </td>
                  <td>
                    {promo.startDate
                      ? new Date(promo.startDate).toLocaleDateString("vi-VN")
                      : "N/A"}
                  </td>
                  <td>
                    {promo.endDate
                      ? new Date(promo.endDate).toLocaleDateString("vi-VN")
                      : "N/A"}
                  </td>
                  <td>
                    <span
                      className={`status-badge ${promo.status.toLowerCase()}`}
                    >
                      {promo.status === "active" && "🟢 Active"}
                      {promo.status === "upcoming" && "🟡 Upcoming"}
                      {promo.status === "expired" && "⚫ Expired"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => handleOpenEditModal(promo)}
                    >
                      <MdEdit />
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(promo.id)}
                    >
                      <MdDelete />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Modal Add */}
        {showModal && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Add New Promotion</h3>
              <form onSubmit={handleAddPromotion}>
                <label>
                  Code:
                  <input
                    type="text"
                    value={newPromo.code}
                    onChange={(e) =>
                      setNewPromo({
                        ...newPromo,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="e.g., SUMMER20"
                    required
                  />
                </label>
                <label>
                  Name:
                  <input
                    type="text"
                    value={newPromo.name}
                    onChange={(e) =>
                      setNewPromo({ ...newPromo, name: e.target.value })
                    }
                    placeholder="e.g., Summer Sale"
                    required
                  />
                </label>
                <label>
                  Description:
                  <textarea
                    value={newPromo.description}
                    onChange={(e) =>
                      setNewPromo({ ...newPromo, description: e.target.value })
                    }
                    placeholder="Describe your promotion..."
                    required
                  />
                </label>
                <label>
                  Type:
                  <select
                    value={newPromo.type}
                    onChange={(e) =>
                      setNewPromo({ ...newPromo, type: e.target.value })
                    }
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₫)</option>
                  </select>
                </label>
                <label>
                  Value:
                  <input
                    type="number"
                    value={newPromo.value}
                    onChange={(e) =>
                      setNewPromo({
                        ...newPromo,
                        value: Number(e.target.value),
                      })
                    }
                    placeholder={
                      newPromo.type === "percentage" ? "20" : "50000"
                    }
                    required
                  />
                </label>
                <label>
                  Min Order Value (₫):
                  <input
                    type="number"
                    value={newPromo.minOrderValue}
                    onChange={(e) =>
                      setNewPromo({
                        ...newPromo,
                        minOrderValue: Number(e.target.value),
                      })
                    }
                    placeholder="100000"
                  />
                </label>
                <label>
                  Max Discount (₫):
                  <input
                    type="number"
                    value={newPromo.maxDiscount}
                    onChange={(e) =>
                      setNewPromo({
                        ...newPromo,
                        maxDiscount: Number(e.target.value),
                      })
                    }
                    placeholder="50000"
                  />
                </label>
                <label>
                  Start Date:
                  <input
                    type="date"
                    value={newPromo.startDate}
                    onChange={(e) =>
                      setNewPromo({ ...newPromo, startDate: e.target.value })
                    }
                    required
                  />
                </label>
                <label>
                  End Date:
                  <input
                    type="date"
                    value={newPromo.endDate}
                    onChange={(e) =>
                      setNewPromo({ ...newPromo, endDate: e.target.value })
                    }
                    required
                  />
                </label>
                <div className="info-note">
                  <small>
                    ℹ️ Status will be automatically determined based on start
                    and end dates
                  </small>
                </div>
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

        {/* Modal Edit */}
        {showEditModal && (
          <div className="modal-overlay" onClick={handleCloseEditModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Edit Promotion</h3>
              <form onSubmit={handleEditSubmit}>
                <label>
                  Code:
                  <input
                    type="text"
                    value={editPromo.code}
                    onChange={(e) =>
                      setEditPromo({
                        ...editPromo,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    required
                  />
                </label>
                <label>
                  Name:
                  <input
                    type="text"
                    value={editPromo.name}
                    onChange={(e) =>
                      setEditPromo({ ...editPromo, name: e.target.value })
                    }
                    required
                  />
                </label>
                <label>
                  Description:
                  <textarea
                    value={editPromo.description}
                    onChange={(e) =>
                      setEditPromo({
                        ...editPromo,
                        description: e.target.value,
                      })
                    }
                    required
                  />
                </label>
                <label>
                  Type:
                  <select
                    value={editPromo.type}
                    onChange={(e) =>
                      setEditPromo({ ...editPromo, type: e.target.value })
                    }
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₫)</option>
                  </select>
                </label>
                <label>
                  Value:
                  <input
                    type="number"
                    value={editPromo.value}
                    onChange={(e) =>
                      setEditPromo({
                        ...editPromo,
                        value: Number(e.target.value),
                      })
                    }
                    required
                  />
                </label>
                <label>
                  Min Order Value (₫):
                  <input
                    type="number"
                    value={editPromo.minOrderValue}
                    onChange={(e) =>
                      setEditPromo({
                        ...editPromo,
                        minOrderValue: Number(e.target.value),
                      })
                    }
                  />
                </label>
                <label>
                  Max Discount (₫):
                  <input
                    type="number"
                    value={editPromo.maxDiscount}
                    onChange={(e) =>
                      setEditPromo({
                        ...editPromo,
                        maxDiscount: Number(e.target.value),
                      })
                    }
                  />
                </label>
                <label>
                  Start Date:
                  <input
                    type="date"
                    value={
                      editPromo.startDate
                        ? new Date(editPromo.startDate)
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      setEditPromo({ ...editPromo, startDate: e.target.value })
                    }
                    required
                  />
                </label>
                <label>
                  End Date:
                  <input
                    type="date"
                    value={
                      editPromo.endDate
                        ? new Date(editPromo.endDate)
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      setEditPromo({ ...editPromo, endDate: e.target.value })
                    }
                    required
                  />
                </label>
                <div className="info-note">
                  <small>
                    ℹ️ Status will be automatically updated based on start and
                    end dates
                  </small>
                </div>
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
    </div>
  );
};

export default Promotions;
