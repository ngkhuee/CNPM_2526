import React, { useState, useEffect } from "react";

const FoodEditModal = ({ food, isOpen, onClose, onSubmit, categories, restaurantFoods }) => {
    const [editFood, setEditFood] = useState({
        id: null,
        name: "",
        categoryId: "",
        price: "",
        description: "",
        image: "",
    });

    useEffect(() => {
        if (food) {
            setEditFood(food);
        }
    }, [food]);

    const handleImageChange = (file) => {
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditFood((prev) => ({ ...prev, image: reader.result }));
            };
            reader.readAsDataURL(file);
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
                        />
                    </label>
                    <div className="modal-buttons">
                        <button type="submit" className="submit-btn">
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
