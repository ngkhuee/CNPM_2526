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
                <h3>Đánh giá món ăn</h3>
                <p style={{ fontSize: "16px", fontWeight: "600", color: "#333" }}>
                    {itemName}
                </p>

                <div className="rating-section">
                    <label>Chất lượng món ăn:</label>
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
                    <p>{rating}/5 sao</p>
                </div>

                <div className="comment-section">
                    <label>Bình luận của bạn:</label>
                    <textarea
                        value={comment}
                        onChange={(e) => onCommentChange(e.target.value)}
                        placeholder="Chia sẻ trải nghiệm của bạn về món ăn này..."
                        rows="4"
                    />
                </div>

                <div className="modal-actions">
                    <button onClick={onSubmit} disabled={submitting}>
                        {submitting ? "Đang gửi..." : "Gửi đánh giá"}
                    </button>
                    <button onClick={onClose}>Hủy</button>
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;
