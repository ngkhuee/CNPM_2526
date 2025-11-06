import React, { useState, useEffect } from "react";
import { promotionService } from "shared-services";
import { formatCurrency } from "shared-utils";
import "./Promotions.css";

const Promotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    type: "percentage",
    value: "",
    minOrderValue: "",
    maxDiscount: "",
    startDate: "",
    endDate: "",
    usageLimit: "",
    status: "active",
  });

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const response = await promotionService.getAll();
      // Filter system-wide promotions (không có restaurantId hoặc applicableRestaurants rỗng)
      const systemPromotions = (response || []).filter(
        (p) => !p.restaurantId || p.applicableRestaurants?.length === 0
      );
      setPromotions(systemPromotions);
    } catch (error) {
      console.error("Error fetching promotions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const promotionData = {
      ...formData,
      value: Number(formData.value),
      minOrderValue: Number(formData.minOrderValue) || 0,
      maxDiscount: Number(formData.maxDiscount) || 0,
      usageLimit: Number(formData.usageLimit) || 0,
      usedCount: editingPromotion ? editingPromotion.usedCount : 0,
      applicableRestaurants: [], // System-wide = empty array
    };

    try {
      if (editingPromotion) {
        await promotionService.update(editingPromotion.id, promotionData);
        alert("Promotion updated successfully!");
      } else {
        await promotionService.create(promotionData);
        alert("Promotion created successfully!");
      }
      setShowModal(false);
      resetForm();
      await fetchPromotions();
    } catch (error) {
      alert("Failed to save promotion: " + error.message);
    }
  };

  const handleEdit = (promotion) => {
    setEditingPromotion(promotion);
    setFormData({
      code: promotion.code,
      name: promotion.name,
      description: promotion.description,
      type: promotion.type,
      value: promotion.value,
      minOrderValue: promotion.minOrderValue,
      maxDiscount: promotion.maxDiscount,
      startDate: promotion.startDate ? promotion.startDate.split("T")[0] : "",
      endDate: promotion.endDate ? promotion.endDate.split("T")[0] : "",
      usageLimit: promotion.usageLimit,
      status: promotion.status,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this promotion?")) {
      try {
        await promotionService.delete(id);
        alert("Promotion deleted successfully!");
        await fetchPromotions();
      } catch (error) {
        alert("Failed to delete promotion");
      }
    }
  };

  const handleToggleStatus = async (promotion) => {
    const newStatus = promotion.status === "active" ? "inactive" : "active";
    try {
      await promotionService.update(promotion.id, { status: newStatus });
      await fetchPromotions();
    } catch (error) {
      alert("Failed to update status");
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      description: "",
      type: "percentage",
      value: "",
      minOrderValue: "",
      maxDiscount: "",
      startDate: "",
      endDate: "",
      usageLimit: "",
      status: "active",
    });
    setEditingPromotion(null);
  };

  const getDiscountDisplay = (promo) => {
    if (promo.type === "percentage") {
      return `${promo.value}%`;
    }
    return formatCurrency(promo.value);
  };

  if (loading) {
    return <div className="promotions-page">Loading...</div>;
  }

  return (
    <div className="promotions-page">
      <div className="promotions-header">
        <h2>System Promotions</h2>
        <button
          className="btn-add"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          + Add Promotion
        </button>
      </div>

      <div className="promotions-grid">
        {promotions.map((promo) => (
          <div key={promo.id} className={`promotion-card ${promo.status}`}>
            <div className="promo-header">
              <div className="promo-code">{promo.code}</div>
              <span className={`promo-status ${promo.status}`}>
                {promo.status}
              </span>
            </div>

            <h3 className="promo-name">{promo.name}</h3>
            <p className="promo-description">{promo.description}</p>

            <div className="promo-details">
              <div className="promo-value">
                <span className="label">Discount:</span>
                <span className="value">{getDiscountDisplay(promo)}</span>
              </div>
              <div className="promo-detail">
                <span className="label">Min Order:</span>
                <span>{formatCurrency(promo.minOrderValue)}</span>
              </div>
              {promo.maxDiscount > 0 && (
                <div className="promo-detail">
                  <span className="label">Max Discount:</span>
                  <span>{formatCurrency(promo.maxDiscount)}</span>
                </div>
              )}
              <div className="promo-detail">
                <span className="label">Usage:</span>
                <span>
                  {promo.usedCount || 0} / {promo.usageLimit || "∞"}
                </span>
              </div>
              <div className="promo-detail">
                <span className="label">Valid Until:</span>
                <span>
                  {promo.endDate
                    ? new Date(promo.endDate).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
            </div>

            <div className="promo-actions">
              <button className="btn-edit" onClick={() => handleEdit(promo)}>
                Edit
              </button>
              <button
                className="btn-toggle"
                onClick={() => handleToggleStatus(promo)}
              >
                {promo.status === "active" ? "Deactivate" : "Activate"}
              </button>
              <button
                className="btn-delete"
                onClick={() => handleDelete(promo.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {promotions.length === 0 && (
        <div className="no-data">
          <p>No promotions found. Create your first system-wide promotion!</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editingPromotion ? "Edit Promotion" : "Create Promotion"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Code *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    required
                    placeholder="SUMMER2024"
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  placeholder="Summer Sale"
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                  placeholder="Get discount on all orders"
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₫)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Value *</label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) =>
                      setFormData({ ...formData, value: e.target.value })
                    }
                    required
                    placeholder={
                      formData.type === "percentage" ? "20" : "50000"
                    }
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Min Order Value</label>
                  <input
                    type="number"
                    value={formData.minOrderValue}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minOrderValue: e.target.value,
                      })
                    }
                    placeholder="100000"
                  />
                </div>
                <div className="form-group">
                  <label>Max Discount</label>
                  <input
                    type="number"
                    value={formData.maxDiscount}
                    onChange={(e) =>
                      setFormData({ ...formData, maxDiscount: e.target.value })
                    }
                    placeholder="50000"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Date *</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Usage Limit</label>
                <input
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) =>
                    setFormData({ ...formData, usageLimit: e.target.value })
                  }
                  placeholder="100"
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-save">
                  {editingPromotion ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowModal(false)}
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

export default Promotions;
