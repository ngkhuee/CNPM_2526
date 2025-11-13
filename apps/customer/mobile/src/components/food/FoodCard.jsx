/**
 * Food Card Component - giống FoodItem.jsx của web
 */
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius, typography, shadows } from '../../styles';
import { getImageUrl, getPlaceholderImage } from '../../utils/imageHelper';
import { formatCurrency } from 'shared-utils';

export const FoodCard = ({ food, onPress, isRestaurantOpen = true }) => {
    const imageUrl = getImageUrl(food.image);

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => onPress(food)}
            activeOpacity={0.7}
            disabled={!isRestaurantOpen}
        >
            {/* Image */}
            <View style={styles.imageContainer}>
                {imageUrl ? (
                    <Image
                        source={{ uri: imageUrl }}
                        style={[styles.image, !isRestaurantOpen && styles.imageDisabled]}
                        onError={() => console.log('[FoodCard] Image load error:', imageUrl)}
                    />
                ) : (
                    <View style={styles.placeholderImage} />
                )}
                {!isRestaurantOpen && (
                    <View style={styles.closedOverlay}>
                        <Text style={styles.closedText}>Restaurant Closed</Text>
                    </View>
                )}
            </View>

            {/* Info */}
            <View style={styles.info}>
                <View style={styles.nameRow}>
                    <Text style={styles.name} numberOfLines={1}>
                        {food.name}
                    </Text>
                    {food.rating > 0 && (
                        <View style={styles.ratingContainer}>
                            <Icon name="star" size={14} color={colors.warning} />
                            <Text style={styles.rating}>{food.rating.toFixed(1)}</Text>
                        </View>
                    )}
                </View>

                {food.description && (
                    <Text style={styles.description} numberOfLines={2}>
                        {food.description}
                    </Text>
                )}

                <View style={styles.footer}>
                    <Text style={styles.price}>{formatCurrency(food.price)}</Text>
                    {food.sold > 0 && (
                        <View style={styles.soldContainer}>
                            <Icon name="flame" size={14} color={colors.danger} />
                            <Text style={styles.sold}>{food.sold} sold</Text>
                        </View>
                    )}
                </View>

                {food.restaurant && (
                    <View style={styles.restaurantRow}>
                        <Icon name="storefront" size={14} color={colors.primary} />
                        <Text style={styles.restaurantName} numberOfLines={1}>
                            {food.restaurant}
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
        height: 120,
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
    imageDisabled: {
        opacity: 0.6,
    },
    closedOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closedText: {
        ...typography.bodyBold,
        color: colors.white,
    },
    info: {
        padding: spacing.md,
    },
    nameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    name: {
        ...typography.h4,
        color: colors.text.primary,
        flex: 1,
        marginRight: spacing.sm,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    rating: {
        ...typography.captionBold,
        color: colors.primary,
    },
    description: {
        ...typography.caption,
        color: colors.text.secondary,
        marginBottom: spacing.sm,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    price: {
        ...typography.h4,
        color: colors.primary,
    },
    soldContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    sold: {
        ...typography.caption,
        color: colors.text.secondary,
    },
    restaurantRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    restaurantName: {
        ...typography.caption,
        color: colors.text.light,
        flex: 1,
    },
});

export default FoodCard;
