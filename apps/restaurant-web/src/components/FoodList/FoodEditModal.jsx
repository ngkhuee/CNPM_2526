import React, { useState, useEffect } from "react";
import { uploadService } from "shared-services";

const FoodEditModal = ({ food, isOpen, onClose, onSubmit, categories, restaurantFoods }) => {
    const [editFood, setEditFood] = useState({
        id: null,
        name: "",
        categoryId: "",
        price: "",
        description: "",
        image: "",
    });
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState("");

    useEffect(() => {
        if (food) {
            // If food has a category name but no categoryId, find the matching categoryId
            let foodData = { ...food };
            if (food.category && !food.categoryId) {
                const matchingCategory = categories.find((cat) => cat.name === food.category);
                if (matchingCategory) {
                    foodData.categoryId = matchingCategory.id;
                }
            }
            setEditFood(foodData);
        }
    }, [food, categories]);

    const handleImageChange = async (file) => {
        if (!file) return;

        setUploading(true);
        setUploadError("");

        try {
            // Upload image to server
            const uploadResult = await uploadService.uploadImage(file, "foods");

            if (uploadResult.success) {
                // Store the image path from server response
                setEditFood((prev) => ({ ...prev, image: uploadResult.path }));
            } else {
                setUploadError("Tải ảnh lên thất bại");
            }
        } catch (error) {
            console.error("Image upload error:", error);
            setUploadError(error.message || "Failed to upload image");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Check if either categoryId or category has a value
        const hasCategoryId = editFood.categoryId && String(editFood.categoryId).trim();
        const hasCategory = editFood.category && String(editFood.category).trim();

        if (!hasCategoryId && !hasCategory) {
            alert("Vui lòng chọn danh mục!");
            return;
        }
        onSubmit(editFood);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>Chỉnh sửa món ăn</h3>
                <form onSubmit={handleSubmit}>
                    <label>
                        Tên:
                        <input
                            type="text"
                            value={editFood.name}
                            onChange={(e) =>
                                setEditFood({ ...editFood, name: e.target.value })
                            }
                            required
                        />
                    </label>
                    <label>
                        Danh mục <span style={{ color: "red" }}>*</span>:
                        <select
                            value={editFood.categoryId || editFood.category}
                            onChange={(e) =>
                                setEditFood({
                                    ...editFood,
                                    categoryId: e.target.value,
                                    category: e.target.value,
                                })
                            }
                            required
                        >
                            <option value="">-- Chọn danh mục (Bắt buộc) --</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                            {[
                                ...new Set(restaurantFoods.map((f) => f.category).filter(Boolean)),
                            ].map((cat) => {
                                if (
                                    !categories.find((rc) => rc.name === cat || rc.id === cat)
                                ) {
                                    return (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    );
                                }
                                return null;
                            })}
                        </select>
                    </label>
                    <label>
                        Giá:
                        <input
                            type="number"
                            value={editFood.price}
                            onChange={(e) =>
                                setEditFood({ ...editFood, price: e.target.value })
                            }
                            required
                        />
                    </label>
                    <label>
                        Mô tả:
                        <textarea
                            value={editFood.description}
                            onChange={(e) =>
                                setEditFood({ ...editFood, description: e.target.value })
                            }
                            rows={4}
                        />
                    </label>
                    <label>
                        Ảnh:
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(e.target.files[0])}
                            disabled={uploading}
                        />
                        {uploading && <span style={{ color: "blue" }}>Đang tải lên...</span>}
                        {uploadError && <span style={{ color: "red" }}>{uploadError}</span>}
                    </label>
                    <div className="modal-buttons">
                        <button type="submit" className="submit-btn" disabled={uploading}>
                            Lưu
                        </button>
                        <button type="button" className="cancel-btn" onClick={onClose}>
                            Hủy
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FoodEditModal;

