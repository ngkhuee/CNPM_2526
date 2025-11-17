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
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <div className="review-card">
            {/* Food name & Rating */}
            <div className="review-card-header">
                <h4 className="review-food-name">{foodName}</h4>
                <div className="review-rating">
                    {renderStars(review.rating)}
                    <span className="review-rating-text">{formatRating(review.rating)}/5</span>
                </div>
            </div>

            {/* Customer info */}
            <div className="review-customer-info">
                <span className="review-customer-name">{review.user_id || "Customer"}</span>
                <span className="review-date">• {formatDate(review.created_at)}</span>
            </div>

            {/* Customer comment */}
            <div className="review-comment">
                <p>{review.comment}</p>
            </div>

            {/* Restaurant reply (if exists) */}
            {review.restaurant_reply && (
                <div className="review-reply">
                    <div className="reply-label"><MdCheckCircle size={16} style={{ marginRight: "6px" }} /> Restaurant Reply:</div>
                    <p>{review.restaurant_reply}</p>
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
                                <MdModeEdit size={14} /> Edit Reply
                            </>
                        ) : (
                            <>
                                <MdChatBubbleOutline size={14} /> Reply
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ReviewCard;
