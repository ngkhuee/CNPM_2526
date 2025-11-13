import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useContext, useEffect, useState } from 'react';
import { RestaurantContext, CartContext } from 'customer-shared';

export default function RestaurantDetailsScreen({ navigation, route }) {
    const { restaurantId } = route.params;
    const { restaurants } = useContext(RestaurantContext);
    const { cart, addItem } = useContext(CartContext);
    const [restaurant, setRestaurant] = useState(null);
    const [foods, setFoods] = useState([]);
    const [addingToCart, setAddingToCart] = useState(false);

    useEffect(() => {
        // Find the restaurant from context
        const foundRestaurant = restaurants?.find(r => r.id === restaurantId);
        if (foundRestaurant) {
            setRestaurant(foundRestaurant);
            setFoods(foundRestaurant.foods || []);
        }
    }, [restaurantId, restaurants]);

    const handleAddToCart = async (food) => {
        try {
            setAddingToCart(true);
            // addItem expects: (restaurant_id, food_id, quantity, note)
            await addItem(restaurantId, food.id, 1, '');
            alert(`${food.name} thêm vào giỏ hàng!`);
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert(`Lỗi: ${error.message || 'Không thể thêm vào giỏ hàng'}`);
        } finally {
            setAddingToCart(false);
        }
    };

    if (!restaurant) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#ff6b35" />
                <Text style={styles.loadingText}>Loading restaurant...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* Restaurant Header */}
            <View style={styles.header}>
                <View style={styles.restaurantImage}>
                    <Text style={styles.imagePlaceholder}>🏪</Text>
                </View>
                <Text style={styles.restaurantTitle}>{restaurant.name}</Text>
                <Text style={styles.restaurantInfo}>
                    {restaurant.address} | Rating: {restaurant.rating || 'N/A'}
                </Text>
            </View>

            {/* Menu Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Menu</Text>
                {foods.length > 0 ? (
                    foods.map((food) => (
                        <View key={food.id} style={styles.foodCard}>
                            <View style={styles.foodInfo}>
                                <Text style={styles.foodName}>{food.name}</Text>
                                <Text style={styles.foodCategory}>{food.category || 'Food'}</Text>
                                <Text style={styles.foodPrice}>${food.price?.toFixed(2)}</Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.addBtn, addingToCart && styles.addBtnDisabled]}
                                onPress={() => handleAddToCart(food)}
                                disabled={addingToCart}
                            >
                                <Text style={styles.addBtnText}>
                                    {addingToCart ? '...' : '+'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ))
                ) : (
                    <Text style={styles.noFoodsText}>No menu items available</Text>
                )}
            </View>

            {/* Floating Cart Button */}
            {cart?.items && cart.items.length > 0 && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => navigation.navigate('Cart')}
                >
                    <Text style={styles.fabText}>Cart {cart.items.length}</Text>
                </TouchableOpacity>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        backgroundColor: '#fff',
        paddingBottom: 20,
    },
    restaurantImage: {
        height: 200,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagePlaceholder: {
        fontSize: 80,
    },
    restaurantTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
        marginTop: 15,
        marginHorizontal: 15,
    },
    restaurantInfo: {
        fontSize: 13,
        color: '#666',
        marginTop: 5,
        marginHorizontal: 15,
    },
    section: {
        paddingHorizontal: 15,
        paddingVertical: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
        marginBottom: 15,
    },
    foodCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    foodInfo: {
        flex: 1,
    },
    foodName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#333',
        marginBottom: 4,
    },
    foodCategory: {
        fontSize: 12,
        color: '#999',
        marginBottom: 6,
    },
    foodPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: '#ff6b35',
    },
    addBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#ff6b35',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addBtnText: {
        fontSize: 24,
        color: '#fff',
        fontWeight: 'bold',
    },
    addBtnDisabled: {
        backgroundColor: '#cccccc',
        opacity: 0.6,
    },
    fab: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: '#ff6b35',
        borderRadius: 30,
        paddingHorizontal: 16,
        paddingVertical: 12,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
    },
    fabText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    noFoodsText: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        marginTop: 20,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#666',
    },
});
