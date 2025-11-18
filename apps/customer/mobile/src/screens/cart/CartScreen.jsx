/**
 * CartScreen.jsx - Màn hình hiển thị giỏ hàng
 * Danh sách item, tổng tiền, checkout button, promotions
 */

import React, { useContext, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { CartContext } from '../../contexts/CartContext';
import { NavigationContext } from '../../contexts/NavigationContext';
import { AuthContext } from '../../contexts/AuthContext';
import BottomNavigation from '../../components/BottomNavigation';
import CartItem from '../../components/CartItem';
import { calculateCartTotals } from '../../utils/cartHelpers';
import { usePromotions } from '../../hooks/usePromotions';
import { useSettings } from '../../hooks/useSettings';

const CartScreen = ({ onNavigate }) => {
    const { cart, loading, removeItem, updateItem } = useContext(CartContext);
    const { navigate, activeRoute } = useContext(NavigationContext);
    const { isAuthenticated } = useContext(AuthContext);

    // Promotions and settings hooks
    const { promotions, loading: loadingPromos, getApplicablePromotions } = usePromotions(cart?.restaurant_id);
    const { deliveryFee: deliveryFeeValue } = useSettings();

    // Promo state
    const [appliedPromotion, setAppliedPromotion] = useState(null);
    const [showPromoList, setShowPromoList] = useState(false);

    // Lấy số item và tổng tiền
    const cartItems = cart?.items || [];
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cartItems.reduce(
        (sum, item) => sum + (item.price * item.quantity),
        0
    );

    // Get applicable promotions for current restaurant
    const applicablePromotions = cart?.restaurant_id
        ? getApplicablePromotions(cart.restaurant_id)
        : promotions.filter(p => p.status === "active");

    // Calculate totals with promotion
    const { discountAmount, deliveryFee, total } = calculateCartTotals(
        subtotal,
        appliedPromotion,
        deliveryFeeValue
    );

    /**
     * Xử lý khi user click xóa item
     */
    const handleRemoveItem = async (itemId) => {
        try {
            await removeItem(itemId);
        } catch (err) {
            console.error('[CartScreen.handleRemoveItem] Error:', err.message);
        }
    };

    /**
     * Xử lý khi user cập nhật số lượng item
     */
    const handleUpdateQuantity = async (itemId, quantity) => {
        try {
            if (quantity <= 0) {
                await handleRemoveItem(itemId);
            } else {
                await updateItem(itemId, quantity);
            }
        } catch (err) {
            console.error('[CartScreen.handleUpdateQuantity] Error:', err.message);
        }
    };

    /**
     * Render item trong FlatList
     */
    const renderItem = ({ item }) => (
        <CartItem
            item={item}
            onUpdateQuantity={handleUpdateQuantity}
            onRemove={handleRemoveItem}
        />
    );

    /**
     * Render footer - tổng tiền, promotions, checkout button
     */
    const renderFooter = () => {
        if (cartItems.length === 0) return null;

        return (
            <View style={styles.footer}>
                {/* Promotions Section */}
                {applicablePromotions.length > 0 && (
                    <View style={styles.promoSection}>
                        <TouchableOpacity
                            style={styles.promoButton}
                            onPress={() => setShowPromoList(!showPromoList)}
                        >
                            <MaterialIcons name="local-offer" size={18} color="#ff6b35" />
                            <View style={styles.promoButtonText}>
                                <Text style={styles.promoLabel}>
                                    {appliedPromotion ? 'Promo Applied' : 'Available Promotions'}
                                </Text>
                                <Text style={styles.promoValue}>
                                    {appliedPromotion
                                        ? appliedPromotion.code
                                        : `${applicablePromotions.length} offers`}
                                </Text>
                            </View>
                            <MaterialIcons
                                name={showPromoList ? "expand-less" : "expand-more"}
                                size={20}
                                color="#666"
                            />
                        </TouchableOpacity>

                        {showPromoList && (
                            <View style={styles.promoList}>
                                {applicablePromotions.map((promo) => (
                                    <TouchableOpacity
                                        key={promo.id}
                                        style={[
                                            styles.promoItem,
                                            appliedPromotion?.id === promo.id && styles.promoItemActive
                                        ]}
                                        onPress={() => {
                                            setAppliedPromotion(promo);
                                            setShowPromoList(false);
                                        }}
                                    >
                                        <View style={styles.promoItemContent}>
                                            <Text style={styles.promoCode}>{promo.code}</Text>
                                            <Text style={styles.promoDesc}>{promo.description}</Text>
                                        </View>
                                        {appliedPromotion?.id === promo.id && (
                                            <MaterialIcons name="check-circle" size={20} color="#ff6b35" />
                                        )}
                                    </TouchableOpacity>
                                ))}
                                {appliedPromotion && (
                                    <TouchableOpacity
                                        style={styles.promoItem}
                                        onPress={() => {
                                            setAppliedPromotion(null);
                                            setShowPromoList(false);
                                        }}
                                    >
                                        <Text style={styles.promoCode}>Remove Promo</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                    </View>
                )}

                {/* Summary */}
                <View style={styles.summary}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Subtotal:</Text>
                        <Text style={styles.summaryValue}>
                            ${subtotal.toFixed(2)}
                        </Text>
                    </View>
                    {discountAmount > 0 && (
                        <View style={[styles.summaryRow, styles.discountRow]}>
                            <Text style={styles.discountLabel}>Discount:</Text>
                            <Text style={styles.discountValue}>
                                -${discountAmount.toFixed(2)}
                            </Text>
                        </View>
                    )}
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Delivery:</Text>
                        <Text style={styles.summaryValue}>
                            ${deliveryFee.toFixed(2)}
                        </Text>
                    </View>
                    <View style={[styles.summaryRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Total:</Text>
                        <Text style={styles.totalValue}>
                            ${total.toFixed(2)}
                        </Text>
                    </View>
                </View>

                {/* Checkout Button */}
                <TouchableOpacity
                    style={styles.checkoutButton}
                    onPress={() => onNavigate('checkout')}
                >
                    <MaterialIcons name="arrow-forward" size={20} color="#fff" />
                    <Text style={styles.checkoutText}>Proceed to Checkout</Text>
                </TouchableOpacity>

                {/* Continue Shopping */}
                <TouchableOpacity
                    style={styles.continueButton}
                    onPress={() => onNavigate('home')}
                >
                    <Text style={styles.continueText}>Continue Shopping</Text>
                </TouchableOpacity>
            </View>
        );
    };

    /**
     * Check if user is authenticated - show login prompt instead of cart
     */
    if (!isAuthenticated) {
        return (
            <View style={styles.screenContainer}>
                <SafeAreaView style={styles.container}>
                    <View style={styles.loginPromptContainer}>
                        <MaterialIcons
                            name="lock"
                            size={48}
                            color="#ff6b35"
                            style={styles.lockIcon}
                        />
                        <Text style={styles.modalTitle}>Login Required</Text>
                        <Text style={styles.modalSubtitle}>
                            Sign in to add items to your cart and checkout
                        </Text>

                        <TouchableOpacity
                            style={styles.modalLoginButton}
                            onPress={() => {
                                onNavigate('login');
                            }}
                        >
                            <Text style={styles.modalLoginButtonText}>Login</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
                <BottomNavigation activeRoute={activeRoute} onNavigate={onNavigate} />
            </View>
        );
    };

    /**
     * Render empty state
     */
    if (cartItems.length === 0) {
        return (
            <View style={styles.screenContainer}>
                <SafeAreaView style={styles.emptyContainer}>
                    <View style={styles.emptyContent}>
                        <MaterialIcons
                            name="shopping-cart"
                            size={80}
                            color="#ddd"
                        />
                        <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
                        <Text style={styles.emptySubtitle}>
                            Add items from your favorite restaurants
                        </Text>
                        <TouchableOpacity
                            style={styles.browseButton}
                            onPress={() => onNavigate('home')}
                        >
                            <Text style={styles.browseButtonText}>Browse Restaurants</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
                <BottomNavigation activeRoute={activeRoute} onNavigate={onNavigate} />
            </View>
        );
    }

    return (
        <View style={styles.screenContainer}>
            <SafeAreaView style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Cart</Text>
                    <View style={styles.headerBadge}>
                        <Text style={styles.headerBadgeText}>{totalItems}</Text>
                    </View>
                </View>

                {/* Restaurant Info */}
                <View style={styles.restaurantInfo}>
                    <MaterialIcons name="restaurant" size={20} color="#ff6b35" />
                    <Text style={styles.restaurantName}>{cart?.restaurant_name}</Text>
                </View>

                {/* Items List */}
                <FlatList
                    data={cartItems}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={true}
                    ListFooterComponent={renderFooter}
                    onEndReachedThreshold={0.1}
                />
            </SafeAreaView>
            <BottomNavigation activeRoute={activeRoute} onNavigate={onNavigate} />
        </View>
    );
};

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
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
        fontSize: 24,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    headerBadge: {
        backgroundColor: '#ff6b35',
        borderRadius: 12,
        width: 28,
        height: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerBadgeText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 12,
    },
    restaurantInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        gap: 8,
    },
    restaurantName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    footer: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 32,
        backgroundColor: '#fff',
        marginTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    summary: {
        marginBottom: 16,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#666',
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1a1a1a',
    },
    totalRow: {
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        marginTop: 8,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#ff6b35',
    },
    discountRow: {
        paddingVertical: 4,
    },
    discountLabel: {
        fontSize: 14,
        color: '#4caf50',
        fontWeight: '600',
    },
    discountValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4caf50',
    },
    promoSection: {
        marginBottom: 16,
        backgroundColor: '#fff8f0',
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#ffe0cc',
    },
    promoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 12,
        gap: 12,
    },
    promoButtonText: {
        flex: 1,
    },
    promoLabel: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    promoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#ff6b35',
    },
    promoList: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#ffe0cc',
    },
    promoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    promoItemActive: {
        backgroundColor: '#fff8f0',
    },
    promoItemContent: {
        flex: 1,
    },
    promoCode: {
        fontSize: 14,
        fontWeight: '600',
        color: '#ff6b35',
    },
    promoDesc: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    checkoutButton: {
        backgroundColor: '#ff6b35',
        borderRadius: 8,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 12,
    },
    checkoutText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    continueButton: {
        borderWidth: 1,
        borderColor: '#ff6b35',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    continueText: {
        color: '#ff6b35',
        fontSize: 14,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        backgroundColor: '#f8f8f8',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContent: {
        alignItems: 'center',
        gap: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        maxWidth: 280,
    },
    browseButton: {
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
        marginTop: 8,
    },
    browseButtonText: {
        color: '#666',
        fontSize: 14,
        fontWeight: '600',
    },
    loginPromptButton: {
        backgroundColor: '#ff6b35',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
        marginTop: 8,
    },
    loginPromptButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    // Login prompt styles
    loginPromptContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    // Login prompt box
    loginPromptBox: {
        backgroundColor: 'transparent',
        alignItems: 'center',
        width: '100%',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalLoginPromptBox: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        width: '100%',
        maxWidth: 320,
    },
    lockIcon: {
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    modalLoginButton: {
        backgroundColor: '#ff6b35',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 32,
        width: '100%',
        alignItems: 'center',
        marginBottom: 12,
    },
    modalLoginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    modalBackButton: {
        borderWidth: 1,
        borderColor: '#ff6b35',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
        width: '100%',
        alignItems: 'center',
        marginTop: 12,
    },
    modalBackButtonText: {
        color: '#ff6b35',
        fontSize: 14,
        fontWeight: '600',
    },
    modalCloseButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCloseButtonText: {
        color: '#ff6b35',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default CartScreen;
