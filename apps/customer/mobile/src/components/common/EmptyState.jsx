/**
 * Empty State Component
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography } from '../../styles';
import { Button } from './Button';

export const EmptyState = ({
    iconName = 'cube-outline',
    title,
    message,
    actionLabel,
    onAction,
}) => {
    return (
        <View style={styles.container}>
            <Icon name={iconName} size={64} color={colors.text.light} style={styles.icon} />
            {title && <Text style={styles.title}>{title}</Text>}
            {message && <Text style={styles.message}>{message}</Text>}
            {actionLabel && onAction && (
                <Button
                    title={actionLabel}
                    onPress={onAction}
                    variant="primary"
                    style={styles.button}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.xxl,
        backgroundColor: colors.background,
    },
    icon: {
        marginBottom: spacing.lg,
    },
    title: {
        ...typography.h3,
        color: colors.text.secondary,
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    message: {
        ...typography.body,
        color: colors.text.light,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    button: {
        marginTop: spacing.md,
    },
});

export default EmptyState;
