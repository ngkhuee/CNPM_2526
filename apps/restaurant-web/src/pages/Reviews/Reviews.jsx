import React, { useState, useEffect } from "react";
import { ReviewCard, ReplyModal } from "shared-ui";
import { useRestaurantReviews } from "../../hooks/useRestaurantReviews";
import { MdStar, MdRateReview, MdHourglassEmpty, MdCheckCircle, MdError, MdNavigateBefore, MdNavigateNext } from "react-icons/md";
import { formatRating } from "@utils/formatters";
import "./Reviews.css";

const Reviews = () => {
    const { reviews, loading, error, fetchReviews, addReply, getStats } =
        useRestaurantReviews();

    const [filter, setFilter] = useState("all");
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const ITEMS_PER_PAGE = 10;

    // Fetch reviews on mount and when filter changes
    useEffect(() => {
        fetchReviews(filter);
        setCurrentPage(1);
    }, [filter, fetchReviews]);

    // Handle reply click
    const handleReplyClick = (review) => {
        setSelectedReview(review);
        setShowReplyModal(true);
    };

    // Handle reply submit
    const handleReplySubmit = async (replyText) => {
        if (!selectedReview) return;

        setSubmitting(true);
        try {
            const result = await addReply(selectedReview.id, replyText);

            if (result.success) {
                alert("Đã gửi phản hồi thành công!");
                setShowReplyModal(false);
                setSelectedReview(null);
                return { success: true, message: result.message };
            } else {
                return { success: false, message: result.message };
            }
        } catch (err) {
            console.error("Error submitting reply:", err);
            return { success: false, message: "Có lỗi xảy ra" };
        } finally {
            setSubmitting(false);
        }
    };

    // Get paginated reviews
    const filteredReviews = reviews;
    const totalPages = Math.ceil(filteredReviews.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedReviews = filteredReviews.slice(startIndex, endIndex);

    // Get stats
    const stats = getStats();

    // Get food names (from menus - need to fetch)
    const getFoodName = (foodId) => {
        // This is a simplified version - in real app, fetch menus first
        return `Food #${foodId}`;
    };

    if (loading && reviews.length === 0) {
        return (
            <div className="main-content">
                <div className="reviews-page">
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Đang tải đánh giá...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="main-content">
            <div className="reviews-page">
                {/* Header */}
                <div className="reviews-header">
                    <h2>Quản lý Đánh giá</h2>
                    <p className="subtitle">Xem và phản hồi đánh giá của khách hàng</p>
                </div>

                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon"><MdStar /></div>
                        <div className="stat-content">
                            <div className="stat-label">Đánh giá</div>
                            <div className="stat-value">{formatRating(stats.avgRating)}/5</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon"><MdRateReview /></div>
                        <div className="stat-content">
                            <div className="stat-label">Tổng đánh giá</div>
                            <div className="stat-value">{stats.total}</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon"><MdHourglassEmpty /></div>
                        <div className="stat-content">
                            <div className="stat-label">Chờ phản hồi</div>
                            <div className="stat-value">{stats.pending}</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon"><MdCheckCircle /></div>
                        <div className="stat-content">
                            <div className="stat-label">Đã phản hồi</div>
                            <div className="stat-value">{stats.replied}</div>
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="filter-tabs">
                    <button
                        className={`tab ${filter === "all" ? "active" : ""}`}
                        onClick={() => setFilter("all")}
                    >
                        Tất cả ({stats.total})
                    </button>
                    <button
                        className={`tab ${filter === "pending" ? "active" : ""}`}
                        onClick={() => setFilter("pending")}
                    >
                        Chờ phản hồi ({stats.pending})
                    </button>
                    <button
                        className={`tab ${filter === "replied" ? "active" : ""}`}
                        onClick={() => setFilter("replied")}
                    >
                        Đã phản hồi ({stats.replied})
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="error-banner">
                        <span><MdError /> {error}</span>
                        <button onClick={() => fetchReviews(filter)}>Thử lại</button>
                    </div>
                )}

                {/* Reviews List */}
                <div className="reviews-list">
                    {paginatedReviews.length > 0 ? (
                        paginatedReviews.map((review) => (
                            <ReviewCard
                                key={review.id}
                                review={review}
                                foodName={getFoodName(review.food_id)}
                                onReplyClick={handleReplyClick}
                            />
                        ))
                    ) : (
                        <div className="empty-state">
                            <p>
                                {filter === "all"
                                    ? "Chưa có đánh giá nào"
                                    : filter === "pending"
                                        ? "Tất cả đánh giá đã được phản hồi!"
                                        : "Không tìm thấy đánh giá"}
                            </p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="pagination">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(currentPage - 1)}
                        >
                            <MdNavigateBefore /> Trước
                        </button>

                        <div className="page-numbers">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    className={`page-number ${currentPage === page ? "active" : ""}`}
                                    onClick={() => setCurrentPage(page)}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(currentPage + 1)}
                        >
                            Tiếp <MdNavigateNext />
                        </button>
                    </div>
                )}

                {/* Reply Modal */}
                {showReplyModal && selectedReview && (
                    <ReplyModal
                        review={selectedReview}
                        onSubmit={handleReplySubmit}
                        onClose={() => {
                            setShowReplyModal(false);
                            setSelectedReview(null);
                        }}
                        loading={submitting}
                    />
                )}
            </div>
        </div>
    );
};

export default Reviews;
