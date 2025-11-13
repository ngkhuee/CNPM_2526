/**
 * Restaurant Detail Screen - Shows menu of selected restaurant
 */
import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { restaurantService } from '../../services';
import { colors } from '../../styles';
import { RestaurantHeader } from '../../components/restaurant';
import { FoodList, FoodDetailModal } from '../../components/food';
import { Loading } from '../../components/common';
import { useHomeStack } from '../../navigation/useHomeStackNavigation';

export default function RestaurantDetailScreen() {
    const stackNav = useHomeStack();
    const { id } = stackNav.params || {};
    const [restaurant, setRestaurant] = useState(null);
    const [filteredMenuItems, setFilteredMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // TODO: Integrate with CartContext when available
    const addItem = (item) => { console.log('Add to cart:', item); };
    const canAddFromRestaurant = (restaurantId) => true;

    useEffect(() => {
        loadRestaurant();
    }, [id]);

    const loadRestaurant = async () => {
        try {
            setLoading(true);
            const data = await restaurantService.getById(id);
            setRestaurant(data);
            setFilteredMenuItems(data.foods || []);
        } catch (error) {
            console.error('Error loading restaurant:', error);
        } finally {
            setLoading(false);
        }
    };

    const [selectedFood, setSelectedFood] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const isOpen = restaurant?.isOpen !== undefined ? restaurant.isOpen : true;

    const handleFoodPress = (food) => {
        setSelectedFood(food);
        setModalVisible(true);
    };

    const handleAddToCart = async (foodId, quantity) => {
        try {
            const can = canAddFromRestaurant(restaurant.id);

            if (can) {
                await addItem(restaurant.id, foodId, quantity, '');
                setModalVisible(false);
                alert('Added to cart!');
            } else {
                // TODO: Show switch restaurant dialog
                alert('Clear cart to add items from different restaurant');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Error adding to cart');
        }
    };

    if (loading) {
        return <Loading text="Loading restaurant..." />;
    }

    return (
        <View style={styles.container}>
            <ScrollView>
                <RestaurantHeader restaurant={restaurant} />
                <FoodList
                    foods={filteredMenuItems}
                    loading={false}
                    onFoodPress={handleFoodPress}
                    isRestaurantOpen={isOpen}
                />
            </ScrollView>

            <FoodDetailModal
                visible={modalVisible}
                food={selectedFood}
                onClose={() => setModalVisible(false)}
                onAddToCart={handleAddToCart}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
});
