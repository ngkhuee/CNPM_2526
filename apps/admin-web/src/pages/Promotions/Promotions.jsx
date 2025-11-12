import React, { useState, useEffect } from "react";
import { promotionService } from "shared-services";
import { usePromotionForm } from "../../hooks/usePromotionForm";
import PromotionModal from "./PromotionModal";
import PromotionCard from "./PromotionCard";
import "./Promotions.css";

const Promotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchPromotions() {
    try {
      setLoading(true);
      const response = await promotionService.getAll();
      // Filter system-wide promotions (no restaurantId or empty applicableRestaurants)
      const systemPromotions = (response || []).filter(
        (p) => !p.restaurantId || p.applicableRestaurants?.length === 0
      );
      setPromotions(systemPromotions);
    } catch (error) {
      console.error("Error fetching promotions:", error);
    } finally {
      setLoading(false);
    }
  }

  const {
    showModal,
    editingPromotion,
    formData,
    openModal,
    closeModal,
    handleSubmit,
    handleChange,
    handleDelete,
    handleToggleStatus,
  } = usePromotionForm(fetchPromotions);

  useEffect(() => {
    fetchPromotions();
  }, []);

  if (loading) {
    return <div className="promotions-page">Loading...</div>;
  }

  return (
    <div className="promotions-page">
      <div className="promotions-header">
        <h2>System Promotions</h2>
        <button
          className="btn-add"
          onClick={() => openModal()}
        >
          + Add Promotion
        </button>
      </div>

      <div className="promotions-grid">
        {promotions.map((promo) => (
          <PromotionCard
            key={promo.id}
            promotion={promo}
            onEdit={openModal}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {promotions.length === 0 && (
        <div className="no-data">
          <p>No promotions found. Create your first system-wide promotion!</p>
        </div>
      )}

      <PromotionModal
        isOpen={showModal}
        isEditing={!!editingPromotion}
        formData={formData}
        onSubmit={handleSubmit}
        onChange={handleChange}
        onClose={closeModal}
      />
    </div>
  );
};

export default Promotions;
