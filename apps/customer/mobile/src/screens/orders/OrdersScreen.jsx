// screens/orders/OrdersScreen.jsx
import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    Text,
} from 'react-native';
import BottomNavigation from '../../components/BottomNavigation';
import OrderHeader from '../../components/orders/OrderHeader';
import OrderTabs from '../../components/orders/OrderTabs';
import OrderList from '../../components/orders/OrderList';
import { useOrders } from '../../hooks/useOrders';

export default function OrdersScreen({ onNavigate }) {
    const [activeRoute, setActiveRoute] = useState('orders');
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Orders hook
    const {
        orders,
        allOrders,
        loading,
        activeTab,
        setActiveTab,
        currentOrdersCount,
        historyOrdersCount,
        handleCancelOrder,
        handleRetryOrder,
        refetch,
    } = useOrders('user-1'); // Mock userId

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await refetch();
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleNavigate = (route) => {
        setActiveRoute(route);
        if (onNavigate) {
            onNavigate(route);
        }
    };

    const handleViewOrderDetails = (orderId) => {
        const order = allOrders.find(o => o.id === orderId);
        // In production, would navigate to order detail screen
        console.log('View order details:', orderId, order);
    };

    return (
        <View style={styles.screenContainer}>
            <SafeAreaView style={styles.container}>
                <ScrollView
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled={true}
                >
                    {/* Header */}
                    <OrderHeader
                        currentCount={currentOrdersCount}
                        historyCount={historyOrdersCount}
                    />

                    {/* Tabs */}
                    <OrderTabs
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        currentCount={currentOrdersCount}
                        historyCount={historyOrdersCount}
                    />

                    {/* Orders List */}
                    <OrderList
                        orders={orders}
                        loading={loading}
                        isRefreshing={isRefreshing}
                        onCancel={handleCancelOrder}
                        onRetry={handleRetryOrder}
                        onViewDetails={handleViewOrderDetails}
                        onRefresh={handleRefresh}
                    />

                    <View style={{ height: 30 }} />
                </ScrollView>
            </SafeAreaView>
            <BottomNavigation activeRoute={activeRoute} onNavigate={handleNavigate} />
        </View>
    );
}

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    content: {
        flex: 1,
    },
});
