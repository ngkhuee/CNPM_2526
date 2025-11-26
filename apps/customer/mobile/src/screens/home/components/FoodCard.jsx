import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { formatCurrency, formatRating } from '../../../shared/formatters';
import { getFoodImageUrl } from '../../../shared/imageHelper';

export default function FoodCard({ item, onPress }) {
    if (!item) {
        console.error('[FoodCard] Item is null/undefined!');
        return null;
    }

    const imageUrl = getFoodImageUrl(item);
    const priceFormatted = formatCurrency(item.price || 0);
    const ratingValue = parseFloat(item.rating) || 0;
    const ratingFormatted = formatRating(ratingValue);
    const soldCount = parseInt(item.sold) || 0;

    const handlePress = async () => {
        console.log('[FoodCard] Pressed:', { id: item.id, name: item.name, restaurantId: item.restaurantId });
        if (onPress && typeof onPress === 'function') {
            // onPress là async function, nên await
            await onPress(item);
        }
    };

    return (
        <TouchableOpacity style={styles.card} onPress={handlePress}>
            <View style={styles.imageContainer}>
                <Image source={{ uri: imageUrl }} style={styles.image} />
                {ratingValue > 0 ? (
                    <View style={styles.ratingBadge}>
                        <View style={{ marginRight: 2 }}>
                            <MaterialIcons name="star" size={12} color="#ffc107" />
                        </View>
                        <Text style={styles.ratingText}>{ratingFormatted}</Text>
                    </View>
                ) : null}
            </View>
            <View style={styles.content}>
                <View style={styles.nameRow}>
                    <Text style={styles.name} numberOfLines={2}>
                        {item.name || 'Món ăn'}
                    </Text>
                    {soldCount > 0 ? (
                        <View style={[styles.soldBadge, { marginLeft: 'auto' }]}>
                            <Text style={styles.soldText}>Đã bán {soldCount}</Text>
                        </View>
                    ) : null}
                </View>
                {/* <Text style={styles.description} numberOfLines={1}>
                    {item.description}
                </Text> */}
                <Text style={styles.price}>{priceFormatted || '0đ'}</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 8,
        overflow: 'hidden',
        elevation: 2,
        flex: 1,
        margin: 6,
    },
    imageContainer: {
        width: '100%',
        height: 120,
        position: 'relative',
        backgroundColor: '#eee',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    ratingBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        elevation: 2,
    },
    ratingText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#333',
    },
    content: {
        padding: 10,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    name: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
        flex: 1,
        marginRight: 8,
    },
    soldBadge: {
        backgroundColor: '#ffebee',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    soldText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#d32f2f',
    },
    description: {
        fontSize: 11,
        color: '#999',
        marginBottom: 8,
    },
    price: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#ff6b35',
    },
});
