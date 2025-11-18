/**
 * CheckoutScreen.jsx - Màn hình thanh toán
 * Địa chỉ giao hàng, phương thức thanh toán, mã khuyến mãi
 */

import React, { useContext, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { CartContext } from '../../contexts/CartContext';
import { NavigationContext } from '../../contexts/NavigationContext';
import { submitOrder } from '../../services/orderService';
import { showToast } from '../../utils/toastHelper';

const CheckoutScreen = () => {
    const { cart, clearCart } = useContext(CartContext);
    const { navigate } = useContext(NavigationContext);
    const [loading, setLoading] = useState(false);

    // Form state
    const [address, setAddress] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [promoCode, setPromoCode] = useState('');
    const [promoDiscount, setPromoDiscount] = useState(0);

    // Tính toán tổng tiền
    const subtotal = cart?.items?.reduce(
        (sum, item) => sum + (item.price * item.quantity),
        0
    ) || 0;
    const deliveryFee = 2.00;
    const total = subtotal + deliveryFee - promoDiscount;

    /**
     * Xử lý áp dụng mã khuyến mãi
     */
    const handleApplyPromo = () => {
        // Giả lập kiểm tra promo code
        if (promoCode === 'SAVE10') {
            setPromoDiscount(subtotal * 0.1);
        } else if (promoCode === 'SAVE20') {
            setPromoDiscount(subtotal * 0.2);
        } else {
            setPromoDiscount(0);
        }
    };

    /**
     * Xử lý đặt hàng
     */
    const handlePlaceOrder = async () => {
        // Validate form
        if (!address.trim()) {
            showToast('error', 'Please enter delivery address');
            return;
        }
        if (!phoneNumber.trim()) {
            showToast('error', 'Please enter phone number');
            return;
        }

        setLoading(true);
        try {
            // Gọi API tạo order
            const order = await submitOrder({
                cart_id: cart.id,
                delivery_address: address,
                phone_number: phoneNumber,
                payment_method: paymentMethod,
                promo_code: promoCode,
                total: total,
            });

            console.log('[CheckoutScreen] Order placed successfully:', order);

            showToast('success', 'Order placed successfully!');

            // Clear cart sau khi đặt hàng thành công
            await clearCart();

            // Navigate to orders
            navigate('orders');
        } catch (err) {
            console.error('[CheckoutScreen] Error placing order:', err.message);
            showToast('error', 'Failed to place order: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!cart || !cart.items || cart.items.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Cart is empty</Text>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigate('home')}
                    >
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigate('cart')}>
                    <MaterialIcons name="arrow-back" size={24} color="#1a1a1a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Checkout</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Restaurant Info */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialIcons name="restaurant" size={20} color="#ff6b35" />
                        <Text style={styles.sectionTitle}>Restaurant</Text>
                    </View>
                    <Text style={styles.restaurantName}>{cart?.restaurant_name}</Text>
                </View>

                {/* Delivery Address */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialIcons name="location-on" size={20} color="#ff6b35" />
                        <Text style={styles.sectionTitle}>Delivery Address</Text>
                    </View>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter delivery address"
                        placeholderTextColor="#aaa"
                        value={address}
                        onChangeText={setAddress}
                        multiline
                        numberOfLines={3}
                    />
                </View>

                {/* Phone Number */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialIcons name="phone" size={20} color="#ff6b35" />
                        <Text style={styles.sectionTitle}>Phone Number</Text>
                    </View>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter phone number"
                        placeholderTextColor="#aaa"
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        keyboardType="phone-pad"
                    />
                </View>

                {/* Payment Method */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialIcons name="payment" size={20} color="#ff6b35" />
                        <Text style={styles.sectionTitle}>Payment Method</Text>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.paymentOption,
                            paymentMethod === 'cash' && styles.paymentOptionActive,
                        ]}
                        onPress={() => setPaymentMethod('cash')}
                    >
                        <MaterialIcons
                            name={paymentMethod === 'cash' ? 'radio-button-checked' : 'radio-button-unchecked'}
                            size={20}
                            color={paymentMethod === 'cash' ? '#ff6b35' : '#ccc'}
                        />
                        <Text style={styles.paymentOptionText}>Cash on Delivery</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.paymentOption,
                            paymentMethod === 'card' && styles.paymentOptionActive,
                        ]}
                        onPress={() => setPaymentMethod('card')}
                    >
                        <MaterialIcons
                            name={paymentMethod === 'card' ? 'radio-button-checked' : 'radio-button-unchecked'}
                            size={20}
                            color={paymentMethod === 'card' ? '#ff6b35' : '#ccc'}
                        />
                        <Text style={styles.paymentOptionText}>Card Payment</Text>
                    </TouchableOpacity>
                </View>

                {/* Promo Code */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialIcons name="local-offer" size={20} color="#ff6b35" />
                        <Text style={styles.sectionTitle}>Promo Code (Optional)</Text>
                    </View>

                    <View style={styles.promoContainer}>
                        <TextInput
                            style={styles.promoInput}
                            placeholder="Enter promo code"
                            placeholderTextColor="#aaa"
                            value={promoCode}
                            onChangeText={setPromoCode}
                        />
                        <TouchableOpacity
                            style={styles.promoButton}
                            onPress={handleApplyPromo}
                        >
                            <Text style={styles.promoButtonText}>Apply</Text>
                        </TouchableOpacity>
                    </View>

                    {promoDiscount > 0 && (
                        <Text style={styles.promoSuccess}>
                            Discount applied: ${promoDiscount.toFixed(2)}
                        </Text>
                    )}
                </View>

                {/* Order Summary */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialIcons name="receipt" size={20} color="#ff6b35" />
                        <Text style={styles.sectionTitle}>Order Summary</Text>
                    </View>

                    <View style={styles.summary}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Subtotal:</Text>
                            <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Delivery Fee:</Text>
                            <Text style={styles.summaryValue}>${deliveryFee.toFixed(2)}</Text>
                        </View>
                        {promoDiscount > 0 && (
                            <View style={styles.summaryRow}>
                                <Text style={[styles.summaryLabel, { color: '#4caf50' }]}>
                                    Discount:
                                </Text>
                                <Text style={[styles.summaryValue, { color: '#4caf50' }]}>
                                    -${promoDiscount.toFixed(2)}
                                </Text>
                            </View>
                        )}
                        <View style={[styles.summaryRow, styles.totalRow]}>
                            <Text style={styles.totalLabel}>Total:</Text>
                            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
                        </View>
                    </View>
                </View>

                {/* Items List */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Items ({cart?.items?.length})</Text>
                    {cart?.items?.map((item) => (
                        <View key={item.id} style={styles.itemRow}>
                            <Text style={styles.itemName} numberOfLines={2}>
                                {item.quantity}x {item.name}
                            </Text>
                            <Text style={styles.itemPrice}>
                                ${(item.price * item.quantity).toFixed(2)}
                            </Text>
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* Place Order Button */}
            <View style={styles.bottomContainer}>
                <TouchableOpacity
                    style={[styles.placeOrderButton, loading && { opacity: 0.7 }]}
                    onPress={handlePlaceOrder}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <>
                            <MaterialIcons name="check-circle" size={20} color="#fff" />
                            <Text style={styles.placeOrderText}>Place Order</Text>
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
        paddingBottom: 100,
    },
    section: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    restaurantName: {
        fontSize: 14,
        color: '#666',
        paddingHorizontal: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: '#1a1a1a',
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginBottom: 8,
        gap: 12,
    },
    paymentOptionActive: {
        backgroundColor: '#fff3e0',
    },
    paymentOptionText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1a1a1a',
    },
    promoContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    promoInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
    },
    promoButton: {
        backgroundColor: '#ff6b35',
        borderRadius: 8,
        paddingHorizontal: 16,
        justifyContent: 'center',
    },
    promoButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    promoSuccess: {
        color: '#4caf50',
        fontWeight: '600',
        marginTop: 8,
        fontSize: 13,
    },
    summary: {
        gap: 8,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
    },
    summaryLabel: {
        fontSize: 13,
        color: '#666',
    },
    summaryValue: {
        fontSize: 13,
        fontWeight: '500',
        color: '#1a1a1a',
    },
    totalRow: {
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    totalLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    totalValue: {
        fontSize: 17,
        fontWeight: '700',
        color: '#ff6b35',
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    itemName: {
        fontSize: 13,
        color: '#666',
        flex: 1,
    },
    itemPrice: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1a1a1a',
        marginLeft: 8,
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    placeOrderButton: {
        backgroundColor: '#ff6b35',
        borderRadius: 8,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    placeOrderText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
    },
    backButton: {
        backgroundColor: '#ff6b35',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    backButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
});

export default CheckoutScreen;
