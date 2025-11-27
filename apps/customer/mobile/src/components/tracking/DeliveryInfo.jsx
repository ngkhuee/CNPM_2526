// components/tracking/DeliveryInfo.jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// Payment status labels
const PAYMENT_STATUS_LABELS = {
    pending: { label: 'Chờ thanh toán', color: '#ff9800', icon: 'schedule' },
    processing: { label: 'Đang xử lý', color: '#ff9800', icon: 'hourglass-empty' },
    paid: { label: 'Đã thanh toán', color: '#4caf50', icon: 'check-circle' },
    completed: { label: 'Hoàn tất', color: '#4caf50', icon: 'check-circle' },
    failed: { label: 'Thất bại', color: '#e53935', icon: 'error' },
};

export const DeliveryInfo = ({ order }) => {
    // Infer payment status from order status - if order progressed past pending, payment was successful
    const orderStatus = order?.status;
    const rawPaymentStatus = order?.payment_status || order?.paymentStatus;
    const isPaidOrder = ['paid', 'confirmed', 'preparing', 'ready', 'delivering', 'arrived', 'delivered'].includes(orderStatus);
    const paymentStatus = isPaidOrder ? 'paid' : (rawPaymentStatus || 'pending');

    const paymentInfo = PAYMENT_STATUS_LABELS[paymentStatus] || PAYMENT_STATUS_LABELS.pending;
    const paymentMethod = order?.payment_method || order?.paymentMethod || 'momo';

    // Get restaurant address from multiple possible sources
    const restaurantAddress = order?.restaurant_address || order?.restaurantAddress ||
        order?.restaurant?.address || order?.pickup_address || '';

    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin giao hàng</Text>

            {/* Payment Status Row */}
            <View style={styles.paymentRow}>
                <View style={styles.paymentItem}>
                    <Text style={styles.paymentLabel}>Thanh toán:</Text>
                    <View style={[styles.paymentBadge, { backgroundColor: paymentInfo.color + '20', borderColor: paymentInfo.color }]}>
                        <MaterialIcons name={paymentInfo.icon} size={14} color={paymentInfo.color} />
                        <Text style={[styles.paymentBadgeText, { color: paymentInfo.color }]}>
                            {paymentInfo.label}
                        </Text>
                    </View>
                </View>
                <View style={styles.paymentItem}>
                    <Text style={styles.paymentLabel}>Phương thức:</Text>
                    <Text style={styles.paymentMethod}>
                        {paymentMethod === 'momo' ? 'MoMo' : paymentMethod === 'card' ? 'Thẻ' : paymentMethod}
                    </Text>
                </View>
            </View>

            <View style={styles.infoGrid}>
                {/* From: Restaurant */}
                <View style={styles.infoBox}>
                    <View style={styles.infoBoxHeader}>
                        <MaterialIcons name="restaurant" size={18} color="#ff6b35" />
                        <Text style={styles.infoBoxTitle}>Từ</Text>
                    </View>
                    <Text style={styles.infoBoxValue} numberOfLines={2}>
                        {order.restaurant_name || 'Nhà hàng'}
                    </Text>
                    <Text style={styles.infoBoxAddress} numberOfLines={2}>
                        {restaurantAddress || 'Không có địa chỉ'}
                    </Text>
                </View>

                {/* To: Customer */}
                <View style={styles.infoBox}>
                    <View style={styles.infoBoxHeader}>
                        <MaterialIcons name="home" size={18} color="#1976d2" />
                        <Text style={styles.infoBoxTitle}>Đến</Text>
                    </View>
                    <Text style={styles.infoBoxValue} numberOfLines={2}>
                        {order.customer?.name || 'Khách hàng'}
                    </Text>
                    <Text style={styles.infoBoxAddress} numberOfLines={2}>
                        {order.customer?.address || 'Không có địa chỉ'}
                    </Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
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
    paymentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    paymentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    paymentLabel: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    paymentBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
    },
    paymentBadgeText: {
        fontSize: 11,
        fontWeight: '600',
    },
    paymentMethod: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    infoGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    infoBox: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderLeftWidth: 3,
        borderLeftColor: '#ddd',
    },
    infoBoxHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    infoBoxTitle: {
        fontSize: 10,
        fontWeight: '600',
        color: '#666',
        marginLeft: 6,
    },
    infoBoxValue: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    infoBoxAddress: {
        fontSize: 11,
        color: '#888',
        lineHeight: 14,
    },
});
