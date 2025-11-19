/**
 * CashPaymentScreen.jsx
 * Cash on Delivery payment confirmation screen
 * Shows order details and mock cash payment info
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
import { NavigationContext } from '../../contexts/NavigationContext';
import * as orderService from '../../services/orderService';
import { showToast } from '../../utils/toastHelper';
import { formatCurrency } from '../../shared/formatters';

const CashPaymentScreen = ({ orderId }) => {
    const { navigate } = useContext(NavigationContext);
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    // Mock cash payment fields
    const [receivedAmount, setReceivedAmount] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        fetchOrder();
    }, [orderId]);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const data = await orderService.getOrderDetail(orderId);
            setOrder(data);
            console.log('[CashPaymentScreen] Order loaded:', data);
        } catch (error) {
            console.error('[CashPaymentScreen] Error fetching order:', error);
            Alert.alert('Error', 'Failed to load order details');
            navigate('orders');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmCashPayment = async () => {
        // Validate input
        if (!receivedAmount) {
            showToast('error', 'Please enter received amount');
            return;
        }

        const received = parseInt(receivedAmount, 10);
        const totalAmount = order?.totalPrice || 0;

        if (received < totalAmount) {
            showToast('error', 'Received amount must be >= Total amount');
            return;
        }

        try {
            setProcessing(true);

            // Calculate change
            const change = received - totalAmount;

            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 1500));

            showToast('success', `Payment confirmed! Change: ₫${change.toLocaleString('vi-VN')}`);

            // Delay navigation to show success message
            setTimeout(() => {
                navigate('tracking', { orderId: order?.id });
            }, 1000);
        } catch (error) {
            console.error('[CashPaymentScreen] Error confirming payment:', error);
            showToast('error', 'Failed to confirm payment');
        } finally {
            setProcessing(false);
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
                    <Text style={styles.errorText}>Order not found</Text>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigate('orders')}
                    >
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const totalAmount = order?.totalPrice || 0;
    const received = receivedAmount ? parseInt(receivedAmount, 10) : 0;
    const change = Math.max(0, received - totalAmount);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigate('payment', { orderId: order.id })}>
                    <MaterialIcons name="arrow-back" size={24} color="#1a1a1a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Cash Payment</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Order Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Order Information</Text>

                    {/* Order Items */}
                    <View style={styles.itemsSection}>
                        <Text style={styles.itemsTitle}>Items</Text>
                        {order?.items?.map((item, index) => (
                            <View key={index} style={styles.itemRow}>
                                <View style={styles.itemInfo}>
                                    <Text style={styles.itemName}>{item.name}</Text>
                                    <Text style={styles.itemQty}>x{item.quantity}</Text>
                                </View>
                                <Text style={styles.itemPrice}>
                                    ₫{(item.price * item.quantity).toLocaleString('vi-VN')}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* Total Breakdown */}
                    <View style={styles.breakdownSection}>
                        <View style={styles.breakdownRow}>
                            <Text style={styles.breakdownLabel}>Subtotal:</Text>
                            <Text style={styles.breakdownValue}>
                                ₫{(order?.subtotal || 0).toLocaleString('vi-VN')}
                            </Text>
                        </View>
                        <View style={styles.breakdownRow}>
                            <Text style={styles.breakdownLabel}>Delivery Fee:</Text>
                            <Text style={styles.breakdownValue}>
                                ₫{(order?.deliveryFee || 0).toLocaleString('vi-VN')}
                            </Text>
                        </View>
                        {order?.discountAmount > 0 && (
                            <View style={styles.breakdownRow}>
                                <Text style={styles.breakdownLabel}>Discount:</Text>
                                <Text style={[styles.breakdownValue, styles.discountValue]}>
                                    -₫{(order.discountAmount).toLocaleString('vi-VN')}
                                </Text>
                            </View>
                        )}
                        <View style={styles.totalBreakdownRow}>
                            <Text style={styles.totalLabel}>Total Amount:</Text>
                            <Text style={styles.totalValue}>
                                ₫{totalAmount.toLocaleString('vi-VN')}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Cash Payment Input */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Payment Details</Text>

                    {/* Mock Default Amount Button */}
                    <View style={styles.mockSection}>
                        <Text style={styles.mockLabel}>Quick Fill:</Text>
                        <TouchableOpacity
                            style={styles.mockButton}
                            onPress={() => setReceivedAmount(String(totalAmount + 50000))}
                        >
                            <Text style={styles.mockButtonText}>
                                +50,000 (₫{(totalAmount + 50000).toLocaleString('vi-VN')})
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Received Amount Input */}
                    <View style={styles.inputSection}>
                        <Text style={styles.inputLabel}>Amount Received</Text>
                        <View style={styles.inputContainer}>
                            <Text style={styles.currencyPrefix}>₫</Text>
                            <TextInput
                                style={styles.amountInput}
                                placeholder="Enter amount"
                                keyboardType="number-pad"
                                value={receivedAmount}
                                onChangeText={setReceivedAmount}
                                editable={!processing}
                            />
                        </View>
                        <Text style={styles.inputHint}>Must be ≥ ₫{totalAmount.toLocaleString('vi-VN')}</Text>
                    </View>

                    {/* Change Calculation */}
                    {receivedAmount && (
                        <View style={styles.changeSection}>
                            <View style={styles.changeRow}>
                                <Text style={styles.changeLabel}>Received:</Text>
                                <Text style={styles.changeValue}>
                                    ₫{received.toLocaleString('vi-VN')}
                                </Text>
                            </View>
                            <View style={styles.changeRow}>
                                <Text style={styles.changeLabel}>Total:</Text>
                                <Text style={styles.changeValue}>
                                    ₫{totalAmount.toLocaleString('vi-VN')}
                                </Text>
                            </View>
                            <View style={[styles.changeRow, styles.changeDivider]}>
                                <Text style={styles.changeLabel}>Change:</Text>
                                <Text style={[styles.changeValue, styles.changeFinal]}>
                                    ₫{change.toLocaleString('vi-VN')}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Notes */}
                    <View style={styles.notesSection}>
                        <Text style={styles.inputLabel}>Special Instructions (Optional)</Text>
                        <TextInput
                            style={styles.notesInput}
                            placeholder="e.g., Leave at door, ring doorbell"
                            multiline={true}
                            numberOfLines={3}
                            value={notes}
                            onChangeText={setNotes}
                            editable={!processing}
                        />
                    </View>
                </View>

                {/* Info Notice */}
                <View style={styles.noticeSection}>
                    <MaterialIcons name="info" size={20} color="#1976d2" />
                    <Text style={styles.noticeText}>
                        Payment will be processed when driver delivers your order. Please have the exact amount ready.
                    </Text>
                </View>
            </ScrollView>

            {/* Confirm Button */}
            <View style={styles.bottomSection}>
                <TouchableOpacity
                    style={[
                        styles.confirmButton,
                        (!receivedAmount || parseInt(receivedAmount, 10) < totalAmount || processing)
                            ? styles.confirmButtonDisabled
                            : {}
                    ]}
                    onPress={handleConfirmCashPayment}
                    disabled={!receivedAmount || parseInt(receivedAmount, 10) < totalAmount || processing}
                >
                    {processing ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <>
                            <MaterialIcons name="check" size={20} color="#fff" />
                            <Text style={styles.confirmButtonText}>Confirm Cash Payment</Text>
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
        paddingVertical: 16,
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
    itemsSection: {
        marginBottom: 16,
    },
    itemsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1a1a1a',
    },
    itemQty: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: '#ff6b35',
    },
    breakdownSection: {
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        padding: 12,
        marginTop: 12,
    },
    breakdownRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
    },
    breakdownLabel: {
        fontSize: 13,
        color: '#666',
    },
    breakdownValue: {
        fontSize: 13,
        fontWeight: '500',
        color: '#1a1a1a',
    },
    discountValue: {
        color: '#4caf50',
    },
    totalBreakdownRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        marginTop: 6,
    },
    totalLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#ff6b35',
    },
    mockSection: {
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    mockLabel: {
        fontSize: 13,
        color: '#666',
        marginBottom: 8,
        fontWeight: '500',
    },
    mockButton: {
        backgroundColor: '#e8f5e9',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#4caf50',
    },
    mockButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2e7d32',
        textAlign: 'center',
    },
    inputSection: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
    },
    currencyPrefix: {
        fontSize: 18,
        fontWeight: '600',
        color: '#ff6b35',
        marginRight: 4,
    },
    amountInput: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 12,
        color: '#1a1a1a',
    },
    inputHint: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
    },
    changeSection: {
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    changeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
    },
    changeDivider: {
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        marginTop: 8,
        paddingTopVertical: 10,
    },
    changeLabel: {
        fontSize: 13,
        color: '#666',
    },
    changeValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    changeFinal: {
        fontSize: 16,
        color: '#4caf50',
    },
    notesSection: {
        marginBottom: 16,
    },
    notesInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: '#1a1a1a',
        textAlignVertical: 'top',
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
    bottomSection: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    confirmButton: {
        backgroundColor: '#ff6b35',
        borderRadius: 8,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    confirmButtonDisabled: {
        opacity: 0.6,
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    errorText: {
        fontSize: 16,
        color: '#e53935',
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

export default CashPaymentScreen;
