// components/tracking/OrderActions.jsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const formatCountdown = (seconds) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const OrderActions = ({
    order,
    isDelivered,
    onConfirmDelivery,
    onReview,
    showConfirmButton,
    autoConfirmCountdown,
    onManualConfirm,
}) => {
    if (isDelivered) {
        return (
            <View style={styles.deliveredSection}>
                <MaterialIcons name="check-circle" size={48} color="#4caf50" />
                <Text style={styles.deliveredText}>Order Delivered!</Text>
                <Text style={styles.deliveredSubtext}>
                    Thank you for your order. Enjoy your meal!
                </Text>
                <TouchableOpacity style={styles.reviewButton} onPress={onReview}>
                    <MaterialIcons name="rate-review" size={18} color="#ff6b35" />
                    <Text style={styles.reviewButtonText}>Write Review</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Show confirm button when drone arrives
    if (showConfirmButton && order?.status === 'delivering') {
        return (
            <View style={styles.confirmSection}>
                <View style={styles.alertBox}>
                    <MaterialIcons name="info" size={20} color="#ff6b35" />
                    <View style={styles.alertContent}>
                        <Text style={styles.alertTitle}>Delivery Arrived!</Text>
                        <Text style={styles.alertText}>
                            Your order has arrived at the delivery location.
                        </Text>
                        {autoConfirmCountdown && (
                            <Text style={styles.countdownText}>
                                Auto-confirm in {formatCountdown(autoConfirmCountdown)}
                            </Text>
                        )}
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={onManualConfirm || onConfirmDelivery}
                >
                    <MaterialIcons name="check-circle" size={20} color="#fff" />
                    <Text style={styles.confirmButtonText}>Confirm Receipt</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (order?.status === 'delivering') {
        return (
            <View style={styles.confirmSection}>
                <Text style={styles.confirmText}>
                    Driver is on the way to deliver your order. Please be ready.
                </Text>
                <TouchableOpacity style={styles.confirmButton} onPress={onConfirmDelivery}>
                    <MaterialIcons name="check-circle" size={20} color="#fff" />
                    <Text style={styles.confirmButtonText}>Confirm Receipt</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return null;
};

const styles = StyleSheet.create({
    confirmSection: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginBottom: 8,
    },
    confirmText: {
        fontSize: 13,
        color: '#666',
        textAlign: 'center',
        marginBottom: 12,
    },
    alertBox: {
        backgroundColor: '#fff9e6',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#ff6b35',
    },
    alertContent: {
        flex: 1,
    },
    alertTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#ff6b35',
        marginBottom: 4,
    },
    alertText: {
        fontSize: 12,
        color: '#666',
        marginBottom: 6,
    },
    countdownText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#ff6b35',
        fontFamily: 'monospace',
    },
    confirmButton: {
        backgroundColor: '#ff6b35',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
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
});
