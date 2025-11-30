import React, { useState } from "react";
import { formatCurrency } from "shared-utils";

const PromotionTable = ({ promotions, onEdit, onToggleStatus, onDelete }) => {
    const [expandedId, setExpandedId] = useState(null);

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const getDiscountDisplay = (promotion) => {
        if (promotion.type === "percentage") {
            return `${promotion.value}%`;
        }
        return formatCurrency(promotion.value);
    };

    const getStatusBadgeClass = (status) => {
        return status === "active" ? "status-active" : "status-inactive";
    };

    return (
        <table className="promotions-table">
            <thead>
                <tr>
                    <th>STT</th>
                    <th>Mã KM</th>
                    <th>Tên khuyến mãi</th>
                    <th>Loại</th>
                    <th>Giảm giá</th>
                    <th>Đã dùng</th>
                    <th>Trạng thái</th>
                    <th>Hết hạn</th>
                    <th>Thao tác</th>
                </tr>
            </thead>
            <tbody>
                {promotions.map((promo, index) => (
                    <React.Fragment key={promo.id}>
                        <tr
                            className={`promotion-row ${expandedId === promo.id ? 'expanded' : ''}`}
                        >
                            <td>{index + 1}</td>
                            <td className="promo-code">{promo.code}</td>
                            <td className="promo-name">{promo.name}</td>
                            <td>
                                <span className="type-badge">
                                    {promo.type === "percentage" ? "%" : "VNĐ"}
                                </span>
                            </td>
                            <td className="discount-value">{getDiscountDisplay(promo)}</td>
                            <td>
                                <span className="usage-count">
                                    {promo.usedCount || 0} / {promo.usageLimit || "∞"}
                                </span>
                            </td>
                            <td>
                                <span className={`status-badge ${getStatusBadgeClass(promo.status)}`}>
                                    {promo.status === "active" ? "Hoạt động" : "Tắt"}
                                </span>
                            </td>
                            <td>
                                {promo.endDate
                                    ? new Date(promo.endDate).toLocaleDateString("vi-VN")
                                    : "Không giới hạn"}
                            </td>
                            <td>
                                <div className="action-buttons">
                                    <button
                                        className="btn-view"
                                        onClick={() => toggleExpand(promo.id)}
                                        title="Xem chi tiết"
                                    >
                                        {expandedId === promo.id ? "Thu gọn" : "Chi tiết"}
                                    </button>
                                    <button
                                        className="btn-edit"
                                        onClick={() => onEdit(promo)}
                                        title="Sửa"
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        className={promo.status === "active" ? "btn-block" : "btn-activate"}
                                        onClick={() => onToggleStatus(promo)}
                                        title={promo.status === "active" ? "Tắt" : "Bật"}
                                    >
                                        {promo.status === "active" ? "Tắt" : "Bật"}
                                    </button>
                                    <button
                                        className="btn-delete"
                                        onClick={() => onDelete(promo.id)}
                                        title="Xóa"
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </td>
                        </tr>
                        {expandedId === promo.id && (
                            <tr className="promotion-detail-row">
                                <td colSpan="9">
                                    <div className="promotion-detail-container">
                                        <div className="promotion-info-grid">
                                            <div className="promotion-info-section">
                                                <h4>Thông tin chung</h4>
                                                <div className="promotion-info-field">
                                                    <span className="label">Mô tả:</span>
                                                    <span className="value">{promo.description || "Không có mô tả"}</span>
                                                </div>
                                                <div className="promotion-info-field">
                                                    <span className="label">Ngày bắt đầu:</span>
                                                    <span className="value">
                                                        {promo.startDate
                                                            ? new Date(promo.startDate).toLocaleDateString("vi-VN")
                                                            : "N/A"}
                                                    </span>
                                                </div>
                                                <div className="promotion-info-field">
                                                    <span className="label">Ngày kết thúc:</span>
                                                    <span className="value">
                                                        {promo.endDate
                                                            ? new Date(promo.endDate).toLocaleDateString("vi-VN")
                                                            : "Không giới hạn"}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="promotion-info-section">
                                                <h4>Điều kiện áp dụng</h4>
                                                <div className="promotion-info-field">
                                                    <span className="label">Đơn hàng tối thiểu:</span>
                                                    <span className="value">{formatCurrency(promo.minOrderValue || 0)}</span>
                                                </div>
                                                {promo.maxDiscount > 0 && (
                                                    <div className="promotion-info-field">
                                                        <span className="label">Giảm giá tối đa:</span>
                                                        <span className="value">{formatCurrency(promo.maxDiscount)}</span>
                                                    </div>
                                                )}
                                                <div className="promotion-info-field">
                                                    <span className="label">Giới hạn sử dụng:</span>
                                                    <span className="value">
                                                        {promo.usageLimit ? `${promo.usageLimit} lần` : "Không giới hạn"}
                                                    </span>
                                                </div>
                                                <div className="promotion-info-field">
                                                    <span className="label">Số lần đã dùng:</span>
                                                    <span className="value">{promo.usedCount || 0} lần</span>
                                                </div>
                                            </div>

                                            <div className="promotion-info-section">
                                                <h4>Phạm vi áp dụng</h4>
                                                <div className="promotion-info-field">
                                                    <span className="label">Khung giờ áp dụng:</span>
                                                    <span className="value">
                                                        {promo.applicableTimeRange || "Cả ngày"}
                                                    </span>
                                                </div>
                                                <div className="promotion-info-field">
                                                    <span className="label">Phạm vi:</span>
                                                    <span className="value">
                                                        Chỉ áp dụng cho nhà hàng này
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </React.Fragment>
                ))}
            </tbody>
        </table>
    );
};

export default PromotionTable;
