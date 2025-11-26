import React from "react";
import { getImageUrl, formatRating } from "shared-utils";

const PartnerDetailsModal = ({ isOpen, onClose, restaurant }) => {
    if (!isOpen || !restaurant) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Chi tiết Nhà hàng</h3>
                    <button className="close-btn" onClick={onClose}>
                        ×
                    </button>
                </div>
                <div className="modal-body">
                    <div className="detail-row">
                        <img
                            src={getImageUrl(restaurant.image)}
                            alt={restaurant.name}
                            className="modal-image"
                        />
                    </div>
                    <div className="detail-row">
                        <strong>Tên nhà hàng:</strong>
                        <span>{restaurant.name}</span>
                    </div>
                    <div className="detail-row">
                        <strong>Email:</strong>
                        <span>{restaurant.email}</span>
                    </div>
                    <div className="detail-row">
                        <strong>Điện thoại:</strong>
                        <span>{restaurant.phone}</span>
                    </div>
                    <div className="detail-row">
                        <strong>Địa chỉ:</strong>
                        <span>{restaurant.address}</span>
                    </div>
                    <div className="detail-row">
                        <strong>Mô tả:</strong>
                        <span>{restaurant.description || "N/A"}</span>
                    </div>
                    <div className="detail-row">
                        <strong>Danh mục:</strong>
                        <span>{restaurant.primary_category || "N/A"}</span>
                    </div>
                    <div className="detail-row">
                        <strong>Trạng thái:</strong>
                        <span className={`status-badge status-${restaurant.status}`}>
                            {restaurant.status}
                        </span>
                    </div>
                    <div className="detail-row">
                        <strong>Đánh giá:</strong>
                        <span>
                            Đánh giá: {formatRating(restaurant.rating || 0)} (
                            {restaurant.total_reviews || 0} lượt)
                        </span>
                    </div>
                    <div className="detail-row">
                        <strong>Ngày đăng ký:</strong>
                        <span>
                            {new Date(restaurant.created_at).toLocaleString("vi-VN")}
                        </span>
                    </div>
                </div>
                <div className="modal-footer">
                    <button onClick={onClose} className="btn-close">
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PartnerDetailsModal;
