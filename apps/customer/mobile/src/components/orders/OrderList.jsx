// components/orders/OrderList.jsx
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import OrderCard from './OrderCard';

export default function OrderList({
    orders,
    loading,
    onCancel,
    onRetry,
    onViewDetails,
    onRefresh,
    isRefreshing,
}) {
    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#FF6B35" />
                <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
            </View>
        );
    }

    if (orders.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <MaterialIcons name="inbox" size={48} color="#ddd" />
                <Text style={styles.emptyTitle}>Chưa có đơn hàng</Text>
                <Text style={styles.emptyText}>
                    Bắt đầu đặt món từ nhà hàng yêu thích của bạn!
                </Text>
            </View>
        );
    }

    return (
        <FlatList
            data={orders}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <OrderCard
                    order={item}
                    onCancel={onCancel}
                    onRetry={onRetry}
                    onViewDetails={onViewDetails}
                />
            )}
            contentContainerStyle={styles.listContainer}
            scrollEnabled={false}
            refreshControl={
                <RefreshControl
                    refreshing={isRefreshing || false}
                    onRefresh={onRefresh}
                    colors={['#FF6B35']}
                />
            }
        />
    );
}

const styles = StyleSheet.create({
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#999',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#999',
        marginTop: 12,
    },
    emptyText: {
        fontSize: 14,
        color: '#bbb',
        marginTop: 8,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    listContainer: {
        paddingVertical: 12,
        paddingBottom: 20,
    },
});
