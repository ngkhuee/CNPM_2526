/**
 * My Orders Screen - Shows user's order history
 */
import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { colors } from '../../styles';
import { OrderCard } from '../../components/order';
import { Loading, EmptyState } from '../../components/common';
import { useAuth } from '../../contexts';
import { orderService } from '../../services';
import { useOrdersStack } from '../../navigation/useOrdersStackNavigation';
import { useTabNavigation } from '../../navigation/SimpleTabNavigator';

export default function MyOrdersScreen() {
    const stackNav = useOrdersStack();
    const tabNav = useTabNavigation();
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchOrders = async () => {
        if (!user?.id) return;
        try {
            setLoading(true);
            const data = await orderService.getByUser(user.id);
            setOrders(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.id) {
            fetchOrders();
        }
    }, [user?.id]);

    const handleTrack = (orderId) => {
        stackNav.navigate('Tracking', { id: orderId });
    };

    const handleCancel = (order) => {
        // TODO: Implement cancel order
        alert('Cancel order feature coming soon');
    };

    if (loading) {
        return <Loading text="Loading orders..." />;
    }

    if (!orders || orders.length === 0) {
        return (
            <EmptyState
                iconName="cube-outline"
                title="No orders yet"
                message="Your order history will appear here"
                actionLabel="Browse Restaurants"
                onAction={() => tabNav.switchTab('HomeTab')}
            />
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={orders}
                renderItem={({ item }) => (
                    <OrderCard
                        order={item}
                        onTrack={handleTrack}
                        onCancel={handleCancel}
                    />
                )}
                keyExtractor={(item) => item.id?.toString() || item._id?.toString()}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    list: {
        padding: 16,
        paddingBottom: 24,
    },
});
