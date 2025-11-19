// components/tracking/OrderActions.jsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export const OrderActions = ({ order, isDelivered, onConfirmDelivery, onReview }) => {
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

    if (order.status === 'delivering') {
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
        alignItems: 'center',
    },
    confirmText: {
        fontSize: 13,
        color: '#666',
        textAlign: 'center',
        marginBottom: 12,
    },
    confirmButton: {
        backgroundColor: '#ff6b35',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
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
