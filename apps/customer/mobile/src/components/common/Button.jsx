/**
 * Button Component - Matches web design
 */
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../styles';

export const Button = ({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    fullWidth = false,
    style,
    textStyle,
    icon,
    ...props
}) => {
    const buttonStyles = [
        styles.button,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
    ];

    const textStyles = [
        styles.text,
        styles[`text_${variant}`],
        styles[`text_${size}`],
        textStyle,
    ];

    return (
        <TouchableOpacity
            style={buttonStyles}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
            {...props}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'outline' ? colors.primary : colors.white} />
            ) : (
                <>
                    {icon && <Text style={styles.icon}>{icon}</Text>}
                    <Text style={textStyles}>{title}</Text>
                </>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: borderRadius.md,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
    },

    // Variants
    primary: {
        backgroundColor: colors.primary,
    },
    secondary: {
        backgroundColor: colors.secondary,
    },
    success: {
        backgroundColor: colors.success,
    },
    danger: {
        backgroundColor: colors.danger,
    },
    warning: {
        backgroundColor: colors.warning,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: colors.primary,
    },
    ghost: {
        backgroundColor: 'transparent',
    },

    // Sizes
    small: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
    },
    medium: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
    },
    large: {
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.xl,
    },

    // States
    disabled: {
        opacity: 0.5,
    },
    fullWidth: {
        width: '100%',
    },

    // Text
    text: {
        ...typography.bodyBold,
        color: colors.white,
        textAlign: 'center',
    },
    text_primary: {
        color: colors.white,
    },
    text_secondary: {
        color: colors.white,
    },
    text_success: {
        color: colors.white,
    },
    text_danger: {
        color: colors.white,
    },
    text_warning: {
        color: colors.white,
    },
    text_outline: {
        color: colors.primary,
    },
    text_ghost: {
        color: colors.primary,
    },
    text_small: {
        fontSize: 12,
    },
    text_medium: {
        fontSize: 14,
    },
    text_large: {
        fontSize: 16,
    },

    icon: {
        marginRight: spacing.sm,
    },
});

export default Button;
