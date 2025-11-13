/**
 * Cart Summary Component
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '../../styles';
import { formatCurrency } from 'shared-utils';
import { Button } from '../common/Button';

export const CartSummary = ({
    subtotal,
    discountAmount = 0,
    deliveryFee,
    total,
    onCheckout,
    disabled = false,
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <Text style={styles.label}>Subtotal:</Text>
                <Text style={styles.value}>{formatCurrency(subtotal)}</Text>
            </View>

            {discountAmount > 0 && (
                <View style={styles.row}>
                    <Text style={styles.label}>Discount:</Text>
                    <Text style={[styles.value, styles.discountValue]}>
                        -{formatCurrency(discountAmount)}
                    </Text>
                </View>
            )}

            <View style={styles.row}>
                <Text style={styles.label}>Delivery Fee:</Text>
                <Text style={styles.value}>{formatCurrency(deliveryFee)}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
            </View>

            <Button
                title="Proceed to Checkout"
                onPress={onCheckout}
                variant="primary"
                fullWidth
                disabled={disabled}
                style={styles.checkoutButton}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        padding: spacing.lg,
        ...shadows.lg,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    label: {
        ...typography.body,
        color: colors.text.secondary,
    },
    value: {
        ...typography.bodyBold,
        color: colors.text.primary,
    },
    discountValue: {
        color: colors.success,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: spacing.md,
    },
    totalLabel: {
        ...typography.h3,
        color: colors.text.primary,
    },
    totalValue: {
        ...typography.h2,
        color: colors.primary,
    },
    checkoutButton: {
        marginTop: spacing.lg,
    },
});

export default CartSummary;
