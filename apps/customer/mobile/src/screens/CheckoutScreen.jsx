import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useContext, useEffect, useState } from 'react';
import { AuthContext, useCheckout } from 'customer-shared';

export default function CheckoutScreen({ navigation, route }) {
    const { user } = useContext(AuthContext);
    const { processCheckout } = useCheckout(user);
    const [loading, setLoading] = useState(false);

    const handleCheckout = async () => {
        setLoading(true);
        try {
            const result = await processCheckout({
                deliveryAddress: route.params?.address,
                paymentMethod: route.params?.paymentMethod || 'cod',
            });

            if (result.success) {
                alert('Order placed successfully!');
                navigation.navigate('MyOrdersStack');
            } else {
                alert(result.message || 'Checkout failed');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('An error occurred during checkout');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#ff6b35" />
                <Text style={styles.loadingText}>Processing your order...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Delivery Address</Text>
                <View style={styles.addressBox}>
                    <Text style={styles.address}>
                        {route.params?.address || 'Select delivery address'}
                    </Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Payment Method</Text>
                <TouchableOpacity style={styles.paymentOption}>
                    <Text style={styles.paymentText}>💵 Cash on Delivery (COD)</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Order Summary</Text>
                <View style={styles.summaryRow}>
                    <Text>Subtotal:</Text>
                    <Text>{route.params?.subtotal || '$0.00'}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text>Delivery Fee:</Text>
                    <Text>{route.params?.deliveryFee || '$0.00'}</Text>
                </View>
                <View style={[styles.summaryRow, styles.totalRow]}>
                    <Text style={styles.totalText}>Total:</Text>
                    <Text style={styles.totalText}>{route.params?.total || '$0.00'}</Text>
                </View>
            </View>

            <TouchableOpacity
                style={styles.checkoutBtn}
                onPress={handleCheckout}
                disabled={loading}
            >
                <Text style={styles.checkoutText}>Place Order</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 15,
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
        marginBottom: 12,
    },
    addressBox: {
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    address: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    paymentOption: {
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 12,
        borderWidth: 2,
        borderColor: '#ff6b35',
    },
    paymentText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    totalRow: {
        borderBottomWidth: 0,
        paddingVertical: 15,
    },
    totalText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ff6b35',
    },
    checkoutBtn: {
        backgroundColor: '#ff6b35',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 10,
    },
    checkoutText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    cancelBtn: {
        backgroundColor: '#e0e0e0',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 40,
    },
    cancelText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#666',
    },
});
