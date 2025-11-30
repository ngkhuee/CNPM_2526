import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { formatRating } from '../../../shared/formatters';
import { getRestaurantImageUrl } from '../../../shared/imageHelper';
import { DroneIcon } from '../../../components/tracking/DroneIcon';

export default function RestaurantCard({ item, onPress }) {
    if (!item) {
        console.error('[RestaurantCard] Item is null/undefined!');
        return null;
    }

    const imageUrl = getRestaurantImageUrl(item);
    const ratingValue = parseFloat(item.rating) || 0;
    const ratingText = formatRating(ratingValue);

    const distance = item.distance || 0;

    // Calculate delivery time based on distance (drone speed ~50 km/h)
    // Base time: 10 minutes (preparation) + travel time
    const travelTimeMinutes = distance > 0 ? Math.ceil((distance / 50) * 60) : 0;
    const deliveryTime = String(10 + travelTimeMinutes);

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => onPress?.(item.id)}
        >
            <Image source={{ uri: imageUrl }} style={styles.image} />

            <View style={styles.content}>
                <Text style={styles.name} numberOfLines={2}>
                    {item.name || 'Nhà hàng'}
                </Text>

                <View style={styles.infoRow}>
                    {/* Rating */}
                    <View style={styles.infoItem}>
                        <MaterialIcons name="star" size={16} color="#ff6b35" />
                        <Text style={styles.infoText}>{ratingText}</Text>
                    </View>

                    {/* Distance */}
                    <View style={styles.infoItem}>
                        <MaterialIcons name="location-on" size={15} color="#ff6b35" />
                        <Text style={styles.infoText}>{distance.toFixed(1)} km</Text>
                    </View>

                    {/* Delivery Time */}
                    <View style={styles.infoItem}>
                        <DroneIcon size={15} color="#ff6b35" />
                        <Text style={styles.infoText}>{deliveryTime} phút</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        marginBottom: 12,
        elevation: 2,
    },

    image: {
        width: 85,
        height: 85,
        borderRadius: 8,
        backgroundColor: '#eee',
        marginRight: 14,
    },

    content: {
        flex: 1,
        justifyContent: 'center',
    },

    name: {
        fontSize: 15,
        fontWeight: '700',
        color: '#333',
        marginBottom: 8,
    },

    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 12,
    },

    infoText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333',
        marginLeft: 3,
    },
});
