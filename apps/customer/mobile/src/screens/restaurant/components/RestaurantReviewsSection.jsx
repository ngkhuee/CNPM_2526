import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { reviewService } from '../../../services/reviewService';
import { formatRating } from '../../../shared/formatters';

/**
 * RestaurantReviewsSection - Display food reviews from all foods in this restaurant
 * Shows user name, rating, date, and comment
 */
export default function RestaurantReviewsSection({ restaurantId }) {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [avgRating, setAvgRating] = useState(0);

    useEffect(() => {
        if (!restaurantId) {
            setLoading(false);
            return;
        }
        fetchReviews();
    }, [restaurantId]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const data = await reviewService.getByRestaurant(restaurantId);

            if (data && data.length > 0) {
                // Sort by created_at descending (newest first)
                const sorted = data.sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at)
                );

                // Calculate average rating
                const avg = sorted.reduce((sum, r) => sum + (r.rating || 0), 0) / sorted.length;
                setAvgRating(Number(avg.toFixed(1)));

                // Show only first 5 most recent
                setReviews(sorted.slice(0, 5));
            }
        } catch (error) {
            console.error('[RestaurantReviewsSection] Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderStars = (rating) => {
        return (
            <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) =>
                    star <= rating ? (
                        <MaterialIcons
                            key={star}
                            name="star"
                            size={14}
                            color="#ffc107"
                        />
                    ) : (
                        <MaterialIcons
                            key={star}
                            name="star-border"
                            size={14}
                            color="#ddd"
                        />
                    )
                )}
            </View>
        );
    };

    const renderReviewItem = ({ item }) => (
        <View style={styles.reviewItem}>
            {/* Review Header */}
            <View style={styles.reviewHeader}>
                <View style={styles.reviewUserInfo}>
                    <Text style={styles.reviewUserName}>{item.user?.name || 'Ẩn danh'}</Text>
                    {renderStars(item.rating || 0)}
                </View>
                <Text style={styles.reviewDate}>
                    {new Date(item.created_at).toLocaleDateString('vi-VN')}
                </Text>
            </View>

            {/* Food Name */}
            {item.food_name && (
                <Text style={styles.foodName}>{item.food_name}</Text>
            )}

            {/* Review Comment */}
            <Text style={styles.reviewComment}>{item.comment}</Text>

            {/* Restaurant Reply */}
            {item.restaurant_reply && (
                <View style={styles.restaurantReply}>
                    <View style={styles.replyHeader}>
                        <MaterialIcons name="reply" size={14} color="#ff6b35" />
                        <Text style={styles.replyLabel}>Phản hồi từ nhà hàng</Text>
                    </View>
                    <Text style={styles.replyText}>{item.restaurant_reply}</Text>
                </View>
            )}
        </View>
    );

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="small" color="#ff6b35" />
            </View>
        );
    }

    if (reviews.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.header}>Đánh giá khách hàng</Text>
                <View style={styles.emptyContainer}>
                    <MaterialIcons name="rate-review" size={32} color="#ccc" />
                    <Text style={styles.emptyText}>Chưa có đánh giá</Text>
                    <Text style={styles.emptySubtext}>Hãy là người đầu tiên đánh giá nhà hàng này</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header with Rating Summary */}
            <View style={styles.headerRow}>
                <Text style={styles.header}>Đánh giá khách hàng</Text>
                <View style={styles.ratingBadge}>
                    <MaterialIcons name="star" size={16} color="#ffc107" />
                    <Text style={styles.ratingValue}>{avgRating}</Text>
                    <Text style={styles.reviewCount}>({reviews.length})</Text>
                </View>
            </View>

            {/* Reviews List */}
            <FlatList
                data={reviews}
                renderItem={renderReviewItem}
                keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                scrollEnabled={false}
            />

            {/* View All Link */}
            {reviews.length >= 5 && (
                <Text style={styles.viewAllLink}>Hiển thị 5 đánh giá gần nhất</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingHorizontal: 12,
        paddingVertical: 16,
        marginTop: 8,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    header: {
        fontSize: 14,
        fontWeight: '700',
        color: '#333',
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingValue: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
    },
    reviewCount: {
        fontSize: 12,
        color: '#999',
    },
    reviewItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    reviewUserInfo: {
        flex: 1,
    },
    reviewUserName: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    starsContainer: {
        flexDirection: 'row',
        gap: 2,
    },
    reviewDate: {
        fontSize: 11,
        color: '#999',
    },
    foodName: {
        fontSize: 12,
        color: '#ff6b35',
        fontWeight: '500',
        marginBottom: 6,
    },
    reviewComment: {
        fontSize: 12,
        color: '#666',
        lineHeight: 16,
        marginBottom: 8,
    },
    restaurantReply: {
        backgroundColor: '#f5f5f5',
        borderLeftWidth: 3,
        borderLeftColor: '#ff6b35',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 4,
        marginTop: 8,
    },
    replyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 6,
    },
    replyLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#ff6b35',
    },
    replyText: {
        fontSize: 12,
        color: '#333',
        lineHeight: 16,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    emptyText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#999',
        marginTop: 8,
    },
    emptySubtext: {
        fontSize: 12,
        color: '#bbb',
        marginTop: 4,
    },
    viewAllLink: {
        fontSize: 12,
        color: '#999',
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 12,
    },
});
