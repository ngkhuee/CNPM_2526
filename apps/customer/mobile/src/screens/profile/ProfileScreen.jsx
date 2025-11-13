/**
 * Profile Screen - User profile and settings
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, typography, spacing } from '../../styles';
import { Button } from '../../components/common';
import { useAuth } from '../../contexts';

export default function ProfileScreen() {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: () => logout(),
                },
            ]
        );
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                {/* User Info */}
                <View style={styles.userInfo}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </Text>
                    </View>
                    <Text style={styles.name}>{user?.name || 'User'}</Text>
                    <Text style={styles.email}>{user?.email || 'user@example.com'}</Text>
                </View>

                {/* Menu Items */}
                <View style={styles.menuSection}>
                    <TouchableOpacity style={styles.menuItem}>
                        <Icon name="person-outline" size={24} color={colors.primary} style={styles.menuIcon} />
                        <Text style={styles.menuText}>Edit Profile</Text>
                        <Icon name="chevron-forward" size={24} color={colors.text.light} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <Icon name="location-outline" size={24} color={colors.primary} style={styles.menuIcon} />
                        <Text style={styles.menuText}>Saved Addresses</Text>
                        <Icon name="chevron-forward" size={24} color={colors.text.light} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <Icon name="notifications-outline" size={24} color={colors.primary} style={styles.menuIcon} />
                        <Text style={styles.menuText}>Notifications</Text>
                        <Icon name="chevron-forward" size={24} color={colors.text.light} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <Icon name="settings-outline" size={24} color={colors.primary} style={styles.menuIcon} />
                        <Text style={styles.menuText}>Settings</Text>
                        <Icon name="chevron-forward" size={24} color={colors.text.light} />
                    </TouchableOpacity>
                </View>

                {/* Logout */}
                <Button
                    title="Logout"
                    onPress={handleLogout}
                    variant="danger"
                    fullWidth
                    style={styles.logoutButton}
                />
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
    userInfo: {
        alignItems: 'center',
        paddingVertical: spacing.xxl,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    avatarText: {
        ...typography.h1,
        color: colors.white,
    },
    name: {
        ...typography.h2,
        color: colors.text.primary,
        marginBottom: spacing.xs,
    },
    email: {
        ...typography.body,
        color: colors.text.secondary,
    },
    menuSection: {
        backgroundColor: colors.white,
        borderRadius: 12,
        marginBottom: spacing.lg,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    menuIcon: {
        marginRight: spacing.md,
    },
    menuText: {
        ...typography.body,
        color: colors.text.primary,
        flex: 1,
    },

    logoutButton: {
        marginTop: spacing.lg,
    },
});
