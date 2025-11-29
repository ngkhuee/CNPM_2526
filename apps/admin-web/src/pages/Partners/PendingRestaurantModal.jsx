import React from "react";
import { MdClose, MdEmail, MdPhone, MdLocationOn, MdRestaurant, MdAccessTime } from "react-icons/md";
import { getImageUrl } from "shared-utils";
import "./PendingRestaurantModal.css";

const PendingRestaurantModal = ({ restaurant, onClose }) => {
    if (!restaurant) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content pending-restaurant-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Xem nhanh thông tin đối tác chờ duyệt</h2>
                    <button className="btn-close-modal" onClick={onClose}>
                        <MdClose />
                    </button>
                </div>

                <div className="modal-body">
                    {/* Restaurant Image and Name */}
                    <div className="restaurant-showcase">
                        <img
                            src={getImageUrl(restaurant.image)}
                            alt={restaurant.name}
                            className="restaurant-image"
                        />
                        <div className="restaurant-main-info">
                            <h3 className="restaurant-title">{restaurant.name}</h3>
                        </div>
                    </div>

                    {/* Restaurant Details */}
                    <div className="details-grid">
                        <div className="detail-item">
                            <div className="detail-label">
                                <MdEmail /> Email
                            </div>
                            <div className="detail-value">{restaurant.email || "N/A"}</div>
                        </div>

                        <div className="detail-item">
                            <div className="detail-label">
                                <MdPhone /> Điện thoại
                            </div>
                            <div className="detail-value">{restaurant.phone || "N/A"}</div>
                        </div>

                        <div className="detail-item full-width">
                            <div className="detail-label">
                                <MdLocationOn /> Địa chỉ
                            </div>
                            <div className="detail-value">{restaurant.address || "N/A"}</div>
                        </div>

                        <div className="detail-item">
                            <div className="detail-label">
                                <MdAccessTime /> Ngày đăng ký
                            </div>
                            <div className="detail-value">
                                {(() => {
                                    const dateStr = restaurant.created_at || restaurant.createdAt;
                                    if (!dateStr) return "N/A";
                                    const date = new Date(dateStr);
                                    if (isNaN(date.getTime())) return "N/A";
                                    return date.toLocaleDateString("vi-VN", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    });
                                })()}
                            </div>
                        </div>

                        <div className="detail-item">
                            <div className="detail-label">Chủ nhà hàng</div>
                            <div className="detail-value">
                                {restaurant.ownerName || restaurant.owner_name || restaurant.full_name || "Không có thông tin"}
                            </div>
                        </div>

                        {restaurant.description && (
                            <div className="detail-item full-width">
                                <div className="detail-label">Mô tả</div>
                                <div className="detail-value description">
                                    {restaurant.description}
                                </div>
                            </div>
                        )}

                        {/* Giờ mở cửa - Ẩn đi vì hiển thị JSON không đẹp */}

                        {restaurant.min_order_amount && (
                            <div className="detail-item">
                                <div className="detail-label">Đơn tối thiểu</div>
                                <div className="detail-value">
                                    {restaurant.min_order_amount.toLocaleString("vi-VN")}đ
                                </div>
                            </div>
                        )}

                        {restaurant.delivery_time_minutes && (
                            <div className="detail-item">
                                <div className="detail-label">Thời gian giao</div>
                                <div className="detail-value">
                                    {restaurant.delivery_time_minutes} phút
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Banner Image */}
                    {restaurant.banner_image && (
                        <div className="banner-section">
                            <div className="detail-label">Ảnh Banner</div>
                            <img
                                src={getImageUrl(restaurant.banner_image)}
                                alt="Banner"
                                className="banner-image"
                            />
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose}>
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PendingRestaurantModal;
