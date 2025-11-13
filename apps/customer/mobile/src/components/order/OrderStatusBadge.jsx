/**
 * Order Status Badge Component - Mobile Version
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { spacing, typography, colors } from '../../styles';

// Local helper
const getStatusStyle = (status) => {
    const statusMap = {
        pending: { background: '#fff3cd', color: '#ff9800' },
        confirmed: { background: '#d1ecf1', color: '#2196f3' },
        preparing: { background: '#e1bee7', color: '#9c27b0' },
        ready: { background: '#b2ebf2', color: '#00bcd4' },
        shipping: { background: '#c8e6c9', color: '#4caf50' },
        delivered: { background: '#dcedc1', color: '#8bc34a' },
        cancelled: { background: '#ffcdd2', color: '#f44336' },
        failed: { background: '#ff8a80', color: '#ff5252' },
    };
    return statusMap[status] || { background: '#f5f5f5', color: '#666666' };
};

const getStatusLabel = (status) => {
    const labelMap = {
        pending: 'Pending',
        confirmed: 'Confirmed',
        preparing: 'Preparing',
        ready: 'Ready',
        shipping: 'Shipping',
        delivered: 'Delivered',
        cancelled: 'Cancelled',
        failed: 'Failed',
    };
    return labelMap[status] || 'Unknown';
};

export const OrderStatusBadge = ({ status, showLabel = true }) => {
    const style = getStatusStyle(status);
    const label = getStatusLabel(status);

    if (!showLabel) return null;

    return (
        <View style={[styles.badge, { backgroundColor: style.background }]}>
            <Text style={[styles.text, { color: style.color }]}>
                {label}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    text: {
        ...typography.caption,
        fontWeight: '600',
    },
});

export default OrderStatusBadge;
