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
            setEditFood(food);
        }
    }, [food]);

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
                setUploadError("Failed to upload image");
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
        if (!editFood.categoryId && !editFood.category) {
            alert("Please select a category!");
            return;
        }
        onSubmit(editFood);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>Edit Food</h3>
                <form onSubmit={handleSubmit}>
                    <label>
                        Name:
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
                        Category <span style={{ color: "red" }}>*</span>:
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
                            <option value="">-- Select a category (Required) --</option>
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
                        Price:
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
                        Description:
                        <textarea
                            value={editFood.description}
                            onChange={(e) =>
                                setEditFood({ ...editFood, description: e.target.value })
                            }
                            rows={4}
                        />
                    </label>
                    <label>
                        Image:
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(e.target.files[0])}
                            disabled={uploading}
                        />
                        {uploading && <span style={{ color: "blue" }}>Uploading...</span>}
                        {uploadError && <span style={{ color: "red" }}>{uploadError}</span>}
                    </label>
                    <div className="modal-buttons">
                        <button type="submit" className="submit-btn" disabled={uploading}>
                            Save
                        </button>
                        <button type="button" className="cancel-btn" onClick={onClose}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FoodEditModal;

