/**
 * sharedStyles.js
 * Shared style objects to reduce duplication across components
 */

import { StyleSheet } from 'react-native';

export const sharedStyles = StyleSheet.create({
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '90%',
        maxWidth: 400,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
    },

    // Button styles
    primaryButton: {
        backgroundColor: '#ff6b35',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    primaryButtonDisabled: {
        backgroundColor: '#ccc',
        opacity: 0.6,
    },

    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#ff6b35',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryButtonText: {
        color: '#ff6b35',
        fontSize: 16,
        fontWeight: '600',
    },

    outlineButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#ddd',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
    },
    outlineButtonText: {
        color: '#666',
        fontSize: 14,
        fontWeight: '500',
    },

    // Card styles
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },

    // Input styles
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 14,
        color: '#1a1a1a',
        backgroundColor: '#fff',
    },
    inputFocused: {
        borderColor: '#ff6b35',
    },
    inputError: {
        borderColor: '#e53935',
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1a1a1a',
        marginBottom: 8,
    },

    // Error/Success text
    errorText: {
        fontSize: 12,
        color: '#e53935',
        marginTop: 4,
    },
    successText: {
        fontSize: 12,
        color: '#4caf50',
        marginTop: 4,
    },
    helperText: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },

    // Container styles
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    scrollContainer: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    section: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 12,
    },

    // Header styles
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1a1a1a',
    },

    // Badge styles
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
    },

    // Divider
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 12,
    },

    // Empty state
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a1a1a',
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
    },

    // Loading
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Shadow
    shadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
});

// Color constants
export const colors = {
    primary: '#ff6b35',
    secondary: '#f39c12',
    success: '#4caf50',
    error: '#e53935',
    warning: '#ff9800',
    info: '#2196f3',

    text: '#1a1a1a',
    textSecondary: '#666',
    textLight: '#999',

    background: '#f8f8f8',
    card: '#fff',
    border: '#ddd',

    white: '#fff',
    black: '#000',
};

// Spacing constants
export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
};

// Font sizes
export const fontSize = {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
};
