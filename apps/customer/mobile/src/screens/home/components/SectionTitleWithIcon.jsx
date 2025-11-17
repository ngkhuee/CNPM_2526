import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function SectionTitleWithIcon({ title, icon, count, iconColor = '#ff6b35' }) {
    return (
        <View style={styles.container}>
            <View style={styles.titleWrapper}>
                <View style={{ marginRight: 8 }}>
                    <MaterialIcons name={icon} size={20} color={iconColor} />
                </View>
                <Text style={styles.title}>{title}</Text>
            </View>
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
    titleWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
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
