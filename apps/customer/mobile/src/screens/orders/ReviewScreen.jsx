/**
 * ReviewScreen.jsx
 * Allow user to submit reviews for individual items in a delivered order
 */

import React, { useContext, useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
    Alert,
    FlatList,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NavigationContext } from '../../contexts/NavigationContext';
import { AuthContext } from '../../contexts/AuthContext';
import * as orderService from '../../services/orderService';
import { reviewService } from '../../services/reviewService';
import { useReview } from '../../hooks/useReview';
import { showToast } from '../../utils/toastHelper';

const ReviewScreen = ({ orderId }) => {
    const { navigate } = useContext(NavigationContext);
    const { user } = useContext(AuthContext);
    const { submitReview, getReviewedFoodIds } = useReview();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [reviewedFoods, setReviewedFoods] = useState({});
    const [selectedItem, setSelectedItem] = useState(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

    useEffect(() => {
        fetchOrder();
        checkReviewedItems();
    }, [orderId]);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const data = await orderService.getOrderDetail(orderId);
            if (data.status !== 'delivered') {
                Alert.alert('Error', 'Can only review delivered orders');
                navigate('order-detail', { orderId: orderId });
                return;
            }
            setOrder(data);
        } catch (error) {
            console.error('[ReviewScreen] Error fetching order:', error);
            Alert.alert('Error', 'Failed to load order');
            navigate('order-detail', { orderId: orderId });
        } finally {
            setLoading(false);
        }
    };

    const checkReviewedItems = async () => {
        if (!user?.id) return;
        try {
            const reviewed = await getReviewedFoodIds(user.id);
            setReviewedFoods(reviewed);
        } catch (error) {
            console.error('[ReviewScreen] Error checking reviewed items:', error);
        }
    };

    const handleOpenReview = (item) => {
        setSelectedItem(item);
        setShowReviewModal(true);
        setRating(5);
        setComment('');
    };

    const handleSubmitReview = async () => {
        if (!selectedItem || !order || !user) return;

        if (rating === 0) {
            Alert.alert('Error', 'Please select a rating');
            return;
        }

        if (!comment.trim() || comment.trim().length < 10) {
            Alert.alert('Error', 'Review must be at least 10 characters');
            return;
        }

        try {
            setSubmitting(true);

            const result = await submitReview({
                foodId: selectedItem.foodId,
                userId: user.id,
                restaurantId: order?.restaurant_id || order?.restaurantId,
                orderId: order.id,
                rating,
                comment,
            });

            if (result.success) {
                showToast('success', 'Review submitted!');
                setShowReviewModal(false);

                // Update reviewedFoods state
                const reviewKey = `${selectedItem.foodId}_${order.id}`;
                setReviewedFoods(prev => ({
                    ...prev,
                    [reviewKey]: true,
                }));

                setSelectedItem(null);
            } else {
                Alert.alert('Error', result.message || 'Failed to submit review');
            }
        } catch (error) {
            console.error('[ReviewScreen] Error submitting review:', error);
            Alert.alert('Error', 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color="#ff6b35" style={{ marginTop: 50 }} />
            </SafeAreaView>
        );
    }

    if (!order) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <MaterialIcons name="error-outline" size={48} color="#e53935" />
                    <Text style={styles.errorText}>Order not found</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigate('order-detail', { orderId: order.id })}>
                    <MaterialIcons name="arrow-back" size={24} color="#1a1a1a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Rate Items</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Order Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Order Summary</Text>
                    <View style={styles.orderCard}>
                        <Text style={styles.restaurantName}>{order.restaurant_name}</Text>
                        <Text style={styles.orderInfo}>
                            Order #{order.id?.substring(0, 8)} • {order.items?.length} items
                        </Text>
                    </View>
                </View>

                {/* Items List */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Rate Each Item</Text>
                    {order.items && order.items.length > 0 ? (
                        <View style={styles.itemsContainer}>
                            {order.items.map((item, idx) => {
                                const reviewKey = `${item.foodId}_${order.id}`;
                                const isReviewed = reviewedFoods[reviewKey];

                                return (
                                    <View key={idx} style={styles.itemCard}>
                                        <View style={styles.itemInfo}>
                                            <Text style={styles.itemName}>{item.name || item.food_name}</Text>
                                            <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                                        </View>
                                        {isReviewed ? (
                                            <View style={styles.reviewedBadge}>
                                                <MaterialIcons name="check-circle" size={20} color="#4caf50" />
                                                <Text style={styles.reviewedText}>Reviewed</Text>
                                            </View>
                                        ) : (
                                            <TouchableOpacity
                                                style={styles.reviewButton}
                                                onPress={() => handleOpenReview(item)}
                                            >
                                                <MaterialIcons name="star" size={16} color="#fff" />
                                                <Text style={styles.reviewButtonText}>Rate</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    ) : (
                        <Text style={styles.noItemsText}>No items in this order</Text>
                    )}
                </View>

                {/* Info Notice */}
                <View style={styles.noticeSection}>
                    <MaterialIcons name="info" size={20} color="#1976d2" />
                    <Text style={styles.noticeText}>
                        Your reviews help other customers and the restaurant improve their service.
                    </Text>
                </View>
            </ScrollView>

            {/* Review Modal */}
            {showReviewModal && selectedItem && (
                <View style={styles.modalOverlay}>
                    <View style={styles.modal}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Rate {selectedItem.name}</Text>
                            <TouchableOpacity onPress={() => setShowReviewModal(false)}>
                                <MaterialIcons name="close" size={24} color="#1a1a1a" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                            {/* Rating Section */}
                            <View style={styles.ratingSection}>
                                <Text style={styles.ratingLabel}>How was this item?</Text>
                                <View style={styles.starsContainer}>
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <TouchableOpacity
                                            key={star}
                                            onPress={() => setRating(star)}
                                            style={styles.starButton}
                                        >
                                            <MaterialIcons
                                                name={star <= rating ? 'star' : 'star-outline'}
                                                size={40}
                                                color={star <= rating ? '#ffc107' : '#ddd'}
                                            />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                {rating > 0 && (
                                    <Text style={styles.ratingValue}>
                                        {rating === 1 && '⭐ Poor'}
                                        {rating === 2 && '⭐⭐ Fair'}
                                        {rating === 3 && '⭐⭐⭐ Good'}
                                        {rating === 4 && '⭐⭐⭐⭐ Very Good'}
                                        {rating === 5 && '⭐⭐⭐⭐⭐ Excellent'}
                                    </Text>
                                )}
                            </View>

                            {/* Comment Section */}
                            <View style={styles.commentSection}>
                                <Text style={styles.commentLabel}>Your Comment</Text>
                                <TextInput
                                    style={styles.commentInput}
                                    placeholder="Share your experience with this dish..."
                                    placeholderTextColor="#aaa"
                                    value={comment}
                                    onChangeText={setComment}
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                    maxLength={500}
                                />
                                <Text style={styles.charCount}>{comment.length}/500</Text>
                            </View>
                        </ScrollView>

                        {/* Modal Actions */}
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setShowReviewModal(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.submitButton,
                                    (submitting || rating === 0) && { opacity: 0.6 }
                                ]}
                                onPress={handleSubmitReview}
                                disabled={submitting || rating === 0}
                            >
                                {submitting ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text style={styles.submitButtonText}>Submit</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 40,
        backgroundColor: '#f8f8f8',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    scrollView: {
        flex: 1,
        paddingVertical: 12,
    },
    section: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 12,
    },
    orderCard: {
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    restaurantName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    orderInfo: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
    },
    itemsContainer: {
        gap: 12,
    },
    itemCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#eee',
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    itemQuantity: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
    },
    reviewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#ff6b35',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    reviewButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    reviewedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    reviewedText: {
        fontSize: 12,
        color: '#4caf50',
        fontWeight: '600',
    },
    noItemsText: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        paddingVertical: 20,
    },
    noticeSection: {
        backgroundColor: '#e3f2fd',
        borderLeftWidth: 4,
        borderLeftColor: '#1976d2',
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 8,
        flexDirection: 'row',
        gap: 10,
    },
    noticeText: {
        fontSize: 12,
        color: '#1565c0',
        flex: 1,
    },
    modalOverlay: {
        ...StyleSheet.absoluteFill,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modal: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        maxHeight: '90%',
        paddingBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    modalContent: {
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    ratingSection: {
        marginBottom: 20,
    },
    ratingLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 12,
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginBottom: 12,
    },
    starButton: {
        padding: 8,
    },
    ratingValue: {
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
        color: '#ff6b35',
    },
    commentSection: {
        marginBottom: 20,
    },
    commentLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    commentInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: '#1a1a1a',
        minHeight: 100,
        textAlignVertical: 'top',
    },
    charCount: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
        textAlign: 'right',
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 12,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    submitButton: {
        flex: 1,
        backgroundColor: '#ff6b35',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    submitButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    errorText: {
        fontSize: 14,
        color: '#e53935',
    },
});

export default ReviewScreen;
