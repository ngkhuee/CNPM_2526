/**
 * Login Screen - Auth entry point
 */
import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { colors, spacing, typography } from '../../styles';
import { Button, Input } from '../../components/common';
import { useAuth } from '../../contexts';
import { authService } from '../../services';
import { useAuthStack } from '../../navigation/useAuthStackNavigation';
import { assets } from '../../../assets/assets';

export default function LoginScreen() {
    const { login } = useAuth();
    const authNav = useAuthStack();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }

        setLoading(true);
        try {
            const result = await authService.login(email, password);
            if (result.success && result.token && result.user) {
                await login(result.user, result.token);
            } else {
                Alert.alert('Login Failed', result.message || 'Invalid credentials');
            }
        } catch (error) {
            Alert.alert('Error', error.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Logo */}
                <View style={styles.logoContainer}>
                    <Image source={assets.logo} style={styles.logo} />
                    <Text style={styles.title}>Drone Food Delivery</Text>
                    <Text style={styles.subtitle}>Fast delivery by drone</Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <Input
                        label="Email"
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Enter your email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <Input
                        label="Password"
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Enter your password"
                        secureTextEntry
                    />

                    <Button
                        title={loading ? 'Logging in...' : 'Login'}
                        onPress={handleLogin}
                        variant="primary"
                        fullWidth
                        loading={loading}
                        disabled={loading}
                        style={styles.loginButton}
                    />

                    {/* Demo credentials hint */}
                    <View style={styles.hintContainer}>
                        <Text style={styles.hint}>Demo: user1@yummy.com / 123456</Text>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: spacing.xxl,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: spacing.xxxl,
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: spacing.lg,
    },
    title: {
        ...typography.h1,
        color: colors.primary,
        marginBottom: spacing.xs,
    },
    subtitle: {
        ...typography.body,
        color: colors.text.secondary,
    },
    form: {
        width: '100%',
    },
    loginButton: {
        marginTop: spacing.lg,
    },
    backButton: {
        marginTop: spacing.md,
    },
    hintContainer: {
        marginTop: spacing.lg,
        padding: spacing.md,
        backgroundColor: colors.backgroundDark,
        borderRadius: spacing.sm,
    },
    hint: {
        ...typography.caption,
        color: colors.text.secondary,
        textAlign: 'center',
    },
});
