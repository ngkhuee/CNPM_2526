import React from "react";
import { MdStar, MdStarBorder } from "react-icons/md";

const ReviewModal = ({
    isOpen,
    itemName,
    rating,
    comment,
    submitting,
    onRatingChange,
    onCommentChange,
    onSubmit,
    onClose,
}) => {
    if (!isOpen) return null;

    return (
        <div
            className="review-modal-overlay"
            onClick={onClose}
        >
            <div className="review-modal" onClick={(e) => e.stopPropagation()}>
                <h3>Rate Food</h3>
                <p style={{ fontSize: "16px", fontWeight: "600", color: "#333" }}>
                    {itemName}
                </p>

                <div className="rating-section">
                    <label>Food Quality:</label>
                    <div className="stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span
                                key={star}
                                className={`star ${rating >= star ? "filled" : ""}`}
                                onClick={() => onRatingChange(star)}
                                style={{
                                    cursor: "pointer",
                                    fontSize: "28px",
                                    color: rating >= star ? "#ffc107" : "#ddd",
                                }}
                            >
                                {rating >= star ? <MdStar /> : <MdStarBorder />}
                            </span>
                        ))}
                    </div>
                    <p>{rating}/5 stars</p>
                </div>

                <div className="comment-section">
                    <label>Your comment:</label>
                    <textarea
                        value={comment}
                        onChange={(e) => onCommentChange(e.target.value)}
                        placeholder="Share your experience with this dish..."
                        rows="4"
                    />
                </div>

                <div className="modal-actions">
                    <button onClick={onSubmit} disabled={submitting}>
                        {submitting ? "Submitting..." : "Submit Review"}
                    </button>
                    <button onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;
