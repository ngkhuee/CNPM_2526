/**
 * ReviewScreen.jsx
 * Allow user to submit review for delivered order
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
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NavigationContext } from '../../contexts/NavigationContext';
import { AuthContext } from '../../contexts/AuthContext';
import { orderService } from '../../services/orderService';
import { reviewService } from '../../services/reviewService';
import { showToast } from '../../utils/toastHelper';

const ReviewScreen = ({ orderId }) => {
    const { navigate } = useContext(NavigationContext);
    const { user } = useContext(AuthContext);

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchOrder();
    }, [orderId]);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const data = await orderService.getOrderDetail(orderId);
            if (data.status !== 'delivered') {
                Alert.alert('Error', 'Can only review delivered orders');
                navigate('orders');
                return;
            }
            setOrder(data);
        } catch (error) {
            console.error('[ReviewScreen] Error fetching order:', error);
            Alert.alert('Error', 'Failed to load order');
            navigate('orders');
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (rating === 0) {
            newErrors.rating = 'Please select a rating';
        }

        if (!comment.trim()) {
            newErrors.comment = 'Please write a review';
        } else if (comment.trim().length < 10) {
            newErrors.comment = 'Review must be at least 10 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmitReview = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            setSubmitting(true);

            const reviewData = {
                order_id: order.id,
                user_id: user?.id,
                restaurant_id: order.restaurant_id,
                rating: rating,
                comment: comment.trim(),
                created_at: new Date().toISOString(),
            };

            await reviewService.create(reviewData);

            showToast('success', 'Review submitted successfully!');
            setTimeout(() => {
                navigate('order-detail', { orderId: order.id });
            }, 1500);
        } catch (error) {
            console.error('[ReviewScreen] Error submitting review:', error);
            showToast('error', 'Failed to submit review');
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
                <Text style={styles.headerTitle}>Write Review</Text>
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

                {/* Rating Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>How was your experience?</Text>
                    <View style={styles.ratingContainer}>
                        {[1, 2, 3, 4, 5].map(star => (
                            <TouchableOpacity
                                key={star}
                                onPress={() => {
                                    setRating(star);
                                    setErrors(prev => ({ ...prev, rating: null }));
                                }}
                                style={styles.starButton}
                            >
                                <MaterialIcons
                                    name={star <= rating ? 'star' : 'star-outline'}
                                    size={48}
                                    color={star <= rating ? '#ffc107' : '#ddd'}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                    {rating > 0 && (
                        <Text style={styles.ratingLabel}>
                            {rating === 1 && 'Poor'}
                            {rating === 2 && 'Fair'}
                            {rating === 3 && 'Good'}
                            {rating === 4 && 'Very Good'}
                            {rating === 5 && 'Excellent'}
                        </Text>
                    )}
                    {errors.rating && (
                        <Text style={styles.errorText}>{errors.rating}</Text>
                    )}
                </View>

                {/* Comment Section */}
                <View style={styles.section}>
                    <View style={styles.commentHeader}>
                        <Text style={styles.sectionTitle}>Your Review</Text>
                        <Text style={styles.charCount}>
                            {comment.length}/500
                        </Text>
                    </View>
                    <TextInput
                        style={[
                            styles.commentInput,
                            errors.comment && styles.inputError
                        ]}
                        placeholder="Share your experience with this order (What did you like? What could be improved?)"
                        placeholderTextColor="#aaa"
                        value={comment}
                        onChangeText={(text) => {
                            if (text.length <= 500) {
                                setComment(text);
                                if (errors.comment) {
                                    setErrors(prev => ({ ...prev, comment: null }));
                                }
                            }
                        }}
                        multiline
                        numberOfLines={6}
                        textAlignVertical="top"
                    />
                    {errors.comment && (
                        <Text style={styles.errorText}>{errors.comment}</Text>
                    )}
                </View>

                {/* Review Highlights */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>What did you think about?</Text>
                    <View style={styles.highlightsContainer}>
                        {['Food Quality', 'Packaging', 'Delivery Speed', 'Restaurant Service'].map(
                            (highlight) => (
                                <TouchableOpacity
                                    key={highlight}
                                    style={styles.highlightTag}
                                >
                                    <MaterialIcons name="add-circle-outline" size={18} color="#ff6b35" />
                                    <Text style={styles.highlightText}>{highlight}</Text>
                                </TouchableOpacity>
                            )
                        )}
                    </View>
                </View>

                {/* Info Notice */}
                <View style={styles.noticeSection}>
                    <MaterialIcons name="info" size={20} color="#1976d2" />
                    <Text style={styles.noticeText}>
                        Your review helps other customers and helps the restaurant improve their service.
                    </Text>
                </View>
            </ScrollView>

            {/* Submit Button */}
            <View style={styles.bottomContainer}>
                <TouchableOpacity
                    style={[
                        styles.submitButton,
                        (submitting || rating === 0) && { opacity: 0.7 }
                    ]}
                    onPress={handleSubmitReview}
                    disabled={submitting || rating === 0}
                >
                    {submitting ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <>
                            <MaterialIcons name="send" size={18} color="#fff" />
                            <Text style={styles.submitButtonText}>Submit Review</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    ratingContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginVertical: 12,
    },
    starButton: {
        padding: 8,
    },
    ratingLabel: {
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
        color: '#ff6b35',
        marginTop: 8,
    },
    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    charCount: {
        fontSize: 12,
        color: '#999',
    },
    commentInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: '#1a1a1a',
        minHeight: 120,
    },
    inputError: {
        borderColor: '#e53935',
        backgroundColor: '#ffebee',
    },
    errorText: {
        fontSize: 12,
        color: '#e53935',
        marginTop: 4,
    },
    highlightsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    highlightTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#fff3e0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    highlightText: {
        fontSize: 12,
        color: '#ff6b35',
        fontWeight: '500',
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
    bottomContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    submitButton: {
        backgroundColor: '#ff6b35',
        borderRadius: 8,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
});

export default ReviewScreen;
