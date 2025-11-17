import React from "react";
import { MdEdit, MdDelete, MdLocalOffer, MdStar } from "react-icons/md";
import { getImageUrl } from "@utils/imageHelper";
import { formatRating } from "@utils/formatters";

const FoodCard = ({ food, assets, onEdit, onDelete, onViewDetail, onFormatVND, categories }) => {
    const getImageSrc = (foodItem) => {
        if (foodItem.image?.startsWith("data:image")) return foodItem.image;
        if (foodItem.image?.startsWith("http") || foodItem.image?.startsWith("/images")) {
            return getImageUrl(foodItem.image);
        }
        if (assets[foodItem.image]) return assets[foodItem.image];
        return "";
    };

    const getCategoryName = () => {
        if (food.categoryId) {
            const category = categories.find((c) => c.id === food.categoryId);
            return category ? category.name : "Uncategorized";
        }
        return food.category || "Uncategorized";
    };

    return (
        <div className="food-card">
            <div className="food-img-wrapper">
                {getImageSrc(food) ? (
                    <img src={getImageSrc(food)} alt={food.name} />
                ) : (
                    <p>No image</p>
                )}
            </div>
            <div className="food-info">
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "8px",
                    }}
                >
                    <h4 style={{ margin: 0 }}>{food.name}</h4>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            cursor: "pointer",
                            padding: "4px 8px",
                            background: "#fff3e0",
                            borderRadius: "12px",
                            transition: "all 0.2s ease",
                        }}
                        onClick={() => onViewDetail(food)}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#ffe0b2";
                            e.currentTarget.style.transform = "scale(1.05)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "#fff3e0";
                            e.currentTarget.style.transform = "scale(1)";
                        }}
                    >
                        <MdStar size={16} color="#ff9800" />
                        <span
                            style={{
                                fontSize: "14px",
                                fontWeight: "600",
                                color: "#ff9800",
                            }}
                        >
                            {formatRating(food.rating || 0)}
                        </span>
                    </div>
                </div>
                <p className="food-category">{getCategoryName()}</p>
                <div className="price-container">
                    <p className="food-price">
                        <MdLocalOffer /> {onFormatVND(food.price)}
                    </p>
                </div>
            </div>
            <div className="card-actions">
                <button className="edit-btn" onClick={() => onEdit(food)}>
                    <MdEdit /> Edit
                </button>
                <button className="remove-btn" onClick={() => onDelete(food.id)}>
                    <MdDelete /> Remove
                </button>
            </div>
        </div>
    );
};

export default FoodCard;
