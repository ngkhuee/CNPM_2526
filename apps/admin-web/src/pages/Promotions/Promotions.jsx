import React, { useState, useEffect } from "react";
import { promotionService } from "shared-services";
import { usePromotionForm } from "../../hooks/usePromotionForm";
import PromotionModal from "./PromotionModal";
import PromotionTable from "./PromotionTable";
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
    return <div className="promotions-page">Đang tải...</div>;
  }

  return (
    <div className="promotions-page">
      <div className="promotions-header">
        <h2>Khuyến mãi Hệ thống</h2>
        <button
          className="btn-add"
          onClick={() => openModal()}
        >
          + Thêm khuyến mãi
        </button>
      </div>

      {promotions.length === 0 ? (
        <div className="no-data">
          <p>Chưa có khuyến mãi. Tạo khuyến mãi đầu tiên cho toàn hệ thống!</p>
        </div>
      ) : (
        <div className="promotions-table-container">
          <PromotionTable
            promotions={promotions}
            onEdit={openModal}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDelete}
          />
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
