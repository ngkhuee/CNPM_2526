// components/tracking/DeliveryInfo.jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export const DeliveryInfo = ({ order }) => {
    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Information</Text>

            <View style={styles.infoGrid}>
                {/* From: Restaurant */}
                <View style={styles.infoBox}>
                    <View style={styles.infoBoxHeader}>
                        <MaterialIcons name="restaurant" size={18} color="#ff6b35" />
                        <Text style={styles.infoBoxTitle}>From</Text>
                    </View>
                    <Text style={styles.infoBoxValue} numberOfLines={2}>
                        {order.restaurant_name || 'Restaurant'}
                    </Text>
                    <Text style={styles.infoBoxAddress} numberOfLines={2}>
                        {order.restaurant_address || 'No address'}
                    </Text>
                </View>

                {/* To: Customer */}
                <View style={styles.infoBox}>
                    <View style={styles.infoBoxHeader}>
                        <MaterialIcons name="home" size={18} color="#1976d2" />
                        <Text style={styles.infoBoxTitle}>To</Text>
                    </View>
                    <Text style={styles.infoBoxValue} numberOfLines={2}>
                        {order.customer?.name || 'Customer'}
                    </Text>
                    <Text style={styles.infoBoxAddress} numberOfLines={2}>
                        {order.customer?.address || 'No address'}
                    </Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    section: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 12,
    },
    infoGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    infoBox: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderLeftWidth: 3,
        borderLeftColor: '#ddd',
    },
    infoBoxHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    infoBoxTitle: {
        fontSize: 10,
        fontWeight: '600',
        color: '#666',
        marginLeft: 6,
    },
    infoBoxValue: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    infoBoxAddress: {
        fontSize: 11,
        color: '#888',
        lineHeight: 14,
    },
});
