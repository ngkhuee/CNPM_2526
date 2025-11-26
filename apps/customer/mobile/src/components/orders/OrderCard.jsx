// components/orders/OrderCard.jsx
import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NavigationContext } from '../../contexts/NavigationContext';
import orderService from '../../services/orderService';

export default function OrderCard({
    order,
    onCancel,
    onRetry,
    onViewDetails,
}) {
    const { navigate } = useContext(NavigationContext);
    const [expandedItems, setExpandedItems] = useState(false);
    const statusColor = orderService.getStatusColor(order.status);
    const statusText = orderService.getStatusText(order.status);
    const canCancel = orderService.canCancelOrder(order.status);
    const isCompleted = order.status === 'completed';
    const isPending = order.status === 'pending';
    const isPaid = order.paymentStatus === 'completed' || order.paymentStatus === 'success';

    // Safe date handling - check if createdAt exists
    let dateString = '';
    let timeString = '';

    if (order.createdAt) {
        try {
            const orderDate = new Date(order.createdAt);
            dateString = orderDate.toLocaleDateString('vi-VN');
            timeString = orderDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            console.error('Date parsing error:', e);
            dateString = 'Invalid Date';
            timeString = '';
        }
    }

    // Safe price handling
    const displayPrice = order.totalPrice && typeof order.totalPrice === 'number'
        ? order.totalPrice.toLocaleString('vi-VN')
        : '0';

    // Can track order
    const canTrackOrder = ['paid', 'confirmed', 'preparing', 'ready', 'delivering'].includes(order.status);

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => onViewDetails && onViewDetails(order.id)}
        >
            {/* Header with Restaurant and Status */}
            <View style={styles.cardHeader}>
                <View style={styles.restaurantInfo}>
                    <Text style={styles.restaurantName}>{order.restaurantName}</Text>
                    <Text style={styles.orderId}>Đơn #{order.id}</Text>
                </View>
                <View
                    style={[
                        styles.statusBadge,
                        { backgroundColor: statusColor + '20', borderColor: statusColor },
                    ]}
                >
                    <MaterialIcons name="info" size={16} color={statusColor} />
                    <Text style={[styles.statusText, { color: statusColor }]}>
                        {statusText}
                    </Text>
                </View>
            </View>

            {/* Items Preview */}
            <View style={styles.itemsContainer}>
                <View style={styles.itemsHeader}>
                    <MaterialIcons name="shopping-bag" size={16} color="#666" />
                    <Text style={styles.itemsLabel}>
                        {order.items?.length || 0} sản phẩm
                    </Text>
                </View>
                {order.items?.slice(0, expandedItems ? undefined : 2).map((item, idx) => (
                    <Text key={idx} style={styles.itemName}>
                        • {item.quantity}x {item.name}
                    </Text>
                ))}
                {(order.items?.length || 0) > 2 && !expandedItems && (
                    <TouchableOpacity
                        style={styles.moreItemsButton}
                        onPress={() => setExpandedItems(true)}
                    >
                        <Text style={styles.moreItems}>
                            + {(order.items?.length || 0) - 2} sản phẩm khác
                        </Text>
                        <MaterialIcons name="expand-more" size={16} color="#999" />
                    </TouchableOpacity>
                )}
                {expandedItems && (order.items?.length || 0) > 2 && (
                    <TouchableOpacity
                        style={styles.moreItemsButton}
                        onPress={() => setExpandedItems(false)}
                    >
                        <Text style={styles.moreItems}>
                            Thu gọn
                        </Text>
                        <MaterialIcons name="expand-less" size={16} color="#999" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Delivery Info */}
            <View style={styles.deliveryInfo}>
                <View style={styles.infoRow}>
                    <MaterialIcons name="location-on" size={16} color="#FF6B35" />
                    <Text style={styles.infoText} numberOfLines={1}>
                        {order.deliveryAddress || 'Chưa có địa chỉ'}
                    </Text>
                </View>
                <View style={styles.infoRow}>
                    <MaterialIcons name="schedule" size={16} color="#FF6B35" />
                    <Text style={styles.infoText}>
                        {dateString || 'Ngày không xác định'} {timeString ? `• ${timeString}` : ''}
                    </Text>
                </View>
            </View>

            {/* Footer with Price and Actions */}
            <View style={styles.cardFooter}>
                <View>
                    <Text style={styles.totalLabel}>Tổng cộng</Text>
                    <Text style={styles.totalPrice}>
                        {displayPrice}₫
                    </Text>
                </View>
                <View style={styles.actions}>
                    {canTrackOrder && (
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.trackBtn]}
                            onPress={() => navigate('tracking', { orderId: order.id })}
                        >
                            <MaterialIcons name="location-on" size={16} color="#1976d2" />
                            <Text style={styles.trackBtnText}>Theo dõi</Text>
                        </TouchableOpacity>
                    )}
                    {isPending && !isPaid && (
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.paymentBtn]}
                            onPress={() => navigate('payment', { orderId: order.id })}
                        >
                            <MaterialIcons name="payment" size={16} color="#fff" />
                            <Text style={styles.paymentBtnText}>Thanh toán</Text>
                        </TouchableOpacity>
                    )}
                    {canCancel && (
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.cancelBtn]}
                            onPress={() => onCancel(order.id)}
                        >
                            <MaterialIcons name="close" size={16} color="#f44336" />
                            <Text style={styles.cancelBtnText}>Hủy</Text>
                        </TouchableOpacity>
                    )}
                    {isCompleted && (
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.retryBtn]}
                            onPress={() => onRetry(order.id)}
                        >
                            <MaterialIcons name="refresh" size={16} color="#FF6B35" />
                            <Text style={styles.retryBtnText}>Đặt lại</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        marginBottom: 12,
        marginHorizontal: 12,
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    restaurantInfo: {
        flex: 1,
    },
    restaurantName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    orderId: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
    },
    statusText: {
        marginLeft: 6,
        fontSize: 12,
        fontWeight: '600',
    },
    itemsContainer: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: '#fafafa',
    },
    itemsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    itemsLabel: {
        marginLeft: 6,
        fontSize: 13,
        fontWeight: '600',
        color: '#666',
    },
    itemName: {
        fontSize: 13,
        color: '#555',
        marginBottom: 4,
    },
    moreItemsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 4,
        marginTop: 4,
        borderRadius: 4,
    },
    moreItems: {
        fontSize: 12,
        color: '#FF6B35',
        fontWeight: '600',
        marginRight: 4,
    },
    deliveryInfo: {
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    infoText: {
        marginLeft: 8,
        fontSize: 13,
        color: '#666',
        flex: 1,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#f5f5f5',
    },
    totalLabel: {
        fontSize: 12,
        color: '#999',
        marginBottom: 2,
    },
    totalPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF6B35',
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
        borderWidth: 1,
    },
    cancelBtn: {
        borderColor: '#f44336',
        backgroundColor: '#fff3f3',
    },
    cancelBtnText: {
        marginLeft: 4,
        fontSize: 12,
        fontWeight: '600',
        color: '#f44336',
    },
    paymentBtn: {
        borderColor: '#FF6B35',
        backgroundColor: '#FF6B35',
    },
    paymentBtnText: {
        marginLeft: 4,
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
    },
    retryBtn: {
        borderColor: '#FF6B35',
        backgroundColor: '#FFF5F0',
    },
    retryBtnText: {
        marginLeft: 4,
        fontSize: 12,
        fontWeight: '600',
        color: '#FF6B35',
    },
    trackBtn: {
        borderColor: '#1976d2',
        backgroundColor: '#e3f2fd',
    },
    trackBtnText: {
        marginLeft: 4,
        fontSize: 12,
        fontWeight: '600',
        color: '#1976d2',
    },
});
