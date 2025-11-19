// components/orders/OrderCard.jsx
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import orderService from '../../services/orderService';

export default function OrderCard({
    order,
    onCancel,
    onRetry,
    onViewDetails,
}) {
    const statusColor = orderService.getStatusColor(order.status);
    const statusText = orderService.getStatusText(order.status);
    const canCancel = orderService.canCancelOrder(order.status);
    const isCompleted = order.status === 'completed';

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

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => onViewDetails && onViewDetails(order.id)}
        >
            {/* Header with Restaurant and Status */}
            <View style={styles.cardHeader}>
                <View style={styles.restaurantInfo}>
                    <Text style={styles.restaurantName}>{order.restaurantName}</Text>
                    <Text style={styles.orderId}>Order #{order.id}</Text>
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
                        {order.items?.length || 0} item{(order.items?.length || 0) > 1 ? 's' : ''}
                    </Text>
                </View>
                {order.items?.slice(0, 2).map((item, idx) => (
                    <Text key={idx} style={styles.itemName}>
                        • {item.quantity}x {item.name}
                    </Text>
                ))}
                {(order.items?.length || 0) > 2 && (
                    <Text style={styles.moreItems}>
                        + {(order.items?.length || 0) - 2} more item{((order.items?.length || 0) - 2) > 1 ? 's' : ''}
                    </Text>
                )}
            </View>

            {/* Delivery Info */}
            <View style={styles.deliveryInfo}>
                <View style={styles.infoRow}>
                    <MaterialIcons name="location-on" size={16} color="#FF6B35" />
                    <Text style={styles.infoText} numberOfLines={1}>
                        {order.deliveryAddress || 'No address'}
                    </Text>
                </View>
                <View style={styles.infoRow}>
                    <MaterialIcons name="schedule" size={16} color="#FF6B35" />
                    <Text style={styles.infoText}>
                        {dateString || 'Date unavailable'} {timeString ? `• ${timeString}` : ''}
                    </Text>
                </View>
            </View>

            {/* Footer with Price and Actions */}
            <View style={styles.cardFooter}>
                <View>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalPrice}>
                        {displayPrice}₫
                    </Text>
                </View>
                <View style={styles.actions}>
                    {canCancel && (
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.cancelBtn]}
                            onPress={() => onCancel(order.id)}
                        >
                            <MaterialIcons name="close" size={16} color="#f44336" />
                            <Text style={styles.cancelBtnText}>Cancel</Text>
                        </TouchableOpacity>
                    )}
                    {isCompleted && (
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.retryBtn]}
                            onPress={() => onRetry(order.id)}
                        >
                            <MaterialIcons name="refresh" size={16} color="#FF6B35" />
                            <Text style={styles.retryBtnText}>Reorder</Text>
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
    moreItems: {
        fontSize: 12,
        color: '#999',
        fontStyle: 'italic',
        marginTop: 4,
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
});
