import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { OfferIcon } from '../../../components/Icons';

export function SectionTitle({ title, count, onViewAll }) {
    return (
        <View style={styles.container}>
            <View style={styles.left}>
                <OfferIcon size={18} color="#ff6b35" />
                <Text style={styles.title}>{title}</Text>
                {count !== undefined && <Text style={styles.count}>({count})</Text>}
            </View>
            {onViewAll && (
                <TouchableOpacity onPress={onViewAll}>
                    <Text style={styles.viewAll}>View All</Text>
                </TouchableOpacity>
            )}
        </View>
    );
} const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    count: {
        fontSize: 14,
        color: '#666',
    },
    viewAll: {
        fontSize: 12,
        color: '#ff6b35',
        fontWeight: '600',
    },
});
