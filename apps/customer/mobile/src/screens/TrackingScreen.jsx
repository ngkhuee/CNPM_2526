import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useContext, useEffect, useState } from 'react';
import { OrderContext } from 'customer-shared';

export default function TrackingScreen({ route }) {
    const { orderId } = route.params;
    const { orders } = useContext(OrderContext);
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const currentOrder = orders?.find(o => o.id === orderId);
        if (currentOrder) {
            setOrder(currentOrder);
        }
        setLoading(false);
    }, [orderId, orders]);

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#ff6b35" />
                <Text style={styles.loadingText}>Loading order details...</Text>
            </View>
        );
    }

    if (!order) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <Text style={styles.errorText}>Order not found</Text>
            </View>
        );
    }

    const statuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivering', 'delivered'];
    const currentStatusIndex = statuses.indexOf(order.status);

    return (
        <ScrollView style={styles.container}>
            {/* Order Number */}
            <View style={styles.section}>
                <Text style={styles.orderId}>Order #{order.id}</Text>
                <Text style={styles.status}>{order.status}</Text>
            </View>

            {/* Timeline */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Order Progress</Text>
                <View style={styles.timeline}>
                    {statuses.map((status, index) => (
                        <View key={status} style={styles.timelineItem}>
                            <View style={[
                                styles.circle,
                                index <= currentStatusIndex && styles.completedCircle
                            ]}>
                                <Text style={styles.circleText}>
                                    {index <= currentStatusIndex ? '✓' : '-'}
                                </Text>
                            </View>
                            <View style={[
                                styles.line,
                                index === statuses.length - 1 && styles.lastLine,
                                index < currentStatusIndex && styles.completedLine
                            ]} />
                            <Text style={[
                                styles.timelineLabel,
                                index <= currentStatusIndex && styles.completedLabel
                            ]}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Current Status Info */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Status Details</Text>
                <View style={styles.infoBox}>
                    <Text style={styles.infoLabel}>Current Status</Text>
                    <Text style={styles.infoValue}>{order.status}</Text>
                    <Text style={[styles.infoLabel, { marginTop: 15 }]}>Estimated Time</Text>
                    <Text style={styles.infoValue}>15-20 minutes</Text>
                </View>
            </View>

            {/* Driver/Restaurant Info */}
            {order.status !== 'pending' && order.status !== 'confirmed' && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Delivery Info</Text>
                    <View style={styles.driverCard}>
                        <Text style={styles.driverName}>Drone #123</Text>
                        <Text style={styles.driverPhone}>Live tracking available</Text>
                    </View>
                </View>
            )}

            {/* Map Placeholder */}
            <View style={styles.mapContainer}>
                <View style={styles.mapPlaceholder}>
                    <Text style={styles.mapText}>MAP</Text>
                    <Text style={styles.mapLabel}>Live Tracking Map</Text>
                    <Text style={styles.mapSubtext}>(Tap to open full map)</Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    section: {
        backgroundColor: '#fff',
        marginHorizontal: 15,
        marginVertical: 10,
        paddingHorizontal: 15,
        paddingVertical: 15,
        borderRadius: 12,
    },
    orderId: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
    },
    status: {
        fontSize: 14,
        color: '#ff6b35',
        fontWeight: '600',
        marginTop: 5,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
        marginBottom: 12,
    },
    timeline: {
        marginLeft: 10,
    },
    timelineItem: {
        flexDirection: 'row',
        marginBottom: 20,
        alignItems: 'center',
    },
    circle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    completedCircle: {
        backgroundColor: '#4caf50',
    },
    circleText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    line: {
        position: 'absolute',
        left: 25,
        top: 32,
        width: 2,
        height: 40,
        backgroundColor: '#e0e0e0',
    },
    lastLine: {
        display: 'none',
    },
    completedLine: {
        backgroundColor: '#4caf50',
    },
    timelineLabel: {
        marginLeft: 12,
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    completedLabel: {
        color: '#4caf50',
        fontWeight: '600',
    },
    infoBox: {
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 12,
    },
    infoLabel: {
        fontSize: 12,
        color: '#999',
        textTransform: 'uppercase',
        fontWeight: '600',
    },
    infoValue: {
        fontSize: 16,
        color: '#333',
        fontWeight: '600',
        marginTop: 5,
        textTransform: 'capitalize',
    },
    driverCard: {
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#ff6b35',
    },
    driverName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#333',
    },
    driverPhone: {
        fontSize: 13,
        color: '#666',
        marginTop: 4,
    },
    mapContainer: {
        marginHorizontal: 15,
        marginVertical: 15,
        marginBottom: 40,
        height: 250,
        borderRadius: 12,
        overflow: 'hidden',
    },
    mapPlaceholder: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#e0e0e0',
        borderStyle: 'dashed',
    },
    mapText: {
        fontSize: 60,
        marginBottom: 10,
    },
    mapLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    mapSubtext: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#666',
    },
    errorText: {
        fontSize: 16,
        color: '#dc3545',
        fontWeight: '600',
    },
});
