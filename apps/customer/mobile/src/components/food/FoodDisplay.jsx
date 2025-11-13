/**
 * FoodDisplay Component for Mobile
 * Displays foods filtered by category
 */
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { FoodCard } from './FoodCard';
import { Loading } from '../common/Loading';
import { colors, spacing, typography } from '../../styles';

export const FoodDisplay = ({
    foods = [],
    loading = false,
    filterBy = 'featured',
    filterValue = 'Top Rated',
    onFoodPress,
}) => {
    // Filter foods based on criteria
    const filteredFoods = useMemo(() => {
        if (!foods || foods.length === 0) return [];

        if (filterBy === 'featured') {
            // Simple filter: Top Rated vs Best Selling
            // You can extend this based on actual data structure
            return foods.slice(0, 10);
        }

        if (filterBy === 'category') {
            return foods.filter((f) => f.categoryId === filterValue);
        }

        return foods;
    }, [foods, filterBy, filterValue]);

    if (loading) {
        return <Loading text="Loading foods..." />;
    }

    if (!filteredFoods || filteredFoods.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No foods available</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{filterValue} Dishes</Text>
            <FlatList
                data={filteredFoods}
                renderItem={({ item }) => (
                    <FoodCard
                        food={item}
                        onPress={() => onFoodPress?.(item)}
                    />
                )}
                keyExtractor={(item) => item.id?.toString() || item._id?.toString()}
                numColumns={2}
                columnWrapperStyle={styles.row}
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
    row: {
        justifyContent: 'space-between',
        marginBottom: spacing.md,
    },
    list: {
        paddingHorizontal: 0,
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
