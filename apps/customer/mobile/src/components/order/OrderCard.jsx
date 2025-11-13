/**
 * Order Card Component - Mobile version
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius, typography, shadows } from '../../styles';
import { formatCurrency } from 'shared-utils';

// Local helper - status management
const getStatusBadgeStyle = (status) => {
    const statusMap = {
        pending: { color: '#ff9800', label: 'Pending' },
        confirmed: { color: '#2196f3', label: 'Confirmed' },
        preparing: { color: '#9c27b0', label: 'Preparing' },
        ready: { color: '#00bcd4', label: 'Ready' },
        shipping: { color: '#4caf50', label: 'Shipping' },
        delivered: { color: '#8bc34a', label: 'Delivered' },
        cancelled: { color: '#f44336', label: 'Cancelled' },
        failed: { color: '#ff5252', label: 'Failed' },
    };
    return statusMap[status] || { color: '#666666', label: 'Unknown' };
};

const canCancelOrder = (order) => {
    const cancelableStatus = ['pending', 'confirmed', 'preparing'];
    return cancelableStatus.includes(order.status);
};

export const OrderCard = ({ order, onTrack, onCancel }) => {
    const statusStyle = getStatusBadgeStyle(order.status);
    const canCancel = canCancelOrder(order);

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.orderId}>Order #{order.id || order._id}</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusStyle.color }]}>
                    <Text style={styles.statusText}>{statusStyle.label}</Text>
                </View>
            </View>

            {(order.restaurantName || order.restaurant?.name) && (
                <View style={styles.restaurantRow}>
                    <Icon name="storefront" size={14} color={colors.primary} />
                    <Text style={styles.restaurant}>
                        {order.restaurantName || order.restaurant?.name}
                    </Text>
                </View>
            )}

            <View style={styles.dateRow}>
                <Icon name="calendar-outline" size={14} color={colors.text.secondary} />
                <Text style={styles.date}>
                    {new Date(order.createdAt || order.created_at).toLocaleString('vi-VN', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                    })}
                </Text>
            </View>

            {order.items && order.items.length > 0 && (
                <View style={styles.items}>
                    {order.items.slice(0, 2).map((item, idx) => (
                        <Text key={idx} style={styles.itemText} numberOfLines={1}>
                            • {item.name} x{item.quantity}
                        </Text>
                    ))}
                    {order.items.length > 2 && (
                        <Text style={styles.moreItems}>
                            +{order.items.length - 2} more items
                        </Text>
                    )}
                </View>
            )}

            <Text style={styles.total}>
                Total: <Text style={styles.totalValue}>{formatCurrency(order.total_amount || order.totalAmount || 0)}</Text>
            </Text>

            <View style={styles.actions}>
                {order.status !== 'paid' && order.status !== 'pending' && (
                    <TouchableOpacity
                        style={[styles.actionButton, styles.trackButton]}
                        onPress={() => onTrack?.(order.id || order._id)}
                    >
                        <Icon name="location" size={16} color={colors.white} />
                        <Text style={styles.actionButtonText}>Track</Text>
                    </TouchableOpacity>
                )}

                {canCancel && (
                    <TouchableOpacity
                        style={[styles.actionButton, styles.cancelButton]}
                        onPress={() => onCancel?.(order)}
                    >
                        <Icon name="close-circle" size={16} color={colors.white} />
                        <Text style={styles.actionButtonText}>Cancel</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.md,
        ...shadows.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    orderId: {
        ...typography.h4,
        color: colors.text.primary,
    },
    statusBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
    },
    statusText: {
        ...typography.captionBold,
        color: colors.white,
    },
    restaurantRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginBottom: spacing.xs,
    },
    restaurant: {
        ...typography.bodyBold,
        color: colors.primary,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginBottom: spacing.md,
    },
    date: {
        ...typography.caption,
        color: colors.text.secondary,
    },
    items: {
        marginBottom: spacing.md,
    },
    itemText: {
        ...typography.caption,
        color: colors.text.secondary,
        marginBottom: spacing.xs,
    },
    moreItems: {
        ...typography.caption,
        color: colors.text.light,
        fontStyle: 'italic',
    },
    total: {
        ...typography.body,
        color: colors.text.primary,
        marginBottom: spacing.md,
    },
    totalValue: {
        ...typography.h4,
        color: colors.primary,
    },
    actions: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center',
    },
    trackButton: {
        backgroundColor: colors.secondary,
    },
    cancelButton: {
        backgroundColor: colors.danger,
    },
    actionButtonText: {
        ...typography.bodyBold,
        color: colors.white,
    },
});

export default OrderCard;
