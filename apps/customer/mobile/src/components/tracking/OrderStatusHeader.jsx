// components/tracking/OrderStatusHeader.jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const OrderStatusHeader = ({ order, isDelivered }) => {
    return (
        <View style={styles.statusHeader}>
            <Text style={styles.statusHeaderText}>
                {isDelivered ? 'Delivered' : 'In Progress'}
            </Text>
            <Text style={styles.estimatedTime}>
                {order.estimated_delivery_time
                    ? `Arrives by ${new Date(order.estimated_delivery_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
                    : 'Calculating...'}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    statusHeader: {
        backgroundColor: '#fff3e0',
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginBottom: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#ff6b35',
    },
    statusHeaderText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#ff6b35',
    },
    estimatedTime: {
        fontSize: 13,
        color: '#666',
        marginTop: 4,
    },
});
