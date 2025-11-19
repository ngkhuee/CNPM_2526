// components/tracking/OrderDetails.jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export const OrderDetails = ({ order }) => {
    return (
        <>
            {/* Order Info */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Order Details</Text>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Order ID</Text>
                    <Text style={styles.detailValue}>#{order.id?.substring(0, 12)}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Restaurant</Text>
                    <Text style={styles.detailValue}>{order.restaurant_name}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Total Items</Text>
                    <Text style={styles.detailValue}>{order.items?.length || 0}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Total Amount</Text>
                    <Text style={styles.detailValue}>
                        ₫{order.total_amount?.toLocaleString('vi-VN')}
                    </Text>
                </View>
            </View>

            {/* Delivery Address */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Delivery Address</Text>
                <View style={styles.addressBox}>
                    <MaterialIcons name="location-on" size={20} color="#ff6b35" />
                    <Text style={styles.addressText}>{order.customer?.address}</Text>
                </View>
            </View>

            {/* GPS Coordinates */}
            {order.dropoff_gps && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Delivery Location</Text>
                    <View style={styles.gpsBox}>
                        <Text style={styles.gpsLabel}>Coordinates</Text>
                        <Text style={styles.gpsValue}>
                            {order.dropoff_gps.latitude.toFixed(4)}, {order.dropoff_gps.longitude.toFixed(4)}
                        </Text>
                    </View>
                </View>
            )}

            {/* Current Driver Location */}
            {order.current_gps && order.status === 'delivering' && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Driver Location</Text>
                    <View style={styles.gpsBox}>
                        <Text style={styles.gpsLabel}>Current Position</Text>
                        <Text style={styles.gpsValue}>
                            {order.current_gps.latitude.toFixed(4)}, {order.current_gps.longitude.toFixed(4)}
                        </Text>
                    </View>
                </View>
            )}
        </>
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
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    detailLabel: {
        fontSize: 13,
        color: '#666',
    },
    detailValue: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    addressBox: {
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
    },
    addressText: {
        fontSize: 13,
        color: '#1a1a1a',
        flex: 1,
    },
    gpsBox: {
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    gpsLabel: {
        fontSize: 12,
        color: '#999',
        fontWeight: '500',
    },
    gpsValue: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1a1a1a',
        marginTop: 4,
        fontFamily: 'monospace',
    },
});
