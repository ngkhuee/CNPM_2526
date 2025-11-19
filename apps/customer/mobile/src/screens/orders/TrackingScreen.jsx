/**
 * TrackingScreen.jsx - Enhanced Order Tracking
 * Real-time tracking with GPS coordinates, status timeline, driver info
 */

import React, { useContext, useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NavigationContext } from '../../contexts/NavigationContext';
import { orderService } from '../../services/orderService';
import { showToast } from '../../utils/toastHelper';

const ORDER_TIMELINE = [
    { status: 'pending', label: 'Order Placed', icon: 'shopping-cart' },
    { status: 'confirmed', label: 'Confirmed', icon: 'check-circle' },
    { status: 'preparing', label: 'Preparing', icon: 'local-dining' },
    { status: 'ready', label: 'Ready for Pickup', icon: 'done-all' },
    { status: 'delivering', label: 'On the Way', icon: 'local-shipping' },
    { status: 'delivered', label: 'Delivered', icon: 'flag' },
];

const TrackingScreen = ({ orderId }) => {
    const { navigate } = useContext(NavigationContext);
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchOrder();
        // Poll for updates every 5 seconds
        const interval = setInterval(fetchOrder, 5000);
        return () => clearInterval(interval);
    }, [orderId]);

    const fetchOrder = async (showLoading = false) => {
        try {
            if (showLoading) setLoading(true);
            const data = await orderService.getOrderDetail(orderId);
            setOrder(data);
        } catch (error) {
            console.error('[TrackingScreen] Error fetching order:', error);
            if (showLoading) {
                Alert.alert('Error', 'Failed to load order');
                navigate('orders');
            }
        } finally {
            if (showLoading) setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchOrder();
    };

    const handleConfirmDelivery = () => {
        Alert.alert(
            'Confirm Delivery',
            'Please confirm that you have received the order',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: async () => {
                        try {
                            // Update order status to delivered
                            await orderService.updateOrderStatus(orderId, 'delivered');
                            showToast('success', 'Delivery confirmed');
                            fetchOrder();
                        } catch (error) {
                            showToast('error', 'Failed to confirm delivery');
                        }
                    },
                },
            ]
        );
    };

    const handleReview = () => {
        navigate('review', { orderId: order.id });
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color="#ff6b35" style={{ marginTop: 50 }} />
            </SafeAreaView>
        );
    }

    if (!order) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <MaterialIcons name="error-outline" size={48} color="#e53935" />
                    <Text style={styles.errorText}>Order not found</Text>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigate('orders')}
                    >
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const getStatusIndex = () => {
        const statusMap = {
            pending: 0,
            confirmed: 1,
            preparing: 2,
            ready: 3,
            delivering: 4,
            delivered: 5,
        };
        return statusMap[order.status] || 0;
    };

    const currentStatusIndex = getStatusIndex();
    const isDelivered = order.status === 'delivered';

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigate('order-detail', { orderId: order.id })}>
                    <MaterialIcons name="arrow-back" size={24} color="#1a1a1a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Order Tracking</Text>
                <TouchableOpacity onPress={handleRefresh} disabled={refreshing}>
                    {refreshing ? (
                        <ActivityIndicator size="small" color="#ff6b35" />
                    ) : (
                        <MaterialIcons name="refresh" size={24} color="#ff6b35" />
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* Order Status Header */}
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

                {/* Timeline */}
                <View style={styles.timelineContainer}>
                    <Text style={styles.timelineTitle}>Order Progress</Text>
                    <View style={styles.timeline}>
                        {ORDER_TIMELINE.map((step, index) => {
                            const isCompleted = index <= currentStatusIndex;
                            const isCurrent = index === currentStatusIndex;

                            return (
                                <View key={step.status} style={styles.timelineItem}>
                                    {/* Timeline node */}
                                    <View style={styles.nodeContainer}>
                                        <View
                                            style={[
                                                styles.node,
                                                isCompleted && styles.nodeCompleted,
                                                isCurrent && styles.nodeCurrent,
                                            ]}
                                        >
                                            <MaterialIcons
                                                name={step.icon}
                                                size={16}
                                                color={isCompleted ? '#fff' : '#ccc'}
                                            />
                                        </View>
                                        {index < ORDER_TIMELINE.length - 1 && (
                                            <View
                                                style={[
                                                    styles.line,
                                                    isCompleted && styles.lineCompleted,
                                                ]}
                                            />
                                        )}
                                    </View>

                                    {/* Timeline label */}
                                    <View style={styles.labelContainer}>
                                        <Text
                                            style={[
                                                styles.label,
                                                isCompleted && styles.labelCompleted,
                                                isCurrent && styles.labelCurrent,
                                            ]}
                                        >
                                            {step.label}
                                        </Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* Order Details */}
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

                {/* Confirmation Section */}
                {order.status === 'delivering' && (
                    <View style={styles.confirmSection}>
                        <Text style={styles.confirmText}>
                            Driver is on the way to deliver your order. Please be ready.
                        </Text>
                        <TouchableOpacity
                            style={styles.confirmButton}
                            onPress={handleConfirmDelivery}
                        >
                            <MaterialIcons name="check-circle" size={20} color="#fff" />
                            <Text style={styles.confirmButtonText}>Confirm Receipt</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Delivered Section */}
                {isDelivered && (
                    <View style={styles.deliveredSection}>
                        <MaterialIcons name="check-circle" size={48} color="#4caf50" />
                        <Text style={styles.deliveredText}>Order Delivered!</Text>
                        <Text style={styles.deliveredSubtext}>
                            Thank you for your order. Enjoy your meal!
                        </Text>
                        <TouchableOpacity
                            style={styles.reviewButton}
                            onPress={handleReview}
                        >
                            <MaterialIcons name="rate-review" size={18} color="#ff6b35" />
                            <Text style={styles.reviewButtonText}>Write Review</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    scrollView: {
        flex: 1,
    },
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
    timelineContainer: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginBottom: 8,
    },
    timelineTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 16,
    },
    timeline: {
        marginLeft: 20,
    },
    timelineItem: {
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    nodeContainer: {
        alignItems: 'center',
        marginRight: 12,
        marginTop: 2,
    },
    node: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 2,
        borderColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    nodeCompleted: {
        backgroundColor: '#4caf50',
        borderColor: '#4caf50',
    },
    nodeCurrent: {
        backgroundColor: '#ff6b35',
        borderColor: '#ff6b35',
        width: 40,
        height: 40,
    },
    line: {
        width: 2,
        height: 40,
        backgroundColor: '#ddd',
        marginTop: 4,
    },
    lineCompleted: {
        backgroundColor: '#4caf50',
    },
    labelContainer: {
        flex: 1,
        paddingVertical: 8,
    },
    label: {
        fontSize: 13,
        color: '#999',
        fontWeight: '500',
    },
    labelCompleted: {
        color: '#4caf50',
        fontWeight: '600',
    },
    labelCurrent: {
        color: '#ff6b35',
        fontWeight: '700',
    },
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
    confirmSection: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginBottom: 8,
        alignItems: 'center',
    },
    confirmText: {
        fontSize: 13,
        color: '#666',
        textAlign: 'center',
        marginBottom: 12,
    },
    confirmButton: {
        backgroundColor: '#ff6b35',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    confirmButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    deliveredSection: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 24,
        marginBottom: 8,
        alignItems: 'center',
    },
    deliveredText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#4caf50',
        marginTop: 12,
    },
    deliveredSubtext: {
        fontSize: 13,
        color: '#666',
        marginTop: 8,
        textAlign: 'center',
    },
    reviewButton: {
        backgroundColor: '#fff3e0',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 16,
    },
    reviewButtonText: {
        color: '#ff6b35',
        fontWeight: '600',
        fontSize: 14,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    errorText: {
        fontSize: 16,
        color: '#e53935',
    },
    backButton: {
        backgroundColor: '#ff6b35',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    backButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
});

export default TrackingScreen;
