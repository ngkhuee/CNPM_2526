/**
 * Checkout Screen - Simple version
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, typography, spacing } from '../../styles';
import { Button } from '../../components/common';
import { useTabNavigation } from '../../navigation/SimpleTabNavigator';

export default function CheckoutScreen() {
    const tabNav = useTabNavigation();

    const handlePlaceOrder = () => {
        alert('Order placed! (Full checkout coming soon)');
        tabNav.switchTab('OrdersTab');
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Checkout</Text>
                <Text style={styles.message}>Checkout feature coming soon...</Text>

                <Button
                    title="Place Order (Demo)"
                    onPress={handlePlaceOrder}
                    variant="primary"
                    fullWidth
                    style={styles.button}
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: spacing.lg,
    },
    title: {
        ...typography.h2,
        marginBottom: spacing.md,
    },
    message: {
        ...typography.body,
        color: colors.text.secondary,
        marginBottom: spacing.lg,
    },
    button: {
        marginTop: spacing.lg,
    },
});
