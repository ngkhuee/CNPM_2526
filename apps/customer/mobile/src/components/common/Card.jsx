/**
 * Card Component
 */
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../../styles';

export const Card = ({
    children,
    onPress,
    style,
    variant = 'elevated',
    padding = 'medium',
    ...props
}) => {
    const cardStyles = [
        styles.card,
        styles[variant],
        styles[`padding_${padding}`],
        style,
    ];

    if (onPress) {
        return (
            <TouchableOpacity
                style={cardStyles}
                onPress={onPress}
                activeOpacity={0.7}
                {...props}
            >
                {children}
            </TouchableOpacity>
        );
    }

    return (
        <View style={cardStyles} {...props}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
    },

    // Variants
    elevated: {
        ...shadows.md,
    },
    outlined: {
        borderWidth: 1,
        borderColor: colors.border,
    },
    flat: {
        backgroundColor: colors.white,
    },

    // Padding
    padding_none: {
        padding: 0,
    },
    padding_small: {
        padding: spacing.sm,
    },
    padding_medium: {
        padding: spacing.md,
    },
    padding_large: {
        padding: spacing.lg,
    },
});

export default Card;
