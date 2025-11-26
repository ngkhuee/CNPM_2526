import React from "react";

const PromotionModal = ({
    isOpen,
    isEditing,
    formData,
    onSubmit,
    onChange,
    onClose,
}) => {
    if (!isOpen) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h3>{isEditing ? "Sửa khuyến mãi" : "Tạo khuyến mãi"}</h3>
                <form onSubmit={onSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Mã *</label>
                            <input
                                type="text"
                                value={formData.code}
                                onChange={(e) =>
                                    onChange("code", e.target.value.toUpperCase())
                                }
                                required
                                placeholder="SUMMER2024"
                            />
                        </div>
                        <div className="form-group">
                            <label>Trạng thái</label>
                            <select
                                value={formData.status}
                                onChange={(e) => onChange("status", e.target.value)}
                            >
                                <option value="active">Hoạt động</option>
                                <option value="inactive">Tạm ngưng</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Tên *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => onChange("name", e.target.value)}
                            required
                            placeholder="Khuyến mãi mùa hè"
                        />
                    </div>

                    <div className="form-group">
                        <label>Mô tả *</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => onChange("description", e.target.value)}
                            required
                            placeholder="Giảm giá cho tất cả đơn hàng"
                            rows={3}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Loại *</label>
                            <select
                                value={formData.type}
                                onChange={(e) => onChange("type", e.target.value)}
                            >
                                <option value="percentage">Phần trăm (%)</option>
                                <option value="fixed">Số tiền cố định (₫)</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Giá trị *</label>
                            <input
                                type="number"
                                value={formData.value}
                                onChange={(e) => onChange("value", e.target.value)}
                                required
                                placeholder={formData.type === "percentage" ? "20" : "50000"}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Đơn tối thiểu</label>
                            <input
                                type="number"
                                value={formData.minOrderValue}
                                onChange={(e) => onChange("minOrderValue", e.target.value)}
                                placeholder="100000"
                            />
                        </div>
                        <div className="form-group">
                            <label>Giảm tối đa</label>
                            <input
                                type="number"
                                value={formData.maxDiscount}
                                onChange={(e) => onChange("maxDiscount", e.target.value)}
                                placeholder="50000"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Ngày bắt đầu *</label>
                            <input
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => onChange("startDate", e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Ngày kết thúc *</label>
                            <input
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => onChange("endDate", e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Giới hạn sử dụng</label>
                        <input
                            type="number"
                            value={formData.usageLimit}
                            onChange={(e) => onChange("usageLimit", e.target.value)}
                            placeholder="100"
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="submit" className="btn-save">
                            {isEditing ? "Cập nhật" : "Tạo mới"}
                        </button>
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={onClose}
                        >
                            Hủy
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PromotionModal;
