/**
 * PaymentScreen.jsx
 * Handle payment processing (Cash, Card, MoMo)
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
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NavigationContext } from '../../contexts/NavigationContext';
import * as orderService from '../../services/orderService';
import { showToast } from '../../utils/toastHelper';

const PaymentScreen = ({ orderId }) => {
    const { navigate } = useContext(NavigationContext);
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState('pending');

    useEffect(() => {
        fetchOrder();
    }, [orderId]);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const data = await orderService.getOrderDetail(orderId);
            setOrder(data);
            setPaymentStatus(data.payment_status || 'pending');
        } catch (error) {
            console.error('[PaymentScreen] Error fetching order:', error);
            Alert.alert('Error', 'Failed to load order');
            navigate('orders');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Handle cash on delivery
     */
    const handleCashPayment = async () => {
        try {
            // Navigate to CashPaymentScreen for detailed cash payment form
            navigate('cashPayment', { orderId: order.id });
        } catch (error) {
            showToast('error', 'Failed to process cash payment');
        }
    };

    /**
     * Handle card payment (simulated)
     */
    const handleCardPayment = async () => {
        try {
            setProcessing(true);
            // Simulate card payment
            Alert.alert(
                'Card Payment',
                'Enter card details to complete payment',
                [
                    {
                        text: 'Cancel',
                        onPress: () => setProcessing(false),
                        style: 'cancel',
                    },
                    {
                        text: 'Confirm',
                        onPress: async () => {
                            setPaymentStatus('completed');
                            showToast('success', 'Payment successful!');
                            setTimeout(() => {
                                navigate('tracking', { orderId: order.id });
                            }, 1500);
                        },
                    },
                ]
            );
        } catch (error) {
            showToast('error', 'Card payment failed');
            setProcessing(false);
        }
    };

    /**
     * Handle MoMo payment (simulated)
     */
    const handleMoMoPayment = async () => {
        try {
            setProcessing(true);
            Alert.alert(
                'MoMo Payment',
                'You will be redirected to MoMo app to complete payment',
                [
                    {
                        text: 'Cancel',
                        onPress: () => setProcessing(false),
                        style: 'cancel',
                    },
                    {
                        text: 'Proceed',
                        onPress: async () => {
                            // Simulate MoMo payment
                            setPaymentStatus('completed');
                            showToast('success', 'Payment received!');
                            setTimeout(() => {
                                navigate('tracking', { orderId: order.id });
                            }, 1500);
                        },
                    },
                ]
            );
        } catch (error) {
            showToast('error', 'MoMo payment failed');
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

    const isCompleted = paymentStatus === 'completed';

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                {!isCompleted && (
                    <TouchableOpacity onPress={() => navigate('orders')}>
                        <MaterialIcons name="arrow-back" size={24} color="#1a1a1a" />
                    </TouchableOpacity>
                )}
                <Text style={styles.headerTitle}>Payment</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Order Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Order Information</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Order ID:</Text>
                        <Text style={styles.infoValue}>{order.id}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Amount:</Text>
                        <Text style={styles.infoValue}>
                            ₫{order.total_amount?.toLocaleString('vi-VN') || 0}
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Status:</Text>
                        <Text style={[
                            styles.infoValue,
                            isCompleted && styles.completedStatus
                        ]}>
                            {isCompleted ? 'Completed' : 'Pending'}
                        </Text>
                    </View>
                </View>

                {/* Payment Methods */}
                {!isCompleted && (
                    <>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Select Payment Method</Text>

                            {/* Cash on Delivery */}
                            {order.payment_method === 'cash' && (
                                <TouchableOpacity
                                    style={styles.paymentMethodButton}
                                    onPress={handleCashPayment}
                                    disabled={processing}
                                >
                                    <MaterialIcons name="payments" size={32} color="#ff6b35" />
                                    <View style={styles.methodInfo}>
                                        <Text style={styles.methodTitle}>Cash on Delivery</Text>
                                        <Text style={styles.methodDesc}>
                                            Pay ₫{order.total_amount?.toLocaleString('vi-VN') || 0} when delivery arrives
                                        </Text>
                                    </View>
                                    {processing && <ActivityIndicator size="small" color="#ff6b35" />}
                                </TouchableOpacity>
                            )}

                            {/* Card Payment */}
                            {order.payment_method === 'card' && (
                                <TouchableOpacity
                                    style={styles.paymentMethodButton}
                                    onPress={handleCardPayment}
                                    disabled={processing}
                                >
                                    <MaterialIcons name="credit-card" size={32} color="#ff6b35" />
                                    <View style={styles.methodInfo}>
                                        <Text style={styles.methodTitle}>Card Payment</Text>
                                        <Text style={styles.methodDesc}>
                                            Debit/Credit Card, Visa, MasterCard
                                        </Text>
                                    </View>
                                    {processing && <ActivityIndicator size="small" color="#ff6b35" />}
                                </TouchableOpacity>
                            )}

                            {/* MoMo Payment */}
                            {order.payment_method === 'momo' && (
                                <TouchableOpacity
                                    style={styles.paymentMethodButton}
                                    onPress={handleMoMoPayment}
                                    disabled={processing}
                                >
                                    <MaterialIcons name="wallet-membership" size={32} color="#ff6b35" />
                                    <View style={styles.methodInfo}>
                                        <Text style={styles.methodTitle}>MoMo Wallet</Text>
                                        <Text style={styles.methodDesc}>
                                            Fast and secure payment
                                        </Text>
                                    </View>
                                    {processing && <ActivityIndicator size="small" color="#ff6b35" />}
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Info Notice */}
                        <View style={styles.noticeSection}>
                            <MaterialIcons name="info" size={20} color="#1976d2" />
                            <Text style={styles.noticeText}>
                                Your payment is secure and encrypted. Your personal information is protected.
                            </Text>
                        </View>
                    </>
                )}

                {/* Payment Completed */}
                {isCompleted && (
                    <View style={styles.successSection}>
                        <MaterialIcons name="check-circle" size={64} color="#4caf50" />
                        <Text style={styles.successTitle}>Payment Successful!</Text>
                        <Text style={styles.successText}>
                            Your order has been confirmed. The restaurant will start preparing your food.
                        </Text>
                        <TouchableOpacity
                            style={styles.successButton}
                            onPress={() => navigate('tracking', { orderId: order.id })}
                        >
                            <Text style={styles.successButtonText}>Track Order</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
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
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    infoLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    completedStatus: {
        color: '#4caf50',
    },
    paymentMethodButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#ff6b35',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        gap: 16,
    },
    methodInfo: {
        flex: 1,
    },
    methodTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    methodDesc: {
        fontSize: 12,
        color: '#666',
    },
    noticeSection: {
        backgroundColor: '#e3f2fd',
        // borderLeftWidth: 4,
        // borderLeftColor: '#1976d2',
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
    successSection: {
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 16,
    },
    successTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#4caf50',
        marginTop: 16,
        marginBottom: 12,
    },
    successText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
    },
    successButton: {
        backgroundColor: '#4caf50',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 32,
    },
    successButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
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

export default PaymentScreen;
