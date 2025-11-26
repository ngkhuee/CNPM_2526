// screens/orders/TrackingScreen.jsx - Complete with popup and drone tracking
import React, { useContext, useState } from 'react';
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
import { useOrderTracking } from '../../hooks/useOrderTracking';
import { useDeliveryTracking, ORDER_TIMELINE, CANCELLED_TIMELINE } from '../../hooks/useDeliveryTracking';
import apiClient from '../../services/apiClient';
import { OrderStatusHeader } from '../../components/tracking/OrderStatusHeader';
import { OrderTimeline } from '../../components/tracking/OrderTimeline';
import { DeliveryInfo } from '../../components/tracking/DeliveryInfo';
import { MapSection } from '../../components/tracking/MapSection';
import { OrderDetails } from '../../components/tracking/OrderDetails';
import { OrderActions } from '../../components/tracking/OrderActions';
import { ArrivedPopup } from '../../components/tracking/ArrivedPopup';

const TrackingScreen = ({ orderId }) => {
    const { navigate } = useContext(NavigationContext);
    const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

    // Custom hooks - useOrderTracking with adaptive polling
    const { order, loading, refreshing, handleRefresh, setAutoRefresh } = useOrderTracking(orderId, navigate);

    // Unified delivery tracking hook (consolidates arrival detection + confirmation)
    const {
        currentStatusIndex,
        isDelivered,
        showMap,
        showArrivedPopup,
        handleCloseArrivedPopup,
    } = useDeliveryTracking(order, () => handleRefresh());

    // Auto-navigate when delivered
    React.useEffect(() => {
        if (isDelivered) {
            const timer = setTimeout(() => {
                console.log('[TrackingScreen] Auto-navigating to orders after delivery');
                navigate('orders');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isDelivered, navigate]);

    // Handle auto-refresh toggle
    const handleAutoRefreshToggle = () => {
        const newState = !autoRefreshEnabled;
        setAutoRefreshEnabled(newState);
        setAutoRefresh?.(newState);
    };

    // Navigation handlers
    const handleBack = () => {
        navigate('orders');
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
                <View style={styles.headerActions}>
                    <TouchableOpacity
                        onPress={handleAutoRefreshToggle}
                        style={[styles.headerBtn, autoRefreshEnabled && styles.headerBtnActive]}
                    >
                        <MaterialIcons
                            name={autoRefreshEnabled ? "sync" : "sync-disabled"}
                            size={20}
                            color={autoRefreshEnabled ? "#ff6b35" : "#ccc"}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleRefresh} disabled={refreshing}>
                        {refreshing ? (
                            <ActivityIndicator size="small" color="#ff6b35" />
                        ) : (
                            <MaterialIcons name="refresh" size={24} color="#ff6b35" />
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* Order Status Header */}
                <OrderStatusHeader order={order} isDelivered={isDelivered} />

                {/* Timeline - Show cancelled timeline for cancelled/rejected orders */}
                <OrderTimeline
                    timeline={order?.status === 'cancelled' || order?.status === 'rejected' ? CANCELLED_TIMELINE : ORDER_TIMELINE}
                    currentStatusIndex={currentStatusIndex}
                />

                {/* Delivery Information */}
                <DeliveryInfo order={order} />

                {/* Delivery Route Map - Show when delivering, arrived, or delivered */}
                {showMap && (
                    <MapSection
                        order={order}
                    />
                )}

                {/* Order Details (with items merged) */}
                <OrderDetails order={order} />

                {/* Action Buttons */}
                <OrderActions
                    order={order}
                    isDelivered={isDelivered}
                    onReview={handleReview}
                />
            </ScrollView>

            {/* Arrived Popup */}
            <ArrivedPopup
                visible={showArrivedPopup && !isDelivered}
                onClose={handleCloseArrivedPopup}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 40,
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
        flex: 1,
        textAlign: 'center',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerBtn: {
        padding: 8,
        borderRadius: 6,
        backgroundColor: 'transparent',
    },
    headerBtnActive: {
        backgroundColor: '#fff3e0',
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
    confirmSection: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 20,
        marginBottom: 8,
        gap: 12,
    },
    confirmButton: {
        backgroundColor: '#4caf50',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        borderRadius: 8,
        shadowColor: '#4caf50',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    confirmNote: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
        fontStyle: 'italic',
        lineHeight: 16,
    },
});

export default TrackingScreen;
