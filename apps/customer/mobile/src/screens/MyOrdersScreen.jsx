import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useContext, useEffect, useState } from 'react';
import {
    OrderContext,
    AuthContext,
    useOrderFiltering,
    getStatusBadgeStyle,
    canCancelOrder,
    canReviewOrder
} from 'customer-shared';
import { formatCurrency } from 'shared-utils';

export default function MyOrdersScreen({ navigation }) {
    const { orders, fetchUserOrders } = useContext(OrderContext);
    const { user } = useContext(AuthContext);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('current');

    const { currentOrders, historyOrders } = useOrderFiltering(orders);

    useEffect(() => {
        fetchUserOrders();
    }, []);

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await fetchUserOrders();
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const displayOrders = activeTab === 'current' ? currentOrders : historyOrders;

    const renderOrderCard = ({ item: order }) => (
        <TouchableOpacity
            style={styles.orderCard}
            onPress={() => navigation.navigate('Tracking', { orderId: order.id })}
            activeOpacity={0.7}
        >
            <View style={styles.orderHeader}>
                <Text style={styles.orderTitle}>Order #{order.id}</Text>
                <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusBadgeStyle(order.status)?.background }
                ]}>
                    <Text style={[
                        styles.statusText,
                        { color: getStatusBadgeStyle(order.status)?.color }
                    ]}>
                        {order.status}
                    </Text>
                </View>
            </View>

            <View style={styles.orderDetails}>
                <Text style={styles.restaurant}>
                    Restaurant: {order.restaurantName || 'Restaurant'}
                </Text>
                <Text style={styles.date}>
                    Date: {new Date(order.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </Text>
                <Text style={styles.itemCount}>
                    Items: {order.items?.length || 0}
                </Text>
            </View>

            <View style={styles.orderFooter}>
                <Text style={styles.total}>
                    {formatCurrency(order.total_amount || order.totalAmount || 0)}
                </Text>
                {canCancelOrder(order) && (
                    <TouchableOpacity style={styles.cancelBtn}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                )}
                {canReviewOrder(order) && (
                    <TouchableOpacity style={styles.reviewBtn}>
                        <Text style={styles.reviewText}>Review</Text>
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Tab Buttons */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === 'current' && styles.activeTab
                    ]}
                    onPress={() => setActiveTab('current')}
                >
                    <Text style={[
                        styles.tabText,
                        activeTab === 'current' && styles.activeTabText
                    ]}>
                        Current ({currentOrders.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === 'history' && styles.activeTab
                    ]}
                    onPress={() => setActiveTab('history')}
                >
                    <Text style={[
                        styles.tabText,
                        activeTab === 'history' && styles.activeTabText
                    ]}>
                        History ({historyOrders.length})
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Orders List */}
            {displayOrders.length > 0 ? (
                <FlatList
                    data={displayOrders}
                    renderItem={renderOrderCard}
                    keyExtractor={(item) => item.id.toString()}
                    onRefresh={handleRefresh}
                    refreshing={refreshing}
                    contentContainerStyle={styles.listContent}
                />
            ) : (
                <View style={[styles.container, styles.centerContent]}>
                    <Text style={styles.noDataText}>
                        {activeTab === 'current'
                            ? 'No active orders'
                            : 'No order history'}
                    </Text>
                    <Text style={styles.noDataSubtext}>
                        {activeTab === 'current'
                            ? 'Order food to get started!'
                            : 'Your completed orders will appear here'}
                    </Text>
                </View>
            )}
        </View>
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
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeTab: {
        borderBottomWidth: 3,
        borderBottomColor: '#ff6b35',
    },
    tabText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    activeTabText: {
        color: '#ff6b35',
        fontWeight: '600',
    },
    listContent: {
        paddingHorizontal: 15,
        paddingVertical: 15,
        paddingBottom: 30,
    },
    orderCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    orderTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    orderDetails: {
        marginBottom: 12,
    },
    restaurant: {
        fontSize: 14,
        fontWeight: '600',
        color: '#ff6b35',
        marginBottom: 4,
    },
    date: {
        fontSize: 13,
        color: '#666',
        marginBottom: 4,
    },
    itemCount: {
        fontSize: 13,
        color: '#666',
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    total: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ff6b35',
    },
    cancelBtn: {
        backgroundColor: '#dc3545',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    cancelText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    reviewBtn: {
        backgroundColor: '#ff9800',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    reviewText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    noDataText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
    },
    noDataSubtext: {
        fontSize: 13,
        color: '#999',
        textAlign: 'center',
    },
});
