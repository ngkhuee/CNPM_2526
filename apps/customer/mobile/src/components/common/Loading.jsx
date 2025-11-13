/**
 * Loading Component
 */
import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../styles';

export const Loading = ({ text = 'Loading...', size = 'large', color = colors.primary }) => {
    return (
        <View style={styles.container}>
            <ActivityIndicator size={size} color={color} />
            {text && <Text style={styles.text}>{text}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    text: {
        ...typography.body,
        color: colors.text.secondary,
        marginTop: spacing.md,
    },
});

export default Loading;
