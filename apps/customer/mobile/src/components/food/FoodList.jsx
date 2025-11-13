/**
 * Food List Component
 */
import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { spacing } from '../../styles';
import { FoodCard } from './FoodCard';
import { Loading } from '../common/Loading';
import { EmptyState } from '../common/EmptyState';

export const FoodList = ({
    foods,
    loading,
    onFoodPress,
    isRestaurantOpen = true,
    numColumns = 1,
}) => {
    if (loading) {
        return <Loading text="Loading menu..." />;
    }

    if (!foods || foods.length === 0) {
        return (
            <EmptyState
                iconName="fast-food-outline"
                title="No menu items"
                message="This restaurant has no items available"
            />
        );
    }

    return (
        <FlatList
            data={foods}
            renderItem={({ item }) => (
                <View style={numColumns > 1 ? styles.gridItem : null}>
                    <FoodCard
                        food={item}
                        onPress={onFoodPress}
                        isRestaurantOpen={isRestaurantOpen}
                    />
                </View>
            )}
            keyExtractor={(item) => item.id?.toString() || item._id?.toString()}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            numColumns={numColumns}
            key={numColumns} // Force re-render when columns change
        />
    );
};

const styles = StyleSheet.create({
    list: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing.xxl,
    },
    gridItem: {
        flex: 1 / 2,
        paddingHorizontal: spacing.xs,
    },
});

export default FoodList;
