/**
 * CardPaymentScreen.jsx
 * Card/Bank payment processing with demo account information
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
import { useOrderAutoCancel } from '../../hooks/useOrderAutoCancel';

// Demo account information
const DEMO_ACCOUNT = {
    accountName: 'Yummy Foods Demo',
    accountNumber: '1234567890',
    bankName: 'Demo Bank',
    swift: 'DEMOCB',
};

const CardPaymentScreen = ({ orderId }) => {
    const { navigate } = useContext(NavigationContext);
    const { stopAutoCancel } = useOrderAutoCancel();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState('pending');
    const [paymentForm, setPaymentForm] = useState({
        cardNumber: '',
        cardHolder: '',
        expiryDate: '',
        cvv: '',
    });

    console.log('[CardPaymentScreen] Rendered with orderId:', orderId);

    useEffect(() => {
        console.log('[CardPaymentScreen] useEffect called, orderId:', orderId);
        fetchOrder();
    }, [orderId]);

    const fetchOrder = async () => {
        try {
            console.log('[CardPaymentScreen] Fetching order with id:', orderId);
            setLoading(true);
            const data = await orderService.getOrderDetail(orderId);
            setOrder(data);
        } catch (error) {
            console.error('[CardPaymentScreen] Error fetching order:', error);
            Alert.alert('Lỗi', 'Không thể tải đơn hàng');
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

            // Update payment_status to 'paid' and status to 'paid' (waiting for restaurant confirmation)
            await orderService.updateOrder(order.id, {
                payment_status: 'paid',
                status: 'paid',
            });

            // Wait a bit longer to ensure backend has updated
            await new Promise(resolve => setTimeout(resolve, 500));

            setPaymentStatus('completed');
            showToast('success', 'Thanh toán thành công!');

            // Navigate to tracking after short delay
            setTimeout(() => {
                navigate('tracking', { orderId: order.id });
            }, 1000);
        } catch (error) {
            console.error('[CardPaymentScreen] Payment error:', error);
            showToast('error', 'Không thể xử lý thanh toán');
            setProcessing(false);
        }
    };

    const handlePaymentFailed = async () => {
        try {
            setProcessing(true);
            Alert.alert(
                'Thanh toán thất bại',
                'Thanh toán của bạn không thành công. Bạn có muốn thử lại không?',
                [
                    {
                        text: 'Hủy đơn hàng',
                        onPress: async () => {
                            await orderService.updateOrder(order.id, { status: 'cancelled' });
                            showToast('info', 'Đã hủy đơn hàng');
                            navigate('orders');
                        },
                        style: 'destructive',
                    },
                    {
                        text: 'Thử lại',
                        onPress: () => {
                            setProcessing(false);
                            setPaymentStatus('pending');
                        },
                        style: 'default',
                    },
                ]
            );
        } catch (error) {
            console.error('[CardPaymentScreen] Error:', error);
            showToast('error', 'Không thể xử lý thanh toán thất bại');
        }
    };

    const handleBack = () => {
        navigate('orders');
    };

    const formatCardNumber = (value) => {
        // Add spaces every 4 digits
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = (matches && matches[0]) || '';
        const parts = [];

        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }

        if (parts.length) {
            return parts.join(' ');
        } else {
            return value;
        }
    };

    const formatExpiryDate = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 2) {
            return v.slice(0, 2) + '/' + v.slice(2, 4);
        }
        return v;
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color="#1976d2" style={{ marginTop: 50 }} />
            </SafeAreaView>
        );
    }

    if (!order) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <MaterialIcons name="error-outline" size={48} color="#e53935" />
                    <Text style={styles.errorText}>Không tìm thấy đơn hàng</Text>
                    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <Text style={styles.backButtonText}>Quay lại</Text>
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
                <Text style={styles.headerTitle}>Thanh toán thẻ</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {paymentStatus === 'pending' ? (
                    <>
                        {/* Order Summary */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Tóm tắt đơn hàng</Text>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Mã đơn:</Text>
                                <Text style={styles.infoValue}>{order.id}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Tạm tính:</Text>
                                <Text style={styles.infoValue}>
                                    ₫{(order.subtotal || 0).toLocaleString('vi-VN')}
                                </Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Phí giao:</Text>
                                <Text style={styles.infoValue}>
                                    ₫{(order.deliveryFee || 0).toLocaleString('vi-VN')}
                                </Text>
                            </View>
                            {order.discountAmount > 0 && (
                                <View style={[styles.infoRow, styles.discountRow]}>
                                    <Text style={[styles.infoLabel, styles.discountLabel]}>
                                        Giảm giá:
                                    </Text>
                                    <Text style={[styles.infoValue, styles.discountValue]}>
                                        -₫{(order.discountAmount || 0).toLocaleString('vi-VN')}
                                    </Text>
                                </View>
                            )}
                            <View style={styles.divider} />
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Tổng cộng:</Text>
                                <Text style={styles.totalValue}>
                                    ₫{(order.totalPrice || 0).toLocaleString('vi-VN')}
                                </Text>
                            </View>
                        </View>

                        {/* Demo Account Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Thông tin tài khoản thử nghiệm</Text>
                            <View style={styles.accountBox}>
                                <View style={styles.accountRow}>
                                    <Text style={styles.accountLabel}>Tên tài khoản:</Text>
                                    <Text style={styles.accountValue}>{DEMO_ACCOUNT.accountName}</Text>
                                </View>
                                <View style={styles.accountRow}>
                                    <Text style={styles.accountLabel}>Số tài khoản:</Text>
                                    <Text style={styles.accountValue}>
                                        {DEMO_ACCOUNT.accountNumber}
                                    </Text>
                                </View>
                                <View style={styles.accountRow}>
                                    <Text style={styles.accountLabel}>Ngân hàng:</Text>
                                    <Text style={styles.accountValue}>{DEMO_ACCOUNT.bankName}</Text>
                                </View>
                                <View style={styles.accountRow}>
                                    <Text style={styles.accountLabel}>SWIFT:</Text>
                                    <Text style={styles.accountValue}>{DEMO_ACCOUNT.swift}</Text>
                                </View>
                            </View>
                            {/* <View style={styles.noticeBox}>
                                <MaterialIcons name="info" size={16} color="#d9a506" />
                                <Text style={styles.noticeText}>
                                    Đây là tài khoản thử nghiệm chỉ dành cho mục đích kiểm tra.
                                </Text>
                            </View> */}
                        </View>

                        {/* Card Form Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Nhập thông tin thẻ (Tùy chọn)</Text>
                            <Text style={styles.formNote}>
                                Để trống để sử dụng tài khoản thử nghiệm ở trên
                            </Text>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Số thẻ</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="1234 5678 9012 3456"
                                    placeholderTextColor="#ccc"
                                    maxLength={19}
                                    value={paymentForm.cardNumber}
                                    onChangeText={(text) =>
                                        setPaymentForm({
                                            ...paymentForm,
                                            cardNumber: formatCardNumber(text),
                                        })
                                    }
                                    editable={paymentStatus === 'pending'}
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Tên chủ thẻ</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Tên trên thẻ"
                                    placeholderTextColor="#ccc"
                                    value={paymentForm.cardHolder}
                                    onChangeText={(text) =>
                                        setPaymentForm({ ...paymentForm, cardHolder: text })
                                    }
                                    editable={paymentStatus === 'pending'}
                                />
                            </View>

                            <View style={styles.rowInputs}>
                                <View style={[styles.formGroup, { flex: 1 }]}>
                                    <Text style={styles.label}>Ngày hết hạn</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="MM/YY"
                                        placeholderTextColor="#ccc"
                                        maxLength={5}
                                        value={paymentForm.expiryDate}
                                        onChangeText={(text) =>
                                            setPaymentForm({
                                                ...paymentForm,
                                                expiryDate: formatExpiryDate(text),
                                            })
                                        }
                                        editable={paymentStatus === 'pending'}
                                    />
                                </View>
                                <View style={[styles.formGroup, { flex: 1, marginLeft: 12 }]}>
                                    <Text style={styles.label}>CVV</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="123"
                                        placeholderTextColor="#ccc"
                                        maxLength={4}
                                        secureTextEntry
                                        value={paymentForm.cvv}
                                        onChangeText={(text) =>
                                            setPaymentForm({
                                                ...paymentForm,
                                                cvv: text.replace(/[^0-9]/g, ''),
                                            })
                                        }
                                        editable={paymentStatus === 'pending'}
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Demo Buttons */}
                        <View style={styles.buttonSection}>
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
                                        <Text style={styles.buttonText}>Xác nhận thanh toán thành công</Text>
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
                                        <Text style={styles.buttonText}>Giả lập thanh toán thất bại</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Info Notice */}
                        {/* <View style={styles.noticeSection}>
                            <MaterialIcons name="info" size={20} color="#1976d2" />
                            <Text style={styles.noticeText}>
                                Đây là các nút thử nghiệm. Thông tin thẻ sẽ không được xử lý thực tế.
                            </Text>
                        </View> */}
                    </>
                ) : (
                    <>
                        {/* Success Screen */}
                        <View style={styles.successSection}>
                            <MaterialIcons name="check-circle" size={64} color="#1976d2" />
                            <Text style={styles.successTitle}>Thanh toán thành công!</Text>
                            <Text style={styles.successText}>
                                ₫{(order.totalPrice || 0).toLocaleString('vi-VN')} đã được thanh toán
                            </Text>
                            <Text style={styles.successSubtext}>
                                Đơn hàng của bạn đã được xác nhận. Nhà hàng sẽ sớm chuẩn bị món ăn của bạn.
                            </Text>
                            <TouchableOpacity
                                style={styles.successButton}
                                onPress={() => navigate('tracking', { orderId: order.id })}
                            >
                                <Text style={styles.successButtonText}>Theo dõi đơn hàng</Text>
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
        color: '#1976d2',
    },
    accountBox: {
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#d9a506',
    },
    accountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    accountLabel: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    accountValue: {
        fontSize: 12,
        color: '#1a1a1a',
        fontWeight: '600',
    },
    noticeBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff8f0',
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 8,
        gap: 8,
    },
    noticeText: {
        fontSize: 11,
        color: '#d9a506',
        flex: 1,
    },
    formNote: {
        fontSize: 12,
        color: '#999',
        marginBottom: 12,
        fontStyle: 'italic',
    },
    formGroup: {
        marginBottom: 12,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: '#1a1a1a',
        backgroundColor: '#fafafa',
    },
    rowInputs: {
        flexDirection: 'row',
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
        color: '#1976d2',
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
        backgroundColor: '#1976d2',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    backButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
});

export default CardPaymentScreen;
