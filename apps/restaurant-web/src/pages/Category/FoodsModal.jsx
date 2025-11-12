import React from "react";
import { formatCurrency } from "shared-utils";
import { getImageUrl } from "@utils/imageHelper";

const FoodsModal = ({ isOpen, foods, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>Foods in this Category</h3>
                {foods.length > 0 ? (
                    <ul className="foods-list">
                        {foods.map((food) => (
                            <li key={food.id} className="food-item">
                                <img src={getImageUrl(food.image)} alt={food.name} />
                                <div>
                                    <strong>{food.name}</strong>
                                    <p>{formatCurrency(food.price)}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No foods found in this category.</p>
                )}
                <button className="cancel-btn" onClick={onClose}>
                    Close
                </button>
            </div>
        </div>
    );
};

export default FoodsModal;
