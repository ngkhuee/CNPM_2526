import React, { useState, useEffect } from "react";
import { MdStar, MdStarBorder, MdClose, MdReply, MdSend } from "react-icons/md";
import { reviewService } from "shared-services";
import { getImageUrl } from "shared-utils";
import { formatCurrency } from "shared-utils";
import "./FoodDetail.css";

const FoodDetail = ({
  food,
  onClose,
  userRole = "customer", // "customer" or "restaurant"
  currentUserId = null,
  currentRestaurantId = null, // Restaurant ID for checking ownership
  onAddToCart = null, // Callback for adding to cart (customer only)
  canReview = false, // Whether user can review (from order history)
}) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState({});
  const [submittingReply, setSubmittingReply] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [userHasReviewed, setUserHasReviewed] = useState(false);

  useEffect(() => {
    const foodId = food?.id || food?._id;
    if (foodId) {
      fetchReviews();
    }
  }, [food?.id, food?._id]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const foodId = food.id || food._id;
      console.log("🔍 Fetching reviews for food:", foodId);
      const data = await reviewService.getByFood(foodId);
      console.log("📝 Reviews received:", data);
      // Sort by created_at descending (newest first)
      const sorted = data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setReviews(sorted);

      // Check if current user has already reviewed
      if (currentUserId && userRole === "customer") {
        const userReview = sorted.find((r) => r.user_id === currentUserId);
        setUserHasReviewed(!!userReview);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReply = async (reviewId) => {
    if (!replyText[reviewId]?.trim()) {
      alert("Please enter a reply");
      return;
    }

    try {
      setSubmittingReply({ ...submittingReply, [reviewId]: true });

      await reviewService.update(reviewId, {
        restaurant_reply: replyText[reviewId].trim(),
      });

      alert("Reply submitted successfully!");
      setReplyText({ ...replyText, [reviewId]: "" });
      await fetchReviews(); // Refresh reviews
    } catch (error) {
      console.error("Error submitting reply:", error);
      alert("Error submitting reply");
    } finally {
      setSubmittingReply({ ...submittingReply, [reviewId]: false });
    }
  };

  const handleSubmitReview = async () => {
    if (!currentUserId) {
      alert("Please login to submit a review");
      return;
    }

    if (reviewForm.comment.trim().length < 10) {
      alert("Review comment must be at least 10 characters");
      return;
    }

    try {
      setSubmittingReview(true);
      const foodId = food.id || food._id;

      await reviewService.create({
        food_id: foodId,
        user_id: currentUserId,
        restaurant_id: food.restaurantId || food.restaurant_id,
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim(),
      });

      alert("Thank you for your review!");
      setReviewForm({ rating: 5, comment: "" });
      setShowReviewForm(false);
      await fetchReviews();
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Error submitting review. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) =>
          star <= rating ? (
            <MdStar key={star} size={18} color="#ffc107" />
          ) : (
            <MdStarBorder key={star} size={18} color="#ddd" />
          )
        )}
      </div>
    );
  };

  const imageUrl = getImageUrl(food?.image);
  const avgRating = food?.rating || 0;
  const totalReviews = reviews.length;

  return (
    <div className="food-detail-overlay" onClick={onClose}>
      <div className="food-detail-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          <MdClose size={24} />
        </button>

        {/* Food Info Section */}
        <div className="food-detail-header">
          <div className="food-detail-image">
            <img src={imageUrl} alt={food?.name} />
          </div>
          <div className="food-detail-info">
            <h2>{food?.name}</h2>
            <p className="food-description">{food?.description}</p>
            <p className="food-price">{formatCurrency(food?.price || 0)}</p>

            <div className="food-rating-summary">
              {renderStars(Math.round(avgRating))}
              <span className="rating-text">
                {avgRating.toFixed(1)} ({totalReviews} reviews)
              </span>
            </div>

            {/* Add to Cart Section - Customer Only */}
            {userRole === "customer" && onAddToCart && (
              <div className="add-to-cart-section">
                <div className="quantity-selector">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span>{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)}>+</button>
                </div>
                <button
                  className="add-to-cart-btn"
                  onClick={() => {
                    onAddToCart(food.id || food._id, quantity);
                    onClose();
                  }}
                >
                  Add to Cart
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="food-detail-reviews">
          <div className="reviews-header">
            <h3>Customer Reviews</h3>
            {userRole === "customer" && currentUserId && !userHasReviewed && canReview && (
              <button
                className="submit-review-toggle-btn"
                onClick={() => setShowReviewForm(!showReviewForm)}
              >
                {showReviewForm ? "Cancel" : "Write a Review"}
              </button>
            )}
            {userRole === "customer" && currentUserId && !canReview && !userHasReviewed}
            {userHasReviewed && (
              <span className="already-reviewed-badge">You reviewed this</span>
            )}
          </div>

          {/* Review Submission Form */}
          {showReviewForm && userRole === "customer" && canReview && (
            <div className="review-form">
              <div className="form-group">
                <label>Rating</label>
                <div className="star-input">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      className={`star-btn ${star <= reviewForm.rating ? "active" : ""}`}
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      type="button"
                    >
                      <MdStar size={28} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="review-comment">Your Review</label>
                <textarea
                  id="review-comment"
                  placeholder="Share your experience with this dish... (minimum 10 characters)"
                  value={reviewForm.comment}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, comment: e.target.value })
                  }
                  rows={4}
                />
                <small className="char-count">
                  {reviewForm.comment.length} characters
                </small>
              </div>

              <button
                className="submit-review-btn"
                onClick={handleSubmitReview}
                disabled={submittingReview || reviewForm.comment.length < 10}
              >
                <MdSend size={16} />
                {submittingReview ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          )}

          {loading ? (
            <p className="loading-text">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="no-reviews-text">
              No reviews yet. Be the first to review!
            </p>
          ) : (
            <div className="reviews-list">
              {reviews.map((review) => (
                <div key={review.id} className="review-item">
                  <div className="review-header">
                    <div className="review-user-info">
                      <strong>{review.user?.name || review.userId}</strong>
                      {renderStars(review.rating)}
                    </div>
                    <span className="review-date">
                      {new Date(review.created_at).toLocaleDateString("vi-VN")}
                    </span>
                  </div>

                  <p className="review-comment">{review.comment}</p>

                  {/* Restaurant Reply */}
                  {review.restaurant_reply && (
                    <div className="restaurant-reply">
                      <MdReply size={16} />
                      <div>
                        <strong>Restaurant:</strong>
                        <p>{review.restaurant_reply}</p>
                      </div>
                    </div>
                  )}

                  {/* Reply Input (only for restaurant users who own this food) */}
                  {userRole === "restaurant" &&
                    !review.restaurant_reply &&
                    currentRestaurantId &&
                    (food.restaurantId === currentRestaurantId ||
                      food.restaurant_id === currentRestaurantId) && (
                      <div className="reply-input-section">
                        <textarea
                          placeholder="Reply to this review..."
                          value={replyText[review.id] || ""}
                          onChange={(e) =>
                            setReplyText({
                              ...replyText,
                              [review.id]: e.target.value,
                            })
                          }
                          rows={2}
                        />
                        <button
                          className="reply-submit-btn"
                          onClick={() => handleSubmitReply(review.id)}
                          disabled={submittingReply[review.id]}
                        >
                          {submittingReply[review.id]
                            ? "Submitting..."
                            : "Reply"}
                        </button>
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodDetail;
