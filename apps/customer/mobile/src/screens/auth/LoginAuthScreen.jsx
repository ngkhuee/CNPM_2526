import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Text, TouchableOpacity } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAuth } from '../../hooks/useAuth.js';
import { useLoginForm, useRegisterForm } from '../../hooks/useAuthForm';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';

export default function LoginAuthScreen({ onBackPress }) {
    const [activeTab, setActiveTab] = useState('login');
    const { handleLogin, handleRegister, loading } = useAuth();

    // Login form logic
    const loginForm = useLoginForm();
    const handleLoginSubmit = async () => {
        if (!loginForm.validateForm()) return;

        const success = await handleLogin(
            loginForm.formData.email,
            loginForm.formData.password,
            () => {
                loginForm.resetForm();
                onBackPress?.();
            }
        );
    };

    // Register form logic
    const registerForm = useRegisterForm();
    const handleRegisterSubmit = async () => {
        if (!registerForm.validateForm()) return;

        const success = await handleRegister(
            {
                name: registerForm.formData.name,
                email: registerForm.formData.email,
                password: registerForm.formData.password,
                confirmPassword: registerForm.formData.confirmPassword,
                phone: registerForm.formData.phone,
            },
            () => {
                registerForm.resetForm();
                setActiveTab('login');
            }
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={onBackPress}
                    >
                        <MaterialIcons name="close" size={20} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Yummy Delivery</Text>
                </View>

                {/* Tab Navigation */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'login' && styles.activeTab]}
                        onPress={() => setActiveTab('login')}
                    >
                        <Text style={[styles.tabText, activeTab === 'login' && styles.activeTabText]}>
                            Đăng nhập
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'register' && styles.activeTab]}
                        onPress={() => setActiveTab('register')}
                    >
                        <Text style={[styles.tabText, activeTab === 'register' && styles.activeTabText]}>
                            Đăng ký
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Forms */}
                {activeTab === 'login' ? (
                    <LoginForm
                        formData={loginForm.formData}
                        updateField={loginForm.updateField}
                        onSubmit={handleLoginSubmit}
                        loading={loading}
                    />
                ) : (
                    <RegisterForm
                        formData={registerForm.formData}
                        updateField={registerForm.updateField}
                        toggleTerms={registerForm.toggleTerms}
                        onSubmit={handleRegisterSubmit}
                        loading={loading}
                    />
                )}

                <View style={styles.spacer} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 90, backgroundColor: '#fff' },
    scrollView: { flex: 1 },
    header: {
        paddingVertical: 20,
        paddingHorizontal: 20,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        position: 'relative',
    },
    backButton: {
        position: 'absolute',
        right: 35,
        top: 0,
        // zIndex: 999,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FF6B35',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#FF6B35',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    headerTitle: { fontSize: 32, fontWeight: 'bold', color: '#FF6B35', paddingTop: 40 },
    tabContainer: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: { borderBottomColor: '#FF6B35' },
    tabText: { fontSize: 16, color: '#999', fontWeight: '500' },
    activeTabText: { color: '#FF6B35' },
    spacer: { height: 40 },
});
