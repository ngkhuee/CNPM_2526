import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useState } from 'react';

export default function RestaurantDetailsScreen({ navigation, route }) {
    const { restaurantId } = route.params;
    const [cart, setCart] = useState([]);

    // Mock food items
    const foods = [
        { id: 1, name: 'Margherita Pizza', price: 8.99, category: 'Pizza' },
        { id: 2, name: 'Pasta Carbonara', price: 10.99, category: 'Pasta' },
        { id: 3, name: 'Caesar Salad', price: 6.99, category: 'Salad' },
    ];

    const handleAddToCart = (food) => {
        setCart([...cart, food]);
        alert(`${food.name} added to cart!`);
    };

    const goToCart = () => {
        navigation.navigate('Cart', { items: cart });
    };

    return (
        <ScrollView style={styles.container}>
            {/* Restaurant Header */}
            <View style={styles.header}>
                <View style={styles.restaurantImage}>
                    <Text style={styles.imagePlaceholder}>Restaurant</Text>
                </View>
                <Text style={styles.restaurantTitle}>Restaurant #{restaurantId}</Text>
                <Text style={styles.restaurantInfo}>Address: Restaurant Details | Rating: Pending</Text>
            </View>

            {/* Menu Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Menu</Text>
                {foods.map((food) => (
                    <View key={food.id} style={styles.foodCard}>
                        <View style={styles.foodInfo}>
                            <Text style={styles.foodName}>{food.name}</Text>
                            <Text style={styles.foodCategory}>{food.category}</Text>
                            <Text style={styles.foodPrice}>${food.price.toFixed(2)}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.addBtn}
                            onPress={() => handleAddToCart(food)}
                        >
                            <Text style={styles.addBtnText}>+</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </View>

            {/* Floating Cart Button */}
            {cart.length > 0 && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={goToCart}
                >
                    <Text style={styles.fabText}>Cart {cart.length}</Text>
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
});
