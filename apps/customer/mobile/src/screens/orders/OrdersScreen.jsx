// screens/orders/OrdersScreen.jsx
import React, { useState, useContext } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    Text,
    TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NavigationContext } from '../../contexts/NavigationContext';
import { AuthContext } from '../../contexts/AuthContext';
import BottomNavigation from '../../components/BottomNavigation';
import OrderHeader from '../../components/orders/OrderHeader';
import OrderTabs from '../../components/orders/OrderTabs';
import OrderList from '../../components/orders/OrderList';
import { useOrders } from '../../hooks/useOrders';

export default function OrdersScreen({ onNavigate }) {
    const { activeRoute, navigate } = useContext(NavigationContext);
    const { isAuthenticated, user } = useContext(AuthContext);
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
    } = useOrders(user?.id || null); // Pass user ID from auth context (null if not authenticated)

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await refetch();
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleNavigate = (route, params) => {
        if (onNavigate) {
            onNavigate(route, params);
        }
        navigate(route, params);
    };

    const handleViewOrderDetails = (orderId) => {
        const order = allOrders.find(o => o.id === orderId);
        if (order) {
            handleNavigate('order-detail', { orderId: orderId });
        }
    };

    // Check if user is authenticated - show login prompt instead of orders
    if (!isAuthenticated) {
        return (
            <View style={styles.screenContainer}>
                <SafeAreaView style={styles.container}>
                    <View style={styles.loginPromptContainer}>
                        <MaterialIcons
                            name="lock"
                            size={48}
                            color="#ff6b35"
                            style={styles.lockIcon}
                        />
                        <Text style={styles.modalTitle}>Yêu cầu đăng nhập</Text>
                        <Text style={styles.modalSubtitle}>
                            Đăng nhập để xem đơn hàng của bạn
                        </Text>

                        <TouchableOpacity
                            style={styles.modalLoginButton}
                            onPress={() => {
                                handleNavigate('login');
                            }}
                        >
                            <Text style={styles.modalLoginButtonText}>Đăng nhập</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
                <BottomNavigation activeRoute={activeRoute} onNavigate={handleNavigate} />
            </View>
        );
    }

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
    emptyContainer: {
        flex: 1,
        backgroundColor: '#f8f8f8',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContent: {
        alignItems: 'center',
        gap: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        maxWidth: 280,
    },
    browseButton: {
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
        marginTop: 8,
    },
    browseButtonText: {
        color: '#666',
        fontSize: 14,
        fontWeight: '600',
    },
    loginPromptButton: {
        backgroundColor: '#ff6b35',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
        marginTop: 8,
    },
    loginPromptButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    // Login prompt styles
    loginPromptContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    loginPromptBox: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        width: '100%',
        maxWidth: 320,
    },
    lockIcon: {
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    modalLoginButton: {
        backgroundColor: '#ff6b35',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 32,
        width: '100%',
        alignItems: 'center',
        marginBottom: 12,
    },
    modalLoginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    modalBackButton: {
        borderWidth: 1,
        borderColor: '#ff6b35',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
        width: '100%',
        alignItems: 'center',
        marginTop: 12,
    },
    modalBackButtonText: {
        color: '#ff6b35',
        fontSize: 14,
        fontWeight: '600',
    },
    modalCloseButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

