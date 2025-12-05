import React, { useState, useEffect, useContext } from "react";
import { promotionService } from "shared-services";
import { usePromotionForm } from "../../hooks/usePromotionForm";
import { AuthContext } from "../../Context/AuthContext";
import PromotionModal from "./PromotionModal";
import PromotionTable from "./PromotionTable";
import "./Promotions.css";

const Promotions = () => {
  const { currentUser } = useContext(AuthContext);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchPromotions() {
    if (!currentUser?.restaurantId) return;

    try {
      setLoading(true);
      const response = await promotionService.getAll();
      // Filter promotions for this restaurant only
      const restaurantPromotions = (response || []).filter(
        (p) => p.restaurantId === currentUser.restaurantId
      );
      setPromotions(restaurantPromotions);
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
  } = usePromotionForm(currentUser?.restaurantId, fetchPromotions);

  useEffect(() => {
    if (currentUser?.restaurantId) {
      fetchPromotions();
    }
  }, [currentUser]);

  if (loading) {
    return <div className="promotions-page">Đang tải...</div>;
  }

  if (!currentUser?.restaurantId) {
    return <div className="promotions-page">Không tìm thấy thông tin nhà hàng</div>;
  }

  return (
    <div className="promotions-page">
      <div className="promotions-header">
        <h2>Khuyến mãi của tôi</h2>
        <button
          className="btn-add"
          onClick={() => openModal()}
        >
          + Thêm khuyến mãi
        </button>
      </div>

      {promotions.length === 0 ? (
        <div className="no-data">
          <p>Chưa có khuyến mãi. Tạo khuyến mãi đầu tiên cho nhà hàng của bạn!</p>
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
