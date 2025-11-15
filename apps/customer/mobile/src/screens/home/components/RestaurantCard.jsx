import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { StarIcon, ClockIcon } from '../../../components/Icons';

export function RestaurantCard({ item, onPress }) {
    const imageUrl = `http://192.168.0.127:4000${item.image}`;

    return (
        <TouchableOpacity style={styles.card} onPress={() => onPress?.(item)}>
            <Image source={{ uri: imageUrl }} style={styles.image} />

            <View style={styles.content}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.category} numberOfLines={1}>{item.category}</Text>

                <View style={styles.footer}>
                    <View style={styles.ratingBox}>
                        <StarIcon size={14} color="#ff6b35" />
                        <Text style={styles.rating}>{item.rating || 0}</Text>
                    </View>
                    <View style={styles.timeBox}>
                        <ClockIcon size={12} color="#666" />
                        <Text style={styles.deliveryTime}>
                            {item.deliveryTime || 30} min
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
} const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 12,
        elevation: 2,
    },
    image: {
        width: '100%',
        height: 180,
        backgroundColor: '#eee',
    },
    content: {
        padding: 12,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    category: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    ratingBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    rating: {
        fontSize: 12,
        color: '#333',
        fontWeight: '600',
    },
    timeBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    deliveryTime: {
        fontSize: 12,
        color: '#666',
    },
});
