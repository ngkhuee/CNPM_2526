// components/restaurant/ReviewsList.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export const ReviewsList = ({ reviews, avgRating }) => {
    const [filteredReviews, setFilteredReviews] = useState(reviews);
    const [filterRating, setFilterRating] = useState('all');
    const [sortOrder, setSortOrder] = useState('newest');
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [showSortModal, setShowSortModal] = useState(false);

    // Filter and sort reviews
    useEffect(() => {
        if (!reviews || reviews.length === 0) {
            setFilteredReviews([]);
            return;
        }

        let filtered = [...reviews];

        // Filter by rating
        if (filterRating !== 'all') {
            const targetRating = parseInt(filterRating);
            filtered = filtered.filter(r => r.rating === targetRating);
        }

        // Sort by date
        if (sortOrder === 'newest') {
            filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        } else {
            filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        }

        setFilteredReviews(filtered);
    }, [reviews, filterRating, sortOrder]);

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
                    <Text style={styles.allReviewsText}>• ({reviews.length} đánh giá)</Text>
                </View>
            </View>

            {/* Filters - Dropdown style */}
            <View style={styles.filtersContainer}>
                <View style={styles.filterGroup}>
                    <Text style={styles.filterLabel}>Lọc theo:</Text>
                    <TouchableOpacity
                        style={styles.dropdown}
                        onPress={() => setShowFilterModal(true)}
                    >
                        <Text style={styles.dropdownText}>
                            {filterRating === 'all' ? 'Tất cả' :
                                filterRating === '5' ? '5 sao - Xuất sắc' :
                                    filterRating === '4' ? '4 sao - Tốt' :
                                        filterRating === '3' ? '3 sao - Trung bình' :
                                            filterRating === '2' ? '2 sao - Tệ' :
                                                '1 sao - Rất tệ'}
                        </Text>
                        <MaterialIcons name="arrow-drop-down" size={20} color="#666" />
                    </TouchableOpacity>
                </View>

                <View style={styles.filterGroup}>
                    <Text style={styles.filterLabel}>Sắp xếp:</Text>
                    <TouchableOpacity
                        style={styles.dropdown}
                        onPress={() => setShowSortModal(true)}
                    >
                        <Text style={styles.dropdownText}>
                            {sortOrder === 'newest' ? 'Mới nhất' : 'Cũ nhất'}
                        </Text>
                        <MaterialIcons name="arrow-drop-down" size={20} color="#666" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Filter Modal */}
            <Modal
                visible={showFilterModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowFilterModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowFilterModal(false)}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Lọc theo đánh giá</Text>
                        {[
                            { value: 'all', label: 'Tất cả' },
                            { value: '5', label: '5 sao - Xuất sắc' },
                            { value: '4', label: '4 sao - Tốt' },
                            { value: '3', label: '3 sao - Trung bình' },
                            { value: '2', label: '2 sao - Tệ' },
                            { value: '1', label: '1 sao - Rất tệ' },
                        ].map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={styles.modalOption}
                                onPress={() => {
                                    setFilterRating(option.value);
                                    setShowFilterModal(false);
                                }}
                            >
                                <Text style={[
                                    styles.modalOptionText,
                                    filterRating === option.value && styles.modalOptionTextActive
                                ]}>
                                    {option.label}
                                </Text>
                                {filterRating === option.value && (
                                    <MaterialIcons name="check" size={20} color="#ff6b35" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Sort Modal */}
            <Modal
                visible={showSortModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowSortModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowSortModal(false)}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Sắp xếp theo</Text>
                        {[
                            { value: 'newest', label: 'Mới nhất' },
                            { value: 'oldest', label: 'Cũ nhất' },
                        ].map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={styles.modalOption}
                                onPress={() => {
                                    setSortOrder(option.value);
                                    setShowSortModal(false);
                                }}
                            >
                                <Text style={[
                                    styles.modalOptionText,
                                    sortOrder === option.value && styles.modalOptionTextActive
                                ]}>
                                    {option.label}
                                </Text>
                                {sortOrder === option.value && (
                                    <MaterialIcons name="check" size={20} color="#ff6b35" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Reviews List */}
            {filteredReviews.length === 0 ? (
                <View style={styles.emptyFilterContainer}>
                    <Text style={styles.emptyFilterText}>Không tìm thấy đánh giá phù hợp</Text>
                </View>
            ) : (
                filteredReviews.map((review) => (
                    <View key={review.id} style={styles.reviewItem}>
                        {/* Food Name & Rating Header */}
                        <View style={styles.reviewTopRow}>
                            <View style={styles.foodNameContainer}>
                                {review.food_name && (
                                    <Text style={styles.foodNameTag}>
                                        {review.food_name}
                                    </Text>
                                )}
                            </View>
                            <View style={styles.ratingContainer}>
                                <View style={styles.starsRow}>
                                    {renderStars(review.rating || 0)}
                                </View>
                                <Text style={styles.reviewDate}>
                                    {new Date(review.created_at).toLocaleDateString('vi-VN')}
                                </Text>
                            </View>
                        </View>

                        {/* Customer Comment */}
                        <View style={styles.commentSection}>
                            <Text style={styles.commentLabel}>
                                Khách hàng:
                                <Text style={styles.userName}>
                                    {' '}
                                    {(() => {
                                        const name = review.user_name || review.user?.name || review.user?.full_name || 'Ẩn danh';
                                        if (name === 'Ẩn danh' || name.length <= 2) return name;
                                        return `${name[0]}***${name[name.length - 1]}`;
                                    })()}
                                </Text>
                            </Text>
                            <Text style={styles.reviewComment}>{review.comment}</Text>
                        </View>

                        {/* Restaurant Reply */}
                        {review.restaurant_reply && (
                            <View style={styles.restaurantReply}>
                                <Text style={styles.replyLabel}>Phản hồi của nhà hàng:</Text>
                                <Text style={styles.replyText}>{review.restaurant_reply}</Text>
                            </View>
                        )}
                    </View>
                ))
            )}
        </>
    );
};

const styles = StyleSheet.create({
    emptyReviewsContainer: { alignItems: 'center', paddingVertical: 32 },
    emptyReviewsText: { fontSize: 13, fontWeight: '500', color: '#999', marginTop: 8 },
    emptyReviewsSubtext: { fontSize: 12, color: '#bbb', marginTop: 4 },
    reviewsHeaderContainer: {
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    filtersContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
        gap: 12,
    },
    filterGroup: {
        flex: 1,
    },
    filterLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#495057',
        marginBottom: 6,
    },
    dropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    dropdownText: {
        fontSize: 13,
        color: '#333',
        flex: 1,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        width: '100%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
        marginBottom: 16,
    },
    modalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalOptionText: {
        fontSize: 14,
        color: '#666',
    },
    modalOptionTextActive: {
        color: '#ff6b35',
        fontWeight: '600',
    },
    emptyFilterContainer: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    emptyFilterText: {
        fontSize: 13,
        color: '#999',
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
    reviewTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    foodNameContainer: {
        flex: 1,
        marginRight: 12,
    },
    foodNameTag: {
        fontSize: 12,
        color: '#ff6b35',
        fontWeight: '600',
        backgroundColor: '#fff3e0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    ratingContainer: {
        alignItems: 'flex-end',
    },
    starsRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    starsContainer: {
        flexDirection: 'row',
    },
    reviewDate: {
        fontSize: 12,
        color: '#999',
    },
    commentSection: {
        marginBottom: 8,
    },
    commentLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#495057',
        marginBottom: 4,
    },
    userName: {
        fontSize: 13,
        fontWeight: '500',
        color: '#6c757d',
    },
    reviewComment: {
        fontSize: 13,
        color: '#333',
        lineHeight: 20,
    },
    restaurantReply: {
        backgroundColor: '#f8f8f8',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 10,
    },
    replyLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#ff6b35',
        marginBottom: 4,
    },
    replyText: {
        fontSize: 13,
        color: '#555',
        lineHeight: 18,
    },
});
