// components/tracking/OrderStatusHeader.jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DroneIcon from './DroneIcon';

export const OrderStatusHeader = ({ order, isDelivered }) => {
    const isDelivering = order?.status === 'delivering';

    return (
        <View style={styles.statusHeader}>
            <View style={styles.statusContent}>
                <View style={styles.statusLeft}>
                    <Text style={styles.statusHeaderText}>
                        {isDelivered ? 'Delivered' : 'In Progress'}
                    </Text>
                    <Text style={styles.estimatedTime}>
                        {order.estimated_delivery_time
                            ? `Arrives by ${new Date(order.estimated_delivery_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
                            : 'Calculating...'}
                    </Text>
                </View>
                <View style={styles.statusIcon}>
                    {isDelivering ? (
                        <DroneIcon size={36} color="#ff6b35" />
                    ) : (
                        <MaterialIcons
                            name={isDelivered ? 'check-circle' : 'schedule'}
                            size={36}
                            color={isDelivered ? '#4caf50' : '#ff6b35'}
                        />
                    )}
                </View>
            </View>
            {isDelivering && order?.drone_id && (
                <View style={styles.droneInfo}>
                    <MaterialIcons name="info" size={14} color="#666" />
                    <Text style={styles.droneInfoText}>
                        Vehicle: {order.drone_id}
                    </Text>
                </View>
            )}
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
        gap: 10,
    },
    statusContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    statusLeft: {
        flex: 1,
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
    statusIcon: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 50,
        height: 50,
    },
    droneInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 8,
        backgroundColor: '#f0f0f0',
        borderRadius: 6,
    },
    droneInfoText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
});
