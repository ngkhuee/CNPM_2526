// screens/orders/TrackingScreen.jsx - REFACTORED VERSION
/**
 * TrackingScreen.jsx - Enhanced Order Tracking
 * Real-time tracking with GPS coordinates, status timeline, driver info
 */

import React, { useContext } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NavigationContext } from '../../contexts/NavigationContext';
import { useOrderTracking } from '../../hooks/useOrderTracking';
import { useOrderStatus, ORDER_TIMELINE } from '../../hooks/useOrderStatus';
import { OrderStatusHeader } from '../../components/tracking/OrderStatusHeader';
import { OrderTimeline } from '../../components/tracking/OrderTimeline';
import { OrderDetails } from '../../components/tracking/OrderDetails';
import { OrderActions } from '../../components/tracking/OrderActions';

const TrackingScreen = ({ orderId }) => {
    const { navigate } = useContext(NavigationContext);

    // Custom hooks
    const { order, loading, refreshing, handleRefresh } = useOrderTracking(orderId, navigate);
    const { currentStatusIndex, isDelivered, handleConfirmDelivery } = useOrderStatus(
        order,
        () => handleRefresh()
    );

    // Navigation handlers
    const handleBack = () => {
        navigate('order-detail', { orderId: order?.id });
    };

    const handleReview = () => {
        navigate('review', { orderId: order?.id });
    };

    // Loading state
    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color="#ff6b35" style={{ marginTop: 50 }} />
            </SafeAreaView>
        );
    }

    // Error state
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

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack}>
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
                <OrderStatusHeader order={order} isDelivered={isDelivered} />

                {/* Timeline */}
                <OrderTimeline timeline={ORDER_TIMELINE} currentStatusIndex={currentStatusIndex} />

                {/* Order Details */}
                <OrderDetails order={order} />

                {/* Action Buttons */}
                <OrderActions
                    order={order}
                    isDelivered={isDelivered}
                    onConfirmDelivery={handleConfirmDelivery}
                    onReview={handleReview}
                />
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
