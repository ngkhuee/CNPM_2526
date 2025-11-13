/**
 * Restaurant Header Component
 */
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius, typography } from '../../styles';
import { getImageUrl, getPlaceholderImage } from '../../utils/imageHelper';

export const RestaurantHeader = ({ restaurant }) => {
    if (!restaurant) return null;

    const bannerUrl = getImageUrl(restaurant.banner || restaurant.image);
    const placeholderImage = getPlaceholderImage();
    const isOpen = restaurant.isOpen !== undefined ? restaurant.isOpen : true;

    return (
        <View style={styles.container}>
            {/* Banner */}
            <View style={styles.bannerContainer}>
                <Image
                    source={{ uri: bannerUrl }}
                    style={styles.banner}
                    defaultSource={placeholderImage}
                />
            </View>

            {/* Info */}
            <View style={styles.info}>
                <Text style={styles.name}>{restaurant.name}</Text>

                <View style={styles.meta}>
                    {restaurant.rating > 0 && (
                        <View style={styles.metaItem}>
                            <Icon name="star" size={16} color={colors.primary} style={styles.metaIcon} />
                            <Text style={styles.metaText}>
                                {restaurant.rating.toFixed(1)} ({restaurant.reviewCount || 0} reviews)
                            </Text>
                        </View>
                    )}                    {restaurant.address && (
                        <View style={styles.metaItem}>
                            <Icon name="location" size={16} color={colors.text.light} />
                            <Text style={styles.metaText} numberOfLines={1}>
                                {restaurant.address}
                            </Text>
                        </View>
                    )}
                </View>

                <View style={[styles.statusBadge, isOpen ? styles.openBadge : styles.closedBadge]}>
                    <Text style={styles.statusText}>{isOpen ? 'Open Now' : 'Closed'}</Text>
                </View>

                {restaurant.description && (
                    <Text style={styles.description}>{restaurant.description}</Text>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        marginBottom: spacing.md,
    },
    bannerContainer: {
        width: '100%',
        height: 200,
        backgroundColor: colors.backgroundDark,
    },
    banner: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    info: {
        padding: spacing.lg,
    },
    name: {
        ...typography.h2,
        color: colors.text.primary,
        marginBottom: spacing.sm,
    },
    meta: {
        marginBottom: spacing.md,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    metaIcon: {
        fontSize: 16,
        marginRight: spacing.xs,
    },
    metaText: {
        ...typography.body,
        color: colors.text.secondary,
        flex: 1,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
        marginBottom: spacing.sm,
    },
    openBadge: {
        backgroundColor: colors.success,
    },
    closedBadge: {
        backgroundColor: colors.danger,
    },
    statusText: {
        ...typography.captionBold,
        color: colors.white,
    },
    description: {
        ...typography.body,
        color: colors.text.secondary,
        lineHeight: 20,
    },
});

export default RestaurantHeader;
