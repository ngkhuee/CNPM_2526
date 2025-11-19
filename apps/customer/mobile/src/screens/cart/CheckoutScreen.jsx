/**
 * CheckoutScreen.jsx - ENHANCED Checkout Screen
 * Fully integrated with all components and hooks
 * Handles customer info, address (saved + GPS), promotions, payment method
 */

import React, { useContext, useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
    Alert,
    TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// Contexts
import { CartContext } from '../../contexts/CartContext';
import { NavigationContext } from '../../contexts/NavigationContext';
import { AuthContext } from '../../contexts/AuthContext';

// Components
import {
    CheckoutCustomerForm,
    CheckoutAddressSection,
    CheckoutOrderSummary,
} from '../../components/checkout';

// Hooks
import { useAddress } from '../../hooks/useAddress';
import { useGeolocation } from '../../hooks/useGeolocation';
import { usePromotions } from '../../hooks/usePromotions';
import { useSettings } from '../../hooks/useSettings';
import { useCheckoutProcessing } from '../../hooks/useCheckoutProcessing';

// Services
import { showToast } from '../../utils/toastHelper';

const CheckoutScreen = () => {
    const cartContext = useContext(CartContext);
    const { cart, clearCurrentRestaurantCart, loadLastActiveCart, fetchCart } = cartContext;
    const { navigate } = useContext(NavigationContext);
    const { user } = useContext(AuthContext);

    // Refresh cart from AsyncStorage when component mounts
    useEffect(() => {
        if (fetchCart) {
            fetchCart();
            console.log('[CheckoutScreen] Fetched cart on mount');
        }
    }, [fetchCart]);

    // Hooks
    const { addresses, handleGetGPS: requestGPSLocation } = useAddress(user?.id);
    const { location, address: gpsAddress, loading: gpsLoading, requestLocation } = useGeolocation();
    const { promotions, validatePromotion, calculateDiscount } = usePromotions();
    const { deliveryFee } = useSettings();
    const { processCheckoutOrder, loading: processingOrder } = useCheckoutProcessing();

    // Form State
    const [checkoutData, setCheckoutData] = useState({
        customerName: user?.name || '',
        phone: user?.phone || '',
        email: user?.email || '',
        address: '',
        addressId: null,
        paymentMethod: 'cash',
        gps: null,
        specialInstructions: '',
    });

    const [selectedAddress, setSelectedAddress] = useState(null);
    const [manualAddress, setManualAddress] = useState('');
    const [promoCode, setPromoCode] = useState('');
    const [appliedPromo, setAppliedPromo] = useState(null);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    // GPS Location effect
    useEffect(() => {
        if (gpsAddress) {
            setManualAddress(gpsAddress);
            setCheckoutData(prev => ({
                ...prev,
                address: gpsAddress,
                gps: location,
            }));
        }
    }, [gpsAddress, location]);

    // Calculate totals
    const subtotal = cart?.items?.reduce(
        (sum, item) => sum + (item.price * item.quantity),
        0
    ) || 0;

    const fee = deliveryFee || 25000;
    const discount = appliedPromo ? calculateDiscount(appliedPromo, subtotal) : 0;
    const total = subtotal + fee - discount;

    /**
     * Validate form fields
     */
    const validateForm = () => {
        const newErrors = {};

        if (!checkoutData.customerName?.trim()) {
            newErrors.customerName = 'Full name is required';
        }

        if (!checkoutData.phone?.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^[0-9]{10,}$/.test(checkoutData.phone.replace(/\D/g, ''))) {
            newErrors.phone = 'Invalid phone number';
        }

        if (!checkoutData.email?.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(checkoutData.email)) {
            newErrors.email = 'Invalid email address';
        }

        const finalAddress = selectedAddress?.address_line || manualAddress || checkoutData.address;
        if (!finalAddress?.trim()) {
            newErrors.address = 'Delivery address is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Handle form field changes
     */
    const handleFormChange = (data) => {
        setCheckoutData(data);
        if (touched[Object.keys(data)[0]]) {
            validateForm();
        }
    };

    /**
     * Handle field blur for validation
     */
    const handleFieldBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        validateForm();
    };

    /**
     * Handle address selection
     */
    const handleAddressSelect = (address) => {
        setSelectedAddress(address);
        setCheckoutData(prev => ({
            ...prev,
            address: address.address_line || address.address,
            addressId: address.id,
            gps: address.latitude && address.longitude
                ? { latitude: address.latitude, longitude: address.longitude }
                : null,
        }));
    };

    /**
     * Handle GPS request
     */
    const handleRequestGPS = async () => {
        try {
            await requestLocation();
        } catch (error) {
            Alert.alert('Location Error', error.message || 'Failed to get location');
        }
    };

    /**
     * Handle applying promo code
     */
    const handleApplyPromo = () => {
        if (!promoCode.trim()) {
            showToast('error', 'Enter a promo code');
            return;
        }

        const validation = validatePromotion(promoCode, subtotal);
        if (validation.valid) {
            setAppliedPromo(validation.promotion);
            showToast('success', `Promo applied: ${validation.promotion.code}`);
            setPromoCode('');
        } else {
            showToast('error', validation.message);
        }
    };

    /**
     * Handle removing promo
     */
    const handleRemovePromo = () => {
        setAppliedPromo(null);
        setPromoCode('');
        showToast('success', 'Promo removed');
    };

    /**
     * Handle place order
     */
    const handlePlaceOrder = async () => {
        // Validate form
        if (!validateForm()) {
            showToast('error', 'Please fill in all required fields correctly');
            return;
        }

        if (!cart?.items || cart.items.length === 0) {
            showToast('error', 'Cart is empty');
            return;
        }

        try {
            // Prepare final checkout data
            const finalCheckoutData = {
                ...checkoutData,
                address: selectedAddress?.address_line || manualAddress || checkoutData.address,
                addressId: selectedAddress?.id,
                gps: selectedAddress?.latitude && selectedAddress?.longitude
                    ? { latitude: selectedAddress.latitude, longitude: selectedAddress.longitude }
                    : location,
            };

            console.log('[CheckoutScreen] Placing order with data:', finalCheckoutData);

            // Process order - pass restaurant_id from cart
            const order = await processCheckoutOrder(
                finalCheckoutData,
                cart.items,
                fee,
                appliedPromo,
                cart.restaurant_id  // Pass restaurant_id from cart
            );

            console.log('[CheckoutScreen] Order created:', order);

            // Clear current restaurant cart (CHỈ xóa giỏ hiện tại)
            // Nếu có giỏ từ restaurant khác, auto-switch sang
            await clearCurrentRestaurantCart();

            // Auto-load last active cart (nếu có)
            const lastActiveCart = await loadLastActiveCart();
            if (lastActiveCart.cartData && lastActiveCart.cartData.items && lastActiveCart.cartData.items.length > 0) {
                console.log('[CheckoutScreen] Auto-loaded last active cart:', lastActiveCart.restaurantId);
            } else {
                console.log('[CheckoutScreen] No other carts, cart is now empty');
            }

            showToast('success', 'Order placed successfully!');

            // Navigate to payment or orders based on payment method
            if (checkoutData.paymentMethod === 'cash') {
                // Cash on delivery - go directly to tracking
                navigate('tracking', { orderId: order.id });
            } else {
                // Go to payment screen
                navigate('payment', { orderId: order.id });
            }
        } catch (error) {
            console.error('[CheckoutScreen] Order placement error:', error);
            showToast('error', error.message || 'Failed to place order');
        }
    };

    // Empty cart check
    if (!cart?.items || cart.items.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.emptyContainer}>
                    <MaterialIcons name="shopping-cart" size={48} color="#ccc" />
                    <Text style={styles.emptyText}>Cart is empty</Text>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigate('home')}
                    >
                        <Text style={styles.backButtonText}>Continue Shopping</Text>
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

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
            >
                {/* Customer Information */}
                <CheckoutCustomerForm
                    data={checkoutData}
                    errors={errors}
                    onChange={handleFormChange}
                    onBlur={handleFieldBlur}
                />

                {/* Delivery Address */}
                <CheckoutAddressSection
                    selectedAddress={selectedAddress}
                    onAddressSelect={handleAddressSelect}
                    gpsLoading={gpsLoading}
                    onRequestGPS={handleRequestGPS}
                    manualAddress={manualAddress}
                    onManualAddressChange={setManualAddress}
                    addressError={touched.address ? errors.address : null}
                    savedAddresses={addresses}
                />

                {/* Promotion Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialIcons name="local-offer" size={20} color="#ff6b35" />
                        <Text style={styles.sectionTitle}>Promotion Code</Text>
                    </View>

                    {appliedPromo ? (
                        <View style={styles.promoAppliedContainer}>
                            <View style={styles.promoAppliedContent}>
                                <MaterialIcons name="check-circle" size={20} color="#4caf50" />
                                <View style={styles.promoAppliedInfo}>
                                    <Text style={styles.promoAppliedCode}>
                                        {appliedPromo.code}
                                    </Text>
                                    <Text style={styles.promoAppliedDesc}>
                                        {appliedPromo.description}
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                style={styles.removePromoButton}
                                onPress={handleRemovePromo}
                            >
                                <MaterialIcons name="close" size={18} color="#ff6b35" />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.promoInputContainer}>
                            <View style={styles.promoInputGroup}>
                                <MaterialIcons name="card-giftcard" size={18} color="#ff6b35" />
                                <TextInput
                                    style={styles.promoInput}
                                    placeholder="Enter promo code"
                                    placeholderTextColor="#aaa"
                                    value={promoCode}
                                    onChangeText={setPromoCode}
                                    autoCapitalize="characters"
                                />
                            </View>
                            <TouchableOpacity
                                style={styles.promoApplyButton}
                                onPress={handleApplyPromo}
                            >
                                <Text style={styles.promoApplyText}>Apply</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Payment Method */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialIcons name="payment" size={20} color="#ff6b35" />
                        <Text style={styles.sectionTitle}>Payment Method</Text>
                    </View>

                    {['cash', 'card', 'momo'].map(method => (
                        <TouchableOpacity
                            key={method}
                            style={[
                                styles.paymentOption,
                                checkoutData.paymentMethod === method && styles.paymentOptionActive,
                            ]}
                            onPress={() => setCheckoutData(prev => ({ ...prev, paymentMethod: method }))}
                        >
                            <MaterialIcons
                                name={checkoutData.paymentMethod === method ? 'radio-button-checked' : 'radio-button-unchecked'}
                                size={20}
                                color={checkoutData.paymentMethod === method ? '#ff6b35' : '#ccc'}
                            />
                            <Text style={styles.paymentOptionText}>
                                {method === 'cash' && 'Cash on Delivery'}
                                {method === 'card' && 'Card Payment'}
                                {method === 'momo' && 'MoMo Wallet'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Order Summary */}
                <CheckoutOrderSummary
                    restaurantName={cart?.restaurant_name}
                    items={cart?.items || []}
                    subtotal={subtotal}
                    deliveryFee={fee}
                    discountAmount={discount}
                    promoCode={appliedPromo?.code}
                    total={total}
                />
            </ScrollView>

            {/* Place Order Button */}
            <View style={styles.bottomContainer}>
                <TouchableOpacity
                    style={[
                        styles.placeOrderButton,
                        (processingOrder || gpsLoading) && { opacity: 0.7 }
                    ]}
                    onPress={handlePlaceOrder}
                    disabled={processingOrder || gpsLoading}
                >
                    {processingOrder ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <>
                            <MaterialIcons name="check-circle" size={20} color="#fff" />
                            <Text style={styles.placeOrderText}>
                                Place Order • ₫{total.toLocaleString('vi-VN')}
                            </Text>
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
        paddingTop: 35,
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
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    promoAppliedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f0f8f5',
        borderRadius: 8,
        padding: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#4caf50',
    },
    promoAppliedContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 10,
    },
    promoAppliedInfo: {
        flex: 1,
    },
    promoAppliedCode: {
        fontSize: 13,
        fontWeight: '700',
        color: '#4caf50',
    },
    promoAppliedDesc: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    removePromoButton: {
        padding: 8,
    },
    promoInputContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    promoInputGroup: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        gap: 8,
    },
    promoInput: {
        flex: 1,
        paddingVertical: 10,
        fontSize: 14,
        color: '#1a1a1a',
    },
    promoApplyButton: {
        backgroundColor: '#ff6b35',
        borderRadius: 8,
        paddingHorizontal: 16,
        justifyContent: 'center',
    },
    promoApplyText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
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
