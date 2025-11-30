/**
 * useReviewForm.js
 * Custom hook for review form management
 * Handles: rating, comment, validation, submission, reviewed items tracking
 */

import { useState, useEffect, useCallback, useContext } from 'react';
import { Alert } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { useReview } from './useReview';
import { showToast } from '../utils/toastHelper';

export const useReviewForm = (orderId, order) => {
    const { user } = useContext(AuthContext);
    const { submitReview, getReviewedFoodIds } = useReview();

    // Review form state
    const [reviewedFoods, setReviewedFoods] = useState({});
    const [selectedItem, setSelectedItem] = useState(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Check which items have been reviewed
    useEffect(() => {
        checkReviewedItems();
    }, [orderId, user?.id]);

    const checkReviewedItems = useCallback(async () => {
        if (!user?.id) return;
        try {
            const reviewed = await getReviewedFoodIds(user.id);
            setReviewedFoods(reviewed);
        } catch (error) {
            console.error('[useReviewForm] Error checking reviewed items:', error);
        }
    }, [user?.id, getReviewedFoodIds]);

    /**
     * Open review modal for an item
     */
    const handleOpenReview = useCallback((item) => {
        setSelectedItem(item);
        setShowReviewModal(true);
        setRating(5);
        setComment('');
    }, []);

    /**
     * Close review modal
     */
    const handleCloseReview = useCallback(() => {
        setShowReviewModal(false);
        setSelectedItem(null);
        setRating(5);
        setComment('');
    }, []);

    /**
     * Validate review form
     */
    const validateReview = useCallback(() => {
        if (!selectedItem || !order || !user) {
            return { valid: false, message: 'Thiếu thông tin' };
        }

        if (rating === 0) {
            return { valid: false, message: 'Vui lòng chọn số sao' };
        }

        if (!comment.trim()) {
            return { valid: false, message: 'Vui lòng nhập nội dung đánh giá' };
        }

        if (comment.trim().length < 10) {
            return { valid: false, message: 'Đánh giá phải có ít nhất 10 ký tự' };
        }

        return { valid: true };
    }, [selectedItem, order, user, rating, comment]);

    /**
     * Submit review
     */
    const handleSubmitReview = useCallback(async () => {
        // Validate
        const validation = validateReview();
        if (!validation.valid) {
            Alert.alert('Lỗi', validation.message);
            return false;
        }

        try {
            setSubmitting(true);

            const result = await submitReview({
                foodId: selectedItem.foodId,
                userId: user.id,
                userName: user.name || user.full_name || 'Người dùng',
                restaurantId: order?.restaurant_id || order?.restaurantId,
                orderId: order.id,
                rating,
                comment: comment.trim(),
            });

            if (result.success) {
                showToast('success', 'Đã gửi đánh giá!');

                // Update reviewedFoods state
                const reviewKey = `${selectedItem.foodId}_${order.id}`;
                setReviewedFoods(prev => ({
                    ...prev,
                    [reviewKey]: true,
                }));

                handleCloseReview();
                return true;
            } else {
                Alert.alert('Lỗi', result.message || 'Không thể gửi đánh giá');
                return false;
            }
        } catch (error) {
            console.error('[useReviewForm] Error submitting review:', error);
            Alert.alert('Lỗi', 'Không thể gửi đánh giá');
            return false;
        } finally {
            setSubmitting(false);
        }
    }, [selectedItem, order, user, rating, comment, submitReview, validateReview, handleCloseReview]);

    /**
     * Check if an item has been reviewed
     */
    const isItemReviewed = useCallback((foodId) => {
        if (!order?.id || !foodId) return false;
        const reviewKey = `${foodId}_${order.id}`;
        return reviewedFoods[reviewKey] === true;
    }, [reviewedFoods, order?.id]);

    return {
        // State
        reviewedFoods,
        selectedItem,
        showReviewModal,
        rating,
        comment,
        submitting,

        // Setters
        setRating,
        setComment,

        // Actions
        handleOpenReview,
        handleCloseReview,
        handleSubmitReview,
        isItemReviewed,
        validateReview,
    };
};
