import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SectionTitle({ title, count }) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            {count !== undefined && (
                <View style={styles.badge}>
                    <Text style={styles.count}>{count}</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
    },
    badge: {
        backgroundColor: '#ff6b35',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    count: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
});
