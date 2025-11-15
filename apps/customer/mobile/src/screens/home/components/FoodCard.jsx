import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { StarIcon } from '../../../components/Icons';

export function FoodCard({ item, onPress }) {
    const imageUrl = `http://192.168.0.127:4000${item.image}`;

    return (
        <TouchableOpacity style={styles.card} onPress={() => onPress?.(item)}>
            <Image source={{ uri: imageUrl }} style={styles.image} />
            <View style={styles.content}>
                <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.description} numberOfLines={1}>{item.description}</Text>

                <View style={styles.footer}>
                    <Text style={styles.price}>{item.price?.toLocaleString('vi-VN')}₫</Text>
                    <View style={styles.ratingBox}>
                        <StarIcon size={14} color="#ff6b35" />
                        <Text style={styles.rating}>{item.rating || 0}</Text>
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
        flexDirection: 'row',
        elevation: 2,
    },
    image: {
        width: 100,
        height: 100,
        backgroundColor: '#eee',
    },
    content: {
        flex: 1,
        padding: 12,
        justifyContent: 'space-between',
    },
    name: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    description: {
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
    price: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#ff6b35',
    },
    ratingBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    rating: {
        fontSize: 12,
        color: '#333',
    },
});
