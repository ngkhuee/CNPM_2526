/**
 * Tracking Screen - Simple version
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, typography, spacing } from '../../styles';
import { useOrdersStack } from '../../navigation/useOrdersStackNavigation';

export default function TrackingScreen() {
    const stackNav = useOrdersStack();
    const { id } = stackNav.params || {};

    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Order Tracking</Text>
                <Text style={styles.orderId}>Order #{id || 'Unknown'}</Text>
                <Text style={styles.message}>Tracking feature with map coming soon...</Text>
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
        marginBottom: spacing.sm,
    },
    orderId: {
        ...typography.h3,
        color: colors.primary,
        marginBottom: spacing.md,
    },
    message: {
        ...typography.body,
        color: colors.text.secondary,
    },
});
