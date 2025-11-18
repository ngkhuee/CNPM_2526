import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
    FlatList,
    Modal,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { NavigationContext } from '../../contexts/NavigationContext';
import { CartContext } from '../../contexts/CartContext';
import { AuthContext } from '../../contexts/AuthContext';
import LoginAuthScreen from '../auth/LoginAuthScreen';
import { formatCurrency, formatRating } from '../../shared/formatters';
import { reviewService } from '../../services/reviewService';
import { getFoodImageUrl } from '../../shared/imageHelper';
import { showToast } from '../../utils/toastHelper';
import SwitchRestaurantModal from '../../components/SwitchRestaurantModal';

/**
 * FoodDetailScreen - Product detail page (based on web version)
 * Shows: image, name, description, price, rating, reviews count
 * User can select quantity and add to cart
 * NO: like button, preparation time, availability, total price
 */
export default function FoodDetailScreen({ foodItem, onNavigate }) {
    const { resetNavigationState, navigate } = useContext(NavigationContext);
    const { addItem, canAddFromRestaurant, getCurrentRestaurantName, clearCart } = useContext(CartContext);
    const { isAuthenticated } = useContext(AuthContext);
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [showSwitchModal, setShowSwitchModal] = useState(false);
    const [pendingAddItem, setPendingAddItem] = useState(null);
    const [showLoginModal, setShowLoginModal] = useState(false);

    // Fetch reviews on mount
    useEffect(() => {
        if (foodItem?.id) {
            fetchReviews();
        }
    }, [foodItem?.id]);

    const fetchReviews = async () => {
        try {
            setReviewsLoading(true);
            const data = await reviewService.getByFood(foodItem.id);
            if (data && data.length > 0) {
                // Sort by created_at descending (newest first)
                const sorted = data.sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at)
                );
                setReviews(sorted);
            }
        } catch (error) {
            console.error('[FoodDetailScreen] Error fetching reviews:', error);
        } finally {
            setReviewsLoading(false);
        }
    };

    if (!foodItem) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Product not found</Text>
                </View>
            </SafeAreaView>
        );
    }

    const imageUrl = getFoodImageUrl(foodItem);
    const priceFormatted = formatCurrency(foodItem.price || 0);
    const ratingValue = parseFloat(foodItem.rating) || 0;
    const reviewCount = foodItem.totalReviews || 0;
    const ratingFormatted = ratingValue > 0 ? formatRating(ratingValue) : '0.0';
    const soldCount = parseInt(foodItem.sold) || 0;

    const handleBack = () => {
        if (onNavigate) {
            onNavigate('restaurant');
        }
    };

    const handleAddToCart = async () => {
        // Check if user is authenticated first
        if (!isAuthenticated) {
            setShowLoginModal(true);
            return;
        }

        try {
            setIsAdding(true);

            // Kiểm tra xem có thể thêm từ restaurant này không
            if (!canAddFromRestaurant(foodItem.restaurant_id)) {
                // Khác restaurant - hiển thị modal
                console.log('[FoodDetailScreen] Different restaurant, show modal');
                setPendingAddItem({
                    restaurant_id: foodItem.restaurant_id,
                    food_id: foodItem.id,
                    quantity,
                });
                setShowSwitchModal(true);
                setIsAdding(false);
                return;
            }

            // Cùng restaurant hoặc giỏ rỗng - thêm vào giỏ
            await addItem(
                foodItem.restaurant_id,
                foodItem.id,
                quantity,
                ''
            );

            console.log('[FoodDetailScreen] Added to cart:', {
                foodId: foodItem.id,
                quantity
            });

            showToast('success', `Added ${quantity} item(s) to cart!`);
            setQuantity(1);
        } catch (error) {
            console.error('[FoodDetailScreen] Error adding to cart:', error.message);
            showToast('error', 'Failed to add item: ' + error.message);
        } finally {
            setIsAdding(false);
        }
    };

    /**
     * Xử lý checkout từ modal - đi đến checkout
     */
    const handleModalCheckout = () => {
        setShowSwitchModal(false);
        setPendingAddItem(null);
        navigate('checkout');
    };

    /**
     * Xử lý clear cart và thêm item mới từ modal
     */
    const handleModalClearAndAdd = async () => {
        try {
            await clearCart();

            // Thêm item từ restaurant mới
            if (pendingAddItem) {
                await addItem(
                    pendingAddItem.restaurant_id,
                    pendingAddItem.food_id,
                    pendingAddItem.quantity,
                    ''
                );

                console.log('[FoodDetailScreen] Cleared and added new item');
                showToast('success', 'Cart updated with new restaurant');
            }

            setShowSwitchModal(false);
            setPendingAddItem(null);
            setQuantity(1);
        } catch (error) {
            console.error('[FoodDetailScreen] Error in handleModalClearAndAdd:', error.message);
            showToast('error', 'Error: ' + error.message);
        }
    };

    const renderReviewItem = ({ item }) => {
        const reviewDate = new Date(item.created_at).toLocaleDateString('vi-VN');
        const userName = item.user?.name || 'Anonymous';
        const rating = Math.round(item.rating) || 0;

        return (
            <View style={styles.reviewItem}>
                {/* User info and rating */}
                <View style={styles.reviewHeader}>
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>{userName}</Text>
                        <View style={styles.reviewMeta}>
                            {/* Star rating */}
                            <View style={styles.reviewStars}>
                                {[1, 2, 3, 4, 5].map((star) =>
                                    star <= rating ? (
                                        <MaterialIcons
                                            key={star}
                                            name="star"
                                            size={12}
                                            color="#ffc107"
                                            style={{ marginRight: 2 }}
                                        />
                                    ) : (
                                        <MaterialIcons
                                            key={star}
                                            name="star-border"
                                            size={12}
                                            color="#ddd"
                                            style={{ marginRight: 2 }}
                                        />
                                    )
                                )}
                            </View>
                            <Text style={styles.reviewDate}>{reviewDate}</Text>
                        </View>
                    </View>
                </View>

                {/* Review comment */}
                {item.comment && (
                    <Text style={styles.reviewComment}>{item.comment}</Text>
                )}

                {/* Restaurant reply */}
                {item.restaurant_reply && (
                    <View style={styles.restaurantReply}>
                        <View style={styles.replyHeader}>
                            <MaterialIcons name="business" size={14} color="#ff6b35" />
                            <Text style={styles.replyLabel}>Restaurant's Reply</Text>
                        </View>
                        <Text style={styles.replyText}>{item.restaurant_reply}</Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header with Back Button - Padded 20px from top */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
                        <MaterialIcons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Product Details</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Large Product Image */}
                <Image
                    source={{ uri: imageUrl }}
                    style={styles.largeImage}
                    resizeMode="cover"
                />

                {/* Product Info Section */}
                <View style={styles.infoSection}>
                    {/* Product Name */}
                    <Text style={styles.productName}>{foodItem.name}</Text>

                    {/* Description */}
                    {foodItem.description && (
                        <Text style={styles.description}>{foodItem.description}</Text>
                    )}

                    {/* Price & Rating Row */}
                    <View style={styles.priceRatingRow}>
                        <Text style={styles.price}>{priceFormatted}</Text>
                    </View>

                    {/* Rating & Reviews */}
                    {ratingValue > 0 || reviewCount > 0 ? (
                        <View style={styles.ratingContainer}>
                            <View style={styles.ratingStars}>
                                {[1, 2, 3, 4, 5].map((star) =>
                                    star <= Math.round(ratingValue) ? (
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
                            <Text style={styles.ratingText}>
                                {ratingFormatted} ({reviewCount} reviews)
                            </Text>
                        </View>
                    ) : (
                        <Text style={styles.noRatingText}>No reviews yet</Text>
                    )}

                    {/* Sold Count (if available) */}
                    {soldCount > 0 && (
                        <Text style={styles.soldText}>
                            {soldCount.toLocaleString()} sold
                        </Text>
                    )}

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Quantity Selector */}
                    <View style={styles.quantitySection}>
                        <Text style={styles.quantityLabel}>Quantity</Text>
                        <View style={styles.quantityControl}>
                            <TouchableOpacity
                                style={styles.quantityButton}
                                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                            >
                                <Text style={styles.quantityButtonText}>−</Text>
                            </TouchableOpacity>
                            <Text style={styles.quantityValue}>{quantity}</Text>
                            <TouchableOpacity
                                style={styles.quantityButton}
                                onPress={() => setQuantity(quantity + 1)}
                            >
                                <Text style={styles.quantityButtonText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Reviews Section */}
                <View style={styles.reviewsSection}>
                    <Text style={styles.reviewsTitle}>Customer Reviews</Text>

                    {reviewsLoading ? (
                        <View style={styles.reviewsLoadingContainer}>
                            <ActivityIndicator size="small" color="#ff6b35" />
                        </View>
                    ) : reviews.length === 0 ? (
                        <View style={styles.noReviewsContainer}>
                            <MaterialIcons name="rate-review" size={32} color="#ccc" />
                            <Text style={styles.noReviewsText}>No reviews yet</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={reviews}
                            renderItem={renderReviewItem}
                            keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                            scrollEnabled={false}
                        />
                    )}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Fixed Bottom Add to Cart Button */}
            <View style={styles.bottomButtonContainer}>
                <TouchableOpacity
                    style={[
                        styles.addToCartButton,
                        isAdding && styles.addToCartButtonLoading,
                    ]}
                    onPress={handleAddToCart}
                    disabled={isAdding}
                >
                    {isAdding ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <>
                            <MaterialIcons name="shopping-cart" size={20} color="#fff" />
                            <Text style={styles.addToCartText}>Add to Cart</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {/* Switch Restaurant Modal */}
            <SwitchRestaurantModal
                visible={showSwitchModal}
                currentRestaurant={getCurrentRestaurantName()}
                newRestaurant={foodItem?.restaurant_name}
                onCheckout={handleModalCheckout}
                onClearAndAdd={handleModalClearAndAdd}
                onCancel={() => {
                    setShowSwitchModal(false);
                    setPendingAddItem(null);
                }}
            />

            {/* Login Modal */}
            <Modal
                visible={showLoginModal}
                animationType="slide"
                transparent={false}
                onRequestClose={() => setShowLoginModal(false)}
            >
                <LoginAuthScreen onBackPress={() => setShowLoginModal(false)} />
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingTop: 32, // 12 + 20px extra offset
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
    },
    imageSection: {
        width: '100%',
        height: 300,
        backgroundColor: '#fff',
        position: 'relative',
    },
    largeImage: {
        width: '100%',
        height: 300,
        backgroundColor: '#f0f0f0',
    },
    infoSection: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    productName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
        marginBottom: 8,
        lineHeight: 24,
    },
    description: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
        marginBottom: 16,
    },
    priceRatingRow: {
        marginBottom: 12,
    },
    price: {
        fontSize: 24,
        fontWeight: '700',
        color: '#ff6b35',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    ratingStars: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    ratingText: {
        fontSize: 12,
        color: '#999',
    },
    noRatingText: {
        fontSize: 12,
        color: '#ccc',
        marginBottom: 8,
    },
    soldText: {
        fontSize: 12,
        color: '#ff6b35',
        fontWeight: '500',
        marginBottom: 8,
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 16,
    },
    quantitySection: {
        paddingVertical: 12,
    },
    quantityLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    quantityButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#ff6b35',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    quantityButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#ff6b35',
    },
    quantityValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        minWidth: 30,
        textAlign: 'center',
    },
    bottomButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    addToCartButton: {
        flexDirection: 'row',
        height: 48,
        backgroundColor: '#ff6b35',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    addToCartButtonLoading: {
        opacity: 0.7,
    },
    addToCartText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    reviewsSection: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingHorizontal: 12,
        paddingVertical: 16,
        marginTop: 8,
    },
    reviewsTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#333',
        marginBottom: 16,
    },
    reviewsLoadingContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    noReviewsContainer: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    noReviewsText: {
        fontSize: 13,
        color: '#999',
        marginTop: 8,
    },
    reviewItem: {
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    reviewHeader: {
        marginBottom: 8,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    reviewMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    reviewStars: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    reviewDate: {
        fontSize: 11,
        color: '#999',
    },
    reviewComment: {
        fontSize: 12,
        color: '#555',
        lineHeight: 18,
        marginBottom: 8,
    },
    restaurantReply: {
        backgroundColor: '#f9f9f9',
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
        marginBottom: 4,
    },
    replyLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#ff6b35',
    },
    replyText: {
        fontSize: 11,
        color: '#666',
        lineHeight: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 14,
        color: '#d32f2f',
    },
});
