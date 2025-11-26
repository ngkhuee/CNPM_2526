// components/tracking/OrderStatusHeader.jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DroneIcon from './DroneIcon';

export const OrderStatusHeader = ({ order, isDelivered }) => {
    const isDelivering = order?.status === 'delivering';
    const isCancelled = order?.status === 'cancelled';
    const isRejected = order?.status === 'rejected';

    // Determine status text and color
    let statusText = 'Đang xử lý';
    let statusColor = '#ff6b35';
    let iconName = 'schedule';

    if (isDelivered) {
        statusText = 'Đã giao hàng';
        statusColor = '#4caf50';
        iconName = 'check-circle';
    } else if (isCancelled) {
        statusText = 'Đã hủy';
        statusColor = '#f44336';
        iconName = 'cancel';
    } else if (isRejected) {
        statusText = 'Bị từ chối';
        statusColor = '#d32f2f';
        iconName = 'cancel';
    }

    return (
        <View style={[styles.statusHeader, { borderLeftColor: statusColor, backgroundColor: isCancelled || isRejected ? '#ffebee' : '#fff3e0' }]}>
            <View style={styles.statusContent}>
                <View style={styles.statusLeft}>
                    <Text style={[styles.statusHeaderText, { color: statusColor }]}>
                        {statusText}
                    </Text>
                    {(isCancelled || isRejected) && order.rejection_reason && (
                        <Text style={styles.reasonText}>
                            {order.rejection_reason}
                        </Text>
                    )}
                </View>
                <View style={styles.statusIcon}>
                    {isDelivering ? (
                        <DroneIcon size={36} color={statusColor} />
                    ) : (
                        <MaterialIcons
                            name={iconName}
                            size={36}
                            color={statusColor}
                        />
                    )}
                </View>
            </View>
            {isDelivering && order?.drone_id && (
                <View style={styles.droneInfo}>
                    <MaterialIcons name="info" size={14} color="#666" />
                    <Text style={styles.droneInfoText}>
                        Drone: {order.drone_id}
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
    reasonText: {
        fontSize: 13,
        color: '#666',
        marginTop: 4,
        fontStyle: 'italic',
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
