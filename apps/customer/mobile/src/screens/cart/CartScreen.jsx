import React, { useContext } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NavigationContext } from '../../contexts/NavigationContext';
import { AuthContext } from '../../contexts/AuthContext';
import BottomNavigation from '../../components/BottomNavigation';
import CartItem from '../../components/CartItem';
import { formatCurrency } from '../../shared/formatters';
import { useCartOperations } from '../../hooks/useCartOperations';

const CartScreen = ({ onNavigate }) => {
    const { navigate, activeRoute } = useContext(NavigationContext);
    const { isAuthenticated } = useContext(AuthContext);

    // Use cart operations hook
    const {
        localCart,
        isLoading,
        handleRemoveItem,
        handleUpdateQuantity,
        saveCartBeforeCheckout,
        calculateTotals,
        isEmpty
    } = useCartOperations();

    // Check if user is authenticated - show login prompt instead of cart
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
                        <Text style={styles.modalTitle}>Yêu cầu đăng nhập</Text>
                        <Text style={styles.modalSubtitle}>
                            Đăng nhập để xem và quản lý giỏ hàng của bạn
                        </Text>

                        <TouchableOpacity
                            style={styles.modalLoginButton}
                            onPress={() => {
                                navigate('login');
                            }}
                        >
                            <Text style={styles.modalLoginButtonText}>Đăng nhập</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
                <BottomNavigation activeRoute={activeRoute} onNavigate={onNavigate} />
            </View>
        );
    }

    // Get cart totals from hook
    const { subtotal, totalItems, items: cartItems } = calculateTotals();

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
     * Render footer - tổng tiền, checkout button
     */
    const renderFooter = () => {
        if (isEmpty) return null;

        return (
            <View style={styles.footer}>
                {/* Summary - only show total */}
                <View style={styles.summary}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Tổng cộng</Text>
                        <Text style={styles.totalValue}>
                            {formatCurrency(subtotal)}
                        </Text>
                    </View>
                </View>

                {/* Checkout Button */}
                <TouchableOpacity
                    style={styles.checkoutButton}
                    onPress={() => {
                        saveCartBeforeCheckout();
                        onNavigate('checkout');
                    }}
                    disabled={isLoading}
                >
                    <Text style={styles.checkoutText}>Tiến hành thanh toán</Text>
                </TouchableOpacity>

                {/* Continue Shopping */}
                <TouchableOpacity
                    style={styles.continueButton}
                    onPress={() => onNavigate('home')}
                >
                    <Text style={styles.continueText}>Tiếp tục mua sắm</Text>
                </TouchableOpacity>
            </View>
        );
    };

    /**
     * Render empty state
     */
    if (isEmpty) {
        return (
            <View style={styles.screenContainer}>
                <SafeAreaView style={styles.emptyContainer}>
                    <View style={styles.emptyContent}>
                        <MaterialIcons
                            name="shopping-cart"
                            size={80}
                            color="#ddd"
                        />
                        <Text style={styles.emptyTitle}>Giỏ hàng trống</Text>
                        <Text style={styles.emptySubtitle}>
                            Thêm món từ các nhà hàng yêu thích của bạn
                        </Text>
                        <TouchableOpacity
                            style={styles.browseButton}
                            onPress={() => onNavigate('home')}
                        >
                            <Text style={styles.browseButtonText}>Khám phá nhà hàng</Text>
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
                    <Text style={styles.headerTitle}>Giỏ hàng</Text>
                    <View style={styles.headerBadge}>
                        <Text style={styles.headerBadgeText}>{totalItems}</Text>
                    </View>
                </View>

                {/* Restaurant Info */}
                <View style={styles.restaurantInfo}>
                    <MaterialIcons name="restaurant" size={20} color="#ff6b35" />
                    <Text style={styles.restaurantName}>{localCart?.restaurant_name || 'Giỏ hàng của bạn'}</Text>
                </View>

                {/* Items List */}
                <FlatList
                    data={cartItems}
                    renderItem={renderItem}
                    keyExtractor={(item) => (item.item_id || item.menu_id || item.food_id || item.id || Math.random().toString()).toString()}
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
        paddingTop: 35,
        backgroundColor: '#f8f8f8',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
