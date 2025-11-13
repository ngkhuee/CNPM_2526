/**
 * ExploreMenu Component for Mobile
 * Filter menu with GPS support
 */
import React, { useState, useCallback, useMemo, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { GeolocationContext } from '../../contexts';
import { colors, spacing, typography } from '../../styles';

// Haversine formula to calculate distance
const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export const ExploreMenu = ({
    selected,
    setSelected,
    restaurants = [],
    showOnlyNearby = false,
    onNearbyRestaurantsLoaded,
}) => {
    const { userLocation, requestLocation, geoLoading } = useContext(GeolocationContext);

    // Filter options
    const filterOptions = useMemo(() => {
        if (showOnlyNearby) return [];
        return [
            { id: 'Top Rated', label: 'Top Rated', icon: 'star' },
            { id: 'Best Selling', label: 'Best Selling', icon: 'flame' },
        ];
    }, [showOnlyNearby]);

    // Find nearby restaurants
    const nearbyRestaurants = useMemo(() => {
        if (!userLocation?.latitude || !userLocation?.longitude) return [];

        let filtered = restaurants
            .map((r) => {
                const lat = r.location?.lat || r.latitude;
                const lng = r.location?.lng || r.longitude;

                if (lat && lng) {
                    const distance = calculateDistance(
                        userLocation.latitude,
                        userLocation.longitude,
                        lat,
                        lng
                    );
                    return { ...r, distance };
                }
                return { ...r, distance: null };
            })
            .filter((r) => r.distance !== null && r.distance <= 5)
            .sort((a, b) => a.distance - b.distance);

        onNearbyRestaurantsLoaded?.(filtered.slice(0, 10));
        return filtered;
    }, [restaurants, userLocation]);

    // Show only nearby section
    if (showOnlyNearby) {
        if (nearbyRestaurants.length === 0) {
            return (
                <View style={styles.emptyContainer}>
                    <Icon name="location-outline" size={40} color={colors.primary} />
                    <Text style={styles.emptyText}>
                        {userLocation ? 'No restaurants nearby' : 'Enable GPS to see nearby restaurants'}
                    </Text>
                    <TouchableOpacity style={styles.gpsButton} onPress={requestLocation}>
                        {geoLoading ? (
                            <ActivityIndicator color={colors.white} />
                        ) : (
                            <>
                                <Icon name="location" size={16} color={colors.white} />
                                <Text style={styles.gpsButtonText}>Request Location</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Icon name="location" size={24} color={colors.primary} />
                    <Text style={styles.sectionTitle}>Restaurants Near You</Text>
                </View>
                <Text style={styles.sectionSubtitle}>
                    {nearbyRestaurants.length} restaurants within 5km
                </Text>
            </View>
        );
    }

    // Main discover section
    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Icon name="restaurant" size={24} color={colors.primary} />
                <Text style={styles.sectionTitle}>Discover Delicious Food</Text>
            </View>
            <Text style={styles.sectionSubtitle}>
                Explore our curated selection of top-rated dishes
            </Text>

            {/* Filter buttons */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
                {filterOptions.map((option) => (
                    <TouchableOpacity
                        key={option.id}
                        style={[
                            styles.filterButton,
                            selected === option.id && styles.filterButtonActive,
                        ]}
                        onPress={() => setSelected?.(option.id)}
                    >
                        <Icon
                            name={option.icon}
                            size={20}
                            color={selected === option.id ? colors.white : colors.primary}
                        />
                        <Text
                            style={[
                                styles.filterButtonText,
                                selected === option.id && styles.filterButtonTextActive,
                            ]}
                        >
                            {option.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* GPS button */}
            {!userLocation && (
                <TouchableOpacity
                    style={styles.gpsButton}
                    onPress={requestLocation}
                    disabled={geoLoading}
                >
                    {geoLoading ? (
                        <ActivityIndicator color={colors.white} />
                    ) : (
                        <>
                            <Icon name="location" size={16} color={colors.white} />
                            <Text style={styles.gpsButtonText}>Request Location</Text>
                        </>
                    )}
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    section: {
        paddingVertical: spacing.lg,
        marginBottom: spacing.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    sectionTitle: {
        ...typography.h3,
        color: colors.text.primary,
    },
    sectionSubtitle: {
        ...typography.caption,
        color: colors.text.secondary,
        marginBottom: spacing.md,
    },
    filterContainer: {
        marginBottom: spacing.md,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: 12,
        backgroundColor: colors.backgroundDark,
        marginRight: spacing.md,
    },
    filterButtonActive: {
        backgroundColor: colors.primary,
    },
    filterButtonText: {
        ...typography.body,
        color: colors.primary,
        fontWeight: '600',
    },
    filterButtonTextActive: {
        color: colors.white,
    },
    gpsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.md,
        backgroundColor: colors.primary,
        borderRadius: 12,
    },
    gpsButtonText: {
        ...typography.body,
        color: colors.white,
        fontWeight: '600',
    },
    emptyContainer: {
        paddingVertical: spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.md,
    },
    emptyText: {
        ...typography.body,
        color: colors.text.secondary,
        textAlign: 'center',
    },
});
