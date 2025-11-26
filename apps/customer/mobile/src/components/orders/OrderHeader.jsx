// components/orders/OrderHeader.jsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function OrderHeader({ currentCount, historyCount }) {
    return (
        <View style={styles.header}>
            <Text style={styles.title}>Đơn hàng của tôi</Text>
            {/* <View style={styles.stats}>
                <View style={styles.statItem}>
                    <MaterialIcons name="local-shipping" size={20} color="#FF6B35" />
                    <Text style={styles.statText}>{currentCount} Active</Text>
                </View>
                <View style={styles.statItem}>
                    <MaterialIcons name="history" size={20} color="#666" />
                    <Text style={styles.statText}>{historyCount} History</Text>
                </View>
            </View> */}
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        backgroundColor: '#fff',
        paddingLeft: 30,
        paddingTop: 65,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    stats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#f5f5f5',
        borderRadius: 6,
        marginHorizontal: 4,
    },
    statText: {
        marginLeft: 8,
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
    },
});
