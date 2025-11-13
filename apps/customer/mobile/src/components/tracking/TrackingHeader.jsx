/**
 * Tracking Header Component - Mobile Version
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography } from '../../styles';

export const TrackingHeader = ({
    order,
    onRefresh,
    refreshing = false,
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.orderInfo}>
                <Text style={styles.orderId}>
                    Order #{order?.id || order?._id}
                </Text>
                {(order?.restaurantName || order?.restaurant?.name) && (
                    <Text style={styles.restaurant}>
                        {order.restaurantName || order.restaurant?.name}
                    </Text>
                )}
            </View>

            {onRefresh && (
                <TouchableOpacity
                    style={styles.refreshButton}
                    onPress={onRefresh}
                    disabled={refreshing}
                >
                    {refreshing ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                        <Icon name="refresh" size={24} color={colors.primary} />
                    )}
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    orderInfo: {
        flex: 1,
    },
    orderId: {
        ...typography.h2,
        color: colors.text.primary,
        marginBottom: spacing.xs,
    },
    restaurant: {
        ...typography.body,
        color: colors.primary,
        fontWeight: '600',
    },
    refreshButton: {
        padding: spacing.sm,
    },
});

export default TrackingHeader;
