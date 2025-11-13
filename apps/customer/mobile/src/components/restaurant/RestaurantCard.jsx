/**
 * Restaurant Card Component - giống RestaurantItem.jsx của web
 */
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius, typography, shadows } from '../../styles';
import { getImageUrl, getPlaceholderImage } from '../../utils/imageHelper';

export const RestaurantCard = ({ restaurant, onPress }) => {
    const imageUrl = getImageUrl(restaurant.image);
    const isOpen = restaurant.isOpen !== undefined ? restaurant.isOpen : true;

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => onPress(restaurant)}
            activeOpacity={0.7}
        >
            {/* Image */}
            <View style={styles.imageContainer}>
                {imageUrl ? (
                    <Image
                        source={{ uri: imageUrl }}
                        style={styles.image}
                        onError={() => console.log('[RestaurantCard] Image load error:', imageUrl)}
                    />
                ) : (
                    <View style={styles.placeholderImage} />
                )}
                {!isOpen && (
                    <View style={styles.closedBadge}>
                        <Text style={styles.closedText}>Closed</Text>
                    </View>
                )}
            </View>

            {/* Info */}
            <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>
                    {restaurant.name}
                </Text>

                {restaurant.rating > 0 && (
                    <View style={styles.ratingRow}>
                        <Icon name="star" size={16} color={colors.primary} style={styles.star} />
                        <Text style={styles.rating}>{restaurant.rating.toFixed(1)}</Text>
                    </View>
                )}                {restaurant.description && (
                    <Text style={styles.description} numberOfLines={2}>
                        {restaurant.description}
                    </Text>
                )}

                {restaurant.address && (
                    <View style={styles.addressRow}>
                        <Icon name="location" size={14} color={colors.text.light} />
                        <Text style={styles.address} numberOfLines={1}>
                            {restaurant.address}
                        </Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
        overflow: 'hidden',
        ...shadows.md,
    },
    imageContainer: {
        width: '100%',
        height: 150,
        backgroundColor: colors.backgroundDark,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    placeholderImage: {
        width: '100%',
        height: '100%',
        backgroundColor: colors.backgroundDark,
    },
    closedBadge: {
        position: 'absolute',
        top: spacing.sm,
        right: spacing.sm,
        backgroundColor: colors.danger,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
    },
    closedText: {
        ...typography.captionBold,
        color: colors.white,
    },
    info: {
        padding: spacing.md,
    },
    name: {
        ...typography.h4,
        color: colors.text.primary,
        marginBottom: spacing.xs,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    star: {
        fontSize: 16,
        marginRight: spacing.xs,
    },
    rating: {
        ...typography.bodyBold,
        color: colors.primary,
    },
    description: {
        ...typography.caption,
        color: colors.text.secondary,
        marginBottom: spacing.xs,
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    address: {
        ...typography.caption,
        color: colors.text.light,
        flex: 1,
    },
});

export default RestaurantCard;
