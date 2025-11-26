// components/restaurant/ReviewsList.jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export const ReviewsList = ({ reviews, avgRating }) => {
    const renderStars = (rating) => {
        return (
            <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) =>
                    star <= rating ? (
                        <MaterialIcons key={star} name="star" size={14} color="#ffc107" />
                    ) : (
                        <MaterialIcons key={star} name="star-border" size={14} color="#ddd" />
                    )
                )}
            </View>
        );
    };

    if (reviews.length === 0) {
        return (
            <View style={styles.emptyReviewsContainer}>
                <MaterialIcons name="rate-review" size={32} color="#ccc" />
                <Text style={styles.emptyReviewsText}>Chưa có đánh giá nào</Text>
                <Text style={styles.emptyReviewsSubtext}>Hãy là người đầu tiên đánh giá nhà hàng này</Text>
            </View>
        );
    }

    return (
        <>
            {/* Reviews Header */}
            <View style={styles.reviewsHeaderContainer}>
                <View style={styles.ratingBadge}>
                    <MaterialIcons name="star" size={18} color="#ffc107" />
                    <Text style={styles.ratingValue}>{avgRating}</Text>
                    <Text style={styles.reviewCountBadge}>/ 5</Text>
                    <Text style={styles.allReviewsText}>• Tất cả đánh giá ({reviews.length})</Text>
                </View>
            </View>

            {/* Reviews List */}
            {reviews.map((review) => (
                <View key={review.id} style={styles.reviewItem}>
                    {/* Review Header */}
                    <View style={styles.reviewHeader}>
                        <View style={styles.reviewUserInfo}>
                            <Text style={styles.reviewUserName}>
                                {review.user?.name || 'Ẩn danh'}
                            </Text>
                            {renderStars(review.rating || 0)}
                        </View>
                        <Text style={styles.reviewDate}>
                            {new Date(review.created_at).toLocaleDateString('vi-VN')}
                        </Text>
                    </View>

                    {/* Food Name */}
                    {review.food_name && (
                        <Text style={styles.foodNameTag}>{review.food_name}</Text>
                    )}

                    {/* Review Comment */}
                    <Text style={styles.reviewComment}>{review.comment}</Text>

                    {/* Restaurant Reply */}
                    {review.restaurant_reply && (
                        <View style={styles.restaurantReply}>
                            <View style={styles.replyHeader}>
                                <MaterialIcons name="reply" size={14} color="#ff6b35" />
                                <Text style={styles.replyLabel}>Phản hồi từ nhà hàng</Text>
                            </View>
                            <Text style={styles.replyText}>{review.restaurant_reply}</Text>
                        </View>
                    )}
                </View>
            ))}
        </>
    );
};

const styles = StyleSheet.create({
    emptyReviewsContainer: { alignItems: 'center', paddingVertical: 32 },
    emptyReviewsText: { fontSize: 13, fontWeight: '500', color: '#999', marginTop: 8 },
    emptyReviewsSubtext: { fontSize: 12, color: '#bbb', marginTop: 4 },
    reviewsHeaderContainer: {
        marginBottom: 20,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    ratingValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
    },
    reviewCountBadge: {
        fontSize: 14,
        color: '#999',
        fontWeight: '500',
    },
    allReviewsText: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
        marginLeft: 4,
    },
    reviewItem: {
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    reviewUserInfo: { flex: 1 },
    reviewUserName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 6,
    },
    starsContainer: { flexDirection: 'row', gap: 2 },
    reviewDate: {
        fontSize: 12,
        color: '#999',
    },
    foodNameTag: {
        fontSize: 12,
        color: '#ff6b35',
        fontWeight: '600',
        marginBottom: 8,
        backgroundColor: '#fff3e0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    reviewComment: {
        fontSize: 13,
        color: '#333',
        lineHeight: 20,
        marginBottom: 8,
    },
    restaurantReply: {
        backgroundColor: '#f8f8f8',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 10,
    },
    replyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 6,
    },
    replyLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#ff6b35',
    },
    replyText: {
        fontSize: 13,
        color: '#555',
        lineHeight: 18,
    },
});
