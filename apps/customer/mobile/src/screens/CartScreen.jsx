import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useContext } from 'react';
import { CartContext, calculateCartTotals, useSettings } from 'customer-shared';
import { formatCurrency } from 'shared-utils';

export default function CartScreen({ navigation, route }) {
    const { cart, removeFromCart, getTotalCartAmount } = useContext(CartContext);
    const { deliveryFee: deliveryFeeValue } = useSettings();
    const items = route.params?.items || cart?.items || [];

    const subtotal = getTotalCartAmount ? getTotalCartAmount() : items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
    const { deliveryFee, total } = calculateCartTotals(subtotal, null, deliveryFeeValue);

    const handleCheckout = () => {
        navigation.navigate('Checkout', {
            items,
            subtotal: formatCurrency(subtotal),
            deliveryFee: formatCurrency(deliveryFee),
            total: formatCurrency(total),
        });
    };

    if (items.length === 0) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <Text style={styles.emptyText}>Cart</Text>
                <Text style={styles.emptyTitle}>Your cart is empty</Text>
                <TouchableOpacity
                    style={styles.continueShoppingBtn}
                    onPress={() => navigation.navigate('Home')}
                >
                    <Text style={styles.continueText}>Continue Shopping</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.itemsList}>
                {items.map((item, index) => (
                    <View key={index} style={styles.cartItem}>
                        <View style={styles.itemInfo}>
                            <Text style={styles.itemName}>{item.name}</Text>
                            <Text style={styles.itemPrice}>${item.price?.toFixed(2)}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.removeBtn}
                            onPress={() => removeFromCart(index)}
                        >
                            <Text style={styles.removeBtnText}>✕</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>

            {/* Cart Summary */}
            <View style={styles.summary}>
                <View style={styles.summaryRow}>
                    <Text>Subtotal:</Text>
                    <Text style={styles.summaryValue}>
                        {formatCurrency(subtotal)}
                    </Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text>Delivery:</Text>
                    <Text style={styles.summaryValue}>{formatCurrency(deliveryFee)}</Text>
                </View>
                <View style={[styles.summaryRow, styles.totalRow]}>
                    <Text style={styles.totalText}>Total:</Text>
                    <Text style={styles.totalValue}>
                        {formatCurrency(total)}
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.checkoutBtn}
                    onPress={handleCheckout}
                >
                    <Text style={styles.checkoutText}>Proceed to Checkout</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.continueBtn}
                    onPress={() => navigation.navigate('Home')}
                >
                    <Text style={styles.continueText}>Continue Shopping</Text>
                </TouchableOpacity>
            </View>
        </View>
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
    emptyText: {
        fontSize: 60,
        marginBottom: 15,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
        marginBottom: 20,
    },
    itemsList: {
        flex: 1,
        paddingHorizontal: 15,
        paddingVertical: 15,
    },
    cartItem: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    itemPrice: {
        fontSize: 14,
        color: '#ff6b35',
        fontWeight: '600',
    },
    removeBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
    removeBtnText: {
        fontSize: 18,
        color: '#dc3545',
        fontWeight: 'bold',
    },
    summary: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        paddingHorizontal: 15,
        paddingTop: 15,
        paddingBottom: 30,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    summaryValue: {
        fontWeight: '600',
        color: '#333',
    },
    totalRow: {
        borderBottomWidth: 0,
        paddingVertical: 15,
    },
    totalText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
    },
    totalValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ff6b35',
    },
    checkoutBtn: {
        backgroundColor: '#ff6b35',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 15,
    },
    checkoutText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    continueBtn: {
        borderWidth: 2,
        borderColor: '#e0e0e0',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 10,
    },
    continueText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },
    continueShoppingBtn: {
        backgroundColor: '#ff6b35',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 30,
    },
});
