import React from "react";
import { MdStar, MdStarBorder, MdModeEdit, MdChatBubbleOutline, MdCheckCircle } from "react-icons/md";
import { formatRating } from "shared-utils";
import "./ReviewCard.css";

/**
 * Component displays a single review and reply button
 * Used by customer-web and restaurant-web
 */
const ReviewCard = ({ review, foodName, onReplyClick, showReplyButton = true }) => {
    // Render rating stars
    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span key={i} style={{ color: i <= rating ? "#ffc107" : "#ddd" }}>
                    {i <= rating ? (
                        <MdStar size={16} />
                    ) : (
                        <MdStarBorder size={16} />
                    )}
                </span>
            );
        }
        return stars;
    };

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <div className="review-card">
            {/* Food name & Rating */}
            <div className="review-card-header">
                <h4 className="review-food-name">
                    {foodName || ''}
                </h4>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                    <div className="review-rating">
                        {renderStars(review.rating)}
                        <span className="review-rating-text">{formatRating(review.rating)}/5</span>
                    </div>
                    <span className="review-date" style={{ fontSize: "13px", color: "#6c757d" }}>
                        {formatDate(review.created_at)}
                    </span>
                </div>
            </div>

            {/* Customer comment */}
            <div className="review-comment">
                <div className="comment-label" style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#495057",
                    marginBottom: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                }}>
                    Khách hàng: <span style={{ color: "#6c757d", fontWeight: "normal" }}>
                        {(() => {
                            const name = review.user_name || review.user?.name || review.user?.full_name || "Ẩn danh";
                            if (name === "Ẩn danh" || name.length <= 2) return name;
                            return `${name[0]}***${name[name.length - 1]}`;
                        })()}
                    </span>
                </div>
                <p style={{ marginLeft: "20px" }}>{review.comment}</p>
            </div>

            {/* Restaurant reply (if exists) */}
            {review.restaurant_reply && (
                <div className="review-reply">
                    <div className="reply-label">
                        {/* <MdCheckCircle size={16} style={{ marginRight: "6px" }} /> */}
                        Phản hồi của nhà hàng:</div>
                    <p style={{ marginLeft: "20px" }}>{review.restaurant_reply}</p>
                </div>
            )}

            {/* Reply button (only for restaurant) */}
            {showReplyButton && onReplyClick && (
                <div className="review-card-footer">
                    <button
                        className={`reply-btn ${review.restaurant_reply ? "edit" : ""}`}
                        onClick={() => onReplyClick(review)}
                    >
                        {review.restaurant_reply ? (
                            <>
                                <MdModeEdit size={14} /> Sửa phản hồi
                            </>
                        ) : (
                            <>
                                <MdChatBubbleOutline size={14} /> Phản hồi
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ReviewCard;
