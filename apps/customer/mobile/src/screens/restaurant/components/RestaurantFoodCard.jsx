import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Animated } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { formatCurrency, formatRating } from '../../../shared/formatters';
import { getFoodImageUrl } from '../../../shared/imageHelper';

/**
 * RestaurantFoodCard - Shopee-style food card
 * Used in RestaurantDetail and search results
 * Shows: image + name + description + sold count + price + badges + add button
 * Support highlight animation when navigated from home/search
 */
export default function RestaurantFoodCard({ item, onPress, isHighlighted = false, onAddToCart }) {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const [hasAnimated, setHasAnimated] = useState(false);

    // Highlight animation - play once when food becomes highlighted
    useEffect(() => {
        if (isHighlighted && !hasAnimated) {
            setHasAnimated(true);
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 1.05,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        } else if (!isHighlighted) {
            // Reset animation flag when highlight is cleared
            setHasAnimated(false);
        }
    }, [isHighlighted]);

    if (!item) return null;

    const imageUrl = getFoodImageUrl(item);
    const priceFormatted = formatCurrency(item.price || 0);
    const soldCount = parseInt(item.sold) || 0;
    const ratingValue = parseFloat(item.rating) || 0;
    const ratingFormatted = ratingValue > 0 ? formatRating(ratingValue) : null;

    return (
        <View
            style={[
                styles.card,
                isHighlighted && styles.cardHighlighted,
            ]}
        >
            <Animated.View
                style={{
                    flex: 1,
                    flexDirection: 'row',
                    transform: [{ scale: scaleAnim }],
                }}
            >
                <TouchableOpacity onPress={() => onPress?.(item)} activeOpacity={0.7} style={{ flex: 1, flexDirection: 'row' }}>
                    {/* Image Container - Left Side */}
                    <View style={styles.imageContainer}>
                        <Image source={{ uri: imageUrl }} style={styles.image} />

                        {/* Badges */}
                        <View style={styles.badgesContainer}>
                            {ratingValue > 0 && (
                                <View style={styles.ratingBadge}>
                                    <MaterialIcons name="star" size={12} color="#ffc107" />
                                    <Text style={styles.ratingText}>{ratingFormatted}</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Content - Right Side */}
                    <View style={styles.content}>


                        {/* Price Row */}
                        <View style={styles.priceRow}>
                            <Text style={styles.price}>{priceFormatted}</Text>
                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={() => onAddToCart?.(item)}
                            >
                                <MaterialIcons name="add" size={22} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        {/* Name */}
                        <Text style={styles.name} numberOfLines={2}>
                            {item.name}
                        </Text>

                        {/* Description */}
                        {item.description && (
                            <Text style={styles.description} numberOfLines={1}>
                                {item.description}
                            </Text>
                        )}

                        {/* Sold Count */}
                        {soldCount > 0 && (
                            <Text style={styles.soldText}>Đã bán {soldCount.toLocaleString()}</Text>
                        )}
                    </View>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 12,
        elevation: 1,
        flexDirection: 'row',
        minHeight: 120,
    },
    cardHighlighted: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#ff6b35',
        elevation: 3,
    },
    imageContainer: {
        width: 100,
        height: 120,
        backgroundColor: '#f5f5f5',
        position: 'relative',
        flexShrink: 0,
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    badgesContainer: {
        position: 'absolute',
        top: 4,
        left: 4,
        flexDirection: 'row',
        gap: 4,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 10,
        gap: 2,
    },
    ratingText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#333',
    },
    content: {
        flex: 1,
        padding: 12,
        justifyContent: 'space-between',
    },
    name: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
        lineHeight: 16,
    },
    description: {
        fontSize: 11,
        color: '#999',
        marginBottom: 4,
        lineHeight: 14,
    },
    soldText: {
        fontSize: 10,
        color: '#ff6b35',
        marginBottom: 6,
        fontWeight: '500',
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    price: {
        fontSize: 14,
        fontWeight: '700',
        color: '#ff6b35',
    },
    addButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#ff6b35',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
