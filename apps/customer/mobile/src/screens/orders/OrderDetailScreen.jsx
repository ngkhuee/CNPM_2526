/**
 * OrderDetailScreen.jsx
 * Display complete order details with items, pricing, tracking, and review
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

const ORDER_STATUS_LABELS = {
    pending: { label: 'Chờ xác nhận', color: '#ff9800' },
    paid: { label: 'Đã thanh toán', color: '#2196f3' },
    confirmed: { label: 'Đã xác nhận', color: '#2196f3' },
    preparing: { label: 'Đang chuẩn bị', color: '#ff9800' },
    ready: { label: 'Sẵn sàng lấy', color: '#ff9800' },
    delivering: { label: 'Đang giao', color: '#1976d2' },
    delivered: { label: 'Đã giao', color: '#4caf50' },
    cancelled: { label: 'Đã hủy', color: '#e53935' },
};

const PaymentStatusLabels = {
    pending: { label: 'Chờ thanh toán', color: '#ff9800' },
    processing: { label: 'Đang xử lý', color: '#ff9800' },
    completed: { label: 'Hoàn tất', color: '#4caf50' },
    failed: { label: 'Thất bại', color: '#e53935' },
};

const OrderDetailScreen = ({ orderId }) => {
    const { navigate } = useContext(NavigationContext);
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchOrderDetail();
    }, [orderId]);

    const fetchOrderDetail = async () => {
        try {
            setLoading(true);
            const data = await orderService.getOrderDetail(orderId);
            setOrder(data);
            setError(null);
        } catch (err) {
            console.error('[OrderDetailScreen] Error:', err);
            setError('Không thể tải chi tiết đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = () => {
        Alert.alert(
            'Hủy đơn hàng',
            'Bạn có chắc chắn muốn hủy đơn hàng này không?',
            [
                { text: 'Không', style: 'cancel' },
                {
                    text: 'Có, xác nhận hủy!',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await orderService.cancelOrder(order.id);
                            showToast('success', 'Đã hủy đơn hàng');
                            fetchOrderDetail();
                        } catch (err) {
                            showToast('error', 'Không thể hủy đơn hàng');
                        }
                    },
                },
            ]
        );
    };

    const handleTrackOrder = () => {
        navigate('tracking', { orderId: order.id });
    };

    const handleReview = () => {
        navigate('review', { orderId: order.id });
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color="#ff6b35" style={{ marginTop: 50 }} />
            </SafeAreaView>
        );
    }

    if (error || !order) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <MaterialIcons name="error-outline" size={48} color="#e53935" />
                    <Text style={styles.errorText}>{error || 'Không tìm thấy đơn hàng'}</Text>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigate('orders')}
                    >
                        <Text style={styles.backButtonText}>Quay lại</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const statusInfo = ORDER_STATUS_LABELS[order.status] || ORDER_STATUS_LABELS.pending;
    const paymentStatusInfo = PaymentStatusLabels[order.payment_status] || PaymentStatusLabels.pending;
    const canCancelOrder = ['pending', 'confirmed', 'preparing'].includes(order.status);
    const canTrackOrder = ['confirmed', 'preparing', 'ready', 'delivering'].includes(order.status);
    const canReview = order.status === 'delivered';

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigate('orders')}>
                    <MaterialIcons name="arrow-back" size={24} color="#1a1a1a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Order Header */}
                <View style={styles.section}>
                    <View style={styles.orderHeaderRow}>
                        <View>
                            <Text style={styles.orderId}>Đơn #{order.id?.substring(0, 8)}</Text>
                            <Text style={styles.orderDate}>
                                {new Date(order.created_at).toLocaleString('vi-VN')}
                            </Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
                            <Text style={styles.statusText}>{statusInfo.label}</Text>
                        </View>
                    </View>
                </View>

                {/* Payment Status */}
                <View style={styles.section}>
                    <View style={styles.statusRow}>
                        <Text style={styles.statusLabel}>Thanh toán:</Text>
                        <View style={[styles.paymentStatusBadge, { borderColor: paymentStatusInfo.color }]}>
                            <Text style={[styles.paymentStatusText, { color: paymentStatusInfo.color }]}>
                                {paymentStatusInfo.label}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Customer Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Thông tin khách hàng</Text>
                    <View style={styles.infoItem}>
                        <MaterialIcons name="person" size={20} color="#666" />
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Họ tên</Text>
                            <Text style={styles.infoText}>{order.customer?.name}</Text>
                        </View>
                    </View>
                    <View style={styles.infoItem}>
                        <MaterialIcons name="phone" size={20} color="#666" />
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>SĐT</Text>
                            <Text style={styles.infoText}>{order.customer?.phone}</Text>
                        </View>
                    </View>
                    <View style={styles.infoItem}>
                        <MaterialIcons name="email" size={20} color="#666" />
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Email</Text>
                            <Text style={styles.infoText}>{order.customer?.email}</Text>
                        </View>
                    </View>
                    <View style={styles.infoItem}>
                        <MaterialIcons name="location-on" size={20} color="#666" />
                        <View style={styles.infoContent}>
                            <Text style={styles.infoLabel}>Địa chỉ giao hàng</Text>
                            <Text style={styles.infoText}>{order.customer?.address}</Text>
                        </View>
                    </View>
                </View>

                {/* Items */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Sản phẩm ({order.items?.length})</Text>
                    {order.items?.map((item, idx) => (
                        <View key={idx} style={styles.itemRow}>
                            <View style={styles.itemInfo}>
                                <Text style={styles.itemQty}>{item.quantity}x</Text>
                                <View style={styles.itemDetails}>
                                    <Text style={styles.itemName}>{item.name}</Text>
                                    <Text style={styles.itemPrice}>
                                        ₫{item.price?.toLocaleString('vi-VN')}
                                    </Text>
                                </View>
                            </View>
                            <Text style={styles.itemTotal}>
                                ₫{(item.quantity * item.price)?.toLocaleString('vi-VN')}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Price Breakdown */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Chi tiết giá</Text>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Tạm tính</Text>
                        <Text style={styles.summaryValue}>
                            ₫{order.subtotal?.toLocaleString('vi-VN')}
                        </Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Phí giao hàng</Text>
                        <Text style={styles.summaryValue}>
                            ₫{order.deliveryFee?.toLocaleString('vi-VN')}
                        </Text>
                    </View>
                    {order.discountAmount > 0 && (
                        <View style={[styles.summaryRow, styles.discountRow]}>
                            <Text style={styles.discountLabel}>
                                Giảm giá {order.promo_code && `(${order.promo_code})`}
                            </Text>
                            <Text style={styles.discountValue}>
                                -₫{order.discountAmount?.toLocaleString('vi-VN')}
                            </Text>
                        </View>
                    )}
                    <View style={[styles.summaryRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Tổng cộng</Text>
                        <Text style={styles.totalValue}>
                            ₫{order.totalPrice?.toLocaleString('vi-VN')}
                        </Text>
                    </View>
                </View>

                {/* Actions */}
                <View style={styles.actionsSection}>
                    {canTrackOrder && (
                        <TouchableOpacity
                            style={[styles.actionButton, styles.trackButton]}
                            onPress={handleTrackOrder}
                        >
                            <MaterialIcons name="map" size={20} color="#1976d2" />
                            <Text style={styles.trackButtonText}>Theo dõi đơn</Text>
                        </TouchableOpacity>
                    )}

                    {canCancelOrder && (
                        <TouchableOpacity
                            style={[styles.actionButton, styles.cancelButton]}
                            onPress={handleCancelOrder}
                        >
                            <MaterialIcons name="close" size={20} color="#e53935" />
                            <Text style={styles.cancelButtonText}>Hủy đơn hàng</Text>
                        </TouchableOpacity>
                    )}

                    {canReview && (
                        <TouchableOpacity
                            style={[styles.actionButton, styles.reviewButton]}
                            onPress={handleReview}
                        >
                            <MaterialIcons name="rate-review" size={20} color="#ff6b35" />
                            <Text style={styles.reviewButtonText}>Viết đánh giá</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 40,
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
        paddingVertical: 12,
    },
    section: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 8,
    },
    orderHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    orderId: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    orderDate: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 12,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    paymentStatusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1.5,
    },
    paymentStatusText: {
        fontWeight: '600',
        fontSize: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 12,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: '#999',
        fontWeight: '500',
    },
    infoText: {
        fontSize: 14,
        color: '#1a1a1a',
        marginTop: 2,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    itemInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    itemQty: {
        fontSize: 14,
        fontWeight: '700',
        color: '#ff6b35',
        minWidth: 25,
    },
    itemDetails: {
        flex: 1,
    },
    itemName: {
        fontSize: 13,
        fontWeight: '500',
        color: '#1a1a1a',
    },
    itemPrice: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
    itemTotal: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
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
    discountRow: {
        backgroundColor: '#f0f8f5',
        paddingHorizontal: 8,
        borderRadius: 4,
    },
    discountLabel: {
        fontSize: 13,
        color: '#4caf50',
        fontWeight: '500',
    },
    discountValue: {
        fontSize: 13,
        fontWeight: '600',
        color: '#4caf50',
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 10,
    },
    totalLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    totalValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ff6b35',
    },
    actionsSection: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        gap: 10,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        gap: 8,
    },
    trackButton: {
        backgroundColor: '#e3f2fd',
    },
    trackButtonText: {
        color: '#1976d2',
        fontWeight: '600',
        fontSize: 14,
    },
    cancelButton: {
        backgroundColor: '#ffebee',
    },
    cancelButtonText: {
        color: '#e53935',
        fontWeight: '600',
        fontSize: 14,
    },
    reviewButton: {
        backgroundColor: '#fff3e0',
        marginBottom: 40,
    },
    reviewButtonText: {
        color: '#ff6b35',
        fontWeight: '600',
        fontSize: 14,
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

export default OrderDetailScreen;
