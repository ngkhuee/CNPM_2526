/**
 * Theme Configuration - Mobile
 * Matches web design system for consistency
 */

export const colors = {
    // Primary colors (matching web)
    primary: '#ff6b35',
    primaryDark: '#e55a28',
    primaryLight: '#ff8555',

    // Secondary colors
    secondary: '#2196f3',
    secondaryDark: '#1976d2',
    secondaryLight: '#42a5f5',

    // Status colors
    success: '#28a745',
    danger: '#dc3545',
    warning: '#ff9800',
    info: '#17a2b8',

    // Neutral colors
    background: '#f5f5f5',
    backgroundDark: '#e0e0e0',
    white: '#ffffff',
    black: '#000000',

    // Text colors
    text: {
        primary: '#333333',
        secondary: '#666666',
        light: '#999999',
        white: '#ffffff',
    },

    // Border colors
    border: '#e0e0e0',
    borderDark: '#cccccc',
    borderLight: '#f0f0f0',

    // Shadow
    shadow: 'rgba(0, 0, 0, 0.1)',
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
};

export const typography = {
    // Headings
    h1: {
        fontSize: 24,
        fontWeight: '700',
        lineHeight: 32,
        color: colors.text.primary,
    },
    h2: {
        fontSize: 20,
        fontWeight: '600',
        lineHeight: 28,
        color: colors.text.primary,
    },
    h3: {
        fontSize: 18,
        fontWeight: '600',
        lineHeight: 24,
        color: colors.text.primary,
    },
    h4: {
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 22,
        color: colors.text.primary,
    },

    // Body text
    body: {
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 20,
        color: colors.text.primary,
    },
    bodyBold: {
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 20,
        color: colors.text.primary,
    },

    // Small text
    caption: {
        fontSize: 12,
        fontWeight: '400',
        lineHeight: 16,
        color: colors.text.secondary,
    },
    captionBold: {
        fontSize: 12,
        fontWeight: '600',
        lineHeight: 16,
        color: colors.text.secondary,
    },

    // Tiny text
    tiny: {
        fontSize: 10,
        fontWeight: '400',
        lineHeight: 14,
        color: colors.text.light,
    },
};

export const borderRadius = {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 20,
    full: 999,
};

export const shadows = {
    none: {
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },
    sm: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    md: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    lg: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 5,
    },
    xl: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
};

export const layout = {
    containerPadding: spacing.lg,
    cardPadding: spacing.md,
    sectionSpacing: spacing.xl,
    itemSpacing: spacing.md,
};

export default {
    colors,
    spacing,
    typography,
    borderRadius,
    shadows,
    layout,
};
