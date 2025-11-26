import React from "react";
import { formatCurrency } from "shared-utils";

const PromotionCard = ({ promotion, onEdit, onToggleStatus, onDelete }) => {
    const getDiscountDisplay = () => {
        if (promotion.type === "percentage") {
            return `${promotion.value}%`;
        }
        return formatCurrency(promotion.value);
    };

    return (
        <div className={`promotion-card ${promotion.status}`}>
            <div className="promo-header">
                <div className="promo-code">{promotion.code}</div>
                <span className={`promo-status ${promotion.status}`}>
                    {promotion.status}
                </span>
            </div>

            <h3 className="promo-name">{promotion.name}</h3>
            <p className="promo-description">{promotion.description}</p>

            <div className="promo-details">
                <div className="promo-value">
                    <span className="label">Giảm giá:</span>
                    <span className="value">{getDiscountDisplay()}</span>
                </div>
                <div className="promo-detail">
                    <span className="label">Đơn tối thiểu:</span>
                    <span>{formatCurrency(promotion.minOrderValue)}</span>
                </div>
                {promotion.maxDiscount > 0 && (
                    <div className="promo-detail">
                        <span className="label">Giảm tối đa:</span>
                        <span>{formatCurrency(promotion.maxDiscount)}</span>
                    </div>
                )}
                <div className="promo-detail">
                    <span className="label">Đã dùng:</span>
                    <span>
                        {promotion.usedCount || 0} / {promotion.usageLimit || "∞"}
                    </span>
                </div>
                <div className="promo-detail">
                    <span className="label">Hết hạn:</span>
                    <span>
                        {promotion.endDate
                            ? new Date(promotion.endDate).toLocaleDateString()
                            : "N/A"}
                    </span>
                </div>
            </div>

            <div className="promo-actions">
                <button className="btn-edit" onClick={() => onEdit(promotion)}>
                    Sửa
                </button>
                <button
                    className="btn-toggle"
                    onClick={() => onToggleStatus(promotion)}
                >
                    {promotion.status === "active" ? "Tắt" : "Bật"}
                </button>
                <button
                    className="btn-delete"
                    onClick={() => onDelete(promotion.id)}
                >
                    Xóa
                </button>
            </div>
        </div>
    );
};

export default PromotionCard;
