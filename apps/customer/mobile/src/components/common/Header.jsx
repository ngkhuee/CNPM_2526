/**
 * Header Component for Mobile
 * Banner with gradient background
 */
import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography } from '../../styles';

export const Header = ({ onExplorePress }) => {
    return (
        <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
        >
            {/* Content */}
            <View style={styles.contentContainer}>
                <Text style={styles.title}>Order Your Favorite Food</Text>
                <Text style={styles.subtitle}>
                    Discover delicious meals from top-rated restaurants
                </Text>

                {/* Explore Button */}
                <TouchableOpacity
                    style={styles.exploreButton}
                    onPress={onExplorePress}
                >
                    <Text style={styles.exploreButtonText}>Explore Now</Text>
                    <Icon name="arrow-forward" size={16} color="#333" />
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    header: {
        width: '100%',
        height: 220,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: spacing.lg,
        justifyContent: 'center',
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
    },
    title: {
        ...typography.h2,
        color: colors.white,
        textAlign: 'center',
        marginBottom: spacing.md,
        fontWeight: '700',
    },
    subtitle: {
        ...typography.body,
        color: colors.white,
        textAlign: 'center',
        marginBottom: spacing.lg,
        opacity: 0.9,
    },
    exploreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderRadius: 25,
        gap: spacing.sm,
    },
    exploreButtonText: {
        ...typography.bodyBold,
        color: '#333',
    },
});
