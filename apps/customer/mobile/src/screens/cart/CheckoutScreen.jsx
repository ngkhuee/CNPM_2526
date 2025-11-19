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
    Modal,
    FlatList,
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
import { useOrderAutoCancel } from '../../hooks/useOrderAutoCancel';

// Services
import { showToast } from '../../utils/toastHelper';

const CheckoutScreen = () => {
    const cartContext = useContext(CartContext);
    const { cart, clearCurrentRestaurantCart, loadLastActiveCart, fetchCart } = cartContext;
    const { navigate } = useContext(NavigationContext);
    const { user } = useContext(AuthContext);

    // Refresh cart from AsyncStorage when component mounts
    // IMPORTANT: Only fetch if cart is empty/null
    // If cart is already populated (from RestaurantDetail sync), use it directly
    useEffect(() => {
        if (!cart || !cart.items || cart.items.length === 0) {
            if (fetchCart) {
                fetchCart();
                console.log('[CheckoutScreen] Fetched cart from AsyncStorage on mount');
            }
        } else {
            console.log('[CheckoutScreen] Cart already populated, skipping fetch');
            console.log('[CheckoutScreen] Current cart:', {
                restaurant_id: cart.restaurant_id,
                items: cart.items.length,
            });
        }
    }, [fetchCart]);

    // Hooks
    const { addresses, handleGetGPS: requestGPSLocation } = useAddress(user?.id);
    const { location, address: gpsAddress, loading: gpsLoading, requestLocation } = useGeolocation();
    const { promotions, getApplicablePromotions, validatePromotion, calculateDiscount } = usePromotions();
    const { deliveryFee } = useSettings();
    const { processCheckoutOrder, loading: processingOrder } = useCheckoutProcessing();
    const { startAutoCancel } = useOrderAutoCancel();

    // Form State
    const [checkoutData, setCheckoutData] = useState({
        customerName: user?.name || '',
        phone: user?.phone || '',
        email: user?.email || '',
        address: '',
        addressId: null,
        paymentMethod: 'card',
        gps: null,
        specialInstructions: '',
    });

    const [selectedAddress, setSelectedAddress] = useState(null);
    const [manualAddress, setManualAddress] = useState('');
    const [promoCode, setPromoCode] = useState('');
    const [appliedPromo, setAppliedPromo] = useState(null);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [showPromosModal, setShowPromosModal] = useState(false);
    const [applicablePromos, setApplicablePromos] = useState([]);

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

    // Load applicable promotions for current restaurant
    useEffect(() => {
        if (cart?.restaurant_id) {
            const promos = getApplicablePromotions(cart.restaurant_id);
            console.log('[CheckoutScreen] Applicable promotions:', {
                restaurantId: cart.restaurant_id,
                allPromotions: promotions.length,
                applicablePromos: promos.length,
                promosList: promos.map(p => ({ code: p.code, type: p.type, status: p.status, scope: p.scope, restaurant_id: p.restaurant_id }))
            });
            setApplicablePromos(promos);
        }
    }, [cart?.restaurant_id, promotions]);

    // Calculate totals
    const subtotal = cart?.items?.reduce(
        (sum, item) => sum + (item.price * item.quantity),
        0
    ) || 0;

    const fee = deliveryFee || 25000;
    const discount = appliedPromo ? calculateDiscount(appliedPromo, subtotal) : 0;
    const total = subtotal + fee - discount;

    // Debug log
    console.log('[CheckoutScreen] Totals:', {
        appliedPromo: appliedPromo ? { code: appliedPromo.code, type: appliedPromo.type, value: appliedPromo.value } : null,
        subtotal,
        discount,
        fee,
        total,
    });

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

        if (!checkoutData.paymentMethod || !['card', 'momo'].includes(checkoutData.paymentMethod)) {
            newErrors.paymentMethod = 'Please select a payment method';
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

        const validation = validatePromotion(promoCode, subtotal, cart.restaurant_id);
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
     * Handle apply promo from list
     */
    const handleApplyPromoFromList = (promo) => {
        console.log('[CheckoutScreen] Applying promo from list:', promo);
        setAppliedPromo(promo);
        setPromoCode(promo.code);
        setShowPromosModal(false);
        showToast('success', `Promo applied: ${promo.code}`);
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

            // Start 30-minute auto-cancel timer for pending orders
            console.log('[CheckoutScreen] Starting 30-minute auto-cancel timer for order:', order.id);
            startAutoCancel(order.id, 30 * 60 * 1000); // 30 minutes

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

            // Add a small delay to ensure cart state is updated before navigating
            await new Promise(resolve => setTimeout(resolve, 500));

            // Navigate to payment screen
            console.log('[CheckoutScreen] About to navigate to payment with orderId:', order.id);
            navigate('payment', { orderId: order.id });
            console.log('[CheckoutScreen] Navigation call completed');
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
                            {/* Show Promotions Button */}
                            {applicablePromos.length > 0 && (
                                <TouchableOpacity
                                    style={styles.showPromosButton}
                                    onPress={() => {
                                        console.log('[CheckoutScreen] Opening promos modal with:', applicablePromos);
                                        setShowPromosModal(true);
                                    }}
                                >
                                    <MaterialIcons name="local-offer" size={18} color="#ff6b35" />
                                    <Text style={styles.showPromosText}>
                                        View Available Promotions ({applicablePromos.length})
                                    </Text>
                                    <MaterialIcons name="arrow-drop-down" size={20} color="#ff6b35" />
                                </TouchableOpacity>
                            )}

                            {/* Promo Code Input */}
                            <View style={styles.promoInputGroup}>
                                <MaterialIcons name="card-giftcard" size={18} color="#ff6b35" />
                                <TextInput
                                    style={styles.promoInput}
                                    placeholder="Or enter promo code"
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

                    {['card', 'momo'].map(method => (
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

            {/* Promotions Modal */}
            <Modal
                visible={showPromosModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowPromosModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {/* Modal Header */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Available Promotions ({applicablePromos.length})</Text>
                            <TouchableOpacity onPress={() => setShowPromosModal(false)}>
                                <MaterialIcons name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        {/* Promotions List */}
                        <FlatList
                            data={applicablePromos}
                            keyExtractor={(item) => item.id?.toString() || item.code}
                            showsVerticalScrollIndicator={true}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.promoItem}
                                    onPress={() => handleApplyPromoFromList(item)}
                                >
                                    <View style={styles.promoItemContent}>
                                        <Text style={styles.promoItemCode}>{item.code}</Text>
                                        <Text style={styles.promoItemName}>{item.name}</Text>
                                        <Text style={styles.promoItemDesc}>{item.description}</Text>
                                        <View style={styles.promoItemFooter}>
                                            <Text style={styles.promoItemValue}>
                                                {item.type === 'percentage'
                                                    ? `${item.value}% off`
                                                    : `₫${item.value.toLocaleString('vi-VN')} off`}
                                            </Text>
                                            {item.minOrderValue > 0 && (
                                                <Text style={styles.promoItemMinOrder}>
                                                    Min: ₫{item.minOrderValue.toLocaleString('vi-VN')}
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                    <MaterialIcons name="chevron-right" size={24} color="#ff6b35" />
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={
                                <View style={styles.emptyPromos}>
                                    <MaterialIcons name="local-offer" size={48} color="#ddd" />
                                    <Text style={styles.emptyPromosText}>No promotions available</Text>
                                </View>
                            }
                        />
                    </View>
                </View>
            </Modal>
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
        // borderLeftWidth: 4,
        // borderLeftColor: '#4caf50',
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
    // Promotion modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        maxHeight: '80%',
        paddingTop: 0,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    promoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    promoItemContent: {
        flex: 1,
    },
    promoItemCode: {
        fontSize: 14,
        fontWeight: '700',
        color: '#ff6b35',
        marginBottom: 4,
    },
    promoItemName: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 2,
    },
    promoItemDesc: {
        fontSize: 12,
        color: '#666',
        marginBottom: 6,
    },
    promoItemFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    promoItemValue: {
        fontSize: 12,
        fontWeight: '700',
        color: '#4caf50',
    },
    promoItemMinOrder: {
        fontSize: 11,
        color: '#999',
    },
    emptyPromos: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        gap: 12,
    },
    emptyPromosText: {
        fontSize: 14,
        color: '#999',
    },
    showPromosButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: '#ff6b35',
        borderRadius: 8,
        marginBottom: 12,
        gap: 8,
    },
    showPromosText: {
        flex: 1,
        fontSize: 13,
        fontWeight: '600',
        color: '#ff6b35',
        textAlign: 'center',
    },
});

export default CheckoutScreen;
