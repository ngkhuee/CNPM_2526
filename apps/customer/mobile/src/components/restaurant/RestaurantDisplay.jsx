/**
 * RestaurantDisplay Component for Mobile
 * Displays all restaurants
 */
import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { RestaurantCard } from './RestaurantCard';
import { Loading } from '../common/Loading';
import { colors, spacing, typography } from '../../styles';

export const RestaurantDisplay = ({
    restaurants = [],
    loading = false,
    onRestaurantPress,
    showAllRestaurants = true,
}) => {
    if (loading) {
        return <Loading text="Loading restaurants..." />;
    }

    if (!restaurants || restaurants.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No restaurants available</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {showAllRestaurants && (
                <Text style={styles.title}>All Restaurants</Text>
            )}
            <FlatList
                data={restaurants}
                renderItem={({ item }) => (
                    <RestaurantCard
                        restaurant={item}
                        onPress={() => onRestaurantPress?.(item)}
                    />
                )}
                keyExtractor={(item) => item.id?.toString() || item._id?.toString()}
                contentContainerStyle={styles.list}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.lg,
    },
    title: {
        ...typography.h3,
        color: colors.text.primary,
        marginBottom: spacing.md,
    },
    list: {
        paddingHorizontal: 0,
        gap: spacing.md,
    },
    emptyContainer: {
        paddingVertical: spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        ...typography.body,
        color: colors.text.secondary,
    },
});
