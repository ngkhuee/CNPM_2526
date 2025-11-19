/**
 * MoMoPaymentScreen.jsx
 * MoMo payment processing with QR code demo and payment simulation
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
    Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NavigationContext } from '../../contexts/NavigationContext';
import * as orderService from '../../services/orderService';
import { showToast } from '../../utils/toastHelper';
import { useOrderAutoCancel } from '../../hooks/useOrderAutoCancel';

// Demo QR Code (base64 PNG - simple demo QR)
const DEMO_QR = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAIAAAD/gqEfAAAA2klEQVR4nO3YMQrCQBRG4TRYO3srb2VvZW8hWNjaWNhYWAm2NpZiI1hYWKhgY2OjmMKFhRZeEJaZN3wz8zszb4oQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQkgqlUpVKhWr1Uqv15PL5aRSKWUyGY1GA8MwDMMwDAMAwzAIBALZbJZSqZRSKpVKaRgGQRAEi8Ui7Xa71+tRs9lUpVJRo9FQIpFQq9XScZxsNkupVIpSqZRSqZRSqZRSqZRSqZRSqZRS/AvxeFwqlQKBQDKZVKlUUiKRoGazSc1mk06nQxAEwWAwoHQ6TS6XU61WU61Wo+FwSI1GQ5VKhX6/T41GQxAEQRAEQRAEQRAEQRAEQRAE+S/+AFu3VKwRLx9/AAAAAElFTkSuQmCC';

const MoMoPaymentScreen = ({ orderId }) => {
    const { navigate } = useContext(NavigationContext);
    const { stopAutoCancel } = useOrderAutoCancel();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState('pending');

    console.log('[MoMoPaymentScreen] Rendered with orderId:', orderId);

    useEffect(() => {
        console.log('[MoMoPaymentScreen] useEffect called, orderId:', orderId);
        fetchOrder();
    }, [orderId]);

    const fetchOrder = async () => {
        try {
            console.log('[MoMoPaymentScreen] Fetching order with id:', orderId);
            setLoading(true);
            const data = await orderService.getOrderDetail(orderId);
            setOrder(data);
        } catch (error) {
            console.error('[MoMoPaymentScreen] Error fetching order:', error);
            Alert.alert('Error', 'Failed to load order');
            navigate('orders');
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSuccess = async () => {
        try {
            setProcessing(true);

            // Stop auto-cancel timer since payment is completed
            stopAutoCancel(order.id);

            setPaymentStatus('completed');
            showToast('success', 'Payment successful!');

            // Update order status to 'paid' (payment completed, waiting for restaurant confirmation)
            await orderService.updateOrder(order.id, {
                payment_status: 'completed',
                status: 'paid',
            });

            setTimeout(() => {
                navigate('tracking', { orderId: order.id });
            }, 1500);
        } catch (error) {
            console.error('[MoMoPaymentScreen] Payment error:', error);
            showToast('error', 'Failed to process payment');
            setProcessing(false);
        }
    }; const handlePaymentFailed = async () => {
        try {
            setProcessing(true);
            Alert.alert(
                'Payment Failed',
                'Your payment has failed. Would you like to try again?',
                [
                    {
                        text: 'Cancel Order',
                        onPress: async () => {
                            await orderService.updateOrder(order.id, { status: 'cancelled' });
                            showToast('info', 'Order cancelled');
                            navigate('orders');
                        },
                        style: 'destructive',
                    },
                    {
                        text: 'Try Again',
                        onPress: () => {
                            setProcessing(false);
                            setPaymentStatus('pending');
                        },
                        style: 'default',
                    },
                ]
            );
        } catch (error) {
            console.error('[MoMoPaymentScreen] Error:', error);
            showToast('error', 'Failed to handle payment failure');
        }
    };

    const handleBack = () => {
        navigate('orders');
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color="#a4073e" style={{ marginTop: 50 }} />
            </SafeAreaView>
        );
    }

    if (!order) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <MaterialIcons name="error-outline" size={48} color="#e53935" />
                    <Text style={styles.errorText}>Order not found</Text>
                    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
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
                    <TouchableOpacity onPress={handleBack}>
                        <MaterialIcons name="arrow-back" size={24} color="#1a1a1a" />
                    </TouchableOpacity>
                )}
                <Text style={styles.headerTitle}>MoMo Payment</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {paymentStatus === 'pending' ? (
                    <>
                        {/* Order Summary */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Order Summary</Text>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Order ID:</Text>
                                <Text style={styles.infoValue}>{order.id}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Subtotal:</Text>
                                <Text style={styles.infoValue}>
                                    ₫{(order.subtotal || 0).toLocaleString('vi-VN')}
                                </Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Delivery:</Text>
                                <Text style={styles.infoValue}>
                                    ₫{(order.deliveryFee || 0).toLocaleString('vi-VN')}
                                </Text>
                            </View>
                            {order.discountAmount > 0 && (
                                <View style={[styles.infoRow, styles.discountRow]}>
                                    <Text style={[styles.infoLabel, styles.discountLabel]}>
                                        Discount:
                                    </Text>
                                    <Text style={[styles.infoValue, styles.discountValue]}>
                                        -₫{(order.discountAmount || 0).toLocaleString('vi-VN')}
                                    </Text>
                                </View>
                            )}
                            <View style={styles.divider} />
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Total Amount:</Text>
                                <Text style={styles.totalValue}>
                                    ₫{(order.totalPrice || 0).toLocaleString('vi-VN')}
                                </Text>
                            </View>
                        </View>

                        {/* QR Code Demo */}
                        <View style={styles.qrSection}>
                            <Text style={styles.sectionTitle}>Scan QR Code to Pay</Text>
                            <Text style={styles.qrNote}>
                                This is a demo QR code. In production, scan this with your MoMo app.
                            </Text>
                            <View style={styles.qrContainer}>
                                <Image
                                    source={{ uri: DEMO_QR }}
                                    style={styles.qrCode}
                                    resizeMode="contain"
                                />
                            </View>
                            <Text style={styles.qrHint}>
                                Amount: ₫{(order.totalPrice || 0).toLocaleString('vi-VN')}
                            </Text>
                        </View>

                        {/* Demo Buttons */}
                        <View style={styles.buttonSection}>
                            <Text style={styles.sectionTitle}>Demo Payment Action</Text>
                            <TouchableOpacity
                                style={[styles.demoButton, styles.successButton]}
                                onPress={handlePaymentSuccess}
                                disabled={processing}
                            >
                                {processing ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <MaterialIcons name="check-circle" size={20} color="#fff" />
                                        <Text style={styles.buttonText}>Confirm Payment Success</Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.demoButton, styles.failButton]}
                                onPress={handlePaymentFailed}
                                disabled={processing}
                            >
                                {processing ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <MaterialIcons name="error" size={20} color="#fff" />
                                        <Text style={styles.buttonText}>Simulate Payment Failed</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Info Notice */}
                        <View style={styles.noticeSection}>
                            <MaterialIcons name="info" size={20} color="#1976d2" />
                            <Text style={styles.noticeText}>
                                These are demo buttons for testing. In production, actual MoMo payment integration would occur here.
                            </Text>
                        </View>
                    </>
                ) : (
                    <>
                        {/* Success Screen */}
                        <View style={styles.successSection}>
                            <MaterialIcons name="check-circle" size={64} color="#a4073e" />
                            <Text style={styles.successTitle}>Payment Successful!</Text>
                            <Text style={styles.successText}>
                                ₫{(order.totalPrice || 0).toLocaleString('vi-VN')} transferred to restaurant
                            </Text>
                            <Text style={styles.successSubtext}>
                                Your order has been confirmed. The restaurant will start preparing your food shortly.
                            </Text>
                            <TouchableOpacity
                                style={styles.successButton}
                                onPress={() => navigate('tracking', { orderId: order.id })}
                            >
                                <Text style={styles.successButtonText}>Track Order</Text>
                            </TouchableOpacity>
                        </View>
                    </>
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
    discountRow: {
        backgroundColor: '#f0f8f5',
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 4,
        marginVertical: 4,
    },
    discountLabel: {
        color: '#4caf50',
        fontWeight: '600',
    },
    discountValue: {
        color: '#4caf50',
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 8,
    },
    totalValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#a4073e',
    },
    qrSection: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginBottom: 8,
        alignItems: 'center',
    },
    qrNote: {
        fontSize: 12,
        color: '#666',
        marginBottom: 16,
        textAlign: 'center',
    },
    qrContainer: {
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        width: 200,
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
    },
    qrCode: {
        width: '100%',
        height: '100%',
    },
    qrHint: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    buttonSection: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginBottom: 8,
    },
    demoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 10,
        gap: 8,
    },
    successButton: {
        backgroundColor: '#4caf50',
    },
    failButton: {
        backgroundColor: '#e53935',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    noticeSection: {
        backgroundColor: '#e3f2fd',
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
        color: '#a4073e',
        marginTop: 16,
        marginBottom: 12,
    },
    successText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    successSubtext: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
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
        backgroundColor: '#a4073e',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    backButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
});

export default MoMoPaymentScreen;
