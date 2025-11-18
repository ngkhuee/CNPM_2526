import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { getRestaurantImageUrl } from '../../../shared/imageHelper';

export default function NearbyRestaurantCard({ item, onPress }) {
    if (!item) return null;

    const imageUrl = getRestaurantImageUrl(item);
    const distance = item.distance || 0;

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => onPress?.(item.id)}
        >
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: imageUrl }}
                    style={styles.image}
                    onError={() => console.error('Image load failed:', imageUrl)}
                />
            </View>
            <View style={styles.content}>
                <Text style={styles.name} numberOfLines={2}>
                    {item.name || 'Restaurant'}
                </Text>
                <View style={styles.distanceRow}>
                    <MaterialIcons name="location-on" size={14} color="#ff6b35" />
                    <Text style={styles.distance}>
                        {distance.toFixed(1)} km
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        width: 140,
        marginRight: 12,
        backgroundColor: '#fff',
        borderRadius: 8,
        overflow: 'hidden',
        elevation: 2,
    },
    imageContainer: {
        width: '100%',
        height: 100,
        backgroundColor: '#eee',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    content: {
        padding: 8,
    },
    name: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333',
        marginBottom: 6,
    },
    distanceRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    distance: {
        fontSize: 11,
        color: '#ff6b35',
        fontWeight: '500',
        marginLeft: 4,
    },
});
