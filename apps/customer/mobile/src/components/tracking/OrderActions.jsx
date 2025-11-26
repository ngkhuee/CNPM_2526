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
    onReview,
}) => {
    if (isDelivered) {
        return (
            <View style={styles.deliveredSection}>
                <MaterialIcons name="check-circle" size={48} color="#4caf50" />
                <Text style={styles.deliveredText}>Đã giao hàng!</Text>
                <Text style={styles.deliveredSubtext}>
                    Cảm ơn bạn đã đặt hàng. Chúc bạn ngon miệng!
                </Text>
                <TouchableOpacity style={styles.reviewButton} onPress={onReview}>
                    <MaterialIcons name="rate-review" size={18} color="#ff6b35" />
                    <Text style={styles.reviewButtonText}>Viết đánh giá</Text>
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
