/**
 * Global Styles - Common style patterns
 */
import { StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from './theme';

export const globalStyles = StyleSheet.create({
    // Containers
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    containerWhite: {
        flex: 1,
        backgroundColor: colors.white,
    },
    safeArea: {
        flex: 1,
        backgroundColor: colors.white,
    },

    // Content
    content: {
        flex: 1,
        paddingHorizontal: spacing.lg,
    },
    contentCentered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
    },

    // Cards
    card: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    cardFlat: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },

    // Rows
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    rowCenter: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Spacing
    mb1: { marginBottom: spacing.xs },
    mb2: { marginBottom: spacing.sm },
    mb3: { marginBottom: spacing.md },
    mb4: { marginBottom: spacing.lg },
    mb5: { marginBottom: spacing.xl },

    mt1: { marginTop: spacing.xs },
    mt2: { marginTop: spacing.sm },
    mt3: { marginTop: spacing.md },
    mt4: { marginTop: spacing.lg },
    mt5: { marginTop: spacing.xl },

    mx1: { marginHorizontal: spacing.xs },
    mx2: { marginHorizontal: spacing.sm },
    mx3: { marginHorizontal: spacing.md },
    mx4: { marginHorizontal: spacing.lg },

    my1: { marginVertical: spacing.xs },
    my2: { marginVertical: spacing.sm },
    my3: { marginVertical: spacing.md },
    my4: { marginVertical: spacing.lg },

    p1: { padding: spacing.xs },
    p2: { padding: spacing.sm },
    p3: { padding: spacing.md },
    p4: { padding: spacing.lg },

    px1: { paddingHorizontal: spacing.xs },
    px2: { paddingHorizontal: spacing.sm },
    px3: { paddingHorizontal: spacing.md },
    px4: { paddingHorizontal: spacing.lg },

    py1: { paddingVertical: spacing.xs },
    py2: { paddingVertical: spacing.sm },
    py3: { paddingVertical: spacing.md },
    py4: { paddingVertical: spacing.lg },

    // Text
    textPrimary: { color: colors.text.primary },
    textSecondary: { color: colors.text.secondary },
    textLight: { color: colors.text.light },
    textWhite: { color: colors.text.white },
    textBold: { fontWeight: '600' },
    textCenter: { textAlign: 'center' },
    textRight: { textAlign: 'right' },

    // Dividers
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: spacing.md,
    },

    // Badges
    badge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
        alignSelf: 'flex-start',
    },
    badgePrimary: {
        backgroundColor: colors.primary,
    },
    badgeSuccess: {
        backgroundColor: colors.success,
    },
    badgeDanger: {
        backgroundColor: colors.danger,
    },
    badgeWarning: {
        backgroundColor: colors.warning,
    },

    // Loading
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    loadingText: {
        marginTop: spacing.md,
        ...typography.body,
        color: colors.text.secondary,
    },

    // Empty state
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.xxl,
    },
    emptyText: {
        ...typography.h3,
        color: colors.text.secondary,
        textAlign: 'center',
        marginTop: spacing.md,
    },
    emptySubtext: {
        ...typography.body,
        color: colors.text.light,
        textAlign: 'center',
        marginTop: spacing.sm,
    },

    // Buttons
    button: {
        borderRadius: borderRadius.md,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonPrimary: {
        backgroundColor: colors.primary,
    },
    buttonSecondary: {
        backgroundColor: colors.secondary,
    },
    buttonDanger: {
        backgroundColor: colors.danger,
    },
    buttonOutline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: colors.primary,
    },
    buttonText: {
        ...typography.bodyBold,
        color: colors.white,
    },
    buttonTextOutline: {
        ...typography.bodyBold,
        color: colors.primary,
    },
    buttonDisabled: {
        opacity: 0.5,
    },

    // Images
    imageCover: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    imageContain: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
});

export default globalStyles;
