import React, { useState, useEffect } from "react";
import { MdClose, MdStar, MdStarBorder } from "react-icons/md";
import { formatRating } from "shared-utils";
import "./ReplyModal.css";

/**
 * Modal for adding/editing review replies
 * Used for restaurant-web
 */
const ReplyModal = ({ review, onSubmit, onClose, loading = false }) => {
    const [replyText, setReplyText] = useState("");
    const [error, setError] = useState("");
    const [charCount, setCharCount] = useState(0);

    // Init reply text if exists
    useEffect(() => {
        if (review?.restaurant_reply) {
            setReplyText(review.restaurant_reply);
            setCharCount(review.restaurant_reply.length);
        } else {
            setReplyText("");
            setCharCount(0);
        }
        setError("");
    }, [review]);

    const handleReplyChange = (e) => {
        const text = e.target.value;
        if (text.length <= 500) {
            setReplyText(text);
            setCharCount(text.length);
            setError("");
        }
    };

    const handleSubmit = async () => {
        // Validation
        if (!replyText.trim()) {
            setError("Phản hồi không được để trống");
            return;
        }

        if (replyText.trim().length < 5) {
            setError("Phản hồi phải có ít nhất 5 ký tự");
            return;
        }

        // Call parent handler
        const result = await onSubmit(replyText.trim());

        if (result?.success) {
            setReplyText("");
            setCharCount(0);
            setError("");
            onClose();
        } else {
            setError(result?.message || "Có lỗi xảy ra");
        }
    };

    return (
        <div className="reply-modal-overlay" onClick={onClose}>
            <div className="reply-modal" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="reply-modal-header">
                    <h3>Phản hồi đánh giá</h3>
                    <button className="close-btn" onClick={onClose}>
                        <MdClose size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="reply-modal-body">
                    {/* Customer info */}
                    <div className="customer-info">
                        <div className="info-row">
                            <label>Khách hàng:</label>
                            <span>{review?.user_id || "Khách"}</span>
                        </div>
                        <div className="info-row">
                            <label>Đánh giá:</label>
                            <span>
                                {Array.from({ length: 5 }, (_, i) => i + 1).map((star) => (
                                    <span key={star} style={{ color: star <= (review?.rating || 0) ? "#ffc107" : "#ddd" }}>
                                        {star <= (review?.rating || 0) ? <MdStar size={16} /> : <MdStarBorder size={16} />}
                                    </span>
                                ))} {formatRating(review?.rating || 0)}/5
                            </span>
                        </div>
                    </div>

                    {/* Customer comment (read-only) */}
                    <div className="customer-comment-section">
                        <label>Nhận xét của khách hàng:</label>
                        <div className="customer-comment">
                            {review?.comment}
                        </div>
                    </div>

                    {/* Reply input */}
                    <div className="reply-input-section">
                        <label>Phản hồi của bạn:</label>
                        <textarea
                            value={replyText}
                            onChange={handleReplyChange}
                            placeholder="Nhập phản hồi của bạn cho khách hàng..."
                            rows="5"
                            maxLength="500"
                            className="reply-textarea"
                            disabled={loading}
                        />
                        <div className="char-count">
                            {charCount}/500 ký tự
                        </div>
                    </div>

                    {/* Error message */}
                    {error && <div className="error-message">{error}</div>}
                </div>

                {/* Footer */}
                <div className="reply-modal-footer">
                    <button
                        className="btn btn-cancel"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Hủy
                    </button>
                    <button
                        className="btn btn-submit"
                        onClick={handleSubmit}
                        disabled={loading || !replyText.trim()}
                    >
                        {loading ? "Đang gửi..." : "Gửi phản hồi"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReplyModal;
