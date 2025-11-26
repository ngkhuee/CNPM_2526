import React from "react";

const CategoryModal = ({
    isOpen,
    isEditing,
    currentCategory,
    loading,
    onSubmit,
    onChange,
    onClose,
}) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>{isEditing ? "Chỉnh sửa Danh mục" : "Thêm Danh mục mới"}</h3>
                <form onSubmit={onSubmit}>
                    <label>
                        Tên:
                        <input
                            type="text"
                            value={currentCategory.name}
                            onChange={(e) => onChange("name", e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Mô tả:
                        <textarea
                            value={currentCategory.description}
                            onChange={(e) => onChange("description", e.target.value)}
                        />
                    </label>
                    <label>
                        Trạng thái:
                        <select
                            value={currentCategory.status}
                            onChange={(e) => onChange("status", e.target.value)}
                        >
                            <option value="Active">Hoạt động</option>
                            <option value="Inactive">Không hoạt động</option>
                        </select>
                    </label>
                    <div className="modal-buttons">
                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? (isEditing ? "Đang lưu..." : "Đang thêm...") : isEditing ? "Lưu" : "Thêm"}
                        </button>
                        <button
                            type="button"
                            className="cancel-btn"
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

export default CategoryModal;
