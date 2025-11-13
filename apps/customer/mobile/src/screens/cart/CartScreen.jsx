/**
 * Cart Screen - Shows items in cart
 */
import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { colors } from '../../styles';
import { CartItem, CartSummary } from '../../components/cart';
import { EmptyState } from '../../components/common';
import { useHomeStack } from '../../navigation/useHomeStackNavigation';

export default function CartScreen() {
    const navigation = useHomeStack();
    // TODO: Integrate with CartContext when available
    const cart = { items: [] };
    const removeItem = (itemId) => { };
    const updateItem = (itemId, quantity) => { };
    const getTotalCartAmount = () => 0;
    const deliveryFeeValue = 2.0;

    const items = cart?.items || [];
    const subtotal = getTotalCartAmount();
    const deliveryFee = deliveryFeeValue;
    const total = subtotal + deliveryFee;

    if (items.length === 0) {
        return (
            <EmptyState
                iconName="cart-outline"
                title="Your cart is empty"
                message="Add items from restaurants to get started"
                actionLabel="Browse Restaurants"
                onAction={() => navigation.navigate('Home')}
            />
        );
    }

    const handleCheckout = () => {
        navigation.navigate('Checkout');
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.itemsList}>
                {items.map((item) => (
                    <CartItem
                        key={item.id}
                        item={item}
                        onUpdateQuantity={updateItem}
                        onRemove={removeItem}
                    />
                ))}
            </ScrollView>

            <CartSummary
                subtotal={subtotal}
                deliveryFee={deliveryFee}
                total={total}
                onCheckout={handleCheckout}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    itemsList: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 12,
    },
});
