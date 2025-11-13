/**
 * Restaurant List Component
 */
import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { spacing } from '../../styles';
import { RestaurantCard } from './RestaurantCard';
import { Loading } from '../common/Loading';
import { EmptyState } from '../common/EmptyState';

export const RestaurantList = ({
    restaurants,
    loading,
    onRestaurantPress,
    onRefresh,
    refreshing = false,
}) => {
    if (loading && !refreshing) {
        return <Loading text="Loading restaurants..." />;
    }

    if (!restaurants || restaurants.length === 0) {
        return (
            <EmptyState
                iconName="restaurant-outline"
                title="No restaurants available"
                message="Try adjusting your location or check back later"
            />
        );
    }

    return (
        <FlatList
            data={restaurants}
            renderItem={({ item }) => (
                <RestaurantCard restaurant={item} onPress={onRestaurantPress} />
            )}
            keyExtractor={(item) => item.id?.toString() || item._id?.toString()}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            onRefresh={onRefresh}
            refreshing={refreshing}
        />
    );
};

const styles = StyleSheet.create({
    list: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing.xxl,
    },
});

export default RestaurantList;
