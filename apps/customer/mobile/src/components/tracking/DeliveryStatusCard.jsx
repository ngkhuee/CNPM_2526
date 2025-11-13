/**
 * Delivery Status Card Component - Mobile Version
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography } from '../../styles';

// Local helper
const getDroneProgressText = (progress) => {
    if (!progress) return 'Preparing Order';
    if (progress < 0.25) return 'Picking Up';
    if (progress < 0.5) return 'In Transit';
    if (progress < 0.75) return 'Almost There';
    return 'Arriving Soon';
};

const getStatusColor = (progress, status) => {
    if (status === 'delivered') return colors.success;
    if (progress > 0.7) return '#ff6b35';
    return colors.primary;
};

export const DeliveryStatusCard = ({
    order,
    droneProgress,
    droneArrived,
    onConfirmDelivery,
    confirming = false,
}) => {
    const statusText = getDroneProgressText(droneProgress);
    const statusColor = getStatusColor(droneProgress, order?.status);

    const getStatusIcon = () => {
        if (order?.status === 'delivered') {
            return 'checkmark-circle';
        } else if (
            ['ready', 'picking_up', 'picked_up', 'delivering'].includes(
                order?.status
            )
        ) {
            return 'car';
        } else {
            return 'restaurant';
        }
    };

    return (
        <View style={[styles.card, { backgroundColor: statusColor }]}>
            <Icon name={getStatusIcon()} size={50} color={colors.background} />

            <Text style={styles.statusText}>{statusText}</Text>

            {order?.status === 'delivering' && (
                <Text style={styles.progressText}>
                    {Math.round(droneProgress * 100)}% complete
                </Text>
            )}

            {order?.current_gps && order?.status === 'delivering' && (
                <Text style={styles.gpsText}>
                    Position: {order.current_gps.lat?.toFixed(6)},{' '}
                    {order.current_gps.lng?.toFixed(6)}
                </Text>
            )}

            {droneArrived && order?.status === 'delivering' && (
                <>
                    <TouchableOpacity
                        style={[
                            styles.confirmButton,
                            confirming && styles.confirmButtonDisabled,
                        ]}
                        onPress={onConfirmDelivery}
                        disabled={confirming}
                    >
                        {confirming ? (
                            <ActivityIndicator size="small" color={colors.background} />
                        ) : (
                            <>
                                <Icon name="checkmark" size={20} color={colors.background} />
                                <Text style={styles.confirmButtonText}>
                                    Confirm Received
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <Text style={styles.autoConfirmText}>
                        Automatic confirmation in 5 minutes if you don't click the button
                    </Text>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        padding: spacing.xl,
        alignItems: 'center',
        marginTop: spacing.lg,
    },
    statusText: {
        ...typography.h3,
        color: colors.background,
        fontWeight: '600',
        marginTop: spacing.md,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    progressText: {
        ...typography.body,
        color: colors.background,
        marginBottom: spacing.sm,
    },
    gpsText: {
        ...typography.caption,
        color: colors.background,
        opacity: 0.9,
        marginTop: spacing.sm,
        textAlign: 'center',
    },
    confirmButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: '#2e7d32',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: 8,
        marginTop: spacing.lg,
        width: '100%',
        justifyContent: 'center',
    },
    confirmButtonDisabled: {
        backgroundColor: colors.text.light,
        opacity: 0.5,
    },
    confirmButtonText: {
        ...typography.body,
        color: colors.background,
        fontWeight: '600',
    },
    autoConfirmText: {
        ...typography.caption,
        color: colors.background,
        opacity: 0.9,
        marginTop: spacing.sm,
        textAlign: 'center',
    },
});

export default DeliveryStatusCard;
