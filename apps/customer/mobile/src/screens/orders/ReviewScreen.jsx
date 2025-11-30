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
import * as orderService from '../../services/orderService';
import { useReviewForm } from '../../hooks/useReviewForm';

const ReviewScreen = ({ orderId }) => {
    const { navigate } = useContext(NavigationContext);

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    // Use review form hook
    const {
        reviewedFoods,
        selectedItem,
        showReviewModal,
        rating,
        comment,
        submitting,
        setRating,
        setComment,
        handleOpenReview,
        handleCloseReview,
        handleSubmitReview,
        isItemReviewed,
    } = useReviewForm(orderId, order);

    useEffect(() => {
        fetchOrder();
    }, [orderId]);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const data = await orderService.getOrderDetail(orderId);
            if (data.status !== 'delivered') {
                Alert.alert('Lỗi', 'Chỉ có thể đánh giá đơn hàng đã giao');
                navigate('order-detail', { orderId: orderId });
                return;
            }
            setOrder(data);
        } catch (error) {
            console.error('[ReviewScreen] Error fetching order:', error);
            Alert.alert('Lỗi', 'Không thể tải đơn hàng');
            navigate('order-detail', { orderId: orderId });
        } finally {
            setLoading(false);
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
                    <Text style={styles.errorText}>Không tìm thấy đơn hàng</Text>
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
                <Text style={styles.headerTitle}>Đánh giá sản phẩm</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Order Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Tóm tắt đơn hàng</Text>
                    <View style={styles.orderCard}>
                        <Text style={styles.restaurantName}>{order.restaurant_name}</Text>
                        <Text style={styles.orderInfo}>
                            Đơn #{order.id?.substring(0, 8)} • {order.items?.length} món
                        </Text>
                    </View>
                </View>

                {/* Items List */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Đánh giá từng món</Text>
                    {order.items && order.items.length > 0 ? (
                        <View style={styles.itemsContainer}>
                            {order.items.map((item, idx) => {
                                const itemIsReviewed = isItemReviewed(item.foodId);

                                return (
                                    <View key={idx} style={styles.itemCard}>
                                        <View style={styles.itemInfo}>
                                            <Text style={styles.itemName}>{item.name || item.food_name}</Text>
                                            <Text style={styles.itemQuantity}>SL: {item.quantity}</Text>
                                        </View>
                                        {itemIsReviewed ? (
                                            <View style={styles.reviewedBadge}>
                                                <MaterialIcons name="check-circle" size={20} color="#4caf50" />
                                                <Text style={styles.reviewedText}>Đã đánh giá</Text>
                                            </View>
                                        ) : (
                                            <TouchableOpacity
                                                style={styles.reviewButton}
                                                onPress={() => handleOpenReview(item)}
                                            >
                                                <MaterialIcons name="star" size={16} color="#fff" />
                                                <Text style={styles.reviewButtonText}>Đánh giá</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    ) : (
                        <Text style={styles.noItemsText}>Không có sản phẩm trong đơn hàng này</Text>
                    )}
                </View>

                {/* Info Notice */}
                <View style={styles.noticeSection}>
                    <MaterialIcons name="info" size={20} color="#1976d2" />
                    <Text style={styles.noticeText}>
                        Đánh giá của bạn giúp khách hàng khác và nhà hàng cải thiện dịch vụ.
                    </Text>
                </View>
            </ScrollView>

            {/* Review Modal */}
            {showReviewModal && selectedItem && (
                <View style={styles.modalOverlay}>
                    <View style={styles.modal}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Đánh giá {selectedItem.name}</Text>
                            <TouchableOpacity onPress={() => setShowReviewModal(false)}>
                                <MaterialIcons name="close" size={24} color="#1a1a1a" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                            {/* Rating Section */}
                            <View style={styles.ratingSection}>
                                <Text style={styles.ratingLabel}>Món này thế nào?</Text>
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
                                        {rating === 1 && '⭐ Kém'}
                                        {rating === 2 && '⭐⭐ Tạm'}
                                        {rating === 3 && '⭐⭐⭐ Tốt'}
                                        {rating === 4 && '⭐⭐⭐⭐ Rất tốt'}
                                        {rating === 5 && '⭐⭐⭐⭐⭐ Xuất sắc'}
                                    </Text>
                                )}
                            </View>

                            {/* Comment Section */}
                            <View style={styles.commentSection}>
                                <Text style={styles.commentLabel}>Nhận xét của bạn</Text>
                                <TextInput
                                    style={styles.commentInput}
                                    placeholder="Chia sẻ trải nghiệm của bạn với món này..."
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
                                onPress={handleCloseReview}
                            >
                                <Text style={styles.cancelButtonText}>Hủy</Text>
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
                                    <Text style={styles.submitButtonText}>Gửi</Text>
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
